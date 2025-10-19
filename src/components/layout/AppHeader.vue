<template>
  <header class="app-header">
    <div class="app-header__left">
      <n-button
        quaternary
        circle
        class="app-header__trigger"
        @click="$emit('toggle-sidebar')"
      >
        <n-icon size="20">
          <MenuOutline />
        </n-icon>
      </n-button>
      <div class="app-header__title">
        <h1>{{ pageTitle }}</h1>
        <p>{{ subtitle }}</p>
      </div>
    </div>

    <div class="app-header__right">
      <n-tag
        class="app-header__role"
        size="medium"
        :bordered="false"
        round
        :type="roleTagType"
      >
        {{ roleLabel }}
      </n-tag>

      <div class="app-header__balance" v-if="showBalance">
        <span class="label">余额</span>
        <span class="value">{{ balanceText }}</span>
      </div>

      <!-- 通知图标 -->
      <n-badge :value="unreadCount" :max="99" :show="unreadCount > 0">
        <n-button quaternary circle class="app-header__notification" @click="openNotificationModal">
          <n-icon size="20">
            <NotificationsOutline />
          </n-icon>
        </n-button>
      </n-badge>

      <!-- 主题切换暂时注释掉 -->
      <!-- <n-button quaternary circle @click="toggleTheme">
        <n-icon size="18">
          <component :is="isDark ? SunnyOutline : MoonOutline" />
        </n-icon>
      </n-button> -->

      <n-dropdown
        trigger="click"
        :options="userMenuOptions"
        @select="handleMenuSelect"
      >
        <button class="app-header__user" type="button">
          <div class="avatar">{{ userInitials }}</div>
          <div class="meta">
            <span class="name">{{ displayName }}</span>
            <span class="email">{{ statusEmail }}</span>
          </div>
          <n-icon size="16">
            <ChevronDownOutline />
          </n-icon>
        </button>
      </n-dropdown>
    </div>

    <!-- 通知模态框 -->
    <n-modal
      v-model:show="notificationModalVisible"
      preset="card"
      title="今日通知"
      size="large"
      style="max-width: 800px"
    >
      <template #header-extra>
        <n-button text size="small" @click="handleMarkAllRead" v-if="unreadCount > 0">
          全部已读
        </n-button>
      </template>
      <div class="notification-modal-content">
        <div v-if="news.length > 0" class="notifications-timeline">
          <div
            v-for="(item, index) in news"
            :key="item.id"
            class="notification-timeline-item"
            :class="{ unread: isUnread(item.originalId || item.id) }"
            @click="handleNewsClick(item)"
          >
            <div class="timeline-indicator">
              <div class="indicator-dot" :class="`type-${item.type}`"></div>
              <div v-if="index < news.length - 1" class="indicator-line"></div>
            </div>
            <div class="timeline-card">
              <div class="timeline-header">
                <div class="timeline-action">
                  <div class="action-icon" :class="`type-${item.type}`">
                    <n-icon size="20">
                      <component :is="getNewsIcon(item.type)" />
                    </n-icon>
                  </div>
                  <span class="action-text">{{ item.title || '系统通知' }}</span>
                  <div class="unread-dot" v-if="isUnread(item.originalId || item.id)"></div>
                </div>
                <div class="timeline-time">{{ formatTime(item.created_at) }}</div>
              </div>
              <div class="timeline-body">
                <p class="timeline-message">{{ item.message || item.content }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="notification-empty">
          <n-icon size="64" color="#d1d5db">
            <MailOpenOutline />
          </n-icon>
          <p>今日暂无通知</p>
        </div>
      </div>
    </n-modal>
  </header>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useNotifications } from '@/composables/useNotifications';
import {
  MenuOutline,
  MoonOutline,
  SunnyOutline,
  ChevronDownOutline,
  NotificationsOutline,
  MailOpenOutline,
  InformationCircleOutline,
  WarningOutline,
  CheckmarkCircleOutline,
} from '@vicons/ionicons5';
import { NButton, NDropdown, NIcon, NTag, NBadge, NModal } from 'naive-ui';
import { formatDateTime } from '@/utils/formatters';
import { getReadNotificationIds } from '@/utils/notificationDB';

defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['toggle-sidebar', 'logout', 'rotate-key']);
const authStore = useAuthStore();
const route = useRoute();

const isDark = ref(false);
const notificationModalVisible = ref(false);

// 通知相关
const { news, unreadCount, markAsRead, markAllAsRead } = useNotifications();

const displayName = computed(() => authStore.displayName || '访客');
const statusEmail = computed(() => authStore.profile?.email || authStore.status?.email || '');

const balanceText = computed(() => {
  const balance = authStore.balance ?? 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(balance);
});

const showBalance = computed(() => authStore.balance !== null && authStore.balance !== undefined);

const roleLabel = computed(() => {
  if (authStore.isRoot) return 'Root';
  if (authStore.isAdmin) return 'Owner';
  if (authStore.canManage) return 'Manager';
  return 'Member';
});

const roleTagType = computed(() => {
  if (authStore.isRoot) return 'info';
  if (authStore.isAdmin) return 'primary';
  if (authStore.canManage) return 'success';
  return 'default';
});

