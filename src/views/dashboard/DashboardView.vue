<template>
  <section class="dashboard-view">
    <!-- 返回顶部按钮 -->
    <BackToTop />
    
    <div class="dashboard-hero">
      <div class="hero-unified">
        <div class="hero-header">
          <div class="hero-header-left">
            <p class="hero-greeting">欢迎回来，{{ username }}</p>
            <h1 class="hero-title">DawAPI 分发控制中心</h1>
          </div>
          <div class="hero-balance">
            <span class="hero-balance__label">可用余额</span>
            <span class="hero-balance__value">{{ formattedBalance }}</span>
          </div>
        </div>

        <div class="hero-content">
          <!-- 核心信息一览 -->
          <div class="core-info-row">
            <!-- API Key 精简展示 -->
            <div class="api-key-mini">
              <div class="api-key-mini-header">
                <span class="api-key-mini-label">🔑 API Key</span>
                <div class="api-key-mini-actions">
                  <n-button 
                    class="api-key-action-btn" 
                    quaternary 
                    size="small" 
                    @click="toggleApiKey" 
                    :focusable="false"
                  >
                    <template #icon>
                      <n-icon :component="showApiKey ? EyeOffOutline : EyeOutline" />
                    </template>
                    {{ showApiKey ? '隐藏' : '显示' }}
                  </n-button>
                  <n-button 
                    class="api-key-action-btn" 
                    quaternary 
                    size="small" 
                    @click="copyApiKey" 
                    :disabled="!authStore.apiKey" 
                    :focusable="false"
                  >
                    <template #icon>
                      <n-icon :component="CopyOutline" />
                    </template>
                    复制
                  </n-button>
                  <n-button 
                    class="api-key-action-btn" 
                    quaternary 
                    size="small" 
                    @click="goTo('api-reference')" 
                    :focusable="false"
                  >
                    <template #icon>
                      <n-icon><ArrowForwardOutline /></n-icon>
                    </template>
                    示例
                  </n-button>
                </div>
              </div>
              <div class="api-key-mini-value">{{ displayedApiKey }}</div>
            </div>

            <!-- 每月限额进度 -->
            <div v-if="selfUsage?.hard_limit !== undefined && selfUsage?.hard_limit > 0" class="limit-progress-card">
              <div class="limit-card-header">
                <span class="limit-card-title">💰 每月限额</span>
                <span class="limit-card-percentage" :class="'status-' + monthlyLimitStatus">
                  {{ monthlyLimitPercentage.toFixed(1) }}%
                </span>
              </div>
              <div class="limit-progress-bar">
                <div 
                  class="limit-progress-fill"
                  :class="'fill-' + monthlyLimitStatus"
                  :style="{ width: monthlyLimitPercentage + '%' }"
                ></div>
              </div>
              <div class="limit-card-info">
                <span class="limit-info-used">{{ formatCurrency(selfUsage?.credit_used || 0, { scientific: true }) }}</span>
                <span class="limit-info-divider">/</span>
                <span class="limit-info-total">{{ formatCurrency(selfUsage?.hard_limit || 0, { scientific: true }) }}</span>
              </div>
            </div>

            <!-- 每日限额进度 -->
            <div v-if="selfUsage?.daily_limit !== undefined && selfUsage?.daily_limit > 0" class="limit-progress-card">
              <div class="limit-card-header">
                <span class="limit-card-title">📅 每日限额</span>
                <div class="limit-card-actions">
                  <span class="limit-card-percentage" :class="'status-' + dailyLimitStatus">
                    {{ dailyLimitPercentage.toFixed(1) }}%
                  </span>
                  <n-button
                    text
                    size="tiny"
                    @click="openEditDailyLimitModal"
                    class="limit-edit-btn"
                  >
                    <template #icon>
                      <n-icon size="14"><CreateOutline /></n-icon>
                    </template>
                  </n-button>
                </div>
              </div>
              <div class="limit-progress-bar">
                <div 
                  class="limit-progress-fill"
                  :class="'fill-' + dailyLimitStatus"
                  :style="{ width: dailyLimitPercentage + '%' }"
                ></div>
              </div>
              <div class="limit-card-info">
                <span class="limit-info-used">{{ formatCurrency(usageSummary?.total_credit_used || 0, { scientific: true }) }}</span>
                <span class="limit-info-divider">/</span>
                <span class="limit-info-total">{{ formatCurrency(selfUsage?.daily_limit || 0, { scientific: true }) }}</span>
              </div>
            </div>
          </div>

          <!-- 充值卡明细 -->
          <div v-if="allCreditBalance.length > 0" class="credit-balance-section-compact">
            <div class="credit-header-compact">
              <span class="credit-title-compact">💳 充值卡明细</span>
              <div class="credit-actions-compact">
                <span class="credit-total-compact">
                  余额: <strong>{{ formatCurrency(totalValidCredit, { scientific: true }) }}</strong>
                </span>
                <n-button
                  v-if="allCreditBalance.length > 2"
                  text
                  size="tiny"
                  @click="toggleCreditExpanded"
                  class="toggle-credit-btn-compact"
                >
                  {{ isCreditExpanded ? '收起' : `展开 (${allCreditBalance.length})` }}
                  <template #icon>
                    <n-icon size="14">
                      <component :is="isCreditExpanded ? ChevronUpOutline : ChevronDownOutline" />
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </div>
              <div class="credit-balance-list">
                <div 
                  v-for="(credit, idx) in displayedCreditBalance" 
                  :key="idx" 
                  class="credit-balance-item"
                  :class="{
                    'is-active': credit.isActive,
                    'is-expired': credit.isExpired,
                    'is-depleted': credit.isDepleted
                  }"
                >
                  <div class="credit-info">
                    <div class="credit-header-row">
                      <div class="credit-amount-info">
                        <span class="amount-label">余额</span>
                        <span class="amount-value">{{ formatCurrency(credit.balance || 0, { scientific: true }) }}</span>
                        <span class="amount-total">/ {{ formatCurrency(credit.amount || 0, { scientific: true }) }}</span>
                      </div>
                      <div class="credit-status-badges">
                        <span v-if="credit.isActive" class="status-badge status-active">使用中</span>
                        <span v-if="credit.isExpired" class="status-badge status-expired">已过期</span>
                        <span v-if="credit.isDepleted && !credit.isExpired" class="status-badge status-depleted">已用完</span>
                      </div>
                    </div>
                    
                    <!-- 进度条 -->
                    <div class="credit-progress">
                      <div 
                        class="credit-progress-bar" 
                        :class="{
                          'progress-depleted': credit.isDepleted && !credit.isExpired,
                          'progress-expired': credit.isExpired,
                          'progress-active': credit.isActive
                        }"
                      >
                        <div 
                          class="credit-progress-fill" 
                          :style="{ width: credit.usagePercentage + '%' }"
                        ></div>
                      </div>
                      <span class="credit-progress-text">{{ credit.usagePercentage.toFixed(1) }}%</span>
                    </div>

                    <div class="credit-expires">
                      <span class="expires-label">到期时间</span>
                      <span class="expires-value" :class="{ 'expires-warning': credit.isExpiringSoon && !credit.isExpired }">
                        {{ formatDateTime(credit.expires_at, 'YYYY-MM-DD HH:mm') }}
                      </span>
                      <span v-if="credit.remainingText" class="expires-remaining" :class="{ 'warning': credit.isExpiringSoon && !credit.isExpired }">
                        {{ credit.remainingText }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>

        <div class="hero-footer">
          <span>最近更新 · {{ lastUpdatedText }}</span>
          <n-button
            quaternary
            circle
            :loading="loading"
            @click="refresh"
            class="refresh-button"
          >
            <template #icon>
              <svg class="refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </template>
          </n-button>
        </div>
      </div>
    </div>

    <section class="summary-section">
      <div class="summary-controls">
        <div class="filter-tabs">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            type="button"
            class="filter-tab"
            :class="{ active: activeFilter === tab.value }"
            @click="selectFilter(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="filter-controls">
          <n-date-picker
            v-if="activeFilter === 'date'"
            v-model:value="selectedDate"
            type="date"
            size="small"
            :is-date-disabled="disableFuture"
          />
          <n-date-picker
            v-if="activeFilter === 'range'"
            v-model:value="selectedRange"
            type="daterange"
            size="small"
            :is-date-disabled="disableFuture"
          />
          <div class="refresh-button-wrapper">
            <n-button
              type="primary"
              size="medium"
              :loading="loadingSummary"
              @click="applyUsageFilter"
              class="refresh-data-button"
            >
              <template #icon v-if="!loadingSummary">
                <svg class="refresh-data-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </template>
              {{ loadingSummary ? '加载中...' : '刷新数据' }}
            </n-button>
            <div class="refresh-warning">
              <svg class="warning-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <span>切勿频繁触发查询，否则会触发系统防御性扣额度</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="summary-cards">
        <article v-for="card in summaryCards" :key="card.key" class="summary-card">
          <div class="icon" :class="`icon-${card.key}`">
            <component :is="card.icon" size="20" />
          </div>
          <div class="content">
            <span class="label">{{ card.label }}</span>
            <span class="value">{{ card.value }}</span>
            <span class="hint">{{ card.hint }}</span>
          </div>
        </article>
      </div>

      <!-- 模型消耗详情 -->
      <n-card class="panel-card large-panel" :bordered="false">
        <header class="panel-header">
          <div>
            <h3>模型消耗详情</h3>
            <p>按照成本排序，识别高消耗模型。</p>
          </div>
          <div class="sort-group">
            <button
              v-for="option in sortOptions"
              :key="option.value"
              class="sort-chip"
              :class="{ active: sortBy === option.value }"
              type="button"
              @click="sortBy = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </header>
        <div v-if="sortedModelRows.length" class="models-table">
          <div class="table-head">
            <span>模型</span>
            <span>请求数</span>
            <span>Prompt</span>
            <span>Completion</span>
            <span>花费</span>
            <span>占比</span>
          </div>
          <div v-for="model in sortedModelRows" :key="model.name" class="table-row">
            <span class="model-name" :title="model.name">{{ model.displayName }}</span>
            <span>{{ model.requests }}</span>
            <span>{{ model.prompt }}</span>
            <span>{{ model.completion }}</span>
            <span>{{ model.cost }}</span>
            <span>
              <div class="progress-bar">
                <div class="progress-bar__inner" :style="{ width: model.percentageWidth }"></div>
              </div>
              {{ model.percentage }}
            </span>
          </div>
        </div>
        <div v-else class="empty-state">
          暂无模型数据
        </div>
      </n-card>
    </section>

    <!-- 密钥轮换弹窗 -->
    <n-modal
      v-model:show="rotateModalVisible"
      preset="card"
      :title="rotateModalTitle"
      size="medium"
      :closable="rotateState !== 'processing'"
      :mask-closable="false"
      style="max-width: 560px"
    >
      <!-- 风险确认阶段 -->
      <div v-if="rotateState === 'confirm'" class="rotate-step">
        <n-alert type="warning" title="风险操作警告" :bordered="false">
          <div style="line-height: 1.6;">
            <p style="margin: 0 0 12px 0;">此操作将立即作废当前密钥并生成新密钥，具有以下风险：</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>当前密钥将<strong>立即失效</strong>，无法撤销</li>
              <li>所有使用旧密钥的服务将<strong>无法访问</strong></li>
              <li>您需要使用新密钥<strong>重新登录</strong>系统</li>
            </ul>
          </div>
        </n-alert>
        <div class="modal-actions">
          <n-button @click="cancelRotate">取消</n-button>
          <n-button type="error" @click="startRotate">
            确认变更密钥
          </n-button>
        </div>
      </div>

      <!-- 处理中阶段 -->
      <div v-else-if="rotateState === 'processing'" class="rotate-step rotate-step--center">
        <n-spin size="large" />
        <span class="rotate-text">正在生成新密钥，请稍候...</span>
      </div>

      <!-- 新密钥展示阶段 -->
      <div v-else-if="rotateState === 'result'" class="rotate-step">
        <n-alert type="success" title="新密钥已生成" :bordered="false">
          请妥善保管新密钥，当前密钥已失效
        </n-alert>

        <div class="key-display-section">
          <div class="key-display-label">新 API 密钥</div>
          <div class="key-display-value">{{ rotatedKey }}</div>
          <n-button type="primary" block @click="copyRotatedKey">
            <template #icon>
              <n-icon><CopyOutline /></n-icon>
            </template>
            {{ copyConfirmed ? '已复制' : '快捷复制' }}
          </n-button>
        </div>

        <div class="key-confirm-section">
          <div class="key-confirm-label">
            <n-icon size="18" color="#f59e0b"><WarningOutline /></n-icon>
            <span>请输入上方密钥以确认</span>
          </div>
          <n-input
            v-model:value="confirmInput"
            type="text"
            placeholder="粘贴或手动输入新密钥"
            :input-props="{ autocomplete: 'off' }"
          />
          <div v-if="confirmInput && !isConfirmInputValid" class="key-confirm-error">
            <n-icon size="16"><CloseCircleOutline /></n-icon>
            <span>输入的密钥不匹配，请检查</span>
          </div>
          <div v-else-if="isConfirmInputValid" class="key-confirm-success">
            <n-icon size="16"><CheckmarkCircleOutline /></n-icon>
            <span>密钥确认成功</span>
          </div>
        </div>

        <div class="modal-actions">
          <n-button
            type="primary"
            block
            size="large"
            :disabled="!isConfirmInputValid"
            @click="finishRotation"
          >
            <template #icon>
              <n-icon><RefreshOutline /></n-icon>
            </template>
            重启系统并使用新密钥登录
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- 编辑每日限额弹窗 -->
    <n-modal
      v-model:show="editDailyLimitModalVisible"
      preset="card"
      title="编辑每日限额"
      size="small"
      :mask-closable="false"
      style="max-width: 450px"
    >
      <n-form label-placement="top">
        <n-form-item label="每日限额 (USD)">
          <n-input-number
            v-model:value="editDailyLimitForm.dailyLimit"
            :min="0"
            :step="1"
            :max="authStore.isRoot ? undefined : (selfUsage?.hard_limit || undefined)"
            style="width: 100%"
            placeholder="设置每日最高消费额度"
          />
          <template #feedback>
            <span style="font-size: 0.85rem; color: var(--daw-text-secondary)">
              设置为 0 表示不限制每日消费
              <span v-if="!authStore.isRoot && selfUsage?.daily_limit">
                <br />当前每日限额: {{ formatCurrency(selfUsage.daily_limit) }}，每日限额不能超过此值
              </span>
            </span>
          </template>
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="editDailyLimitModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="submittingDailyLimit" @click="handleUpdateDailyLimit">
            保存
          </n-button>
        </div>
      </template>
    </n-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  NButton,
  NCard,
  NDatePicker,
  NSpace,
  NBadge,
  NModal,
  NAlert,
  NSpin,
  NIcon,
  NInput,
  NProgress,
} from 'naive-ui';
import dayjs from 'dayjs';
import {
  WalletOutline,
  PulseOutline,
  FlashOutline,
  CalendarOutline,
  NotificationsOutline,
  CopyOutline,
  SaveOutline,
  WarningOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
  RefreshOutline,
  CreateOutline,
  EyeOutline,
  EyeOffOutline,
  ArrowForwardOutline,
  ChevronDownOutline,
  ChevronUpOutline,
} from '@vicons/ionicons5';
import { useAuthStore } from '@/store/auth';
import { useNotifications } from '@/composables/useNotifications';
import { getUsage, getNews, getLiveStatusWithKey } from '@/api/dashboard';
import { rotateSelfKey as rotateSelfKeyApi } from '@/api/accounts';
import { formatCurrency, formatNumber, formatDateTime, diffFromNow, maskApiKey } from '@/utils/formatters';
import { useMessage } from 'naive-ui';
import { setAuthToken, disable401Handling, enable401Handling } from '@/utils/httpClient';
import BackToTop from '@/components/common/BackToTop.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const message = useMessage();

