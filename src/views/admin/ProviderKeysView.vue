<template>
  <section class="provider-keys-view">
    <!-- 返回顶部按钮 -->
    <BackToTop />
    
    <!-- 顶部操作栏 -->
    <n-card class="header-card" :bordered="false">
      <div class="toolbar">
        <div class="toolbar-left">
          <h3 class="page-title">Provider 密钥</h3>
          <n-select v-model:value="levelFilter" :options="levelOptions" placeholder="Level" clearable style="width: 100px" />
          <n-select v-model:value="providerFilter" :options="providerOptions" placeholder="Provider" clearable style="width: 130px" />
          <n-input v-model:value="searchTerm" placeholder="搜索名称" clearable style="width: 140px">
            <template #prefix><n-icon size="14"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></n-icon></template>
          </n-input>
        </div>
        <div class="toolbar-right">
          <n-button type="warning" :loading="checkingHealth" @click="openHealthDialog">查活</n-button>
          <n-button type="primary" @click="openCreateDrawer">新增密钥</n-button>
          <n-button secondary :loading="loading" @click="fetchKeys">刷新</n-button>
        </div>
      </div>
    </n-card>

    <!-- 数据表格 -->
    <n-card class="table-card" :bordered="false">
      <div class="table-content">
        <n-data-table
          :columns="columns"
          :data="keys"
          :loading="loading"
          :pagination="false"
          :bordered="false"
          :single-line="false"
          :scroll-x="1400"
          striped
        />
      </div>
      
      <!-- 分页 -->
      <div v-if="total > 0" class="table-footer">
        <span class="footer-total">共 {{ total }} 条</span>
        <n-pagination
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :item-count="total"
          :page-sizes="[10, 20, 50, 100]"
          show-size-picker
        />
      </div>
    </n-card>

    <n-drawer v-model:show="drawerVisible" :width="480" placement="right" :trap-focus="false">
      <n-drawer-content :title="drawerTitle" closable>
        <n-form label-placement="top" :model="form" class="drawer-form">
          <n-form-item label="类型" required>
            <n-select
              v-model:value="form.type"
              :options="providerTypeOptions"
              placeholder="选择 Provider 类型"
            />
          </n-form-item>
          <n-form-item label="名称">
            <n-input v-model:value="form.name" placeholder="用于区分的别名" />
          </n-form-item>
          <n-form-item label="Provider 地址" required>
            <n-input v-model:value="form.provider" placeholder="https://api.openai.com" />
          </n-form-item>
          <n-form-item label="SecretKey">
            <n-input v-model:value="form.secretKey" placeholder="sk-..." type="password" show-password-on="click" />
          </n-form-item>
          <n-form-item label="Level" required>
            <n-input-number v-model:value="form.level" :min="1" :max="99" />
          </n-form-item>
          <n-form-item label="状态">
            <n-switch v-model:value="form.status" />
          </n-form-item>

          <div v-if="form.type === 'azure'" class="config-block">
            <h4>Azure 配置</h4>
            <n-form-item label="Model Mapping (JSON)">
              <n-input
                v-model:value="form.azure.modelMapping"
                type="textarea"
                placeholder='{"gpt-4":"azure-deployment"}'
                :autosize="{ minRows: 3, maxRows: 6 }"
              />
            </n-form-item>
            <n-form-item label="API Versions (JSON)">
              <n-input
                v-model:value="form.azure.apiVersions"
                type="textarea"
                placeholder='{"gpt-4":"2024-02-01"}'
                :autosize="{ minRows: 3, maxRows: 6 }"
              />
            </n-form-item>
          </div>

          <div v-if="form.type === 'vertex'" class="config-block">
            <h4>Vertex AI 配置</h4>
            <n-form-item label="Base URL" required>
              <n-input v-model:value="form.vertex.baseUrl" placeholder="https://us-central1-aiplatform.googleapis.com" />
            </n-form-item>
            <n-form-item label="Project ID" required>
              <n-input v-model:value="form.vertex.projectId" placeholder="your-project-id" />
            </n-form-item>
            <n-form-item label="Service Account Email" required>
              <n-input v-model:value="form.vertex.clientEmail" placeholder="service-account@project.iam.gserviceaccount.com" />
            </n-form-item>
            <n-form-item label="Private Key" required>
              <n-input
                v-model:value="form.vertex.privateKey"
                type="textarea"
                placeholder="-----BEGIN PRIVATE KEY-----"
                :autosize="{ minRows: 4, maxRows: 6 }"
              />
            </n-form-item>
          </div>

          <div v-if="form.type === 'custom'" class="config-block">
            <h4>自定义配置 (JSON)</h4>
            <n-form-item>
              <n-input
                v-model:value="form.customConfig"
                type="textarea"
                placeholder='{"key":"value"}'
                :autosize="{ minRows: 4, maxRows: 8 }"
              />
            </n-form-item>
          </div>
        </n-form>

        <template #footer>
          <div class="drawer-footer">
            <n-button tertiary @click="drawerVisible = false">取消</n-button>
            <n-button type="primary" :loading="submitting" @click="submitDrawer">保存</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 查活弹窗 -->
    <n-modal v-model:show="healthDialogVisible" preset="card" title="密钥健康状态" style="width: 800px">
      <div v-if="checkingHealth" class="health-loading">
        <n-spin size="large" />
        <p>正在检查密钥状态...</p>
      </div>
      <div v-else class="health-content">
        <div v-if="healthData">
          <!-- 休眠密钥 -->
          <div v-if="healthData.SleepingKeys && healthData.SleepingKeys.length > 0" class="health-section">
            <h3>🟠 休眠中的密钥 ({{ healthData.SleepingKeys.length }})</h3>
            <div class="health-table">
              <div v-for="key in healthData.SleepingKeys" :key="key.ID" class="health-row sleeping">
                <div class="health-info">
                  <div class="key-name">{{ key.Name || `密钥 #${key.ID}` }}</div>
                  <div class="key-details">
                    <span class="detail-item">ID: {{ key.ID }}</span>
                    <span class="detail-item">Level: {{ key.Level }}</span>
                    <span class="detail-item truncate" :title="key.Provider">{{ key.Provider }}</span>
                  </div>
                  <div class="key-secret">{{ maskSecretKey(key.SecretKey) }}</div>
                </div>
                <div class="health-status">
                  <span class="badge sleeping">休眠中</span>
                  <span v-if="key.Remaining" class="remaining">剩余: {{ key.Remaining }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 禁用密钥 -->
          <div v-if="healthData.DisabledKeys && healthData.DisabledKeys.length > 0" class="health-section">
            <h3>🔴 已禁用的密钥 ({{ healthData.DisabledKeys.length }})</h3>
            <div class="health-table">
              <div v-for="key in healthData.DisabledKeys" :key="key.ID" class="health-row disabled">
                <div class="health-info">
                  <div class="key-name">{{ key.Name || `密钥 #${key.ID}` }}</div>
                  <div class="key-details">
                    <span class="detail-item">ID: {{ key.ID }}</span>
                    <span class="detail-item">Level: {{ key.Level }}</span>
                    <span class="detail-item truncate" :title="key.Provider">{{ key.Provider }}</span>
                  </div>
                  <div class="key-secret">{{ maskSecretKey(key.SecretKey) }}</div>
                </div>
                <div class="health-status">
                  <span class="badge disabled">已禁用</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 无异常 -->
          <div v-if="(!healthData.SleepingKeys || healthData.SleepingKeys.length === 0) &&
                      (!healthData.DisabledKeys || healthData.DisabledKeys.length === 0)"
               class="health-empty">
            <div class="empty-icon">✅</div>
            <h3>所有密钥状态正常</h3>
            <p>没有休眠或禁用的密钥</p>
          </div>

          <!-- 配置信息摘要 -->
          <div class="health-summary">
            <h4>系统配置信息</h4>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">最低余额:</span>
                <span class="summary-value">{{ healthData.UserMinBalance || 0 }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">API 余额阈值:</span>
                <span class="summary-value">{{ healthData.UserApiBalance || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-modal>
  </section>
</template>

<script setup>
import { computed, h, onMounted, reactive, ref, watch } from 'vue';
import {
  NButton,
  NCard,
  NDataTable,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NModal,
  NPagination,
  NSelect,
  NSpin,
  NSwitch,
  NTag,
  useMessage,
} from 'naive-ui';
import {
  SearchOutline,
  AddOutline,
  RefreshOutline,
  PencilOutline,
  TrashOutline,
  PowerOutline,
} from '@vicons/ionicons5';
import BackToTop from '@/components/common/BackToTop.vue';
import {
  listProviderKeys,
  createProviderKey,
  updateProviderKey,
  deleteProviderKey,
  getProviderKeysConfig,
} from '@/api/providerKeys';
import { formatDateTime as formatDate } from '@/utils/formatters';

const message = useMessage();

const loading = ref(false);
const submitting = ref(false);
const allKeys = ref([]); // 所有密钥数据
const searchTerm = ref('');
const levelFilter = ref(null);
const providerFilter = ref(null);
const drawerVisible = ref(false);
const drawerMode = ref('create');
const activeKey = ref(null);

// 查活弹窗
const healthDialogVisible = ref(false);
const checkingHealth = ref(false);
const healthData = ref(null);

// 前端分页相关
const currentPage = ref(1);
const pageSize = ref(20);

const defaultForm = () => ({
  type: 'standard',
  name: '',
  provider: 'https://api.openai.com',
  secretKey: '',
  level: 1,
  status: true,
  azure: {
    modelMapping: '',
    apiVersions: '',
  },
  vertex: {
    baseUrl: '',
    projectId: '',
    clientEmail: '',
    privateKey: '',
  },
  customConfig: '',
});

const form = reactive(defaultForm());

const providerTypeOptions = [
  { label: '标准 (OpenAI / Anthropic)', value: 'standard' },
  { label: 'Azure OpenAI', value: 'azure' },
  { label: 'Vertex AI', value: 'vertex' },
  { label: '自定义 JSON', value: 'custom' },
];

const drawerTitle = computed(() => (drawerMode.value === 'create' ? '新增 Provider 密钥' : '编辑 Provider 密钥'));

// 从所有keys中提取唯一的level选项用于筛选器
const levelOptions = computed(() => {
  const levels = [...new Set(allKeys.value.map(k => k.level))].sort((a, b) => a - b);
  return levels.map(level => ({ label: `Level ${level}`, value: level }));
});

// 前端筛选后的密钥列表
const filteredKeys = computed(() => {
  let result = [...allKeys.value];
  
  // 按 Level 筛选
  if (levelFilter.value !== null && levelFilter.value !== undefined) {
    result = result.filter(k => k.level === levelFilter.value);
  }
  
  // 按 Provider 筛选
  if (providerFilter.value) {
    result = result.filter(k => k.provider === providerFilter.value);
  }
  
  // 按搜索词筛选
  if (searchTerm.value && searchTerm.value.trim()) {
    const term = searchTerm.value.trim().toLowerCase();
    result = result.filter(k => 
      k.name?.toLowerCase().includes(term) || 
      k.provider?.toLowerCase().includes(term)
    );
  }
  
  return result;
});

// 当前页显示的密钥
const keys = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredKeys.value.slice(start, end);
});

// 总数
const total = computed(() => filteredKeys.value.length);

// 表格列配置
const columns = computed(() => [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: '名称',
    key: 'name',
    width: 150,
  },
  {
    title: 'Provider',
    key: 'provider',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: 'SecretKey',
    key: 'secretKey',
    width: 200,
    ellipsis: {
      tooltip: true,
    },
    render: (row) => maskSecretKey(row.secretKey),
  },
  {
    title: 'Level',
    key: 'level',
    width: 80,
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        {
          type: row.status ? 'success' : 'error',
          size: 'small',
          bordered: false,
        },
        { default: () => row.status ? '启用' : '禁用' }
      );
    },
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render: (row) => formatDateTime(row.createdAt),
  },
  {
    title: '操作',
    key: 'actions',
    width: 210,
    fixed: 'right',
    render: (row) => {
      return h(
        'div',
        { class: 'row-actions', style: 'display: flex; gap: 6px;' },
        [
          h(
            NButton,
            {
              size: 'tiny',
              type: 'primary',
              onClick: () => openEditDrawer(row),
              style: 'margin: 0;'
            },
            {
              default: () => '编辑',
              icon: () => h(NIcon, null, { default: () => h(PencilOutline) })
            }
          ),
          h(
            NButton,
            {
              size: 'tiny',
              type: row.status ? 'warning' : 'success',
              onClick: () => toggleKey(row),
              style: 'margin: 0;'
            },
            {
              default: () => (row.status ? '禁用' : '启用'),
              icon: () => h(NIcon, null, { default: () => h(PowerOutline) })
            }
          ),
          h(
            NButton,
            {
              size: 'tiny',
              type: 'error',
              onClick: () => removeKey(row),
              style: 'margin: 0;'
            },
            {
              default: () => '删除',
              icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
            }
          ),
        ]
      );
    },
  },
]);

