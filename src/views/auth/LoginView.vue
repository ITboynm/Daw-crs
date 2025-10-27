<template>
  <div class="login-view">
    <div class="login-hero">
      <div class="hero-bg">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
        <div class="gradient-mesh"></div>
      </div>
      <div class="hero-content">
        <div class="brand-section">
          <img src="@/assets/logo.png" alt="DawAPI" class="hero-logo" />
          <h1>DawAPI</h1>
        </div>
        <p class="tagline">企业级 AI 服务统一接入平台</p>
        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <h3>统一接入</h3>
              <p>多模型供应商统一管理，简化集成流程</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <h3>实时监控</h3>
              <p>全方位掌控用量、成本与服务状态</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2"/>
                <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38291 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74486 20.1656 6.23582 20.3766 5.705 20.3766C5.17418 20.3766 4.66514 20.1656 4.29 19.79C3.91445 19.4149 3.70343 18.9058 3.70343 18.375C3.70343 17.8442 3.91445 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95235 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87235 8.38291 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83445 6.74486 3.62343 6.23582 3.62343 5.705C3.62343 5.17418 3.83445 4.66514 4.21 4.29C4.58514 3.91445 5.09418 3.70343 5.625 3.70343C6.15582 3.70343 6.66486 3.91445 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30291 4.95235 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87235 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83445 17.7642 3.62343 18.295 3.62343C18.8258 3.62343 19.3349 3.83445 19.71 4.21C20.0856 4.58514 20.2966 5.09418 20.2966 5.625C20.2966 6.15582 20.2966 6.66486 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div>
              <h3>灵活管理</h3>
              <p>细粒度权限控制，支持多层级账户体系</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <n-card class="login-card" :bordered="false">
      <div class="login-card__header">
        <h2>{{ isRegisterMode ? '邮箱注册' : '登录控制台' }}</h2>
        <p>{{ isRegisterMode ? '通过邮箱获取 API 密钥' : '使用您的 API 密钥访问管理平台' }}</p>
      </div>

      <!-- 登录表单 -->
      <n-form
        v-if="!isRegisterMode"
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="top"
        size="large"
        class="login-form"
        @submit.prevent="handleSubmit"
      >
        <n-form-item label="API 密钥" path="apiKey">
          <n-input
            v-model:value="formValue.apiKey"
            type="password"
            placeholder="请输入您的 API 密钥 (sk-...)"
            maxlength="64"
            show-password-on="click"
            clearable
            @keyup.enter="handleSubmit"
          >
            <template #suffix>
              <n-button text @click="pasteFromClipboard" style="margin-right: 8px">粘贴</n-button>
            </template>
          </n-input>
        </n-form-item>

        <div class="login-options">
          <n-checkbox v-model:checked="rememberKey">
            <span class="checkbox-label">保持登录状态</span>
          </n-checkbox>
        </div>

        <n-button
          type="primary"
          size="large"
          block
          :loading="authStore.loading"
          @click="handleSubmit"
          class="login-button"
        >
          {{ authStore.loading ? '登录中...' : '登录' }}
        </n-button>
      </n-form>

      <!-- 注册表单 -->
      <n-form
        v-else
        ref="registerFormRef"
        :model="registerFormValue"
        :rules="registerRules"
        label-placement="top"
        size="large"
        class="login-form"
        @submit.prevent="handleRegister"
      >
        <n-form-item label="邮箱地址" path="email">
          <n-input
            v-model:value="registerFormValue.email"
            type="text"
            placeholder="请输入您的邮箱地址"
            clearable
            @keyup.enter="handleRegister"
          />
        </n-form-item>

        <n-alert type="info" :bordered="false" style="margin-bottom: 16px;">
          我们将向此邮箱发送验证码和 API 密钥（邮件稍有延迟，可能在垃圾信箱）
        </n-alert>

        <n-button
          type="primary"
          size="large"
          block
          :loading="registerLoading"
          @click="handleRegister"
          class="login-button"
        >
          {{ registerLoading ? '注册中...' : '邮箱注册' }}
        </n-button>
      </n-form>

      <!-- 切换按钮 -->
      <div class="switch-mode">
        <n-button text @click="toggleMode" class="switch-mode-button">
          {{ isRegisterMode ? '← 返回登录' : '没有账号？邮箱注册 →' }}
        </n-button>
      </div>

      <div class="login-footer">
        <a href="https://api.dawclaudecode.com/docs" target="_blank" class="footer-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          使用教程
        </a>
        <a href="https://dawapi.com/support" target="_blank" class="footer-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          帮助中心
        </a>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NCheckbox,
  NAlert,
  useMessage,
} from 'naive-ui';
import { useAuthStore } from '@/store/auth';
import http from '@/utils/httpClient';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const message = useMessage();
const formRef = ref(null);
const registerFormRef = ref(null);

const isRegisterMode = ref(false);
const registerLoading = ref(false);
const rememberKey = ref(true);

const formValue = reactive({
  apiKey: authStore.apiKey || '',
});

const registerFormValue = reactive({
  email: '',
});

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const rules = {
  apiKey: [
    {
      required: true,
      message: '请输入 API Key',
      trigger: ['input', 'blur'],
    },
    {
      validator: (_, value) => (value ?? '').trim().startsWith('sk-'),
      message: 'API Key 应以 sk- 开头',
      trigger: ['input', 'blur'],
    },
  ],
};