// 通知相关
const { fetchNews, stopPolling: stopNotificationPolling, startPolling: startNotificationPolling } = useNotifications();

const loading = ref(false);
const loadingSummary = ref(false);
const loadingSelfUsage = ref(false);
const info = ref(authStore.profile || null);
const usageSummary = ref(null);
const usageTrend = ref(null);
const news = ref([]);
const selfUsage = ref(null);
const lastUpdated = ref(null);
const showApiKey = ref(false);
const dismissedNewsIds = ref(new Set());
const notificationsRef = ref(null);

const rotateModalVisible = ref(false);
const rotateState = ref('confirm'); // confirm, processing, result
const rotatedKey = ref('');
const confirmInput = ref(''); // 用户确认输入的密钥
const copyConfirmed = ref(false);

const editDailyLimitModalVisible = ref(false);
const editDailyLimitForm = ref({ dailyLimit: 0 });
const submittingDailyLimit = ref(false);
const isCreditExpanded = ref(false);

const POLL_INTERVAL = 2 * 60 * 60 * 1000; // 2小时
let pollTimer = null;

const filterTabs = [
  { label: '今日实时', value: 'today' },
  { label: '指定日期', value: 'date' },
  { label: '时间范围', value: 'range' },
];
const activeFilter = ref('today');
const selectedDate = ref(dayjs().valueOf());
const selectedRange = ref([
  dayjs().subtract(6, 'day').startOf('day').valueOf(),
  dayjs().endOf('day').valueOf(),
]);

