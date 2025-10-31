<template>
  <n-layout class="app-shell" has-sider>
    <!-- 侧边栏 -->
    <n-layout-sider
      class="app-shell__sider"
      bordered
      :width="260"
    >
      <AppSidebar
        :items="navItems"
        :collapsed="false"
        @navigate="handleNavigate"
      />
    </n-layout-sider>

    <!-- 头部和内容区域 -->
    <n-layout>
      <AppHeader
        class="app-shell__header"
        @logout="handleLogout"
        @rotate-key="handleRotateKey"
      />

      <!-- 内容区域 -->
      <div class="app-shell__content">
        <router-view />
      </div>
    </n-layout>
  </n-layout>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  HomeOutline,
  AnalyticsOutline,
  KeyOutline,
  PeopleOutline,
  DocumentTextOutline,
  SettingsOutline,
  ConstructOutline,
  MegaphoneOutline,
  BookOutline,
  RefreshOutline,
  HelpCircleOutline,
  PricetagOutline,
} from '@vicons/ionicons5';
import { useAuthStore } from '@/store/auth';
import { useNotifications } from '@/composables/useNotifications';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppHeader from '@/components/layout/AppHeader.vue';

const router = useRouter();
const authStore = useAuthStore();

// 通知轮询
const { initialize, startPolling, stopPolling } = useNotifications();

onMounted(() => {
  // 初始化通知系统（设置 API Key 并清理非当日通知）
  const apiKey = authStore.apiKey;
  if (apiKey) {
    initialize(apiKey).then(() => {
      // 启动通知轮询，每 60 秒一次
      startPolling(60000);
    });
  }
});

onUnmounted(() => {
  // 组件卸载时停止轮询
  stopPolling();
});

const navItems = computed(() => {
  const baseItems = [
    {
      key: 'dashboard',
      label: '总览',
      icon: HomeOutline,
      to: { name: 'dashboard' },
      group: '控制台',
    },
    {
      key: 'pricing',
      label: '套餐定价',
      icon: PricetagOutline,
      to: { name: 'pricing' },
      group: '控制台',
    },
    {
      key: 'api-key-insights',
      label: 'API Key 速查',
      icon: KeyOutline,
      to: { name: 'api-key-insights' },
      group: '工具',
      requiresManage: true,
    },
    {
      key: 'account-tools',
      label: '子账户工具',
      icon: PeopleOutline,
      to: { name: 'account-tools' },
      group: '工具',
      requiresManage: true,
    },
    {
      key: 'logs',
      label: '操作日志',
      icon: DocumentTextOutline,
      to: { name: 'logs' },
      group: '工具',
      requiresManage: true,
    },
    {
      key: 'admin-config',
      label: '系统配置',
      icon: SettingsOutline,
      to: { name: 'admin-config' },
      group: '系统',
      requiresAdmin: true,
    },
    {
      key: 'admin-provider-keys',
      label: 'Provider 密钥',
      icon: ConstructOutline,
      to: { name: 'admin-provider-keys' },
      group: '系统',
      requiresAdmin: true,
    },
    {
      key: 'admin-broadcast',
      label: '广播通知',
      icon: MegaphoneOutline,
      to: { name: 'admin-broadcast' },
      group: '系统',
      requiresAdmin: true,
    },
    {
      key: 'admin-account-reset',
      label: '账户重置管理',
      icon: RefreshOutline,
      to: { name: 'admin-account-reset' },
      group: '系统',
      requiresAdmin: true,
    },
    {
      key: 'api-reference',
      label: '使用教程',
      icon: BookOutline,
      to: { name: 'api-reference' },
      group: '资源',
    },
    {
      key: 'troubleshooting',
      label: '常见问题排除',
      icon: HelpCircleOutline,
      to: { name: 'troubleshooting' },
      group: '资源',
    },
  ];

  return baseItems.filter((item) => {
    if (item.requiresAdmin && !authStore.isAdmin) {
      return false;
    }
    if (item.requiresManage && !authStore.canManage) {
      return false;
    }
    return true;
  });
});

function handleNavigate(routeConfig) {
  if (routeConfig?.to) {
    router.push(routeConfig.to);
  }
}

function handleRotateKey() {
  // 导航到 dashboard 并触发轮换弹窗
  router.push({ name: 'dashboard', query: { action: 'rotate-key' } });
}

function handleLogout() {
  authStore.logout();
  router.replace({ name: 'login', query: { reason: 'logout' } });
}
</script>

<style scoped>
.app-shell {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: transparent;
}

/* 侧边栏 */
.app-shell__sider {
  position: fixed !important;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  transition: width 0.3s var(--n-bezier);
}

/* 头部 */
.app-shell__header {
  position: fixed;
  top: 0;
  left: 260px;
  right: 0;
  height: 80px;
  z-index: 50;
}

/* 内容区域 */
.app-shell__content {
  position: fixed;
  top: 80px;
  left: 260px;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 24px;
}

/* 自定义滚动条 */
.app-shell__content::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.app-shell__content::-webkit-scrollbar-track {
  background: rgba(240, 242, 255, 0.4);
  border-radius: 5px;
}

.app-shell__content::-webkit-scrollbar-thumb {
  background: rgba(94, 92, 230, 0.3);
  border-radius: 5px;
  transition: background 0.2s;
}

.app-shell__content::-webkit-scrollbar-thumb:hover {
  background: rgba(94, 92, 230, 0.5);
}

/* 平滑滚动 */
.app-shell__content {
  scroll-behavior: smooth;
}

@media (max-width: 960px) {
  .app-shell__content {
    padding: 24px 18px 32px;
  }
}
</style>