const pageTitle = computed(() => route.meta?.title || '概览');
const subtitle = computed(() => {
  const map = {
    dashboard: '全局运行状态与快速操作',
    usage: '趋势、模型和账户用量洞察',
    'api-key-insights': '跨账户额度和活跃度速查',
    'account-tools': '批量管理子账户与额度',
    logs: '安全审计和操作轨迹',
    'admin-config': '系统策略与资源配置',
    'admin-provider-keys': 'Provider 凭据生命周期',
    'admin-broadcast': '向账户推送公告与提醒',
    'api-reference': '集成示例与最佳实践',
  };
  return map[route.name] || 'DawAPI 控制台';
});

const userInitials = computed(() => {
  const name = displayName.value || '';
  const matches = name.trim().split(/\s+/);
  if (matches.length === 1) {
    return matches[0].slice(0, 2).toUpperCase();
  }
  return matches.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
});

const userMenuOptions = computed(() => [
  // {
  //   label: '变更密钥',
  //   key: 'rotate-key',
  // },
  {
    label: '退出登录',
    key: 'logout',
  },
]);

// 通知相关方法
async function isUnread(newsId) {
  try {
    const readIds = await getReadNotificationIds();
    return !readIds.includes(newsId);
  } catch (error) {
    return false;
  }
}

function openNotificationModal() {
  notificationModalVisible.value = true;
}

function handleNewsClick(item) {
  const id = item.originalId || item.id;
  markAsRead(id);
}

function handleMarkAllRead() {
  markAllAsRead();
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const now = new Date();
  const time = new Date(timeStr);
  const diff = Math.floor((now - time) / 1000); // 秒

  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;

  return formatDateTime(timeStr, 'MM-DD HH:mm');
}

function getNewsIcon(type) {
  const iconMap = {
    system: InformationCircleOutline,
    user: CheckmarkCircleOutline,
    dna: WarningOutline,
  };
  return iconMap[type] || InformationCircleOutline;
}

function toggleTheme() {
  isDark.value = !isDark.value;
}

function handleMenuSelect(key) {
  if (key === 'logout') {
    emit('logout');
  }
  if (key === 'rotate-key') {
    emit('rotate-key');
  }
}

watchEffect(() => {
  if (isDark.value) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
});
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px 16px;
  min-height: 80px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
  position: relative;
  z-index: 50;
}

.app-header__left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.app-header__trigger {
  display: none;
}

.app-header__title h1 {
  margin: 0;
  font-size: 1.36rem;
  font-weight: 600;
  color: var(--daw-text);
  letter-spacing: 0.01em;
}

.app-header__title p {
  margin: 6px 0 0;
  font-size: 0.78rem;
  color: var(--daw-text-secondary);
  letter-spacing: 0.04em;
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.app-header__role {
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.app-header__balance {
  display: flex;
  flex-direction: column;
  font-size: 0.74rem;
  color: var(--daw-text-secondary);
}

.app-header__balance .label {
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.app-header__balance .value {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--daw-text);
}

.app-header__user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(247, 249, 255, 0.92);
  cursor: pointer;
  transition: var(--daw-transition);
}

.app-header__user:hover {
  box-shadow: 0 12px 30px -18px rgba(93, 95, 246, 0.35);
}

.app-header__user .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(92, 92, 241, 0.85), rgba(247, 138, 200, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.app-header__user .meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.app-header__user .name {
  font-weight: 600;
  font-size: 0.95rem;
}

.app-header__user .email {
  font-size: 0.72rem;
  color: var(--daw-text-secondary);
}

/* 通知模态框样式 */
.notification-modal-content {
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
  padding: 8px 0;
}

.notifications-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.notification-timeline-item {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 20px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.notification-timeline-item:hover {
  opacity: 0.85;
}

.notification-timeline-item.unread .timeline-card {
  background: rgba(246, 244, 255, 0.4);
}

/* Timeline 指示器 */
.timeline-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 24px;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  z-index: 1;
}

.indicator-dot.type-system {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.indicator-dot.type-user {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.indicator-dot.type-dna {
  background: linear-gradient(135deg, #fb923c, #f97316);
}

.indicator-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(180deg, rgba(203, 213, 225, 0.5), rgba(203, 213, 225, 0.2));
  margin-top: 4px;
}

/* Timeline 卡片 */
.timeline-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.timeline-card:hover {
  border-color: rgba(94, 92, 230, 0.2);
  box-shadow: 0 4px 12px rgba(94, 92, 230, 0.08);
  transform: translateX(4px);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 16px;
}

.timeline-action {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.action-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon.type-system {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1));
  color: #3b82f6;
}

.action-icon.type-user {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1));
  color: #22c55e;
}

.action-icon.type-dna {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(249, 115, 22, 0.1));
  color: #fb923c;
}

.action-text {
  font-weight: 600;
  font-size: 1rem;
  color: var(--daw-text);
  flex: 1;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5e5ce6, #8b5cf6);
  box-shadow: 0 0 8px rgba(94, 92, 230, 0.5);
  flex-shrink: 0;
}

.timeline-time {
  font-size: 0.82rem;
  color: var(--daw-text-secondary);
  white-space: nowrap;
}

.timeline-body {
  padding-top: 4px;
}

.timeline-message {
  margin: 0;
  font-size: 0.92rem;
  color: var(--daw-text-secondary);
  line-height: 1.6;
}

.notification-empty {
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--daw-text-secondary);
}

.notification-empty p {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

@media (max-width: 960px) {
  .app-header {
    padding: 16px 20px;
  }

  .app-header__trigger {
    display: inline-flex;
  }

  .app-header__balance {
    display: none;
  }

  .app-header__right {
    gap: 12px;
  }

  .app-header__user .email {
    display: none;
  }
}
</style>