const providerOptions = computed(() => {
  const providers = [...new Set(allKeys.value.map(k => k.provider))].filter(Boolean);
  return providers.map(provider => ({
    label: provider,
    value: provider,
  }));
});

onMounted(() => {
  fetchKeys();
});

// 监听筛选条件变化,重置到第一页（前端分页，不需要重新加载数据）
watch([levelFilter, providerFilter, searchTerm], () => {
  currentPage.value = 1;
});

// 监听分页变化，表格内部滚动到顶部
watch([currentPage, pageSize], () => {
  const tableWrapper = document.querySelector('.table-scroll-wrapper');
  if (tableWrapper) {
    tableWrapper.scrollTop = 0;
  }
});

function resetForm() {
  Object.assign(form, defaultForm());
}

function maskSecretKey(key) {
  if (!key) return '--';
  if (key.length <= 10) return key;
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '--';
  return formatDate(dateStr, 'YYYY-MM-DD HH:mm');
}

// 获取Provider密钥列表 - 使用后端分页
async function fetchKeys() {
  loading.value = true;
  try {
    // 前端分页：一次性获取所有数据
    const params = {
      page: 1,
      size: 9999, // 获取大量数据
    };

    const response = await listProviderKeys(params);

    // API直接返回数组,不是嵌套在data.keys中
    const list = Array.isArray(response.data) ? response.data : (response.data.keys || []);
    allKeys.value = list.map((item) => ({
      id: item.ID || item.id,
      name: item.Name || item.name || '--',
      provider: item.Provider || item.provider,
      secretKey: item.SecretKey || item.secret_key,
      level: item.Level || item.level,
      status: item.Status ?? item.status ?? true,
      type: (item.Config && typeof item.Config === 'object' && item.Config.provider_type) ||
            (item.config && item.config.provider_type) || 'standard',
      createdAt: item.CreatedAt || item.created_at,
      updatedAt: item.UpdatedAt || item.updated_at,
      raw: item,
    }));
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '加载密钥失败';
    message.error(errorMessage);
    allKeys.value = [];
  } finally {
    loading.value = false;
  }
}

