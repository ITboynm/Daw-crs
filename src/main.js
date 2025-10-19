import { createApp } from 'vue';
import { createPinia } from 'pinia';
import {
  create,
  NLayout,
  NLayoutSider,
  NScrollbar,
  NMenu,
  NGrid,
  NGi,
  NCard,
  NButton,
  NSpace,
  NForm,
  NFormItem,
  NInput,
  NCheckbox,
  NTag,
  NDropdown,
  NIcon,
  NDatePicker,
  NBadge,
  NModal,
  NAlert,
  NSpin,
  NInputNumber,
  NSelect,
  NSwitch,
  NDrawer,
  NDrawerContent,
} from 'naive-ui';
import App from './App.vue';
import router from '@/router';
import './styles/main.css';
import './plugins/echarts';
import { onUnauthorized } from '@/utils/httpClient';
import { useAuthStore } from '@/store/auth';
import VueECharts from 'vue-echarts';

const naive = create({
  components: [
    NLayout,
    NLayoutSider,
    NScrollbar,
    NMenu,
    NGrid,
    NGi,
    NCard,
    NButton,
    NSpace,
    NForm,
    NFormItem,
    NInput,
    NCheckbox,
    NTag,
    NDropdown,
    NIcon,
    NDatePicker,
    NBadge,
    NModal,
    NAlert,
    NSpin,
    NInputNumber,
    NSelect,
    NSwitch,
    NDrawer,
    NDrawerContent,
  ],
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const authStore = useAuthStore(pinia);

// 在应用启动时统一初始化认证状态
// 等待 bootstrap 完成后再挂载应用
authStore.bootstrap().then(() => {
  onUnauthorized(() => {
    authStore.handleUnauthorized();
    if (router.currentRoute.value.name !== 'login') {
      router.replace({ name: 'login', query: { reason: 'expired' } }).catch(() => {});
    }
  });

  app.use(router);
  app.use(naive);
  app.component('v-chart', VueECharts);

  app.mount('#app');
});
