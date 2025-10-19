<template>
  <section class="provider-keys-view">
    <n-card class="keys-card" :bordered="false">
      <header class="card-header">
        <div>
          <h2>Provider 密钥</h2>
          <p>统一查看、筛选、编辑上游模型密钥，支持类型化配置。</p>
        </div>
        <div class="actions">
          <n-select
            v-model:value="levelFilter"
            size="small"
            placeholder="Level 筛选"
            clearable
            :options="levelOptions"
            style="width: 140px"
          />
          <n-input
            v-model:value="searchTerm"
            size="small"
            placeholder="搜索名称 / Provider"
            clearable
            style="width: 220px"
          />
          <n-button secondary size="small" :loading="loading" @click="fetchKeys">刷新</n-button>
          <n-button type="primary" size="small" @click="openCreateDrawer">新增密钥</n-button>
        </div>
      </header>

      <div v-if="filteredKeys.length" class="keys-table">
        <div class="table-head">
          <span>ID</span>
          <span>名称</span>
          <span>Provider</span>
          <span>SecretKey</span>
          <span>Level</span>
          <span>状态</span>
          <span>创建时间</span>
          <span></span>
        </div>
        <div v-for="item in filteredKeys" :key="item.id" class="table-row">
          <span>{{ item.id }}</span>
          <span>{{ item.name }}</span>
          <span class="truncate" :title="item.provider">{{ item.provider }}</span>
          <span class="truncate secret-key" :title="item.secretKey">{{ maskSecretKey(item.secretKey) }}</span>
          <span>{{ item.level }}</span>
          <span>
            <span class="status" :class="item.status ? 'online' : 'offline'">
              {{ item.status ? '启用' : '禁用' }}
            </span>
          </span>
          <span>{{ formatDateTime(item.createdAt) }}</span>
          <span class="row-actions">
            <n-button text size="small" @click="openEditDrawer(item)">编辑</n-button>
            <n-button text size="small" @click="toggleKey(item)">
              {{ item.status ? '禁用' : '启用' }}
            </n-button>
            <n-button text size="small" type="error" @click="removeKey(item)">删除</n-button>
          </span>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>暂无密钥记录，点击右上角“新增密钥”开始配置。</p>
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
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import {
  NButton,
  NCard,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  useMessage,
} from 'naive-ui';
import {
  listProviderKeys,
  createProviderKey,
  updateProviderKey,
  deleteProviderKey,
} from '@/api/providerKeys';
import { formatDateTime as formatDate } from '@/utils/formatters';

const message = useMessage();

const loading = ref(false);
const submitting = ref(false);
const keys = ref([]);
const searchTerm = ref('');
const levelFilter = ref(null);
const drawerVisible = ref(false);
const drawerMode = ref('create');
const activeKey = ref(null);

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

const levelOptions = computed(() => {
  const levels = [...new Set(keys.value.map(k => k.level))].sort((a, b) => a - b);
  return levels.map(level => ({ label: `Level ${level}`, value: level }));
});

const filteredKeys = computed(() => {
  let result = keys.value;

  // Level 筛选
  if (levelFilter.value !== null && levelFilter.value !== undefined) {
    result = result.filter(item => item.level === levelFilter.value);
  }

  // 搜索筛选
  const term = searchTerm.value.trim().toLowerCase();
  if (term) {
    result = result.filter((item) =>
      [item.name, item.provider, String(item.id)].some((field) =>
        field?.toString().toLowerCase().includes(term),
      ),
    );
  }

  return result;
});

onMounted(() => {
  fetchKeys();
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

async function fetchKeys() {
  loading.value = true;
  try {
    const response = await listProviderKeys({ size: 200 });
    // API直接返回数组，不是嵌套在data.keys中
    const list = Array.isArray(response.data) ? response.data : (response.data.keys || []);
    keys.value = list.map((item) => ({
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
  } finally {
    loading.value = false;
  }
}

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
  if (!window.confirm(`确定删除密钥 ${item.name || item.id} 吗？此操作不可撤销。`)) return;
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
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.keys-card {
  border-radius: 26px;
  background: var(--daw-surface);
  box-shadow: var(--daw-shadow-md);
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.card-header h2,
.card-header h3 {
  margin: 0;
}

.card-header p {
  margin: 6px 0 0;
  color: var(--daw-text-secondary);
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.keys-table {
  display: grid;
  gap: 12px;
  overflow-x: auto;
  width: 100%;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 0.6fr 1fr 1.6fr 1.4fr 0.6fr 0.7fr 1fr 1.2fr;
  gap: 12px;
  align-items: center;
  min-width: 1000px;
}

.table-head {
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--daw-text-secondary);
}

.table-row {
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(247, 248, 253, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
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

.status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

.status.online {
  background: rgba(34, 197, 94, 0.18);
  color: #16a34a;
}

.status.offline {
  background: rgba(239, 68, 68, 0.18);
  color: #ef4444;
}

.row-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
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
</style>