async function openHealthDialog() {
  healthDialogVisible.value = true;
  checkingHealth.value = true;
  try {
    const response = await getProviderKeysConfig();
    healthData.value = response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '获取密钥状态失败';
    message.error(errorMessage);
  } finally {
    checkingHealth.value = false;
  }
}

// 前端分页：不需要重新加载数据

function openCreateDrawer() {
  drawerMode.value = 'create';
  activeKey.value = null;
  resetForm();
  drawerVisible.value = true;
}

function openEditDrawer(item) {
  drawerMode.value = 'edit';
  activeKey.value = item;
  resetForm();
  form.type = item.type || 'standard';
  form.name = item.name || '';
  form.provider = item.provider || '';
  form.level = item.level || 1;
  form.status = item.status ?? true;
  form.secretKey = '';
  const config = item.raw?.config || {};
  if (form.type === 'azure') {
    form.azure.modelMapping = config.model_mapping ? JSON.stringify(config.model_mapping, null, 2) : '';
    form.azure.apiVersions = config.api_versions ? JSON.stringify(config.api_versions, null, 2) : '';
  }
  if (form.type === 'vertex') {
    form.vertex.baseUrl = config.base_url || '';
    form.vertex.projectId = config.project_id || '';
    form.vertex.clientEmail = config.client_email || '';
    form.vertex.privateKey = config.private_key || '';
  }
  if (form.type === 'custom') {
    form.customConfig = config ? JSON.stringify(config, null, 2) : '';
  }
  drawerVisible.value = true;
}

