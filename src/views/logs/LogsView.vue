<template>
  <section class="logs-view">
    <!-- 顶部操作栏 -->
    <n-card class="header-card" :bordered="false">
      <div class="header-content">
        <div class="header-info">
          <div class="icon-wrapper">
            <svg class="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div>
            <h2>操作日志</h2>
            <p>实时追踪敏感操作，支持关键词搜索与动作过滤</p>
          </div>
        </div>
        <div class="header-actions">
          <n-input
            v-model:value="searchTerm"
            placeholder="搜索用户名、IP、详情"
            clearable
            style="width: 280px"
          >
            <template #prefix>
              <n-icon>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </n-icon>
            </template>
          </n-input>
          <n-button secondary :loading="loading" @click="fetchLogs">
            <template #icon>
              <n-icon>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </n-icon>
            </template>
            刷新
          </n-button>
        </div>
      </div>

      <!-- 动作过滤器 -->
      <div class="action-filter">
        <div class="filter-row">
          <div class="filter-chips">
            <button
              type="button"
              class="action-chip"
              :class="{ active: !selectedAction }"
              @click="toggleAction('')"
            >
              <svg class="chip-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              全部
            </button>
            <button
              v-for="action in actionOptions"
              :key="action"
              type="button"
              class="action-chip"
              :class="{ active: action === selectedAction }"
              @click="toggleAction(action)"
            >
              <component :is="getActionIcon(action)" class="chip-icon" />
              {{ formatAction(action) }}
            </button>
          </div>

          <div class="filter-controls">
            <div class="filter-item">
              <span class="filter-label">目标ID</span>
              <n-input
                v-model:value="filterTargetId"
                placeholder="筛选目标ID"
                clearable
                style="width: 160px"
                size="small"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">状态</span>
              <n-select
                v-model:value="filterStatus"
                :options="statusOptions"
                clearable
                placeholder="全部"
                style="width: 120px"
                size="small"
              />
            </div>
            <n-button type="primary" size="small" @click="applyFilters" :loading="loading">
              应用筛选
            </n-button>
            <n-button size="small" @click="resetFilters">
              重置
            </n-button>
          </div>
        </div>
      </div>
    </n-card>

    <!-- 日志列表 -->
    <div class="logs-container">
      <div v-if="logs.length" class="logs-timeline">
        <div v-for="(log, index) in logs" :key="log.id" class="log-item" :class="{ selected: selectedLog?.id === log.id }" @click="selectLog(log)">
          <div class="log-indicator">
            <div class="indicator-dot"></div>
            <div v-if="index < logs.length - 1" class="indicator-line"></div>
          </div>
          <div class="log-card">
            <div class="log-header">
              <div class="log-action">
                <component :is="getActionIcon(log.action)" class="action-icon" />
                <span class="action-text">{{ formatAction(log.action) }}</span>
                <n-tag v-if="log.status" :type="log.status === 'success' ? 'success' : 'error'" size="small">
                  {{ log.status === 'success' ? '成功' : '失败' }}
                </n-tag>
              </div>
              <div class="log-time">
                <svg class="time-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ formatDateTime(log.created_at, 'MM-DD HH:mm:ss') }}
              </div>
            </div>
            <div class="log-body">
              <div class="log-info">
                <div class="info-item">
                  <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span class="info-label">发起人</span>
                  <span class="info-value">{{ log.parent_name || '--' }}</span>
                </div>
                <div v-if="log.user_name" class="info-item">
                  <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span class="info-label">子账户</span>
                  <span class="info-value">{{ log.user_name }}</span>
                </div>
                <div v-if="log.target_id" class="info-item">
                  <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                  </svg>
                  <span class="info-label">目标</span>
                  <span class="info-value">{{ log.target_id }}</span>
                </div>
                <div class="info-item">
                  <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                  </svg>
                  <span class="info-label">IP</span>
                  <span class="info-value">{{ log.ip || log.ip_address || '--' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p>没有匹配的日志记录</p>
      </div>

      <!-- 分页 -->
      <div v-if="totalCount > 0" class="pagination-wrapper">
        <n-pagination
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :page-count="pageCount"
          :item-count="totalCount"
          :page-sizes="pageSizes"
          show-size-picker
          show-quick-jumper
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        >
          <template #prefix="{ itemCount }">
            共 {{ itemCount }} 条
          </template>
        </n-pagination>
      </div>
    </div>

    <!-- 详情模态框 -->
    <n-modal
      v-model:show="detailModalVisible"
      preset="card"
      title="日志详情"
      size="large"
      style="max-width: 800px"
    >
      <div v-if="selectedLog" class="detail-content">
        <div class="detail-section">
          <h4 class="section-title">基本信息</h4>
          <n-descriptions>
            <n-descriptions-item label="操作动作">{{ formatAction(selectedLog.action) }}</n-descriptions-item>
            <n-descriptions-item label="发起人">{{ selectedLog.parent_name || '--' }}</n-descriptions-item>
            <n-descriptions-item label="子账户">{{ selectedLog.user_name || '--' }}</n-descriptions-item>
            <n-descriptions-item label="目标ID">{{ selectedLog.target_id || '--' }}</n-descriptions-item>
            <n-descriptions-item label="IP地址">{{ selectedLog.ip || '--' }}</n-descriptions-item>
            <n-descriptions-item label="操作时间">
              {{ formatDateTime(selectedLog.created_at) }}
            </n-descriptions-item>
          </n-descriptions>
        </div>

        <div v-if="prettyDetails !== '无详细数据'" class="detail-section">
          <h4 class="section-title">操作详情</h4>
          <div class="json-output">
            <pre>{{ prettyDetails }}</pre>
          </div>
        </div>
      </div>
    </n-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, h } from 'vue';
import { useMessage, NCard, NButton, NInput, NIcon, NTag, NModal, NDescriptions, NDescriptionsItem, NSelect, NPagination } from 'naive-ui';
import { getLogs } from '@/api/dashboard';
import { formatDateTime } from '@/utils/formatters';

const message = useMessage();

const logs = ref([]);
const loading = ref(false);
const searchTerm = ref('');
const selectedAction = ref('');
const selectedLog = ref(null);
const detailModalVisible = ref(false);

// 筛选条件
const filterTargetId = ref('');
const filterStatus = ref(null);

// 分页
const currentPage = ref(1);
const pageSize = ref(24);
const totalCount = ref(0);
const pageSizes = [24, 50, 100];

const statusOptions = [
  { label: '成功', value: 'success' },
  { label: '失败', value: 'error' },
];

onMounted(() => {
  fetchLogs();
});

const pageCount = computed(() => Math.ceil(totalCount.value / pageSize.value));

async function fetchLogs() {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
    };

    if (selectedAction.value) {
      params.action = selectedAction.value;
    }
    if (filterTargetId.value) {
      params.target_id = filterTargetId.value.trim();
    }
    if (filterStatus.value) {
      params.status = filterStatus.value;
    }

    const response = await getLogs(params);
    logs.value = response.data.logs || response.data || [];
    totalCount.value = response.data.total || logs.value.length;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '获取日志失败';
    message.error(errorMessage);
    logs.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
}

