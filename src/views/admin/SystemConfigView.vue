<template>
  <section class="admin-config-view">
    <n-card class="config-card" :bordered="false">
      <header class="card-header">
        <div>
          <h2>系统配置管理</h2>
          <p>配置系统基础参数、邮件服务和模型映射规则</p>
        </div>
        <div class="actions">
          <n-button secondary size="small" :loading="loading" @click="loadConfig">刷新</n-button>
        </div>
      </header>

      <n-form ref="formRef" :model="formData" label-placement="top">
        <!-- 基础配置 -->
        <div class="config-section">
          <h3 class="section-title">基础配置</h3>

          <n-form-item label="系统通知邮箱" path="XAI_MAIL">
            <n-input
              v-model:value="formData.XAI_MAIL"
              placeholder="info@example.com"
            />
            <template #feedback>
              <span class="form-hint">系统通知邮箱</span>
            </template>
          </n-form-item>

          <n-form-item label="允许的资源路径" path="RESOURCES">
            <n-input
              v-model:value="formData.RESOURCES"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 6 }"
              placeholder="/v1/chat/completions,/v1/messages,/v1/embeddings"
            />
            <template #feedback>
              <span class="form-hint">逗号分隔的API路径列表</span>
            </template>
          </n-form-item>

          <n-form-item label="模型限制" path="MODEL_LIMITS">
            <n-input
              v-model:value="formData.MODEL_LIMITS"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 6 }"
              placeholder='{"gpt-4o":100,"gpt-4o-mini":500}'
            />
            <template #feedback>
              <span class="form-hint">JSON格式：{"模型名":限制数}</span>
            </template>
          </n-form-item>

          <n-form-item label="模型定价 (Owner 覆盖)" path="MODEL_PRICING">
            <n-input
              v-model:value="formData.MODEL_PRICING"
              type="textarea"
              :autosize="{ minRows: 5, maxRows: 10 }"
              placeholder='{"gpt-4o":{"prompt":0.0025,"completion":0.01},"gpt-4o-mini":{"prompt":0.00015,"completion":0.0006}}'
            />
            <template #feedback>
              <span class="form-hint">JSON格式：自定义模型价格（USD/1K tokens），覆盖系统默认定价。支持 prompt 和 completion 分别定价</span>
            </template>
          </n-form-item>
        </div>

        <!-- 邮件配置 -->
        <div class="config-section">
          <h3 class="section-title">邮件配置</h3>

          <div class="form-grid">
            <n-form-item label="SMTP 服务器" path="EMAIL_SMTP">
              <n-input
                v-model:value="formData.EMAIL_SMTP"
                placeholder="smtp.gmail.com"
              />
            </n-form-item>

            <n-form-item label="SMTP 端口" path="EMAIL_PORT">
              <n-input
                v-model:value="formData.EMAIL_PORT"
                placeholder="465"
              />
            </n-form-item>

            <n-form-item label="认证邮箱" path="EMAIL_AUTH">
              <n-input
                v-model:value="formData.EMAIL_AUTH"
                type="email"
                placeholder="xproxyai@gmail.com"
              />
            </n-form-item>

            <n-form-item label="邮箱密码" path="EMAIL_PASS">
              <n-input
                v-model:value="formData.EMAIL_PASS"
                type="password"
                placeholder="••••••••••••••••"
              />
            </n-form-item>

            <n-form-item label="启用 TLS" path="EMAIL_TLS">
              <n-select
                v-model:value="formData.EMAIL_TLS"
                :options="tlsOptions"
                placeholder="选择 TLS 设置"
              />
            </n-form-item>
          </div>
        </div>

        <!-- 映射配置 -->
        <div class="config-section">
          <div class="section-header">
            <h3 class="section-title">映射配置</h3>
            <n-button-group size="small">
              <n-button :type="mapperMode === 'visual' ? 'primary' : 'default'" @click="mapperMode = 'visual'">
                可视化
              </n-button>
              <n-button :type="mapperMode === 'text' ? 'primary' : 'default'" @click="mapperMode = 'text'">
                文本
              </n-button>
            </n-button-group>
          </div>

          <!-- 文本模式 -->
          <template v-if="mapperMode === 'text'">
            <n-form-item label="系统模型映射" path="MODEL_MAPPER">
              <n-input
                v-model:value="formData.MODEL_MAPPER"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 8 }"
                placeholder="gpt-3.5*=gpt-4o-mini,gpt-4=gpt-4o"
              />
              <template #feedback>
                <span class="form-hint">格式：原模型=目标模型，逗号分隔多个映射 (例如 gpt-3.5*=gpt-4o-mini 代表将任何gpt-3.5模型请求转换为gpt-4o-mini)</span>
              </template>
            </n-form-item>

            <n-form-item label="模型分组映射" path="LEVEL_MAPPER">
              <n-input
                v-model:value="formData.LEVEL_MAPPER"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 8 }"
                placeholder="gpt*=1,text*=1,claude*=2,doubao*=3,qwen*=4,deepseek*=5"
              />
              <template #feedback>
                <span class="form-hint">格式：模型=分组号，逗号分隔多个映射 (例如 gpt 系列模型由1号分组的 AI Provider 处理, claude 系列模型由2号分组的 AI Provider处理)</span>
              </template>
            </n-form-item>

            <n-form-item label="模型分组主备切换" path="SWITCH_OVER">
              <n-input
                v-model:value="formData.SWITCH_OVER"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 6 }"
                placeholder="1=10,2=20"
              />
              <template #feedback>
                <span class="form-hint">格式：主分组=备分组，逗号分隔多个映射(当模型主分组一分钟内超过5次异常响应,则触发切换到模型备分组,1小时后自动切回)</span>
              </template>
            </n-form-item>
          </template>

          <!-- 可视化模式 -->
          <template v-else>
            <div class="mapper-visual">
              <h4>系统模型映射</h4>
              <div class="mapper-list">
                <div v-for="(item, index) in modelMapperList" :key="index" class="mapper-row">
                  <n-input v-model:value="item.from" placeholder="原模型 (支持通配符*)" size="small" />
                  <span class="mapper-arrow">→</span>
                  <n-input v-model:value="item.to" placeholder="目标模型" size="small" />
                  <n-button text type="error" size="small" @click="removeMapperItem('model', index)">删除</n-button>
                </div>
                <n-button text size="small" @click="addMapperItem('model')">+ 添加映射</n-button>
              </div>

              <h4>模型分组映射</h4>
              <div class="mapper-list">
                <div v-for="(item, index) in levelMapperList" :key="index" class="mapper-row">
                  <n-input v-model:value="item.from" placeholder="模型名 (支持通配符*)" size="small" />
                  <span class="mapper-arrow">→</span>
                  <n-input-number v-model:value="item.to" placeholder="分组号" size="small" :min="1" :max="99" />
                  <n-button text type="error" size="small" @click="removeMapperItem('level', index)">删除</n-button>
                </div>
                <n-button text size="small" @click="addMapperItem('level')">+ 添加分组</n-button>
              </div>

              <h4>模型分组主备切换</h4>
              <div class="mapper-list">
                <div v-for="(item, index) in switchOverList" :key="index" class="mapper-row">
                  <n-input-number v-model:value="item.from" placeholder="主分组" size="small" :min="1" :max="99" />
                  <span class="mapper-arrow">→</span>
                  <n-input-number v-model:value="item.to" placeholder="备分组" size="small" :min="1" :max="99" />
                  <n-button text type="error" size="small" @click="removeMapperItem('switch', index)">删除</n-button>
                </div>
                <n-button text size="small" @click="addMapperItem('switch')">+ 添加切换规则</n-button>
              </div>
            </div>
          </template>
        </div>

        <!-- 模型定价（Owner 覆盖） -->
        <div class="config-section">
          <div class="section-header">
            <h3 class="section-title">模型定价（Owner 覆盖）</h3>
            <n-button secondary size="small" @click="resetPricing" :loading="resetting">
              恢复默认定价
            </n-button>
          </div>

          <n-form-item label="定价配置 (JSON)" path="PRICING">
            <n-input
              v-model:value="formData.PRICING"
              type="textarea"
              :autosize="{ minRows: 8, maxRows: 15 }"
              placeholder='{"gpt-4o": {"prompt": 0.005, "completion": 0.015}, "gpt-4o-mini": {"prompt": 0.00015, "completion": 0.0006}}'
            />
            <template #feedback>
              <span class="form-hint">JSON 格式：模型名 → {"prompt": 价格, "completion": 价格}，单位为 USD per 1K tokens</span>
            </template>
          </n-form-item>
        </div>

        <!-- 保存按钮 -->
        <div class="form-actions">
          <n-button
            type="primary"
            size="large"
            :loading="saving"
            @click="saveConfig"
          >
            <template #icon>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </template>
            保存配置
          </n-button>
        </div>
      </n-form>
    </n-card>
  </section>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useMessage, NCard, NButton, NForm, NFormItem, NInput, NSelect, NButtonGroup, NInputNumber } from 'naive-ui';