function buildConfigPayload() {
  if (form.type === 'azure') {
    const payload = { provider_type: 'azure' };
    if (form.azure.modelMapping) {
      payload.model_mapping = JSON.parse(form.azure.modelMapping);
    }
    if (form.azure.apiVersions) {
      payload.api_versions = JSON.parse(form.azure.apiVersions);
    }
    return payload;
  }
  if (form.type === 'vertex') {
    if (!form.vertex.baseUrl || !form.vertex.projectId || !form.vertex.clientEmail || !form.vertex.privateKey) {
      throw new Error('Vertex AI 配置字段不能为空');
    }
    return {
      provider_type: 'vertex',
      base_url: form.vertex.baseUrl.trim(),
      project_id: form.vertex.projectId.trim(),
      client_email: form.vertex.clientEmail.trim(),
      private_key: form.vertex.privateKey.trim(),
    };
  }
  if (form.type === 'custom') {
    if (!form.customConfig.trim()) return {};
    return JSON.parse(form.customConfig);
  }
  return form.type === 'standard' ? { provider_type: 'standard' } : {};
}

async function submitDrawer() {
  try {
    submitting.value = true;
    const payload = {
      SecretKey: form.secretKey ? form.secretKey.trim() : undefined,
      Provider: form.provider.trim(),
      Level: Number(form.level) || 1,
      Name: form.name.trim() || undefined,
      Status: form.status,
    };
    let config;
    try {
      config = buildConfigPayload();
    } catch (parseError) {
      throw new Error(parseError.message || '配置解析失败');
    }
    if (Object.keys(config).length > 0) {
      payload.config = config;
    }

    if (drawerMode.value === 'create') {
      if (!form.secretKey && form.type !== 'vertex') {
        message.warning('请输入 SecretKey');
        return;
      }
      await createProviderKey(payload);
      message.success('密钥创建成功');
    } else if (activeKey.value) {
      if (!payload.SecretKey) delete payload.SecretKey;
      await updateProviderKey(activeKey.value.id, payload);
      message.success('密钥更新成功');
    }
    drawerVisible.value = false;
    await fetchKeys();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '保存失败';
    message.error(errorMessage);
  } finally {
    submitting.value = false;
  }
}