const NEWS_TODAY_KEY = 'dawapi:news-dismissed-date';

onMounted(async () => {
  loadDismissedNews();
  await refresh();
  // 同时更新全局通知状态
  fetchNews();
  pollTimer = window.setInterval(() => {
    refresh();
  }, POLL_INTERVAL);

  // 检查是否需要打开轮换弹窗
  if (route.query.action === 'rotate-key') {
    openRotateModal();
    // 清除 query 参数
    router.replace({ name: 'dashboard' });
  }
});

// 监听路由 query 参数变化
watch(
  () => route.query.action,
  (action) => {
    if (action === 'rotate-key') {
      openRotateModal();
      // 清除 query 参数
      router.replace({ name: 'dashboard' });
    }
  }
);

onBeforeUnmount(() => {
  if (pollTimer) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }
});

async function refresh() {
  loading.value = true;
  try {
    const usageParams = buildUsageParams();
    const [summaryRes, newsRes] = await Promise.all([
      getUsage(usageParams),
      getNews(),
    ]);

    // 使用已有的 profile，不强制刷新
    info.value = authStore.profile;
    usageSummary.value = summaryRes.data;
    news.value = normalizeNews(newsRes.data);
    if (isNewsDismissedToday()) news.value = [];
    await fetchSelfUsage();
    lastUpdated.value = new Date();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '加载仪表盘数据失败';
    message.error(errorMessage);
  } finally {
    loading.value = false;
  }
}

function buildUsageParams() {
  if (activeFilter.value === 'date') {
    return { date: dayjs(selectedDate.value).format('YYYY-MM-DD') };
  }
  if (activeFilter.value === 'range' && Array.isArray(selectedRange.value)) {
    return {
      start: dayjs(selectedRange.value[0]).format('YYYY-MM-DD'),
      end: dayjs(selectedRange.value[1]).format('YYYY-MM-DD'),
    };
  }
  return {};
}

async function applyUsageFilter() {
  loadingSummary.value = true;
  try {
    const usageRes = await getUsage(buildUsageParams());

    // 使用已有的 profile，不强制刷新
    info.value = authStore.profile;
    usageSummary.value = usageRes.data;
    await fetchSelfUsage();
    lastUpdated.value = new Date();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '刷新失败';
    message.error(errorMessage);
  } finally {
    loadingSummary.value = false;
  }
}

async function fetchSelfUsage() {
  if (!authStore.apiKey) {
    selfUsage.value = null;
    return;
  }
  loadingSelfUsage.value = true;
  try {
    const response = await getLiveStatusWithKey(authStore.apiKey);
    console.log('selfUsage API response:', response.data);
    selfUsage.value = response.data;
  } catch (error) {
    selfUsage.value = null;
  } finally {
    loadingSelfUsage.value = false;
  }
}