const actionOptions = computed(() => {
  const allActions = [
    'add_user',
    'recharge_user',
    'update_user',
    'delete_user',
    'get_users',
    'login',
    'rotate_self',
    'add_key',
    'update_key',
    'delete_key',
    'update_config',
    'create_news',
    'auto_config',
  ];
  return allActions;
});

function toggleAction(action) {
  if (selectedAction.value === action) {
    selectedAction.value = '';
  } else {
    selectedAction.value = action;
  }
  currentPage.value = 1;
  fetchLogs();
}

function applyFilters() {
  currentPage.value = 1;
  fetchLogs();
}

function resetFilters() {
  selectedAction.value = '';
  filterTargetId.value = '';
  filterStatus.value = null;
  currentPage.value = 1;
  fetchLogs();
}

function handlePageChange(page) {
  currentPage.value = page;
  fetchLogs();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handlePageSizeChange(size) {
  pageSize.value = size;
  currentPage.value = 1;
  fetchLogs();
}

function selectLog(log) {
  selectedLog.value = log;
  detailModalVisible.value = true;
}

function formatAction(action) {
  const map = {
    add_user: '创建子账户',
    recharge_user: '调整额度',
    update_user: '更新子账户',
    delete_user: '删除子账户',
    get_users: '获取用户信息',
    login: '登录',
    rotate_self: '轮换密钥',
    add_key: '新增 Provider',
    update_key: '更新 Provider',
    delete_key: '删除 Provider',
    update_config: '更新配置',
    create_news: '发布通知',
    auto_config: '自动配置',
  };
  return map[action] || action || '--';
}

function getActionIcon(action) {
  const iconMap = {
    add_user: () => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' })
    ]),
    recharge_user: () => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
    ]),
    update_user: () => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' })
    ]),
    delete_user: () => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
    ]),
    get_users: () => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })
    ]),
    login: () => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' })
    ]),
    rotate_self: () => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' })
    ]),
    add_key: () => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' })
    ]),
    update_key: () => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' })
    ]),
    delete_key: () => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' })
    ]),
    update_config: () => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
    ]),
    create_news: () => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' })
    ]),
    auto_config: () => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
    ]),
  };

  return iconMap[action] || (() => h('svg', { class: 'chip-icon', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
  ]));
}

