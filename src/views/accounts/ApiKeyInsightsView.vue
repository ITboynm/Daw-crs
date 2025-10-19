<template>
  <section class="api-key-insights-view">
    <!-- 查询卡片 -->
    <n-card class="query-card" :bordered="false">
      <div class="card-header">
        <div class="header-content">
          <div class="icon-wrapper">
            <n-icon size="28" color="#5a56f6"><KeyOutline /></n-icon>
          </div>
          <div class="header-text">
            <h2>API Key 速查</h2>
            <p>批量查询密钥信息，支持一次性粘贴多个密钥，最多检测 50 个</p>
          </div>
        </div>
      </div>

      <!-- 历史记录 -->
      <div v-if="historyKeys.length" class="history-section">
        <div class="history-header">
          <n-icon size="16"><TimeOutline /></n-icon>
          <span>最近查询</span>
        </div>
        <div class="history-list">
          <n-tag
            v-for="key in historyKeys.slice(0, 8)"
            :key="key"
            type="info"
            size="small"
            :bordered="false"
            class="history-tag"
            @click="applyHistory(key)"
          >
            {{ formatMaskedKey(key) }}
          </n-tag>
          <n-button text type="error" size="tiny" @click="clearHistory">
            <template #icon><n-icon><TrashOutline /></n-icon></template>
            清空历史
          </n-button>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-section">
        <n-input
          v-model:value="apiKeyInput"
          type="textarea"
          placeholder="每行一个 sk-... 密钥&#10;支持批量粘贴，自动识别提取"
          :autosize="{ minRows: 4, maxRows: 10 }"
          size="large"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <n-alert type="info" :bordered="false" class="info-alert">
          <template #icon><n-icon><InformationCircleOutline /></n-icon></template>
          支持粘贴原有查询历史，最多检测 50 个密钥
        </n-alert>
        <div class="action-buttons">
          <n-button secondary size="large" @click="pasteClipboard">
            <template #icon><n-icon><ClipboardOutline /></n-icon></template>
            从剪贴板粘贴
          </n-button>
          <n-button type="primary" size="large" :loading="loading" @click="runQuery">
            <template #icon><n-icon><SearchOutline /></n-icon></template>
            {{ loading ? '查询中...' : '开始查询' }}
          </n-button>
        </div>
      </div>
    </n-card>

    <!-- 结果卡片 -->
    <n-card class="result-card" :bordered="false">
      <div class="result-header">
        <div class="result-title">
          <h3>查询结果</h3>
          <n-tag v-if="results.length" type="success" size="small" :bordered="false">
            成功 {{ successCount }} / 失败 {{ failCount }}
          </n-tag>
        </div>
        <n-button
          v-if="results.length"
          type="primary"
          secondary
          size="medium"
          :loading="loading"
          @click="refreshResults"
        >
          <template #icon><n-icon><RefreshOutline /></n-icon></template>
          刷新数据
        </n-button>
      </div>

      <!-- 结果表格 -->
      <n-data-table
        v-if="results.length"
        :columns="columns"
        :data="results"
        :bordered="false"
        :single-line="false"
        :scroll-x="1600"
        striped
        size="small"
      />

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <n-empty description="暂未查询或没有有效密钥" size="large">
          <template #icon>
            <n-icon size="64" color="#d1d5db"><SearchOutline /></n-icon>
          </template>
        </n-empty>
      </div>
    </n-card>

    <!-- 详情模态框 -->
    <n-modal
      v-model:show="detailModalVisible"
      preset="card"
      title="API Key 详细信息"
      size="large"
      style="max-width: 900px"
    >
      <div v-if="currentDetailItem" class="detail-content">
        <!-- API Key -->
        <div class="detail-section">
          <div class="section-title">
            <n-icon size="18"><KeyOutline /></n-icon>
            <span>API Key</span>
          </div>
          <div class="key-display">
            <span class="key-text">{{ currentDetailItem.maskedKey }}</span>
            <n-button size="small" @click="copyKey(currentDetailItem.key)">
              <template #icon><n-icon><CopyOutline /></n-icon></template>
              复制完整Key
            </n-button>
          </div>
        </div>

        <!-- 账户信息 -->
        <div class="detail-section">
          <div class="section-title">
            <n-icon size="18"><PersonOutline /></n-icon>
            <span>账户信息</span>
          </div>
          <n-descriptions :column="2" bordered size="small">
            <n-descriptions-item label="用户名">{{ currentDetailItem.name }}</n-descriptions-item>
            <n-descriptions-item label="邮箱">{{ currentDetailItem.email }}</n-descriptions-item>
            <n-descriptions-item label="等级">{{ currentDetailItem.level }}</n-descriptions-item>
            <n-descriptions-item label="子账户数">{{ currentDetailItem.child }}</n-descriptions-item>
            <n-descriptions-item label="创建时间" :span="2">
              {{ formatDateTime(currentDetailItem.createdAt) }}
            </n-descriptions-item>
          </n-descriptions>
        </div>

        <!-- 充值卡列表 -->
        <div class="detail-section" v-if="currentDetailItem.creditBalance && currentDetailItem.creditBalance.length">
          <div class="section-title">
            <n-icon size="18"><CardOutline /></n-icon>
            <span>充值卡明细 ({{ currentDetailItem.creditBalance.length }})</span>
          </div>
          <div class="credit-grid">
            <div v-for="(credit, idx) in currentDetailItem.creditBalance" :key="idx" class="credit-card">
              <div class="credit-row">
                <span class="credit-label">卡额</span>
                <span class="credit-value">{{ credit.amount }}</span>
              </div>
              <div class="credit-row">
                <span class="credit-label">余额</span>
                <span class="credit-value balance">{{ credit.balance }}</span>
              </div>
              <div class="credit-row">
                <span class="credit-label">到期</span>
                <span class="credit-value">{{ credit.expires }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用统计 -->
        <div class="detail-section">
          <div class="section-title">
            <n-icon size="18"><StatsChartOutline /></n-icon>
            <span>使用统计</span>
          </div>
          <n-descriptions :column="2" bordered size="small">
            <n-descriptions-item label="总消费">{{ currentDetailItem.creditUsed }}</n-descriptions-item>
            <n-descriptions-item label="总余额">
              <span style="color: #10b981; font-weight: 600;">{{ currentDetailItem.balance }}</span>
            </n-descriptions-item>
            <n-descriptions-item label="今日使用量">{{ currentDetailItem.dailyUsage }}</n-descriptions-item>
            <n-descriptions-item label="本月使用量">{{ currentDetailItem.monthlyUsage }}</n-descriptions-item>
            <n-descriptions-item label="今日请求数">{{ currentDetailItem.dailyRequests }}</n-descriptions-item>
            <n-descriptions-item label="本月请求数">{{ currentDetailItem.monthlyRequests }}</n-descriptions-item>
          </n-descriptions>
        </div>

        <!-- 速率限制 -->
        <div class="detail-section">
          <div class="section-title">
            <n-icon size="18"><SpeedometerOutline /></n-icon>
            <span>速率限制</span>
          </div>
          <n-descriptions :column="3" bordered size="small">
            <n-descriptions-item label="RPM">{{ currentDetailItem.rpm }}</n-descriptions-item>
            <n-descriptions-item label="TPM">{{ currentDetailItem.tpm }}</n-descriptions-item>
            <n-descriptions-item label="TPD">{{ currentDetailItem.tpd }}</n-descriptions-item>
          </n-descriptions>
        </div>
      </div>
    </n-modal>
  </section>
</template>

<script setup>
import { ref, computed, h } from 'vue';
import {
  useMessage,
  NCard,
  NInput,
  NButton,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  NDataTable,
  NTag,
  NEmpty,
  NAlert,
  NIcon,
} from 'naive-ui';
import {
  KeyOutline,
  TimeOutline,
  TrashOutline,
  InformationCircleOutline,
  ClipboardOutline,
  SearchOutline,
  RefreshOutline,
  CopyOutline,
  PersonOutline,
  CardOutline,
  StatsChartOutline,
  SpeedometerOutline,
  EyeOutline,
} from '@vicons/ionicons5';
import { useAuthStore } from '@/store/auth';
import { getLiveStatusWithKey } from '@/api/dashboard';
import { formatCurrency, formatNumber, formatDateTime, maskApiKey } from '@/utils/formatters';

const message = useMessage();
const authStore = useAuthStore();

// 根据当前登录的 API Key 生成唯一的存储键
const STORAGE_KEY = computed(() => {
  const currentApiKey = authStore.apiKey;
  if (!currentApiKey) return 'dawapi:key-history';
  const keyId = currentApiKey.substring(0, 16);
  return `dawapi:key-history:${keyId}`;
});

const apiKeyInput = ref('');
const loading = ref(false);
const results = ref([]);
const historyKeys = ref(loadHistory());
const detailModalVisible = ref(false);
const currentDetailItem = ref(null);

const successCount = computed(() => results.value.filter((item) => !item.error).length);
const failCount = computed(() => results.value.length - successCount.value);

// 表格列定义
const columns = [
  {
    title: 'API Key',
    key: 'maskedKey',
    width: 180,
    fixed: 'left',
    render: (row) => {
      return h('div', { class: 'key-cell' }, [
        h('span', { class: 'key-text' }, row.maskedKey),
        row.error
          ? h('span', { class: 'error-badge' }, row.error)
          : h(
              NButton,
              {
                size: 'tiny',
                text: true,
                onClick: () => copyKey(row.key),
              },
              { default: () => '复制', icon: () => h(NIcon, null, { default: () => h(CopyOutline) }) }
            ),
      ]);
    },
  },
  {
    title: '账户信息',
    key: 'account',
    width: 240,
    render: (row) => {
      if (row.error) return '--';
      return h('div', { class: 'account-cell' }, [
        h('div', { class: 'account-line primary' }, [
          h('strong', { class: 'level-badge' }, row.level),
          ` / ${row.child} / ${row.name}`,
        ]),
        h('div', { class: 'account-line' }, row.email),
        h('div', { class: 'account-line meta' }, formatDateTime(row.createdAt, 'YYYY/MM/DD HH:mm')),
      ]);
    },
  },
  {
    title: '充值卡',
    key: 'credits',
    width: 260,
    render: (row) => {
      if (row.error || !row.creditBalance || !row.creditBalance.length) {
        return h('span', { class: 'text-secondary' }, '--');
      }
      const first = row.creditBalance[0];
      return h('div', { class: 'credit-cell' }, [
        h('div', { class: 'credit-line' }, [
          h('span', first.amount),
          h('span', { class: 'balance' }, first.balance),
          h('span', { class: 'expires' }, first.expires),
        ]),
        row.creditBalance.length > 1
          ? h(NTag, { type: 'info', size: 'small', bordered: false }, { default: () => `+${row.creditBalance.length - 1} 更多` })
          : null,
      ]);
    },
  },
  {
    title: '已用 / 余额',
    key: 'balance',
    width: 160,
    render: (row) => {
      if (row.error) return '--';
      return h('div', { class: 'balance-cell' }, [
        h('div', { class: 'used' }, row.creditUsed),
        h('div', { class: 'balance' }, row.balance),
      ]);
    },
  },
  {
    title: '使用量 (今日/本月)',
    key: 'usage',
    width: 160,
    render: (row) => {
      if (row.error) return '--';
      return h('div', { class: 'stat-cell' }, [
        h('div', { class: 'stat-value' }, `${row.dailyUsage} / ${row.monthlyUsage}`),
      ]);
    },
  },
  {
    title: '请求数 (今日/本月)',
    key: 'requests',
    width: 160,
    render: (row) => {
      if (row.error) return '--';
      return h('div', { class: 'stat-cell' }, [
        h('div', { class: 'stat-value' }, `${row.dailyRequests} / ${row.monthlyRequests}`),
      ]);
    },
  },
  {
    title: '速率限制',
    key: 'limits',
    width: 140,
    render: (row) => {
      if (row.error) return '--';
      return h('div', { class: 'limit-cell' }, [
        h('div', `RPM ${row.rpm}`),
        h('div', `TPD ${row.tpd}`),
      ]);
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    fixed: 'right',
    render: (row) => {
      if (row.error) return null;
      return h(
        NButton,
        {
          size: 'small',
          quaternary: true,
          onClick: () => openDetailModal(row),
        },
        { default: () => '查看', icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) }
      );
    },
  },
];

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY.value);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.warn('history load failed', error);
  }
  return [];
}