function normalizeNews(payload = {}) {
  const allNews = [];
  const pushItems = (items = [], type) => {
    items.forEach((item) => {
      allNews.push({
        ...item,
        id: `${type}-${item.created_at || Math.random()}`,
        type,
        typeLabel: type === 'sys' ? '系统' : type === 'user' ? '账户' : '族群',
        expiresText: diffFromNow(item.expires_at),
      });
    });
  };

  pushItems(payload.sys_news, 'sys');
  pushItems(payload.user_news, 'user');
  pushItems(payload.dna_news, 'dna');

  return allNews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function isNewsDismissedToday() {
  try {
    const stored = localStorage.getItem(NEWS_TODAY_KEY);
    if (!stored) return false;
    return stored === new Date().toDateString();
  } catch (error) {
    return false;
  }
}

const username = computed(() => authStore.displayName || '访客');

const formattedBalance = computed(() =>
  formatCurrency(info.value?.balance?.total ?? authStore.balance ?? 0, { scientific: true }),
);

const summaryIcons = {
  balance: WalletOutline,
  requests: PulseOutline,
  tokens: FlashOutline,
  image: CalendarOutline,
};

const summaryCards = computed(() => {
  const data = usageSummary.value || {};
  return [
    {
      key: 'balance',
      label: '总花费',
      value: formatCurrency(data.total_credit_used || 0, { scientific: true }),
      hint: 'USD',
      icon: summaryIcons.balance,
    },
    {
      key: 'requests',
      label: '总请求',
      value: formatNumber(data.total_requests || 0, { scientific: true }),
      hint: 'Requests',
      icon: summaryIcons.requests,
    },
    {
      key: 'tokens',
      label: '总 Tokens',
      value: formatNumber(data.total_prompt + data.total_completion || 0, { scientific: true }),
      hint: 'Prompt + Completion',
      icon: summaryIcons.tokens,
    },
    {
      key: 'image',
      label: '图片处理',
      value: formatNumber(data.total_image_n || 0, { scientific: false }),
      hint: 'Count',
      icon: summaryIcons.image,
    },
  ];
});

const selfUsageSummary = computed(() => {
  const data = selfUsage.value;
  if (!data) return [];
  const rows = [];
  if (data.balance !== undefined) {
    rows.push({ label: '余额', value: formatCurrency(data.balance, { scientific: true }) });
  }
  if (data.credit_used !== undefined) {
    rows.push({ label: '已使用', value: formatCurrency(data.credit_used, { scientific: true }) });
  }
  if (data.hard_limit !== undefined) {
    rows.push({ label: '每月限额', value: formatCurrency(data.hard_limit, { scientific: true }) });
  }
  // 每日限额改为进度条展示，不在这里显示
  const rpm = data.rpm ?? data.requests_per_minute;
  if (rpm !== undefined) {
    rows.push({ label: 'RPM', value: formatNumber(rpm, { scientific: true }) });
  }
  const tpm = data.tpm ?? data.tokens_per_minute;
  if (tpm !== undefined) {
    rows.push({ label: 'TPM', value: formatNumber(tpm, { scientific: true }) });
  }
  if (data.create_at) {
    rows.push({ label: '创建时间', value: formatDateTime(data.create_at, 'YYYY-MM-DD HH:mm') });
  }
  return rows;
});

const dailyLimitPercentage = computed(() => {
  const limit = selfUsage.value?.daily_limit;
  const used = usageSummary.value?.total_credit_used || 0; // 使用今日实时的总花费
  if (!limit || limit === 0) return 0;
  const percentage = (used / limit) * 100;
  return Math.min(percentage, 100);
});

const dailyLimitStatus = computed(() => {
  const limit = selfUsage.value?.daily_limit;
  const used = usageSummary.value?.total_credit_used || 0;
  if (!limit || limit === 0) return 'default';
  const percentage = (used / limit) * 100;
  if (percentage >= 100) return 'error';
  if (percentage >= 90) return 'error';
  if (percentage >= 70) return 'warning';
  return 'success';
});

const monthlyLimitPercentage = computed(() => {
  const limit = selfUsage.value?.hard_limit;
  const used = selfUsage.value?.credit_used || 0; // 当月已使用
  if (!limit || limit === 0) return 0;
  const percentage = (used / limit) * 100;
  return Math.min(percentage, 100);
});

const monthlyLimitStatus = computed(() => {
  const limit = selfUsage.value?.hard_limit;
  const used = selfUsage.value?.credit_used || 0;
  if (!limit || limit === 0) return 'default';
  const percentage = (used / limit) * 100;
  if (percentage >= 100) return 'error';
  if (percentage >= 90) return 'error';
  if (percentage >= 70) return 'warning';
  return 'success';
});

const displayedApiKey = computed(() => {
  if (!authStore.apiKey) return '--';
  return showApiKey.value ? authStore.apiKey : maskApiKey(authStore.apiKey, 4);
});

const usageTrendSeries = computed(() => {
  const daily = usageTrend.value?.daily_costs || [];
  return daily
    .map((item) => ({
      date: formatDateTime(item.timestamp * 1000, 'MM-DD'),
      cost: Number(item.cost || item.total_cost || 0),
      requests: Number(item.requests || item.total_requests || 0),
    }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));
});

const hasTrendData = computed(() =>
  usageTrendSeries.value.length > 0 && usageTrendSeries.value.some((item) => item.cost > 0),
);

const usageTrendOption = computed(() => {
  if (!hasTrendData.value) {
    return {};
  }
  return {
    color: ['#5a56f6', '#f472b6'],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderWidth: 0,
      textStyle: {
        color: '#f8fafc',
      },
      formatter: (params) => {
        const [costPoint, requestPoint] = params;
        return [
          `<strong>${costPoint.axisValue}</strong>`,
          `花费：${formatCurrency(costPoint.data, { scientific: true })}`,
          requestPoint ? `请求：${formatNumber(requestPoint.data)}` : '',
        ]
          .filter(Boolean)
          .join('<br/>');
      },
    },
    legend: {
      data: ['花费', '请求数'],
      top: 16,
      icon: 'roundRect',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '6%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: usageTrendSeries.value.map((item) => item.date),
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.4)' } },
    },
    yAxis: [
      {
        type: 'value',
        name: '花费 (USD)',
        axisLabel: {
          formatter: (value) => `$${formatNumber(value, { scientific: true })}`,
        },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      },
      {
        type: 'value',
        name: '请求数',
        position: 'right',
        axisLabel: {
          formatter: (value) => formatNumber(value, { maximumFractionDigits: 0, scientific: false }),
        },
        axisLine: { show: false },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '花费',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        data: usageTrendSeries.value.map((item) => item.cost),
        areaStyle: {
          color: 'rgba(90, 86, 246, 0.18)',
        },
      },
      {
        name: '请求数',
        type: 'bar',
        yAxisIndex: 1,
        barWidth: 14,
        data: usageTrendSeries.value.map((item) => item.requests),
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
        },
      },
    ],
  };
});

const panelTitle = computed(() => {
  switch (activeFilter.value) {
    case 'date':
      return `指定日期 · ${dayjs(selectedDate.value).format('YYYY-MM-DD')} 用量趋势`;
    case 'range':
      return `时间范围 · ${dayjs(selectedRange.value[0]).format('MM-DD')} 至 ${dayjs(
        selectedRange.value[1],
      ).format('MM-DD')} 用量趋势`;
    default:
      return '近 7 天用量趋势';
  }
});

const panelSubtitle = computed(() => {
  switch (activeFilter.value) {
    case 'date':
      return '指定日期账单统计，可用于账务对账。';
    case 'range':
      return '按时间范围统计，建议不超过 30 天。';
    default:
      return '实时账单数据，帮助判断成本波动。';
  }
});

const trendSummary = computed(() => {
  const totals = usageTrendSeries.value.reduce(
    (acc, item) => {
      acc.cost += item.cost;
      acc.requests += item.requests;
      return acc;
    },
    { cost: 0, requests: 0 },
  );
  return {
    totalCost: formatCurrency(totals.cost || 0, { scientific: true }),
    totalRequests: formatNumber(totals.requests || 0),
  };
});

const creditCredits = computed(() => {
  const credits = info.value?.balance?.credits || [];
  return credits.map((credit) => {
    const expires = formatDateTime(credit.expires_at, 'YYYY-MM-DD');
    const remainingText = diffFromNow(credit.expires_at);
    const isWarning = remainingText !== '已过期' && (remainingText.includes('天') || remainingText.includes('小时'));
    return {
      amount: formatCurrency(credit.amount || credit.balance || 0, { scientific: true }),
      expires,
      remainingText,
      isWarning,
      expires_at: credit.expires_at,
    };
  });
});

const sortOptions = [
  { label: '按花费', value: 'cost' },
  { label: '按请求', value: 'requests' },
  { label: '按 Prompt', value: 'prompt' },
  { label: '按 Completion', value: 'completion' },
];

const sortBy = ref('cost');

const sortedModelRows = computed(() => {
  const summary = usageSummary.value?.usage_summary || {};
  const models = Object.entries(summary).map(([name, stats]) => {
    const modelStats = stats.model_stats || {};
    const cost = modelStats.CreditUsed || 0;
    const requests = modelStats.Requests || 0;
    const prompt = modelStats.Prompt || 0;
    const completion = modelStats.Completion || 0;
    const percentage = stats.usage_analysis?.cost_percentage || 0;
    return {
      name,
      displayName: name.length > 32 ? `${name.slice(0, 29)}…` : name,
      cost: formatCurrency(cost, { scientific: true }),
      requests: formatNumber(requests),
      prompt: formatNumber(prompt),
      completion: formatNumber(completion),
      percentage: `${percentage.toFixed(1)}%`,
      percentageWidth: `${Math.min(100, percentage)}%`,
      raw: { cost, requests, prompt, completion },
    };
  });

  switch (sortBy.value) {
    case 'requests':
      models.sort((a, b) => b.raw.requests - a.raw.requests);
      break;
    case 'prompt':
      models.sort((a, b) => b.raw.prompt - a.raw.prompt);
      break;
    case 'completion':
      models.sort((a, b) => b.raw.completion - a.raw.completion);
      break;
    default:
      models.sort((a, b) => b.raw.cost - a.raw.cost);
      break;
  }
  return models;
});

const visibleNews = computed(() => news.value.filter((item) => !dismissedNewsIds.value.has(item.id)));

const notificationCount = computed(() => visibleNews.value.length);

const topNews = computed(() => visibleNews.value.slice(0, 3));

const rotateModalTitle = computed(() => {
  if (rotateState.value === 'processing') return '密钥轮换中';
  if (rotateState.value === 'result') return '新密钥已生成';
  return '变更 API 密钥';
});