import { getConfig, updateConfig, deleteConfig } from '@/api/admin';

const message = useMessage();
const formRef = ref(null);

const loading = ref(false);
const saving = ref(false);
const resetting = ref(false);
const mapperMode = ref('text'); // 'text' or 'visual'

const tlsOptions = [
  { label: '不修改', value: '' },
  { label: '启用', value: 'true' },
  { label: '禁用', value: 'false' },
];

const formData = ref({
  XAI_MAIL: '',
  RESOURCES: '',
  MODEL_LIMITS: '',
  MODEL_PRICING: '',
  EMAIL_SMTP: '',
  EMAIL_PORT: '',
  EMAIL_AUTH: '',
  EMAIL_PASS: '',
  EMAIL_TLS: '',
  MODEL_MAPPER: '',
  LEVEL_MAPPER: '',
  SWITCH_OVER: '',
  PRICING: '',
});

// 可视化模式的数据
const modelMapperList = ref([]);
const levelMapperList = ref([]);
const switchOverList = ref([]);

onMounted(() => {
  loadConfig();
});

// 监听模式切换
watch(mapperMode, (newMode) => {
  if (newMode === 'visual') {
    // 文本 -> 可视化
    syncTextToVisual();
  } else {
    // 可视化 -> 文本
    syncVisualToText();
  }
});