const registerRules = {
  email: [
    {
      required: true,
      message: '请输入邮箱地址',
      trigger: ['input', 'blur'],
    },
    {
      type: 'email',
      message: '请输入有效的邮箱地址',
      trigger: ['input', 'blur'],
    },
  ],
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace({ name: 'dashboard' });
  }
});

async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    await authStore.login(formValue.apiKey);
    if (!rememberKey.value && typeof window !== 'undefined') {
      localStorage.removeItem('dawapi:api-key');
    }

    const redirect = route.query.redirect;
    if (typeof redirect === 'string' && redirect.trim()) {
      if (redirect.startsWith('/')) {
        await router.replace(redirect);
      } else {
        await router.replace({ name: redirect });
      }
    } else {
      await router.replace({ name: 'dashboard' });
    }
    message.success('登录成功，欢迎回来。');
  } catch (error) {
    if (error?.message === 'API Key 格式不正确' || error?.message === '请输入 API Key') {
      message.error(error.message);
    } else if (error?.message) {
      message.error(error.message);
    } else {
      message.error('登录失败，请检查密钥。');
    }
  }
}

async function pasteFromClipboard() {
  if (!navigator.clipboard) return;
  try {
    const text = await navigator.clipboard.readText();
    formValue.apiKey = text.trim();
  } catch (error) {
    message.warning('无法访问剪贴板，请手动粘贴。');
  }
}

function toggleMode() {
  isRegisterMode.value = !isRegisterMode.value;
  // 清空表单
  if (isRegisterMode.value) {
    registerFormValue.email = '';
  }
}

async function handleRegister() {
  if (!registerFormRef.value) return;

  try {
    await registerFormRef.value.validate();
    registerLoading.value = true;

    const response = await http.post('/x-sign', {
      email: registerFormValue.email,
    });

    if (response.data?.success === false) {
      message.error(response.data.message || '注册失败，请稍后重试');
    } else {
      message.success('注册成功！我们已向您的邮箱发送验证码和 API 密钥，请查收（邮件稍有延迟，可能在垃圾信箱）');
      // 注册成功后切换回登录模式
      setTimeout(() => {
        isRegisterMode.value = false;
      }, 2000);
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      message.error(error.response.data.message);
    } else if (error?.message) {
      message.error(error.message);
    } else {
      message.error('注册失败，请稍后重试');
    }
  } finally {
    registerLoading.value = false;
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  position: relative;
  overflow: hidden;
}

.login-view::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(93, 95, 246, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.login-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 100px 80px 120px;
  position: relative;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.4) 100%);
  top: -20%;
  left: -10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(240, 147, 251, 0.7) 0%, rgba(245, 175, 255, 0.3) 100%);
  bottom: -15%;
  right: -5%;
  animation-delay: -7s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(93, 95, 246, 0.6) 0%, rgba(124, 126, 248, 0.3) 100%);
  top: 40%;
  right: 10%;
  animation-delay: -14s;
}

.gradient-mesh {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 50%, transparent 100%),
    linear-gradient(0deg, transparent 0%, rgba(255, 255, 255, 0.03) 50%, transparent 100%);
  background-size: 100px 100px;
  animation: meshMove 30s linear infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% {
    transform: translate(20px, 30px) scale(1.05);
  }
}

@keyframes meshMove {
  0% {
    background-position: 0 0, 0 0;
  }
  100% {
    background-position: 100px 100px, 100px 100px;
  }
}

.hero-content {
  max-width: 580px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.hero-logo {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(93, 95, 246, 0.2);
}

.brand-section h1 {
  margin: 0;
  font-size: 3.2rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.15);
  letter-spacing: -0.02em;
}

.tagline {
  margin: 0 0 48px;
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  line-height: 1.6;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.1);
}

.features {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.feature-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #ffffff;
}

.feature-item h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.1);
}

.feature-item p {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.login-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 80px 80px 60px;
  background: #ffffff;
  border-left: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.02);
}

.login-card__header {
  margin-bottom: 40px;
}

.login-card__header h2 {
  margin: 0 0 12px;
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.login-card__header p {
  margin: 0;
  font-size: 1rem;
  color: #64748b;
  font-weight: 400;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.login-options {
  display: flex;
  align-items: center;
  margin: -8px 0 8px;
}

.checkbox-label {
  font-size: 0.95rem;
  color: #475569;
  font-weight: 500;
}

.login-button {
  height: 52px;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 12px;
  margin-top: 8px;
}

.switch-mode {
  margin-top: 24px;
  text-align: center;
}

.switch-mode-button {
  font-size: 0.95rem;
  color: #5d5ff6;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.switch-mode-button:hover {
  opacity: 0.8;
}

.login-footer {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  gap: 32px;
  justify-content: center;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.footer-link:hover {
  color: #5d5ff6;
}

.footer-link svg {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.footer-link:hover svg {
  opacity: 1;
}

@media (max-width: 1200px) {
  .login-view {
    grid-template-columns: 1fr;
  }

  .login-hero {
    display: none;
  }

  .login-card {
    padding: 60px 40px;
    border-left: none;
    box-shadow: none;
  }
}

@media (max-width: 768px) {
  .login-card {
    padding: 40px 24px;
  }

  .login-card__header h2 {
    font-size: 1.75rem;
  }

  .login-footer {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
}
</style>