async function toggleKey(item) {
  try {
    await updateProviderKey(item.id, { Status: !item.status });
    message.success(`${item.status ? '已禁用' : '已启用'}密钥`);
    await fetchKeys();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '更新失败';
    message.error(errorMessage);
  }
}

async function removeKey(item) {
  if (!window.confirm(`确定删除密钥 ${item.name || item.id} 吗?此操作不可撤销。`)) return;
  try {
    await deleteProviderKey(item.id);
    message.success('密钥已删除');
    await fetchKeys();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '删除失败';
    message.error(errorMessage);
  }
}

function renderTypeLabel(type) {
  const map = {
    standard: '标准',
    azure: 'Azure',
    vertex: 'Vertex',
    custom: '自定义',
  };
  return map[type] || type || '--';
}
</script>

<style scoped>
.provider-keys-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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

.table-card {
  flex: 1;
  min-height: 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.table-card :deep(.n-card__content) {
  padding: 0;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.table-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.table-content :deep(.n-data-table-thead) {
  position: sticky;
  top: 0;
  z-index: 3;
}

.table-content :deep(.n-data-table-th) {
  background: #ffffff !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.header-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-header h2,
.card-header h3 {
  margin: 0;
}

.card-header p {
  margin: 0;
  color: var(--daw-text-secondary);
}

.health-check-btn {
  border-radius: 12px !important;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.25) !important;
  transition: all 0.2s ease;
}

.health-check-btn:hover {
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.35) !important;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1.1rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.keys-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
}

.table-head {
  display: grid;
  grid-template-columns: 0.6fr 1fr 1.6fr 1.4fr 0.6fr 0.7fr 1fr 1.2fr;
  gap: 16px;
  align-items: center;
  min-width: 1000px;
  flex-shrink: 0;
  background: #ffffff;
  padding: 16px 32px;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.table-row {
  display: grid;
  grid-template-columns: 0.6fr 1fr 1.6fr 1.4fr 0.6fr 0.7fr 1fr 1.2fr;
  gap: 16px;
  align-items: center;
  min-width: 1000px;
  padding: 16px 20px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  cursor: pointer;
}

.table-row:hover {
  background: #f9fafb;
  border-color: #5a56f6;
  box-shadow: 0 4px 12px rgba(90, 86, 246, 0.1);
  transform: translateY(-1px);
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.secret-key {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
  color: var(--daw-text-secondary);
}

/* 操作按钮样式 */
.row-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
}

.row-actions :deep(.n-button) {
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  padding: 0 10px;
  height: 26px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-right: 0 !important;
}

.row-actions :deep(.n-button:not(:last-child)) {
  margin-right: 8px;
}

.row-actions :deep(.n-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.row-actions :deep(.n-button:active) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.row-actions :deep(.n-button .n-button__icon) {
  font-size: 12px;
  margin-right: 2px;
}

.row-actions :deep(.n-button--primary-type) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
}

.row-actions :deep(.n-button--primary-type:hover) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.row-actions :deep(.n-button--warning-type) {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
}

.row-actions :deep(.n-button--warning-type:hover) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}

.row-actions :deep(.n-button--success-type) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
}