function persistHistory(keys) {
  historyKeys.value = keys;
  try {
    localStorage.setItem(STORAGE_KEY.value, JSON.stringify(keys.slice(0, 20)));
  } catch (error) {
    console.warn('history persist failed', error);
  }
}

function applyHistory(key) {
  apiKeyInput.value = key;
}

function clearHistory() {
  persistHistory([]);
  message.success('历史记录已清空');
}

function formatMaskedKey(key) {
  return maskApiKey(key, 5);
}

async function pasteClipboard() {
  if (!navigator.clipboard) {
    message.warning('浏览器不支持剪贴板 API，请手动粘贴');
    return;
  }
  try {
    const text = await navigator.clipboard.readText();
    apiKeyInput.value = text.trim();
    message.success('已粘贴到输入框');
  } catch (error) {
    message.error('无法读取剪贴板内容');
  }
}

function parseKeys() {
  const matches = apiKeyInput.value.match(/sk-[^\s]+/gi) || [];
  const unique = Array.from(new Set(matches.map((key) => key.trim())));
  if (!unique.length) {
    throw new Error('请输入有效的 API Key');
  }
  return unique.slice(0, 50);
}

async function runQuery() {
  let keys;
  try {
    keys = parseKeys();
  } catch (error) {
    message.error(error.message);
    return;
  }

  persistHistory([...keys, ...historyKeys.value.filter((key) => !keys.includes(key))].slice(0, 20));

  loading.value = true;
  try {
    const responses = await Promise.allSettled(keys.map((key) => fetchKey(key)));
    results.value = responses.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        key: keys[index],
        maskedKey: formatMaskedKey(keys[index]),
        error: result.reason?.message || '查询失败',
      };
    });
    message.success(`查询完成：成功 ${successCount.value}，失败 ${failCount.value}`);
  } finally {
    loading.value = false;
  }
}