const isConfirmInputValid = computed(() => {
  return confirmInput.value.trim() === rotatedKey.value.trim();
});

const lastUpdatedText = computed(() => (lastUpdated.value ? formatDateTime(lastUpdated.value, 'YYYY-MM-DD HH:mm') : '尚未刷新'));

// 所有充值卡明细（包括有效和失效的）
const allCreditBalance = computed(() => {
  const creditBalance = selfUsage.value?.credit_balance || selfUsage.value?.CreditBalance || [];
  if (!Array.isArray(creditBalance)) return [];

  const now = new Date();
  
  // 处理所有充值卡
  const processedCredits = creditBalance
    .map(credit => {
      const expiresAt = credit.expires_at || credit.ExpiresAt;
      const balance = credit.balance || credit.Balance || 0;
      const amount = credit.amount || credit.Amount || balance; // 总量，如果没有则使用余额
      
      if (!expiresAt) return null;
      
      const remainingText = diffFromNow(expiresAt);
      const expiresDate = new Date(expiresAt);
      const isExpired = expiresDate <= now;
      
      // 判断是否即将过期（7天内且未过期）
      const daysUntilExpiry = (expiresDate - now) / (1000 * 60 * 60 * 24);
      const isExpiringSoon = !isExpired && daysUntilExpiry <= 7;
      
      // 判断是否正在使用（balance 小于 amount）
      const isActive = balance < amount && balance > 0 && !isExpired;
      
      // 判断是否余额已用完
      const isDepleted = balance <= 0;
      
      // 计算使用百分比
      const usagePercentage = amount > 0 ? ((amount - balance) / amount) * 100 : 0;

      return {
        balance,
        amount,
        expires_at: expiresAt,
        remainingText,
        isExpiringSoon,
        isExpired,
        isActive,
        isDepleted,
        usagePercentage: Math.min(Math.max(usagePercentage, 0), 100), // 限制在 0-100 之间
      };
    })
    .filter(credit => credit !== null);
  
  // 排序：使用中的在最前面，然后是有效的，最后是失效的；同类按到期时间排序
  return processedCredits.sort((a, b) => {
    // 优先级1：使用中的卡片排在最前面
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    // 优先级2：有效的在前，失效的在后
    if (a.isExpired !== b.isExpired) {
      return a.isExpired ? 1 : -1;
    }
    
    // 优先级3：同类按到期时间排序
    return new Date(a.expires_at) - new Date(b.expires_at);
  });
});

// 有效期内总余额
const totalValidCredit = computed(() => {
  return allCreditBalance.value
    .filter(credit => !credit.isExpired)
    .reduce((sum, credit) => sum + credit.balance, 0);
});

// 显示的充值卡明细（根据展开状态）
const displayedCreditBalance = computed(() => {
  if (isCreditExpanded.value || allCreditBalance.value.length <= 2) {
    return allCreditBalance.value;
  }
  return allCreditBalance.value.slice(0, 2);
});

function loadDismissedNews() {
  try {
    const raw = localStorage.getItem('dawapi:news-dismissed');
    if (raw) {
      dismissedNewsIds.value = new Set(JSON.parse(raw));
    }
  } catch (error) {
    console.warn('Failed to load dismissed news cache', error);
  }
}

function persistDismissedNews() {
  try {
    localStorage.setItem('dawapi:news-dismissed', JSON.stringify(Array.from(dismissedNewsIds.value)));
  } catch (error) {
    console.warn('Failed to persist dismissed news cache', error);
  }
}

function dismissNews(id) {
  dismissedNewsIds.value.add(id);
  persistDismissedNews();
}

function dismissNewsToday() {
  const today = new Date().toDateString();
  localStorage.setItem(NEWS_TODAY_KEY, today);
  news.value = [];
  dismissedNewsIds.value.clear();
  persistDismissedNews();
}

function selectFilter(filter) {
  activeFilter.value = filter;
  if (filter === 'today') {
    selectedDate.value = dayjs().valueOf();
    selectedRange.value = [
      dayjs().subtract(6, 'day').startOf('day').valueOf(),
      dayjs().endOf('day').valueOf(),
    ];
    applyUsageFilter();
  }
}

function disableFuture(ts) {
  return ts > Date.now();
}

function toggleApiKey() {
  showApiKey.value = !showApiKey.value;
}

async function copyApiKey() {
  if (!authStore.apiKey || !navigator.clipboard) {
    message.warning('无法复制密钥');
    return;
  }
  try {
    await navigator.clipboard.writeText(authStore.apiKey);
    message.success('密钥已复制');
  } catch (error) {
    message.error('复制失败');
  }
}