const prettyDetails = computed(() => {
  if (!selectedLog.value?.details) {
    return '无详细数据';
  }
  try {
    const json = JSON.parse(selectedLog.value.details);
    return JSON.stringify(json, null, 2);
  } catch (error) {
    return selectedLog.value.details;
  }
});
</script>

<style scoped>
.logs-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 顶部卡片 */
.header-card {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 12px rgba(94, 92, 230, 0.08);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(94, 92, 230, 0.12), rgba(139, 92, 246, 0.08));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon {
  width: 28px;
  height: 28px;
  color: var(--daw-primary);
}

.header-info h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #5e5ce6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-info p {
  margin: 6px 0 0;
  color: var(--daw-text-secondary);
  font-size: 0.92rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 动作过滤器 */
.action-filter {
  padding-top: 16px;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
}

.filter-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-controls {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 0.8rem;
  color: var(--daw-text-secondary);
  font-weight: 500;
}

.action-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(94, 92, 230, 0.15);
  background: rgba(246, 244, 255, 0.4);
  padding: 8px 16px;
  border-radius: 14px;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--daw-text);
}

.action-chip:hover {
  background: rgba(94, 92, 230, 0.08);
  border-color: rgba(94, 92, 230, 0.25);
  transform: translateY(-1px);
}

.action-chip.active {
  background: linear-gradient(135deg, rgba(94, 92, 230, 0.15), rgba(139, 92, 246, 0.12));
  border-color: rgba(94, 92, 230, 0.35);
  color: var(--daw-primary);
  box-shadow: 0 2px 8px rgba(94, 92, 230, 0.12);
}

.chip-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 日志容器 */
.logs-container {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 24px 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(94, 92, 230, 0.08);
}

/* Timeline 布局 */
.logs-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.log-item {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 20px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.log-item:hover {
  opacity: 0.85;
}

.log-item.selected .log-card {
  border-color: rgba(94, 92, 230, 0.3);
  box-shadow: 0 4px 16px rgba(94, 92, 230, 0.12);
}

/* Timeline 指示器 */
.log-indicator {
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
  background: linear-gradient(135deg, #5e5ce6, #8b5cf6);
  border: 2px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 6px rgba(94, 92, 230, 0.25);
  z-index: 1;
}

.indicator-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(180deg, rgba(203, 213, 225, 0.5), rgba(203, 213, 225, 0.2));
  margin-top: 4px;
}

/* 日志卡片 */
.log-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 20px;
  padding: 20px 24px;
  margin-bottom: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.log-card:hover {
  border-color: rgba(94, 92, 230, 0.2);
  box-shadow: 0 4px 12px rgba(94, 92, 230, 0.08);
  transform: translateX(4px);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.log-action {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  padding: 6px;
  border-radius: 10px;
  color: var(--daw-primary);
  background: rgba(94, 92, 230, 0.1);
}

.action-text {
  font-weight: 600;
  font-size: 1rem;
  color: var(--daw-text);
}

.log-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--daw-text-secondary);
}

.time-icon {
  width: 14px;
  height: 14px;
}

/* 日志信息 */
.log-body {
  padding-top: 12px;
  border-top: 1px solid rgba(226, 232, 240, 0.4);
}

.log-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
}

.info-icon {
  width: 16px;
  height: 16px;
  color: rgba(94, 92, 230, 0.6);
  flex-shrink: 0;
}

.info-label {
  color: var(--daw-text-secondary);
  font-weight: 500;
}

.info-value {
  color: var(--daw-text);
  font-weight: 600;
  word-break: break-all;
}

/* 空状态 */
.empty-state {
  min-height: 320px;
  border: 2px dashed rgba(94, 92, 230, 0.15);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--daw-text-secondary);
  background: rgba(246, 244, 255, 0.2);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: rgba(94, 92, 230, 0.3);
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
}

/* 详情模态框 */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--daw-text);
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(94, 92, 230, 0.15);
}

.json-output {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.88));
  border-radius: 16px;
  padding: 20px;
  color: #e2e8f0;
  overflow-x: auto;
  border: 1px solid rgba(94, 92, 230, 0.2);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.15);
}

.json-output pre {
  margin: 0;
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, monospace;
  font-size: 0.85rem;
  line-height: 1.6;
}

/* 响应式 */
@media (max-width: 960px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .header-actions > * {
    width: 100%;
  }

  .log-info {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .header-card {
    padding: 24px;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .header-icon {
    width: 24px;
    height: 24px;
  }

  .header-info h2 {
    font-size: 1.5rem;
  }

  .log-item {
    grid-template-columns: 24px 1fr;
    gap: 12px;
  }

  .log-card {
    padding: 16px;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
