<template>
  <section class="account-reset-view">
    <!-- 顶部说明卡片 -->
    <n-card class="header-card" :bordered="false">
      <div class="header-content">
        <div class="header-info">
          <h2>账户重置管理</h2>
          <p>输入 API Key 重置对应账户的密钥，可用于重置自己或子账户的访问凭证</p>
        </div>
      </div>
    </n-card>

    <!-- 重置表单卡片 -->
    <n-card class="reset-card" :bordered="false">
      <n-form ref="resetFormRef" :model="resetForm" label-placement="top">
        <n-form-item label="目标账户 API Key" required>
          <n-input
            v-model:value="resetForm.apiKey"
            type="text"
            placeholder="请输入需要重置的账户 API Key (sk-...)"
            clearable
            @keyup.enter="handleReset"
          />
        </n-form-item>
        <n-form-item>
          <n-button
            type="primary"
            :loading="resetting"
            :disabled="!resetForm.apiKey?.trim()"
            @click="handleReset"
            style="width: 200px"
          >
            重置密钥
          </n-button>
        </n-form-item>
      </n-form>

      <n-alert type="warning" title="安全提示" style="margin-top: 24px">
        <ul style="margin: 8px 0; padding-left: 20px">
          <li>重置后，原密钥将立即失效，请确保已通知账户所有者</li>
          <li>新密钥仅显示一次，请务必妥善保存</li>
          <li>如果重置的是自己的账户，完成后需要使用新密钥重新登录</li>
        </ul>
      </n-alert>
    </n-card>

    <!-- 重置成功结果弹窗 -->
    <n-modal
      v-model:show="resultModalVisible"
      preset="card"
      title="密钥重置成功"
      size="medium"
      :mask-closable="false"
      style="max-width: 600px"
    >
      <div class="reset-result-content">
        <n-alert type="success" title="重置成功">
          账户密钥已成功重置，请妥善保存以下新密钥。密钥仅显示一次，关闭后无法再次查看。
        </n-alert>

        <div class="key-display-section">
          <div class="key-label">新密钥</div>
          <div class="key-display-value">{{ newKey }}</div>
          <n-button type="primary" @click="copyNewKey" style="margin-top: 12px">
            <template #icon>
              <n-icon><CopyOutline /></n-icon>
            </template>
            复制密钥
          </n-button>
        </div>

        <n-alert type="warning" :show-icon="false" style="margin-top: 20px">
          <ul style="margin: 8px 0; padding-left: 20px">
            <li>请立即复制并保存此密钥</li>
            <li>密钥关闭后无法再次查看</li>
            <li v-if="isResetSelf">重置的是您自己的账户，关闭后将自动退出登录</li>
          </ul>
        </n-alert>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button type="primary" @click="closeResultModal">
            我已保存，关闭窗口
          </n-button>
        </div>
      </template>
    </n-modal>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { NCard, NForm, NFormItem, NInput, NButton, NAlert, NModal, NIcon, useMessage } from 'naive-ui';
import { CopyOutline } from '@vicons/ionicons5';
import { useAuthStore } from '@/store/auth';
import { resetUserKey } from '@/api/accounts';
import {
  setAuthToken,
  disable401Handling,
  enable401Handling
} from '@/utils/httpClient';
import { useNotifications } from '@/composables/useNotifications';

const router = useRouter();
const message = useMessage();
const authStore = useAuthStore();
const { stopPolling: stopNotificationPolling, startPolling: startNotificationPolling } = useNotifications();

const resetForm = ref({
  apiKey: '',
});

const resetting = ref(false);
const resultModalVisible = ref(false);
const newKey = ref('');
const resetTargetKey = ref(''); // 保存被重置的密钥，用于判断是否重置了自己

// 判断是否重置了自己的账户
const isResetSelf = computed(() => {
  return resetTargetKey.value === authStore.apiKey;
});

// 处理重置
async function handleReset() {
  const apiKey = resetForm.value.apiKey?.trim();
  if (!apiKey) {
    message.error('请输入 API Key');
    return;
  }

  if (!apiKey.startsWith('sk-')) {
    message.error('API Key 格式不正确，应以 sk- 开头');
    return;
  }

  resetting.value = true;

  // 保存目标密钥用于后续判断
  resetTargetKey.value = apiKey;

  // 如果重置的是自己，需要关闭轮询和 401 处理器
  const isResetingSelf = apiKey === authStore.apiKey;
  if (isResetingSelf) {
    stopNotificationPolling();
    disable401Handling();
  }

  try {
    // 生成确认参数：当前日期 + "-ROTATE-SELF"
    const today = dayjs().format('YYYY-MM-DD');
    const confirmParam = `${today}-ROTATE-SELF`;

    // 调用重置接口（使用目标账户的 API Key）
    const response = await resetUserKey(apiKey, confirmParam);

    const secretKey =
      response?.data?.SecretKey ||
      response?.data?.secret_key ||
      response?.data?.NewSecretKey ||
      response?.data?.Key ||
      response?.data?.key ||
      response?.data?.data?.SecretKey ||
      '';

    if (!secretKey) {
      message.warning('接口未返回新密钥，请联系管理员');
      resetting.value = false;
      if (isResetingSelf) {
        enable401Handling();
        startNotificationPolling(60000);
      }
      return;
    }

    // 如果重置的是自己，立即更新本地密钥
    if (isResetingSelf) {
      authStore.apiKey = secretKey;
      localStorage.setItem('dawapi:api-key', secretKey);
      setAuthToken(secretKey);
      enable401Handling();
      startNotificationPolling(60000);
    }

    // 显示结果弹窗
    newKey.value = secretKey;
    resultModalVisible.value = true;

    // 清空表单
    resetForm.value.apiKey = '';
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '重置失败';
    message.error(errorMessage);

    if (isResetingSelf) {
      enable401Handling();
      startNotificationPolling(60000);
    }
  } finally {
    resetting.value = false;
  }
}

// 复制新密钥
async function copyNewKey() {
  if (!newKey.value) {
    message.warning('暂无可复制的密钥');
    return;
  }
  try {
    await navigator.clipboard.writeText(newKey.value);
    message.success('密钥已复制到剪贴板');
  } catch (err) {
    message.error('复制失败，请手动复制');
  }
}

// 关闭结果弹窗
function closeResultModal() {
  resultModalVisible.value = false;

  // 如果重置的是自己的账户，关闭后退出登录
  if (isResetSelf.value) {
    message.success('密钥已重置，请使用新密钥重新登录');
    authStore.logout();
    router.replace({ name: 'login', query: { reason: 'reset' } });
  }

  newKey.value = '';
  resetTargetKey.value = '';
}
</script>

<style scoped>
.account-reset-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-card,
.reset-card {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 12px rgba(90, 86, 246, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 28px 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-info h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-info p {
  margin: 6px 0 0;
  color: var(--daw-text-secondary);
  font-size: 0.9rem;
}

.reset-result-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.key-display-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.05), rgba(147, 51, 234, 0.05));
  border-radius: 16px;
  border: 1px dashed rgba(90, 86, 246, 0.3);
}

.key-label {
  font-size: 0.9rem;
  color: var(--daw-text-secondary);
  font-weight: 500;
  margin-bottom: 8px;
}

.key-display-value {
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--daw-primary);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(90, 86, 246, 0.2);
  border-radius: 12px;
  padding: 16px 20px;
  word-break: break-all;
  width: 100%;
  text-align: center;
  box-shadow: 0 2px 8px rgba(90, 86, 246, 0.08);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
