// IndexedDB 操作封装 - 按 API Key 分用户存储
const DB_NAME = 'dawapi_notifications';
const DB_VERSION = 1;
const STORE_NAME = 'notifications';
const READ_STORE_NAME = 'read_notifications';

let db = null;
let currentApiKey = null;

// 设置当前用户的 API Key
export function setCurrentApiKey(apiKey) {
  currentApiKey = apiKey;
}

// 获取当前用户的 API Key
function getCurrentApiKey() {
  if (!currentApiKey) {
    throw new Error('API Key not set. Please call setCurrentApiKey first.');
  }
  return currentApiKey;
}

// 生成复合 ID（API Key + 通知 ID）
function generateCompositeId(notificationId) {
  const apiKey = getCurrentApiKey();
  return `${apiKey}:${notificationId}`;
}

// 解析复合 ID
function parseCompositeId(compositeId) {
  const parts = compositeId.split(':');
  return {
    apiKey: parts[0],
    notificationId: parts.slice(1).join(':')
  };
}

// 初始化数据库
function initDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // 创建通知存储表
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'compositeId' });
        objectStore.createIndex('apiKey', 'apiKey', { unique: false });
        objectStore.createIndex('created_at', 'created_at', { unique: false });
        objectStore.createIndex('type', 'type', { unique: false });
        objectStore.createIndex('apiKey_createdAt', ['apiKey', 'created_at'], { unique: false });
      }

      // 创建已读通知存储表
      if (!database.objectStoreNames.contains(READ_STORE_NAME)) {
        const objectStore = database.createObjectStore(READ_STORE_NAME, { keyPath: 'compositeId' });
        objectStore.createIndex('apiKey', 'apiKey', { unique: false });
      }
    };
  });
}

// 保存通知到 IndexedDB
export async function saveNotifications(notifications) {
  const database = await initDB();
  const apiKey = getCurrentApiKey();
  const transaction = database.transaction([STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(STORE_NAME);

  const promises = notifications.map(notification => {
    return new Promise((resolve, reject) => {
      const compositeId = generateCompositeId(notification.id);
      const record = {
        ...notification,
        compositeId,
        apiKey,
        originalId: notification.id
      };
      const request = objectStore.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });

  await Promise.all(promises);
}

// 获取今日所有通知（当前用户）
export async function getTodayNotifications() {
  const database = await initDB();
  const apiKey = getCurrentApiKey();
  const transaction = database.transaction([STORE_NAME], 'readonly');
  const objectStore = transaction.objectStore(STORE_NAME);
  const index = objectStore.index('apiKey_createdAt');

  // 获取今天的开始时间（00:00:00）
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.toISOString();

  return new Promise((resolve, reject) => {
    const range = IDBKeyRange.bound(
      [apiKey, todayTimestamp],
      [apiKey, new Date().toISOString()]
    );
    const request = index.openCursor(range, 'prev'); // 倒序
    const results = [];

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// 获取所有通知（当前用户）
export async function getAllNotifications() {
  const database = await initDB();
  const apiKey = getCurrentApiKey();
  const transaction = database.transaction([STORE_NAME], 'readonly');
  const objectStore = transaction.objectStore(STORE_NAME);
  const index = objectStore.index('apiKey');

  return new Promise((resolve, reject) => {
    const request = index.getAll(apiKey);

    request.onsuccess = () => {
      const results = request.result;
      // 按时间倒序排列
      results.sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return timeB - timeA;
      });
      resolve(results);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// 标记通知为已读（当前用户）
export async function markNotificationAsRead(notificationId) {
  const database = await initDB();
  const apiKey = getCurrentApiKey();
  const transaction = database.transaction([READ_STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(READ_STORE_NAME);

  return new Promise((resolve, reject) => {
    const compositeId = generateCompositeId(notificationId);
    const request = objectStore.put({
      compositeId,
      apiKey,
      originalId: notificationId,
      readAt: new Date().toISOString()
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// 标记所有通知为已读（当前用户）
export async function markAllNotificationsAsRead(notificationIds) {
  const database = await initDB();
  const apiKey = getCurrentApiKey();
  const transaction = database.transaction([READ_STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(READ_STORE_NAME);

  const promises = notificationIds.map(id => {
    return new Promise((resolve, reject) => {
      const compositeId = generateCompositeId(id);
      const request = objectStore.put({
        compositeId,
        apiKey,
        originalId: id,
        readAt: new Date().toISOString()
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });

  await Promise.all(promises);
}

// 获取所有已读通知的 ID（当前用户）
export async function getReadNotificationIds() {
  const database = await initDB();
  const apiKey = getCurrentApiKey();
  const transaction = database.transaction([READ_STORE_NAME], 'readonly');
  const objectStore = transaction.objectStore(READ_STORE_NAME);
  const index = objectStore.index('apiKey');

  return new Promise((resolve, reject) => {
    const request = index.getAll(apiKey);

    request.onsuccess = () => {
      const ids = request.result.map(record => record.originalId);
      resolve(ids);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// 检查通知是否已读（当前用户）
export async function isNotificationRead(notificationId) {
  const database = await initDB();
  const transaction = database.transaction([READ_STORE_NAME], 'readonly');
  const objectStore = transaction.objectStore(READ_STORE_NAME);

  return new Promise((resolve, reject) => {
    const compositeId = generateCompositeId(notificationId);
    const request = objectStore.get(compositeId);

    request.onsuccess = () => {
      resolve(!!request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// 清理旧通知（保留最近 30 天，所有用户）
export async function cleanOldNotifications() {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(STORE_NAME);
  const index = objectStore.index('created_at');

  // 30 天前的时间戳
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffTimestamp = thirtyDaysAgo.toISOString();

  return new Promise((resolve, reject) => {
    const request = index.openCursor(IDBKeyRange.upperBound(cutoffTimestamp));

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// 清理非当日通知（当前用户）
export async function cleanNonTodayNotifications() {
  const database = await initDB();
  const apiKey = getCurrentApiKey();
  const transaction = database.transaction([STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(STORE_NAME);
  const index = objectStore.index('apiKey');

  // 获取今天的开始时间（00:00:00）
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  return new Promise((resolve, reject) => {
    const request = index.openCursor(apiKey);

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const notification = cursor.value;
        const createdAt = new Date(notification.created_at).getTime();

        // 如果通知不是今天的，删除它
        if (createdAt < todayTimestamp) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// 初始化当前用户的通知数据（清理非当日通知）
export async function initUserNotifications() {
  try {
    await cleanNonTodayNotifications();
    console.log('Non-today notifications cleaned');
  } catch (error) {
    console.error('Failed to clean non-today notifications:', error);
  }
}
