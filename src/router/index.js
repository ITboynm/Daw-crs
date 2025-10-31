import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { public: true, title: '登录 DawAPI' },
  },
  {
    path: '/public/tutorial',
    name: 'public-tutorial',
    component: () => import('@/views/public/PublicApiReferenceView.vue'),
    meta: { public: true, title: '使用教程' },
  },
  {
    path: '/public/help',
    name: 'public-help',
    component: () => import('@/views/public/PublicTroubleshootingView.vue'),
    meta: { public: true, title: '帮助中心' },
  },
  {
    path: '/public/pricing',
    name: 'public-pricing',
    component: () => import('@/views/public/PublicPricingView.vue'),
    meta: { public: true, title: '套餐定价' },
  },
  {
    path: '/',
    component: () => import('@/layouts/AppShell.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '总览' },
      },
      {
        path: 'accounts/tools',
        name: 'account-tools',
        component: () => import('@/views/accounts/AccountToolsView.vue'),
        meta: { title: '子账户工具', requiresManage: true },
      },
      {
        path: 'accounts/insights',
        name: 'api-key-insights',
        component: () => import('@/views/accounts/ApiKeyInsightsView.vue'),
        meta: { title: 'API Key 速查', requiresManage: true },
      },
      {
        path: 'accounts/analytics',
        name: 'sub-account-analytics',
        component: () => import('@/views/accounts/SubAccountAnalyticsView.vue'),
        meta: { title: '子账户数据分析', requiresManage: true },
      },
      {
        path: 'logs',
        name: 'logs',
        component: () => import('@/views/logs/LogsView.vue'),
        meta: { title: '操作日志', requiresManage: true },
      },
      {
        path: 'admin/config',
        name: 'admin-config',
        component: () => import('@/views/admin/SystemConfigView.vue'),
        meta: { title: '系统配置', requiresAdmin: true },
      },
      {
        path: 'admin/provider-keys',
        name: 'admin-provider-keys',
        component: () => import('@/views/admin/ProviderKeysView.vue'),
        meta: { title: 'Provider 密钥', requiresAdmin: true },
      },
      {
        path: 'admin/broadcast',
        name: 'admin-broadcast',
        component: () => import('@/views/admin/BroadcastCenterView.vue'),
        meta: { title: '广播通知', requiresAdmin: true },
      },
      {
        path: 'admin/account-reset',
        name: 'admin-account-reset',
        component: () => import('@/views/admin/AccountResetView.vue'),
        meta: { title: '账户重置管理', requiresAdmin: true },
      },
      {
        path: 'support/api',
        name: 'api-reference',
        component: () => import('@/views/support/ApiReferenceView.vue'),
        meta: { title: '使用教程' },
      },
      {
        path: 'support/troubleshooting',
        name: 'troubleshooting',
        component: () => import('@/views/support/TroubleshootingView.vue'),
        meta: { title: '常见问题排除' },
      },
      {
        path: 'pricing',
        name: 'pricing',
        component: () => import('@/views/pricing/PricingView.vue'),
        meta: { title: '套餐定价' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' };
  },
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 移除这里的 bootstrap 调用，已在 main.js 中统一初始化
  // if (!authStore.initialized) {
  //   await authStore.bootstrap();
  // }

  if (to.meta.public) {
    if (authStore.isAuthenticated && to.name === 'login') {
      return next({ name: 'dashboard' });
    }
    return next();
  }

  if (!authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'dashboard' });
  }

  if (to.meta.requiresManage && !authStore.canManage) {
    return next({ name: 'dashboard' });
  }

  return next();
});

router.afterEach((to) => {
  const baseTitle = import.meta.env.VITE_APP_NAME || 'DawAPI';
  if (to.meta?.title) {
    document.title = `${to.meta.title} · ${baseTitle}`;
  } else {
    document.title = baseTitle;
  }
});

export default router;