.row-actions :deep(.n-button--success-type:hover) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.row-actions :deep(.n-button--error-type) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
}

.row-actions :deep(.n-button--error-type:hover) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.row-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.row-actions :deep(.n-button) {
  font-weight: 500;
}

.empty-state {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--daw-text-secondary);
  border: 1px dashed rgba(148, 163, 184, 0.25);
  border-radius: 16px;
  background: rgba(248, 250, 255, 0.7);
}

.table-container {
  display: flex;
  flex-direction: column;
  height: 650px;
  max-height: 70vh;
}

.table-scroll-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.table-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 2px solid #e5e7eb;
  background: #f9fafb;
  min-height: 64px;
}

.footer-total {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  line-height: 1.5;
}

.drawer-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-block {
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(247, 248, 253, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.config-block h4 {
  margin: 0 0 8px;
  font-size: 0.9rem;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1200px) {
  .table-head,
  .table-row {
    grid-template-columns: 0.6fr 1fr 1.4fr 1.2fr 0.6fr 0.7fr 1fr 1.2fr;
  }
}

@media (max-width: 920px) {
  .keys-table {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .table-head,
  .table-row {
    min-width: 900px;
  }
}

@media (max-width: 720px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .title-row {
    width: 100%;
    flex-wrap: wrap;
  }

  .health-check-btn {
    width: 100%;
  }

  .actions {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .keys-table {
    margin: 0 -28px;
    padding: 0 28px;
    width: calc(100% + 56px);
  }
}

/* 查活弹窗样式 */
.health-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 20px;
}

.health-loading p {
  color: var(--daw-text-secondary);
  margin: 0;
}

.health-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 600px;
  overflow-y: auto;
}

.health-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.health-section h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.health-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.health-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(247, 248, 253, 0.5);
  gap: 16px;
}

.health-row.sleeping {
  border-color: rgba(251, 146, 60, 0.3);
  background: rgba(251, 146, 60, 0.05);
}

.health-row.disabled {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.health-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.key-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--daw-text);
}

.key-details {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--daw-text-secondary);
}

.detail-item {
  display: inline-block;
}

.key-secret {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  color: var(--daw-text-tertiary);
}

.health-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.badge.sleeping {
  background: rgba(251, 146, 60, 0.18);
  color: #f97316;
}

.badge.disabled {
  background: rgba(239, 68, 68, 0.18);
  color: #ef4444;
}

.remaining {
  font-size: 0.8rem;
  color: var(--daw-text-secondary);
}

.health-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
}

.health-empty h3 {
  margin: 0;
  color: var(--daw-text);
}

.health-empty p {
  margin: 0;
  color: var(--daw-text-secondary);
}

.health-summary {
  padding: 16px;
  border-radius: 12px;
  background: rgba(247, 248, 253, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.health-summary h4 {
  margin: 0 0 12px;
  font-size: 0.9rem;
  font-weight: 600;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  color: var(--daw-text-secondary);
  font-size: 0.85rem;
}

.summary-value {
  font-weight: 600;
  color: var(--daw-text);
}

</style>