function scrollToNotifications() {
  const target = notificationsRef.value;
  const el = target?.$el || target;
  if (el && typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function openRotateModal() {
  rotateModalVisible.value = true;
  rotateState.value = 'confirm';
  rotatedKey.value = '';
  confirmInput.value = '';
  copyConfirmed.value = false;
}

async function startRotate() {
  rotateState.value = 'processing';
  copyConfirmed.value = false;

  // 暂停所有轮询，避免在轮转过程中用旧密钥请求导致401
  if (pollTimer) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }
  stopNotificationPolling();

  // 临时禁用 401 处理器，避免轮转过程中被登出
  disable401Handling();

  try {
    // 生成确认参数：当前日期 + "-ROTATE-SELF"
    const today = dayjs().format('YYYY-MM-DD');
    const confirmParam = `${today}-ROTATE-SELF`;

    const response = await rotateSelfKeyApi({ confirm: confirmParam });
    rotatedKey.value =
      response?.data?.SecretKey ||
      response?.data?.secret_key ||
      response?.data?.NewSecretKey ||
      response?.data?.data?.SecretKey ||
      '';

    if (!rotatedKey.value) {
      message.warning('接口未返回新密钥，请确认后端配置');
      rotateState.value = 'confirm';
      // 重启轮询
      pollTimer = window.setInterval(() => {
        refresh();
      }, POLL_INTERVAL);
      startNotificationPolling(60000);
      // 恢复 401 处理器
      enable401Handling();
      return;
    }

    // 密钥轮转成功，立即更新本地存储的密钥和 HTTP 客户端 token，避免后续请求401
    authStore.apiKey = rotatedKey.value;
    localStorage.setItem('dawapi:api-key', rotatedKey.value);
    setAuthToken(rotatedKey.value);

    // 恢复 401 处理器
    enable401Handling();

    // 重启轮询，使用新密钥
    pollTimer = window.setInterval(() => {
      refresh();
    }, POLL_INTERVAL);
    startNotificationPolling(60000);

    rotateState.value = 'result';
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '轮换密钥失败';
    message.error(errorMessage);
    rotateState.value = 'confirm';
    // 恢复 401 处理器
    enable401Handling();
    // 重启轮询
    pollTimer = window.setInterval(() => {
      refresh();
    }, POLL_INTERVAL);
    startNotificationPolling(60000);
  }
}

async function copyRotatedKey() {
  if (!rotatedKey.value) {
    message.warning('暂无可复制的密钥');
    return;
  }
  if (!navigator.clipboard) {
    message.warning('浏览器不支持剪贴板，请使用保存功能');
    return;
  }
  try {
    await navigator.clipboard.writeText(rotatedKey.value);
    message.success('已复制到剪贴板');
    copyConfirmed.value = true;
  } catch (error) {
    message.error('复制失败，请手动复制或保存文件');
  }
}

function downloadRotatedKey() {
  if (!rotatedKey.value) {
    message.warning('暂无密钥');
    return;
  }
  const blob = new Blob([rotatedKey.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dawapi-key-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  copyConfirmed.value = true;
  message.success('已保存密钥文件');
}

function cancelRotate() {
  // 不允许在处理中取消
  if (rotateState.value === 'processing') return;

  rotateModalVisible.value = false;

  // 如果用户在确认阶段取消，确保恢复 401 处理器和轮询
  // （虽然确认阶段还没禁用，但为了安全起见统一处理）
  enable401Handling();

  // 确保轮询正常运行
  if (!pollTimer) {
    pollTimer = window.setInterval(() => {
      refresh();
    }, POLL_INTERVAL);
  }

  // 确保通知轮询正常运行
  startNotificationPolling(60000);
}

function finishRotation() {
  rotateModalVisible.value = false;
  message.success('密钥已轮换，请使用新密钥重新登录');
  authStore.logout();
  router.replace({ name: 'login', query: { reason: 'rotate' } });
}

function goTo(name) {
  router.push({ name }).catch(() => {});
}

function toggleCreditExpanded() {
  isCreditExpanded.value = !isCreditExpanded.value;
}

// 生成波浪路径
function generateWavePath(percentage, offset = 0) {
  const waveHeight = 8; // 波浪高度
  const waveCount = 3; // 波浪数量
  const width = 200;
  const fillHeight = 200 - (percentage / 100) * 180; // 液体高度
  
  let path = `M 0,${fillHeight}`;
  
  // 生成波浪曲线
  for (let i = 0; i <= width; i += 2) {
    const x = i;
    const y = fillHeight + Math.sin((i / width) * Math.PI * waveCount + (offset / 100) * Math.PI * 2) * waveHeight;
    path += ` L ${x},${y}`;
  }
  
  // 闭合路径
  path += ` L ${width},200 L 0,200 Z`;
  
  return path;
}

// 获取不同状态的颜色
function getGradientColor(status, type) {
  const colors = {
    success: {
      start: '#10b981',
      end: '#059669',
      border: '#10b981',
    },
    warning: {
      start: '#f59e0b',
      end: '#d97706',
      border: '#f59e0b',
    },
    error: {
      start: '#ef4444',
      end: '#dc2626',
      border: '#ef4444',
    },
    default: {
      start: '#5a56f6',
      end: '#4338ca',
      border: '#5a56f6',
    }
  };
  
  return colors[status]?.[type] || colors.default[type];
}

function openEditDailyLimitModal() {
  editDailyLimitForm.value.dailyLimit = selfUsage.value?.daily_limit || 0;
  editDailyLimitModalVisible.value = true;
}

async function handleUpdateDailyLimit() {
  try {
    submittingDailyLimit.value = true;
    const newDailyLimit = Number(editDailyLimitForm.value.dailyLimit);

    // 如果不是 root 用户，需要验证不能超过每月限额
    if (!authStore.isRoot) {
      const hardLimit = selfUsage.value?.hard_limit;

      // 如果设置了每月限额，每日限额不能超过每月限额
      if (hardLimit !== undefined && hardLimit !== null && hardLimit > 0) {
        if (newDailyLimit > hardLimit) {
          message.error(`每日限额不能超过每月限额 (${formatCurrency(hardLimit)})`);
          return;
        }
      }
    }

    const payload = {
      DailyLimit: newDailyLimit
    };

    // 使用当前 API Key 更新自己的账户
    const { updateUser } = await import('@/api/accounts');
    await updateUser(authStore.apiKey, payload);

    message.success('每日限额已更新');
    editDailyLimitModalVisible.value = false;

    // 刷新数据
    await fetchSelfUsage();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '更新失败';
    message.error(errorMessage);
  } finally {
    submittingDailyLimit.value = false;
  }
}

</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dashboard-hero {
  display: flex;
}

.hero-unified {
  width: 100%;
  padding: 24px 28px;
  border-radius: 20px;
  background: var(--daw-surface);
  box-shadow: var(--daw-shadow-md);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(240, 242, 255, 0.8);
}

.hero-header-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-greeting {
  margin: 0;
  color: var(--daw-text-secondary);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.75rem;
  white-space: nowrap;
}

.hero-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  white-space: nowrap;
}

.hero-balance {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.08), rgba(139, 92, 246, 0.06));
  border-radius: 14px;
  border: 1px solid rgba(90, 86, 246, 0.15);
}

.hero-balance__label {
  font-size: 0.8rem;
  color: var(--daw-text-secondary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.hero-balance__value {
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, #5a56f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 核心信息一览 - 一行搞定 */
.core-info-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 14px;
  align-items: stretch;
}

/* API Key 精简展示 */
.api-key-mini {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
  border: 2px solid rgba(90, 86, 246, 0.2);
  border-radius: 16px;
  min-height: 0;
  box-shadow: 0 4px 16px rgba(90, 86, 246, 0.12), 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.api-key-mini::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #5a56f6, #8b5cf6, #5a56f6);
  background-size: 200% 100%;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.api-key-mini:hover {
  border-color: rgba(90, 86, 246, 0.4);
  box-shadow: 0 8px 24px rgba(90, 86, 246, 0.2), 0 2px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.api-key-mini-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.api-key-mini-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--daw-text-primary);
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.api-key-mini-actions {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

.api-key-action-btn {
  padding: 4px 10px !important;
  border-radius: 8px !important;
  background: rgba(90, 86, 246, 0.08) !important;
  border: 1px solid rgba(90, 86, 246, 0.15) !important;
  transition: all 0.2s ease !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
}

.api-key-action-btn:hover {
  background: rgba(90, 86, 246, 0.15) !important;
  border-color: rgba(90, 86, 246, 0.3) !important;
  transform: translateY(-1px);
}

.api-key-action-btn:active {
  transform: translateY(0);
}

.api-key-mini:hover .api-key-action-btn {
  background: rgba(90, 86, 246, 0.1) !important;
}

.api-key-mini-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.75rem;
  color: var(--daw-text-primary);
  word-break: break-all;
  line-height: 1.5;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 限额进度卡片 */
.limit-progress-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 50%, #fafbff 100%);
  border: 2px solid rgba(90, 86, 246, 0.15);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(90, 86, 246, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.limit-progress-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    rgba(16, 185, 129, 0.6),
    rgba(245, 158, 11, 0.6),
    rgba(239, 68, 68, 0.6)
  );
  opacity: 0.5;
  transition: opacity 0.3s;
}

.limit-progress-card:hover::before {
  opacity: 1;
}

.limit-progress-card:hover {
  box-shadow: 0 8px 24px rgba(90, 86, 246, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  border-color: rgba(90, 86, 246, 0.3);
}

.limit-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.limit-card-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--daw-text-primary);
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.limit-card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.limit-card-percentage {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 1.2rem;
  font-weight: 800;
  transition: color 0.3s;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.limit-card-percentage.status-success {
  color: #10b981;
}

.limit-card-percentage.status-warning {
  color: #f59e0b;
}

.limit-card-percentage.status-error {
  color: #ef4444;
}

.limit-card-percentage.status-default {
  color: #5a56f6;
}

.limit-edit-btn {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.limit-progress-card:hover .limit-edit-btn {
  opacity: 1;
}

/* 进度条 */
.limit-progress-bar {
  position: relative;
  height: 14px;
  background: linear-gradient(90deg, rgba(226, 232, 240, 0.3), rgba(226, 232, 240, 0.5));
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.limit-progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.limit-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.fill-success {
  background: linear-gradient(90deg, #10b981, #34d399, #10b981);
  background-size: 200% 100%;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3);
  animation: progress-glow 2s ease-in-out infinite;
}

.fill-warning {
  background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
  background-size: 200% 100%;
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3);
  animation: progress-glow 2s ease-in-out infinite;
}

.fill-error {
  background: linear-gradient(90deg, #ef4444, #f87171, #ef4444);
  background-size: 200% 100%;
  box-shadow: 0 0 16px rgba(239, 68, 68, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3);
  animation: progress-glow 2s ease-in-out infinite;
}

.fill-default {
  background: linear-gradient(90deg, #5a56f6, #8b5cf6, #5a56f6);
  background-size: 200% 100%;
  box-shadow: 0 0 16px rgba(90, 86, 246, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3);
  animation: progress-glow 2s ease-in-out infinite;
}

@keyframes progress-glow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* 限额信息 */
.limit-card-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
}

.limit-info-used {
  font-weight: 700;
  color: var(--daw-primary);
}

.limit-info-divider {
  color: var(--daw-text-secondary);
  font-weight: 400;
}

.limit-info-total {
  color: var(--daw-text-secondary);
  font-weight: 500;
}

/* 充值卡紧凑展示 */
.credit-balance-section-compact {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(247, 248, 253, 0.6), rgba(250, 250, 254, 0.4));
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 12px;
}

.credit-header-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.credit-title-compact {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--daw-text-primary);
}

.credit-actions-compact {
  display: flex;
  align-items: center;
  gap: 10px;
}

.credit-total-compact {
  font-size: 0.75rem;
  color: var(--daw-text-secondary);
}

.credit-total-compact strong {
  color: var(--daw-primary);
  font-weight: 700;
}

.toggle-credit-btn-compact {
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(90, 86, 246, 0.08);
  color: var(--daw-primary);
  font-size: 0.7rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 1px solid rgba(90, 86, 246, 0.15);
}

.toggle-credit-btn-compact:hover {
  background: rgba(90, 86, 246, 0.12);
  border-color: rgba(90, 86, 246, 0.25);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.section-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--daw-text-primary);
}

.section-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.usage-loading {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--daw-text-secondary);
}


/* Usage Stats */
.usage-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 120px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--daw-text-secondary);
  font-weight: 500;
}

