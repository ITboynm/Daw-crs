import { ref, computed } from 'vue';
import { getNews } from '@/api/dashboard';
import {
  setCurrentApiKey,
  saveNotifications,
  getTodayNotifications,
  markNotificationAsRead as markAsReadInDB,
  markAllNotificationsAsRead as markAllAsReadInDB,
  getReadNotificationIds,
  initUserNotifications
} from '@/utils/notificationDB';

const news = ref([]);
const unreadCount = ref(0);
const loading = ref(false);
const initialized = ref(false);
let pollingTimer = null;

export function useNotifications() {
  // 初始化（设置 API Key 并清理非当日通知）
  async function initialize(apiKey) {
    if (!apiKey) {
      console.error('API Key is required for notifications');
      return;
    }

    try {
      setCurrentApiKey(apiKey);
      await initUserNotifications();

      // 从 IndexedDB 加载今日通知
      await loadTodayNews();
      initialized.value = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  // 从 IndexedDB 加载今日通知
  async function loadTodayNews() {
    try {
      const todayNews = await getTodayNotifications();
      news.value = todayNews;
      await updateUnreadCount();
    } catch (error) {
      console.error('Failed to load today notifications:', error);
      news.value = [];
    }
  }

  // 获取通知（从 API）
  async function fetchNews() {
    try {
      loading.value = true;
      const response = await getNews();
      const data = response.data || {};

      // 合并所有类型的通知
      const allNews = [];

      if (data.sys_news) {
        data.sys_news.forEach(item => {
          allNews.push({
            ...item,
            type: 'system',
            id: item.id || item.created_at || `sys_${Date.now()}_${Math.random()}`
          });
        });
      }

      if (data.user_news) {
        data.user_news.forEach(item => {
          allNews.push({
            ...item,
            type: 'user',
            id: item.id || item.created_at || `user_${Date.now()}_${Math.random()}`
          });
        });
      }

      if (data.dna_news) {
        data.dna_news.forEach(item => {
          allNews.push({
            ...item,
            type: 'dna',
            id: item.id || item.created_at || `dna_${Date.now()}_${Math.random()}`
          });
        });
      }

      // 保存到 IndexedDB
      if (allNews.length > 0) {
        await saveNotifications(allNews);
      }

      // 重新加载今日通知
      await loadTodayNews();
    } catch (error) {
      console.error('获取通知失败:', error);
    } finally {
      loading.value = false;
    }
  }

  // 更新未读数量
  async function updateUnreadCount() {
    try {
      const readIds = await getReadNotificationIds();
      unreadCount.value = news.value.filter(item => !readIds.includes(item.originalId || item.id)).length;
    } catch (error) {
      console.error('Failed to update unread count:', error);
      unreadCount.value = 0;
    }
  }

  // 标记通知为已读
  async function markAsRead(newsId) {
    try {
      await markAsReadInDB(newsId);
      await updateUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // 标记所有通知为已读
  async function markAllAsRead() {
    try {
      const allIds = news.value.map(item => item.originalId || item.id);
      await markAllAsReadInDB(allIds);
      unreadCount.value = 0;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  // 开始轮询
  function startPolling(interval = 60000) {
    // 先立即获取一次
    fetchNews();

    // 设置定时轮询
    pollingTimer = setInterval(() => {
      fetchNews();
    }, interval);
  }

  // 停止轮询
  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  }

  return {
    news: computed(() => news.value),
    unreadCount: computed(() => unreadCount.value),
    loading: computed(() => loading.value),
    initialized: computed(() => initialized.value),
    initialize,
    fetchNews,
    loadTodayNews,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling
  };
}
