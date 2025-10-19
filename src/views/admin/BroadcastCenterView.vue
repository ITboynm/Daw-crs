<template>
  <section class="broadcast-view">
    <n-card class="compose-card" :bordered="false">
      <header class="card-header">
        <div>
          <h2>广播通知</h2>
          <p>向 DNA 全体用户推送公告，可设置过期时间。</p>
        </div>
        <div class="actions">
          <n-button secondary size="small" :loading="loading" @click="fetchNews">刷新列表</n-button>
        </div>
      </header>
      <n-form label-placement="top" :model="form">
        <div class="form-grid">
          <n-form-item label="标题" required>
            <n-input v-model:value="form.title" placeholder="通知标题" />
          </n-form-item>
          <n-form-item label="有效天数" required>
            <n-input v-model:value="form.days" type="number" min="1" max="30" />
          </n-form-item>
        </div>
        <n-form-item label="正文" required>
          <n-input
            v-model:value="form.content"
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 12 }"
            placeholder="支持 Markdown 简要格式"
          />
        </n-form-item>
      </n-form>
      <div class="form-actions">
        <n-button type="primary" :loading="sending" @click="sendBroadcast">发送通知</n-button>
        <n-button tertiary @click="resetForm">清空</n-button>
      </div>
    </n-card>

    <n-card class="news-card" :bordered="false">
      <header class="card-header">
        <div>
          <h3>通知列表</h3>
          <p>包含系统、账户、族群三类通知，按时间倒序排列。</p>
        </div>
        <div class="filter-group">
          <button
            v-for="type in typeOptions"
            :key="type.value"
            type="button"
            class="type-chip"
            :class="{ active: selectedType === type.value }"
            @click="selectedType = type.value"
          >
            {{ type.label }}
          </button>
        </div>
      </header>
      <div v-if="filteredNews.length" class="news-list">
        <article v-for="item in filteredNews" :key="item.id" class="news-item">
          <header>
            <div>
              <span class="type" :class="`type--${item.type}`">{{ item.typeLabel }}</span>
              <h4>{{ item.title }}</h4>
            </div>
            <div class="meta">
              <time>{{ formatDate(item.created_at) }}</time>
              <span>{{ item.expireText }}</span>
            </div>
          </header>
          <p>{{ item.content }}</p>
          <footer>
            <span>发送者：{{ item.created_by || '系统' }}</span>
            <n-button text size="small" type="error" @click="removeNews(item)">删除</n-button>
          </footer>
        </article>
      </div>
      <div v-else class="empty-state">
        <p>暂无通知，发送后将显示在此。</p>
      </div>
    </n-card>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { NCard, NForm, NFormItem, NInput, NButton } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { sendNews, deleteNews } from '@/api/admin';
import { getNews } from '@/api/dashboard';
import { useAuthStore } from '@/store/auth';
import { formatDateTime, diffFromNow } from '@/utils/formatters';

const authStore = useAuthStore();
const message = useMessage();

const loading = ref(false);
const sending = ref(false);
const news = ref([]);
const selectedType = ref('all');

const form = reactive({
  title: '',
  content: '',
  days: 3,
});

const typeOptions = [
  { label: '全部', value: 'all' },
  { label: '系统', value: 'sys' },
  { label: '账户', value: 'user' },
  { label: '族群', value: 'dna' },
];

onMounted(() => {
  fetchNews();
  if (!authStore.status) {
    authStore.fetchStatus?.();
  }
});

async function fetchNews() {
  loading.value = true;
  try {
    const response = await getNews();
    news.value = normalize(response.data);
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '加载通知失败';
    message.error(errorMessage);
  } finally {
    loading.value = false;
  }
}

function normalize(payload = {}) {
  const result = [];
  const pushItems = (items = [], type) => {
    items.forEach((item) => {
      result.push({
        ...item,
        id: item.id || `${type}-${item.created_at}`,
        type,
        typeLabel: type === 'sys' ? '系统' : type === 'user' ? '账户' : '族群',
        expireText: diffFromNow(item.expires_at),
      });
    });
  };
  pushItems(payload.sys_news, 'sys');
  pushItems(payload.user_news, 'user');
  pushItems(payload.dna_news, 'dna');
  return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

const filteredNews = computed(() => {
  if (selectedType.value === 'all') return news.value;
  return news.value.filter((item) => item.type === selectedType.value);
});

function formatDate(value) {
  return formatDateTime(value, 'YYYY-MM-DD HH:mm');
}

function resetForm() {
  form.title = '';
  form.content = '';
  form.days = 3;
}

async function sendBroadcast() {
  if (!form.title || !form.content) {
    message.warning('请填写完整的标题和内容');
    return;
  }
  const status = authStore.status || (await authStore.fetchStatus?.());
  if (!status?.dna || !status?.id) {
    message.error('无法获取 DNA 信息，刷新后重试');
    return;
  }
  const dnaPath = `${status.dna}${status.id}.`;
  sending.value = true;
  try {
    await sendNews(dnaPath, {
      title: form.title.trim(),
      content: form.content.trim(),
      days: Number(form.days) || 3,
    });
    message.success('通知已发送');
    resetForm();
    await fetchNews();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '发送失败';
    message.error(errorMessage);
  } finally {
    sending.value = false;
  }
}

async function removeNews(item) {
  if (!window.confirm(`确定删除通知「${item.title}」吗？`)) return;
  try {
    await deleteNews(item.id);
    message.success('通知已删除');
    await fetchNews();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '删除失败';
    message.error(errorMessage);
  }
}
</script>

<style scoped>
.broadcast-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.compose-card,
.news-card {
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: var(--daw-shadow-md);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

.card-header h2,
.card-header h3 {
  margin: 0;
}

.card-header p {
  margin: 6px 0 0;
  color: var(--daw-text-secondary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.filter-group {
  display: inline-flex;
  background: rgba(246, 244, 255, 0.6);
  padding: 6px;
  border-radius: 16px;
  gap: 6px;
}

.type-chip {
  border: none;
  background: transparent;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.82rem;
  cursor: pointer;
}

.type-chip.active {
  background: rgba(90, 86, 246, 0.16);
  color: var(--daw-primary);
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.news-item {
  padding: 20px;
  border-radius: 18px;
  background: rgba(246, 244, 255, 0.55);
  border: 1px solid rgba(94, 92, 230, 0.12);
}

.news-item header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.news-item h4 {
  margin: 4px 0 0;
}

.news-item .meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.78rem;
  color: var(--daw-text-secondary);
}

.type {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.type--sys {
  background: rgba(90, 86, 246, 0.18);
  color: var(--daw-primary);
}

.type--user {
  background: rgba(16, 185, 129, 0.18);
  color: #16a34a;
}

.type--dna {
  background: rgba(244, 114, 182, 0.18);
  color: #f472b6;
}

.news-item footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 0.8rem;
  color: var(--daw-text-secondary);
}

.empty-state {
  min-height: 160px;
  border: 1px dashed rgba(94, 92, 230, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--daw-text-secondary);
}

@media (max-width: 720px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .news-item header {
    flex-direction: column;
    align-items: flex-start;
  }

  .news-item .meta {
    align-items: flex-start;
  }
}
</style>
