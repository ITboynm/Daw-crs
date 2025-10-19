<template>
  <n-config-provider :theme-overrides="themeOverrides" preflight-style-disabled>
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup>
import { computed } from 'vue';
import {
  NConfigProvider,
  NLoadingBarProvider,
  NDialogProvider,
  NNotificationProvider,
  NMessageProvider,
} from 'naive-ui';

const themeOverrides = computed(() => ({
  common: {
    primaryColor: '#5a56f6',
    primaryColorHover: '#6d62ff',
    primaryColorPressed: '#403fd8',
    infoColor: '#6366f1',
    successColor: '#22c55e',
    warningColor: '#f59e0b',
    errorColor: '#ef4444',
    fontFamily: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  Button: {
    textColor: '#0f172a',
    border: '1px solid transparent',
    borderHover: '1px solid rgba(90, 86, 246, 0.2)',
    borderPressed: '1px solid rgba(90, 86, 246, 0.35)',
    borderFocus: '1px solid rgba(90, 86, 246, 0.35)',
    colorHover: 'rgba(90, 86, 246, 0.08)',
    colorPressed: 'rgba(90, 86, 246, 0.12)',
    rippleDuration: '0s',
  },
  Card: {
    borderRadius: '28px',
    color: 'rgba(255, 255, 255, 0.96)',
    paddingMedium: '32px',
  },
  Tag: {
    borderRadius: '999px',
  },
}));
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