.stat-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--daw-text-primary);
}

.stats-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--daw-text-secondary);
  font-size: 0.85rem;
  padding: 20px 0;
}


.liquid-ball-background {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(240, 242, 255, 0.8), rgba(250, 250, 254, 0.6));
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

/* 不同状态的背景色 */
.bg-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.05));
  box-shadow: inset 0 2px 8px rgba(16, 185, 129, 0.1), 0 0 20px rgba(16, 185, 129, 0.1);
}

.bg-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.05));
  box-shadow: inset 0 2px 8px rgba(245, 158, 11, 0.1), 0 0 20px rgba(245, 158, 11, 0.1);
}

.bg-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.05));
  box-shadow: inset 0 2px 8px rgba(239, 68, 68, 0.1), 0 0 20px rgba(239, 68, 68, 0.1);
}

.bg-default {
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.08), rgba(67, 56, 202, 0.05));
  box-shadow: inset 0 2px 8px rgba(90, 86, 246, 0.1), 0 0 20px rgba(90, 86, 246, 0.1);
}

.liquid-ball {
  width: 130px;
  height: 130px;
  position: relative;
  z-index: 1;
}

.liquid-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 3px 10px rgba(90, 86, 246, 0.15));
}

/* 波浪动画 */
.liquid-wave-1 {
  animation: wave-1 2.8s ease-in-out infinite;
}

.liquid-wave-2 {
  animation: wave-2 3.2s ease-in-out infinite;
}

@keyframes wave-1 {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-8px);
  }
}

@keyframes wave-2 {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(8px);
  }
}

/* 文字样式 */
.liquid-percentage {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 36px;
  font-weight: 700;
  fill: #1e293b;
  filter: drop-shadow(0 1px 2px rgba(255, 255, 255, 0.8));
}

.liquid-label-text {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  font-weight: 600;
  fill: #334155;
  filter: drop-shadow(0 1px 1px rgba(255, 255, 255, 0.8));
}

.liquid-label-sub {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 500;
  fill: #64748b;
  filter: drop-shadow(0 1px 1px rgba(255, 255, 255, 0.8));
}

/* 不同状态的水球样式 */
.liquid-success .liquid-svg {
  filter: drop-shadow(0 4px 16px rgba(16, 185, 129, 0.3));
}

.liquid-warning .liquid-svg {
  filter: drop-shadow(0 4px 16px rgba(245, 158, 11, 0.3));
}

.liquid-error .liquid-svg {
  filter: drop-shadow(0 4px 16px rgba(239, 68, 68, 0.3));
}

.liquid-default .liquid-svg {
  filter: drop-shadow(0 4px 16px rgba(90, 86, 246, 0.3));
}


.credit-balance-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.credit-balance-item {
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 10px;
  gap: 10px;
  transition: all 0.25s ease;
}

.credit-balance-item:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 3px 10px rgba(90, 86, 246, 0.12);
  border-color: rgba(90, 86, 246, 0.3);
  transform: translateY(-1px);
}

/* 使用中的卡片样式 */
.credit-balance-item.is-active {
  border-color: rgba(90, 86, 246, 0.5);
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.06), rgba(147, 51, 234, 0.04));
  box-shadow: 0 2px 12px rgba(90, 86, 246, 0.15);
}

.credit-balance-item.is-active:hover {
  border-color: rgba(90, 86, 246, 0.6);
  box-shadow: 0 4px 16px rgba(90, 86, 246, 0.25);
}

/* 已过期的卡片样式 */
.credit-balance-item.is-expired {
  opacity: 0.6;
  background: rgba(148, 163, 184, 0.08);
  border-color: rgba(148, 163, 184, 0.4);
}

.credit-balance-item.is-expired:hover {
  opacity: 0.75;
  transform: translateY(0);
}

/* 已用完的卡片样式 */
.credit-balance-item.is-depleted:not(.is-expired) {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.04);
}

.credit-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.credit-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.credit-amount-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.amount-label {
  font-size: 0.7rem;
  color: var(--daw-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.amount-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--daw-primary);
}

.is-expired .amount-value {
  color: var(--daw-text-secondary);
}

.amount-total {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--daw-text-secondary);
}