async function refreshResults() {
  if (!results.value.length) return;

  const keys = results.value.map((item) => item.key);
  loading.value = true;
  try {
    const responses = await Promise.allSettled(keys.map((key) => fetchKey(key)));
    results.value = responses.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        key: keys[index],
        maskedKey: formatMaskedKey(keys[index]),
        error: result.reason?.message || '查询失败',
      };
    });
    message.success('数据已刷新');
  } catch (error) {
    message.error('刷新失败');
  } finally {
    loading.value = false;
  }
}

async function fetchKey(key) {
  try {
    const response = await getLiveStatusWithKey(key);
    const data = response.data;
    return transformResult(key, data);
  } catch (error) {
    throw new Error(error?.response?.data?.message || '请求失败');
  }
}

function transformResult(key, data) {
  const creditBalance = (data.credit_balance || []).map((credit) => ({
    amount: formatCurrency(credit.amount),
    balance: formatCurrency(credit.balance),
    expires: formatDateTime(credit.expires_at, 'YYYY-MM-DD'),
  }));

  const dailyUsage = data.daily_usage || {};
  const monthlyUsage = data.monthly_usage || {};

  return {
    key,
    maskedKey: formatMaskedKey(key),
    name: data.name || '--',
    email: data.email || '--',
    level: data.level || '--',
    child: data.child || '--',
    balance: formatCurrency(data.balance || 0),
    creditUsed: formatCurrency(data.credit_used || 0),
    dailyUsage: formatCurrency(dailyUsage.CreditUsed || 0),
    dailyRequests: formatNumber(dailyUsage.Requests || 0),
    monthlyUsage: formatCurrency(monthlyUsage.CreditUsed || 0),
    monthlyRequests: formatNumber(monthlyUsage.Requests || 0),
    createdAt: data.create_at,
    rpm: formatNumber(data.rpm || 0),
    tpm: formatNumber(data.tpm || 0),
    tpd: formatNumber(data.tpd || 0),
    creditBalance,
  };
}