function syncTextToVisual() {
  // MODEL_MAPPER
  modelMapperList.value = parseMapperString(formData.value.MODEL_MAPPER);

  // LEVEL_MAPPER
  levelMapperList.value = parseMapperString(formData.value.LEVEL_MAPPER, true);

  // SWITCH_OVER
  switchOverList.value = parseMapperString(formData.value.SWITCH_OVER, true);
}

function syncVisualToText() {
  // MODEL_MAPPER
  formData.value.MODEL_MAPPER = modelMapperList.value
    .filter(item => item.from && item.to)
    .map(item => `${item.from}=${item.to}`)
    .join(',');

  // LEVEL_MAPPER
  formData.value.LEVEL_MAPPER = levelMapperList.value
    .filter(item => item.from && item.to !== undefined && item.to !== null)
    .map(item => `${item.from}=${item.to}`)
    .join(',');

  // SWITCH_OVER
  formData.value.SWITCH_OVER = switchOverList.value
    .filter(item => item.from !== undefined && item.from !== null && item.to !== undefined && item.to !== null)
    .map(item => `${item.from}=${item.to}`)
    .join(',');
}

function parseMapperString(str, isNumber = false) {
  if (!str || !str.trim()) return [];

  return str.split(',')
    .map(pair => pair.trim())
    .filter(pair => pair.includes('='))
    .map(pair => {
      const [from, to] = pair.split('=').map(s => s.trim());
      return {
        from: isNumber ? (from ? Number(from) : 1) : from,
        to: isNumber ? (to ? Number(to) : 1) : to,
      };
    });
}

function addMapperItem(type) {
  const newItem = { from: '', to: '' };

  if (type === 'model') {
    modelMapperList.value.push(newItem);
  } else if (type === 'level') {
    levelMapperList.value.push({ from: '', to: 1 });
  } else if (type === 'switch') {
    switchOverList.value.push({ from: 1, to: 1 });
  }
}

function removeMapperItem(type, index) {
  if (type === 'model') {
    modelMapperList.value.splice(index, 1);
  } else if (type === 'level') {
    levelMapperList.value.splice(index, 1);
  } else if (type === 'switch') {
    switchOverList.value.splice(index, 1);
  }
}

