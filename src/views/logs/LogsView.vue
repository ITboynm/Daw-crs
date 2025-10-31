<template>
  <section class="logs-view">
    <!-- 返回顶部按钮 -->
    <BackToTop />
    
    <!-- 顶部操作栏 -->
    <n-card class="header-card" :bordered="false">
      <div class="toolbar">
        <div class="toolbar-left">
          <h3 class="page-title">操作日志</h3>
          <n-select 
            v-model:value="selectedAction" 
            :options="actionSelectOptions" 
            placeholder="操作类型" 
            clearable 
            style="width: 140px"
            @update:value="handleActionChange"
          />
          <n-input v-model:value="searchTerm" placeholder="搜索用户、IP" clearable style="width: 180px">
            <template #prefix><n-icon size="14"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></n-icon></template>
          </n-input>
          <n-input v-model:value="filterTargetId" placeholder="目标ID" clearable style="width: 120px" />
          <n-select v-model:value="filterStatus" :options="statusOptions" clearable placeholder="状态" style="width: 100px" />
        </div>
        <div class="toolbar-right">
          <n-button type="primary" @click="applyFilters" :loading="loading">查询</n-button>
          <n-button @click="resetFilters">重置</n-button>
          <n-button secondary :loading="loading" @click="fetchLogs">刷新</n-button>
        </div>
      </div>
    </n-card>

    <!-- 日志列表容器（固定高度） -->
    <n-card class="logs-container-card" :bordered="false">
      <div class="logs-container-header">
        <span class="logs-count">共 {{ totalCount }} 条记录</span>
      </div>
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

      </div>
      
      <!-- 分页 -->
      <div v-if="totalCount > 0" class="logs-pagination">
        <span class="pagination-total">共 {{ totalCount }} 条</span>
        <n-pagination
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :item-count="totalCount"
          :page-sizes="pageSizes"
          show-size-picker
          show-quick-jumper
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </n-card>

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
import BackToTop from '@/components/common/BackToTop.vue';

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
const pageSize = ref(10);
const totalCount = ref(0);
const pageSizes = [10, 20, 30, 50, 100];

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

// 操作类型选项（用于下拉）
const actionSelectOptions = computed(() => {
  const allActions = [
    'add_user',
    'recharge_user',
    'update_user',
    'delete_user',
    'get_user_info',
    'add_provider',
    'update_provider',
    'delete_provider',
    'rotate_password',
    'dynamic_balance',
    'login'
  ];
  
  return allActions.map(action => ({
    label: formatAction(action),
    value: action
  }));
});


function handleActionChange(value) {
  selectedAction.value = value || '';
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
  // 列表内部滚动到顶部
  const logsContainer = document.querySelector('.logs-container');
  if (logsContainer) {
    logsContainer.scrollTop = 0;
  }
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
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 顶部卡片 */
.header-card {
  flex-shrink: 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
}

.header-card :deep(.n-card__content) {
  padding: 16px 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
}


/* 日志容器卡片 */
.logs-container-card {
  flex: 1;
  min-height: 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.logs-container-card :deep(.n-card__content) {
  padding: 16px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logs-container-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e7eb;
}

.logs-count {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

/* 日志容器（可滚动区域） */
.logs-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 8px;
  margin-right: -8px;
}

/* 美化日志容器滚动条 */
.logs-container::-webkit-scrollbar {
  width: 8px;
}

.logs-container::-webkit-scrollbar-track {
  background: rgba(240, 242, 255, 0.4);
  border-radius: 4px;
}

.logs-container::-webkit-scrollbar-thumb {
  background: rgba(94, 92, 230, 0.3);
  border-radius: 4px;
  transition: background 0.2s;
}

.logs-container::-webkit-scrollbar-thumb:hover {
  background: rgba(94, 92, 230, 0.5);
}

/* 分页区域 */
.logs-pagination {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 0;
  border-top: 2px solid #e5e7eb;
  margin-top: 12px;
}

.pagination-total {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

/* Timeline 布局 */
.logs-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.log-item {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.log-item:hover {
  opacity: 0.9;
}

.log-item.selected .log-card {
  border-color: rgba(94, 92, 230, 0.4);
  box-shadow: 0 2px 12px rgba(94, 92, 230, 0.12);
  background: rgba(248, 250, 255, 0.5);
}

/* Timeline 指示器 */
.log-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 12px;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(135deg, #5e5ce6, #8b5cf6);
  border: 2px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 1px 4px rgba(94, 92, 230, 0.2);
  z-index: 1;
}

.indicator-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(180deg, rgba(203, 213, 225, 0.4), rgba(203, 213, 225, 0.15));
  margin-top: 3px;
}

/* 日志卡片 */
.log-card {
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 14px 16px;
  margin-bottom: 10px;
  transition: all 0.2s;
}

.log-card:hover {
  background: #fff;
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.log-action {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--daw-primary);
}

.action-text {
  font-weight: 600;
  font-size: 14px;
  color: #262626;
}

.log-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: rgba(0,0,0,0.45);
}

.time-icon {
  width: 12px;
  height: 12px;
}

/* 日志信息 */
.log-body {
  padding-top: 6px;
  border-top: 1px solid #f0f0f0;
}

.log-info {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  padding: 3px 10px;
  background: #fff;
  border-radius: 2px;
  border: 1px solid #f0f0f0;
}

.info-icon {
  width: 12px;
  height: 12px;
  color: rgba(0,0,0,0.45);
  flex-shrink: 0;
}

.info-label {
  color: rgba(0,0,0,0.45);
  font-weight: 400;
}

.info-value {
  color: #262626;
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