async function copyKey(key) {
  try {
    await navigator.clipboard.writeText(key);
    message.success('已复制到剪贴板');
  } catch (error) {
    message.error('复制失败');
  }
}

function openDetailModal(item) {
  currentDetailItem.value = item;
  detailModalVisible.value = true;
}
</script>

<style scoped>
.api-key-insights-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0;
}

.query-card,
.result-card {
  border-radius: 20px;
  background: var(--daw-surface);
  box-shadow: var(--daw-shadow-md);
}

/* 查询卡片 */
.card-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.icon-wrapper {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.1), rgba(139, 92, 246, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--daw-text-primary);
}

.header-text p {
  margin: 0;
  color: var(--daw-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 历史记录 */
.history-section {
  padding: 16px;
  background: rgba(240, 242, 255, 0.4);
  border-radius: 14px;
  margin-bottom: 20px;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--daw-text-secondary);
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.history-tag {
  cursor: pointer;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  transition: all 0.2s;
}

.history-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(90, 86, 246, 0.2);
}

/* 输入区域 */
.input-section {
  margin-bottom: 20px;
}

/* 操作区域 */
.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.info-alert {
  flex: 1;
  min-width: 300px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

/* 结果卡片 */
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(240, 242, 255, 0.8);
}

.result-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-title h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--daw-text-primary);
}