async function loadConfig() {
  loading.value = true;
  try {
    const response = await getConfig();
    // 处理两种可能的数据格式
    let data = response.data;

    // 如果返回的是 { success: true, configs: {...} } 格式
    if (data?.success && data?.configs) {
      data = data.configs;
    }

    // 填充表单数据
    Object.keys(formData.value).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        // 特殊处理不同类型的值
        if (key === 'MODEL_LIMITS' && typeof data[key] === 'object') {
          formData.value[key] = JSON.stringify(data[key], null, 2);
        } else if (key === 'PRICING' && typeof data[key] === 'object') {
          formData.value[key] = JSON.stringify(data[key], null, 2);
        } else if (key === 'EMAIL_TLS') {
          formData.value[key] = data[key] === true ? 'true' : data[key] === false ? 'false' : '';
        } else if (typeof data[key] === 'object') {
          // MODEL_MAPPER, LEVEL_MAPPER, SWITCH_OVER 等对象转换为字符串
          formData.value[key] = Object.entries(data[key])
            .map(([k, v]) => `${k}=${v}`)
            .join(',');
        } else if (Array.isArray(data[key])) {
          // RESOURCES 等数组转换为逗号分隔
          formData.value[key] = data[key].join(',');
        } else {
          formData.value[key] = String(data[key]);
        }
      }
    });

    message.success('配置加载成功');
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '加载配置失败';
    message.error(errorMessage);
  } finally {
    loading.value = false;
  }
}

async function saveConfig() {
  // 如果当前是可视化模式，先同步到文本
  if (mapperMode.value === 'visual') {
    syncVisualToText();
  }

  saving.value = true;
  try {
    // 准备更新数据：只提交有值的字段
    const updates = {};
    Object.entries(formData.value).forEach(([key, value]) => {
      if (value && value.trim()) {
        // MODEL_LIMITS 字段必须使用 JSON.stringify
        if (key === 'MODEL_LIMITS') {
          try {
            // 先解析验证 JSON 格式是否正确
            const parsed = JSON.parse(value);
            // 然后转为字符串传递给后端
            updates[key] = JSON.stringify(parsed);
          } catch {
            updates[key] = value;
          }
        }
        // 尝试解析其他 JSON 格式的字段
        else if (key === 'PRICING' && value.trim().startsWith('{')) {
          try {
            updates[key] = JSON.parse(value);
          } catch {
            updates[key] = value;
          }
        } else {
          updates[key] = value;
        }
      }
    });

    await updateConfig(updates);
    message.success('配置保存成功');
    await loadConfig(); // 重新加载以确认保存结果
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '保存配置失败';
    message.error(errorMessage);
  } finally {
    saving.value = false;
  }
}

async function resetPricing() {
  resetting.value = true;
  try {
    await deleteConfig(['PRICING']);
    message.success('已恢复默认定价');
    await loadConfig();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '恢复默认定价失败';
    message.error(errorMessage);
  } finally {
    resetting.value = false;
  }
}
</script>

<style scoped>
.admin-config-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-card {
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: var(--daw-shadow-md);
  padding: 32px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 32px;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--daw-text-primary);
}

.card-header p {
  margin: 6px 0 0;
  color: var(--daw-text-secondary);
  font-size: 0.9rem;
}

.config-section {
  margin-bottom: 32px;
  padding: 24px;
  background: rgba(246, 244, 255, 0.3);
  border-radius: 18px;
  border: 1px solid rgba(94, 92, 230, 0.08);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--daw-text-primary);
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(94, 92, 230, 0.15);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.form-hint {
  font-size: 0.78rem;
  color: var(--daw-text-secondary);
  margin-top: 4px;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(94, 92, 230, 0.1);
}

.w-5 {
  width: 1.25rem;
  height: 1.25rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(94, 92, 230, 0.15);
}

.section-header .section-title {
  margin: 0;
  padding: 0;
  border: none;
}

.mapper-visual {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mapper-visual h4 {
  margin: 0 0 12px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--daw-text-primary);
}

.mapper-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mapper-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.mapper-arrow {
  font-size: 1.2rem;
  color: var(--daw-primary);
  font-weight: 600;
}

@media (max-width: 720px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .mapper-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .mapper-arrow {
    display: none;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

</style>