.credit-status-badges {
  display: flex;
  gap: 6px;
  align-items: center;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.status-active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-expired {
  background: rgba(148, 163, 184, 0.15);
  color: #64748b;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.status-depleted {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* 进度条样式 */
.credit-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.credit-progress-bar {
  flex: 1;
  height: 10px;
  border-radius: 10px;
  background: rgba(226, 232, 240, 0.5);
  overflow: hidden;
  position: relative;
}

.credit-progress-fill {
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(90deg, #10b981, #34d399);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

/* 使用中的进度条 - 绿色渐变 */
.progress-active .credit-progress-fill {
  background: linear-gradient(90deg, #10b981, #34d399);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
}

/* 已用完的进度条 - 红色 */
.progress-depleted .credit-progress-fill {
  background: linear-gradient(90deg, #ef4444, #f87171);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
}

/* 已过期的进度条 - 灰色 */
.progress-expired .credit-progress-fill {
  background: linear-gradient(90deg, #94a3b8, #cbd5e1);
  box-shadow: none;
}

.credit-progress-text {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--daw-text-secondary);
  min-width: 45px;
  text-align: right;
}

.is-expired .credit-progress-text {
  color: var(--daw-text-secondary);
  opacity: 0.7;
}

.credit-expires {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.expires-label {
  font-size: 0.7rem;
  color: var(--daw-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.expires-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--daw-text-primary);
}

.expires-value.expires-warning {
  color: #f59e0b;
}

.is-expired .expires-value {
  color: var(--daw-text-secondary);
}

.expires-remaining {
  font-size: 0.75rem;
  color: var(--daw-text-secondary);
  padding: 2px 8px;
  background: rgba(226, 232, 240, 0.4);
  border-radius: 6px;
}

.expires-remaining.warning {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  font-weight: 600;
}

.key-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.88rem;
  letter-spacing: 0.05em;
  color: var(--daw-text-primary);
  word-break: break-all;
  line-height: 1.5;
  font-weight: 500;
}

.usage-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 20px;
  min-height: 120px;
}

.usage-grid li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: var(--daw-text);
  line-height: 1.5;
  gap: 12px;
}

.usage-grid li .label {
  color: var(--daw-text-secondary);
  flex-shrink: 0;
}

.usage-grid li .value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
  font-size: 0.8rem;
}

.usage-grid li.empty {
  grid-column: 1 / -1;
  justify-content: center;
  color: var(--daw-text-secondary);
  font-size: 0.8rem;
  padding: 12px 0;
}

.hero-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(240, 242, 255, 0.8);
  font-size: 0.78rem;
  color: var(--daw-text-secondary);
}

.refresh-button {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.refresh-button:hover {
  background: rgba(90, 86, 246, 0.1);
  transform: scale(1.05);
}

.refresh-button:active {
  transform: scale(0.95);
}

.refresh-icon {
  width: 16px;
  height: 16px;
  color: var(--daw-primary);
}

.summary-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 18px;
  background: var(--daw-surface);
  box-shadow: var(--daw-shadow-md);
  flex-wrap: wrap;
}

.filter-tabs {
  display: inline-flex;
  background: rgba(240, 242, 255, 0.8);
  padding: 6px;
  border-radius: 16px;
  gap: 6px;
  flex-shrink: 0;
}

.filter-tab {
  border: none;
  background: transparent;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--daw-transition);
  color: var(--daw-text-secondary);
  white-space: nowrap; /* 防止文字换行 */
}

.filter-tab.active {
  background: rgba(91, 94, 246, 0.18);
  color: var(--daw-primary);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  margin-left: auto;
}

.refresh-button-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.refresh-data-button {
  border-radius: 14px;
  padding: 0 18px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(90, 86, 246, 0.15);
}

.refresh-data-button:hover {
  box-shadow: 0 4px 12px rgba(90, 86, 246, 0.25);
  transform: translateY(-1px);
}

.refresh-data-button:active {
  transform: translateY(0);
}

.refresh-data-icon {
  width: 18px;
  height: 18px;
  color: white;
  stroke: white;
}

.refresh-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #f59e0b;
  line-height: 1.3;
}

.warning-icon-small {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  color: #f59e0b;
  stroke: #f59e0b;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  min-height: 100px; /* 固定最小高度，防止加载时跳动 */
}

.summary-card {
  display: flex;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 20px;
  background: var(--daw-surface);
  box-shadow: var(--daw-shadow-sm);
  align-items: center;
}

.summary-card .icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(93, 95, 246, 0.12);
  color: var(--daw-primary);
}

.summary-card .content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-card .label {
  font-size: 0.85rem;
  color: var(--daw-text-secondary);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.summary-card .value {
  font-size: 1.6rem;
  font-weight: 600;
}

.summary-card .hint {
  font-size: 0.78rem;
  color: var(--daw-text-secondary);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.panel-card {
  border-radius: 26px;
  background: var(--daw-surface);
  box-shadow: var(--daw-shadow-md);
  padding: 28px 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.large-panel {
  min-height: 360px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}

.panel-header h3 {
  margin: 0;
}

.panel-header p {
  margin: 6px 0 0;
  color: var(--daw-text-secondary);
  font-size: 0.88rem;
}

.panel-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--daw-text-secondary);
  text-align: right;
}

.sort-group {
  display: inline-flex;
  background: rgba(240, 242, 255, 0.8);
  padding: 6px;
  border-radius: 16px;
  gap: 6px;
}

.sort-chip {
  border: none;
  background: transparent;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: var(--daw-transition);
}

.sort-chip.active {
  background: rgba(91, 94, 246, 0.16);
  color: var(--daw-primary);
}

.models-table {
  display: grid;
  gap: 12px;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 0.8fr 0.8fr 1fr 1fr;
  gap: 16px;
  align-items: center;
}

.table-head {
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--daw-text-secondary);
}

.table-row {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(247, 248, 253, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.model-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-bar {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: rgba(90, 86, 246, 0.15);
  margin-bottom: 4px;
}

.progress-bar__inner {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.8), rgba(247, 114, 182, 0.8));
}

.balance-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.balance-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(247, 248, 253, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.balance-list li.warning {
  border-color: rgba(250, 204, 21, 0.45);
  background: rgba(255, 251, 235, 0.86);
}

.balance-list .amount {
  font-weight: 600;
}

.balance-list .desc,
.balance-list .remaining {
  font-size: 0.82rem;
  color: var(--daw-text-secondary);
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.news-item {
  padding: 18px 20px;
  border-radius: 16px;
  background: #f7f8fd;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.news-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--daw-text-secondary);
  margin-bottom: 6px;
}

.news-type {
  padding: 4px 10px;
  border-radius: 999px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.7rem;
}

.news-type--sys {
  background: rgba(90, 86, 246, 0.16);
  color: var(--daw-primary);
}

.news-type--user {
  background: rgba(16, 185, 129, 0.16);
  color: #10b981;
}

.news-type--dna {
  background: rgba(244, 114, 182, 0.16);
  color: #f472b6;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.quick-item {
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(247, 248, 253, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.quick-item h4 {
  margin: 0 0 6px;
}

.quick-item p {
  margin: 0;
  color: var(--daw-text-secondary);
  font-size: 0.85rem;
}

.empty-state {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--daw-text-secondary);
  border: 1px dashed rgba(148, 163, 184, 0.25);
  border-radius: 14px;
  padding: 30px;
  background: rgba(248, 250, 255, 0.7);
  text-align: center;
}

.rotate-step {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rotate-step--center {
  align-items: center;
}

.rotate-text {
  margin-top: 12px;
  display: block;
  color: var(--daw-text-secondary);
}

.rotate-key {
  margin: 0;
  padding: 12px 16px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.85);
  color: #f8fafc;
  max-height: 240px;
  overflow: auto;
}

.rotate-buttons {
  display: flex;
  gap: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.key-display-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: rgba(240, 242, 255, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(90, 86, 246, 0.15);
}

.key-display-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--daw-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.key-display-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  padding: 14px 16px;
  background: rgba(15, 23, 42, 0.92);
  color: #10b981;
  border-radius: 12px;
  word-break: break-all;
  line-height: 1.6;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.key-confirm-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.key-confirm-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--daw-text-primary);
}

.key-confirm-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #ef4444;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.key-confirm-success {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #10b981;
  padding: 8px 12px;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

@media (max-width: 1100px) {
  .hero-side {
    width: 100%;
    flex-direction: row;
  }

  .hero-card {
    flex: 1;
  }
}

@media (max-width: 820px) {
  .dashboard-hero {
    flex-direction: column;
  }

  .hero-side {
    width: 100%;
    flex-direction: column;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .panel-meta {
    flex-direction: row;
    gap: 12px;
  }
}

@media (max-width: 1024px) {
  .core-info-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .liquid-ball-wrapper-mini {
    width: 120px;
    height: 120px;
  }

  .liquid-ball {
    width: 110px;
    height: 110px;
  }

  .liquid-percentage-mini {
    font-size: 30px;
  }
}

@media (max-width: 768px) {
  .hero-header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .hero-greeting {
    font-size: 0.7rem;
  }

  .hero-title {
    font-size: 1.2rem;
  }

  .core-info-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .summary-controls {
    flex-direction: column;
    align-items: stretch;
    min-height: auto;
    padding: 16px;
  }

  .filter-tabs {
    width: 100%;
    justify-content: center;
  }

  .filter-controls {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    min-width: auto;
  }

  .summary-cards {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    min-height: auto;
  }

  .table-head,
  .table-row {
    grid-template-columns: 1.6fr 1fr 1fr;
  }

  .table-head span:nth-child(n + 4),
  .table-row span:nth-child(n + 4) {
    display: none;
  }

  .hero-balance {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .hero-balance__value {
    font-size: 1.3rem;
  }
}
</style>