.empty-state {
  padding: 60px 20px;
}

/* 表格内cell样式 */
.key-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.key-text {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--daw-text-primary);
}

.error-badge {
  font-size: 0.75rem;
  color: #ef4444;
  padding: 2px 8px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
}

.account-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-line {
  font-size: 0.82rem;
  color: var(--daw-text-secondary);
  line-height: 1.4;
}

.account-line.primary {
  color: var(--daw-text-primary);
  font-weight: 600;
}

.account-line.meta {
  font-size: 0.75rem;
}

.level-badge {
  display: inline-block;
  padding: 2px 8px;
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.1), rgba(139, 92, 246, 0.08));
  border-radius: 6px;
  color: var(--daw-primary);
  font-size: 0.8rem;
}

.credit-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.credit-line {
  display: grid;
  grid-template-columns: 1fr 1fr 90px;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--daw-text-secondary);
}

.credit-line .balance {
  color: #10b981;
  font-weight: 600;
}

.credit-line .expires {
  font-size: 0.7rem;
}

.balance-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
}

.balance-cell .used {
  color: #ef4444;
}

.balance-cell .balance {
  color: #10b981;
  font-weight: 700;
  font-size: 1.05em;
}

.stat-cell {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--daw-text-primary);
}

.limit-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--daw-text-secondary);
}

.text-secondary {
  color: var(--daw-text-secondary);
}

/* 详情弹窗 */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--daw-text-primary);
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(90, 86, 246, 0.15);
}

.key-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(240, 242, 255, 0.4);
  border-radius: 12px;
}

.key-display .key-text {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.95rem;
  font-weight: 600;
}

.credit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.credit-card {
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(250, 250, 254, 0.9));
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.credit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.credit-label {
  color: var(--daw-text-secondary);
  font-weight: 500;
}

.credit-value {
  color: var(--daw-text-primary);
  font-weight: 600;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.82rem;
}

.credit-value.balance {
  color: #10b981;
}

@media (max-width: 768px) {
  .action-section {
    flex-direction: column;
    align-items: stretch;
  }

  .info-alert {
    min-width: auto;
  }

  .action-buttons {
    width: 100%;
  }

  .action-buttons button {
    flex: 1;
  }

  .credit-grid {
    grid-template-columns: 1fr;
  }
}
</style>
