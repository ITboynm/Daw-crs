<template>
  <section class="usage-view">
    <n-card class="usage-controls" :bordered="false">
      <div class="controls-header">
        <div>
          <h2>用量分析</h2>
          <p>根据日期范围对比花费、请求数与 Token 用量。</p>
        </div>
        <div class="query-type">
          <button
            v-for="option in queryOptions"
            :key="option.value"
            type="button"
            class="type-chip"
            :class="{ active: queryType === option.value }"
            @click="setQueryType(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="controls-body">
        <div v-if="queryType === 'date'" class="control-block">
          <label>选择日期</label>
          <n-date-picker v-model:value="dateValue" type="date" size="medium" :is-date-disabled="disableFuture" />
        </div>
        <div v-if="queryType === 'range'" class="control-block">
          <label>选择时间范围</label>
          <n-date-picker
            v-model:value="rangeValue"
            type="daterange"
            size="medium"
            :is-date-disabled="disableFuture"
          />
        </div>
        <div class="control-actions">
          <span class="hint">{{ lastQueryText }}</span>
          <n-button type="primary" size="medium" :loading="loading" @click="runQuery">
            {{ queryButtonLabel }}
          </n-button>
        </div>
      </div>
    </n-card>

    <n-card class="summary-card" :bordered="false">
      <div class="summary-grid">
        <div v-for="metric in summaryMetrics" :key="metric.key" class="summary-item">
          <span class="summary-label">{{ metric.label }}</span>
          <span class="summary-value">{{ metric.value }}</span>
          <span class="summary-hint">{{ metric.hint }}</span>
        </div>
      </div>
    </n-card>

    <div class="usage-grid">
      <n-card class="models-card" :bordered="false">
        <header class="section-header">
          <div>
            <h3>模型明细</h3>
            <p>按模型统计请求与花费，支持多种排序方式。</p>
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
        <div v-if="modelRows.length" class="models-table">
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
          <p>暂无模型用量数据。</p>
        </div>
      </n-card>

      <n-card class="trend-card" :bordered="false">
        <header class="section-header">
          <div>
            <h3>日粒度趋势</h3>
            <p>适用于跨天范围查询，展示成本与请求变化。</p>
          </div>
        </header>
        <div v-if="hasDailyData" class="trend-chart">
          <v-chart :option="dailyTrendOption" autoresize style="height: 300px" />
        </div>
        <div v-else class="empty-state">
          <p>选择跨天范围后，可查看趋势图。</p>
        </div>
      </n-card>
    </div>

    <n-card class="daily-card" :bordered="false">
      <header class="section-header">
        <div>
          <h3>每日明细</h3>
          <p>查看成本最高的日期及主要消耗模型。</p>
        </div>
      </header>
      <div v-if="dailyRows.length" class="daily-list">
        <article v-for="day in dailyRows" :key="day.timestamp" class="daily-item">
          <div>
            <h4>{{ day.date }}</h4>
            <p>{{ day.highlight }}</p>
          </div>
          <div class="daily-metrics">
            <span>花费 {{ day.cost }}</span>
            <span>请求 {{ day.requests }}</span>
          </div>
        </article>
      </div>
      <div v-else class="empty-state">
        <p>暂无日明细。</p>
      </div>
    </n-card>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { useMessage, NCard, NButton, NDatePicker } from 'naive-ui';
import { getUsage } from '@/api/dashboard';
import { formatCurrency, formatNumber, formatDateTime } from '@/utils/formatters';

const message = useMessage();

const loading = ref(false);
const queryType = ref('today');
const dateValue = ref(Date.now());
const rangeValue = ref(getDefaultRange());
const usageData = ref(null);
const lastQueryText = ref('尚未查询');
const sortBy = ref('cost');

const queryOptions = [
  { label: '今日实时', value: 'today' },
  { label: '指定日期', value: 'date' },
  { label: '时间范围', value: 'range' },
];

const sortOptions = [
  { label: '按花费', value: 'cost' },
  { label: '按请求', value: 'requests' },
  { label: '按图片', value: 'images' },
  { label: '按名称', value: 'name' },
];

onMounted(() => {
  runQuery();
});

function getDefaultRange() {
  const end = dayjs();
  const start = end.subtract(6, 'day');
  return [start.startOf('day').valueOf(), end.endOf('day').valueOf()];
}

function disableFuture(ts) {
  return ts > Date.now();
}

function setQueryType(type) {
  queryType.value = type;
  if (type === 'today') {
    runQuery();
  }
}

const queryButtonLabel = computed(() => {
  if (loading.value) return '查询中...';
  if (queryType.value === 'today') return '刷新今日';
  return '开始查询';
});

async function runQuery() {
  loading.value = true;
  try {
    const params = buildParams();
    const response = await getUsage(params);
    usageData.value = response.data;
    lastQueryText.value = `已更新 · ${formatDateTime(new Date(), 'YYYY-MM-DD HH:mm')}`;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '查询失败';
    message.error(errorMessage);
  } finally {
    loading.value = false;
  }
}

function buildParams() {
  if (queryType.value === 'date') {
    const date = dayjs(dateValue.value).format('YYYY-MM-DD');
    return { date };
  }
  if (queryType.value === 'range') {
    const [start, end] = rangeValue.value || [];
    if (!start || !end) {
      throw new Error('请选择开始和结束日期');
    }
    return {
      start: dayjs(start).format('YYYY-MM-DD'),
      end: dayjs(end).format('YYYY-MM-DD'),
    };
  }
  return {};
}

const summaryMetrics = computed(() => {
  const data = usageData.value || {};
  return [
    {
      key: 'cost',
      label: '花费',
      value: formatCurrency(data.total_credit_used || 0),
      hint: 'USD',
    },
    {
      key: 'requests',
      label: '请求数',
      value: formatNumber(data.total_requests || 0),
      hint: 'Requests',
    },
    {
      key: 'prompt',
      label: 'Prompt Tokens',
      value: formatNumber(data.total_prompt || 0),
      hint: 'Tokens',
    },
    {
      key: 'completion',
      label: 'Completion Tokens',
      value: formatNumber(data.total_completion || 0),
      hint: 'Tokens',
    },
    {
      key: 'images',
      label: '图片生成',
      value: formatNumber(data.total_image_n || 0),
      hint: 'Images',
    },
  ];
});

const modelRows = computed(() => {
  const summary = usageData.value?.usage_summary || {};
  return Object.entries(summary).map(([name, stats]) => {
    const modelStats = stats.model_stats || {};
    const requests = modelStats.Requests || 0;
    const prompt = modelStats.Prompt || 0;
    const completion = modelStats.Completion || 0;
    const images = modelStats.ImageN || 0;
    const cost = modelStats.CreditUsed || 0;
    const percentage = stats.usage_analysis?.cost_percentage || 0;
    return {
      name,
      displayName: name.length > 32 ? `${name.slice(0, 29)}…` : name,
      requests: formatNumber(requests),
      prompt: formatNumber(prompt),
      completion: formatNumber(completion),
      images,
      cost: formatCurrency(cost),
      raw: { requests, prompt, completion, images, cost },
      percentage: `${percentage.toFixed(1)}%`,
      percentageWidth: `${Math.min(100, percentage)}%`,
    };
  });
});

const sortedModelRows = computed(() => {
  const rows = [...modelRows.value];
  switch (sortBy.value) {
    case 'requests':
      rows.sort((a, b) => b.raw.requests - a.raw.requests);
      break;
    case 'images':
      rows.sort((a, b) => b.raw.images - a.raw.images);
      break;
    case 'name':
      rows.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      rows.sort((a, b) => b.raw.cost - a.raw.cost);
  }
  return rows;
});

const dailyRows = computed(() => {
  const list = usageData.value?.daily_costs || [];
  return list
    .map((item) => ({
      timestamp: item.timestamp,
      date: formatDateTime(item.timestamp * 1000, 'YYYY-MM-DD'),
      cost: formatCurrency(item.cost || item.total_cost || 0),
      requests: formatNumber(item.requests || item.total_requests || 0),
      highlight: buildDailyHighlight(item.line_items || []),
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
});

function buildDailyHighlight(items) {
  if (!items.length) return '暂无详细模型数据';
  const top = [...items].sort((a, b) => b.cost - a.cost)[0];
  return `${top.name} · ${formatCurrency(top.cost)} / ${formatNumber(top.requests || 0)}次`;
}

const hasDailyData = computed(() => (usageData.value?.daily_costs || []).length > 1);

const dailyTrendOption = computed(() => {
  if (!hasDailyData.value) return {};
  const daily = usageData.value?.daily_costs || [];
  const sorted = [...daily].sort((a, b) => a.timestamp - b.timestamp);
  return {
    color: ['#5a56f6', '#f472b6'],
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const [costPoint, reqPoint] = params;
        return [
          `<strong>${costPoint.axisValue}</strong>`,
          `花费：${formatCurrency(costPoint.data)}`,
          reqPoint ? `请求：${formatNumber(reqPoint.data)}` : '',
        ]
          .filter(Boolean)
          .join('<br/>');
      },
    },
    grid: { left: '3%', right: '4%', bottom: '6%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: sorted.map((item) => formatDateTime(item.timestamp * 1000, 'MM-DD')),
    },
    yAxis: [
      { type: 'value', axisLabel: { formatter: (value) => `$${value}` } },
      { type: 'value', axisLabel: { formatter: (value) => formatNumber(value) } },
    ],
    series: [
      {
        name: '花费',
        type: 'line',
        smooth: true,
        data: sorted.map((item) => Number(item.cost || item.total_cost || 0)),
        areaStyle: { color: 'rgba(90, 86, 246, 0.12)' },
      },
      {
        name: '请求数',
        type: 'bar',
        yAxisIndex: 1,
        data: sorted.map((item) => Number(item.requests || item.total_requests || 0)),
        itemStyle: { borderRadius: [8, 8, 0, 0] },
      },
    ],
  };
});
</script>

<style scoped>
.usage-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.usage-controls,
.summary-card,
.models-card,
.trend-card,
.daily-card {
  border-radius: 26px;
  background: var(--daw-surface);
  box-shadow: var(--daw-shadow-md);
  padding: 30px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.controls-header h2 {
  margin: 0;
}

.controls-header p {
  margin: 6px 0 0;
  color: var(--daw-text-secondary);
}

.query-type {
  display: inline-flex;
  background: rgba(240, 242, 255, 0.8);
  padding: 6px;
  border-radius: 16px;
  gap: 6px;
}

.type-chip {
  border: none;
  background: transparent;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--daw-transition);
}

.type-chip.active {
  background: rgba(91, 94, 246, 0.16);
  color: var(--daw-primary);
}

.controls-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  align-items: end;
}

.control-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-block label {
  font-size: 0.85rem;
  color: var(--daw-text-secondary);
}

.control-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.hint {
  font-size: 0.82rem;
  color: var(--daw-text-secondary);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 18px;
}

.summary-item {
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(247, 248, 253, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-label {
  font-size: 0.82rem;
  color: var(--daw-text-secondary);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.summary-hint {
  font-size: 0.78rem;
  color: var(--daw-text-secondary);
}

.usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}

.section-header h3 {
  margin: 0;
}

.section-header p {
  margin: 6px 0 0;
  color: var(--daw-text-secondary);
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
  grid-template-columns: 1.5fr repeat(4, 1fr) 1fr;
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

.trend-chart {
  width: 100%;
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
}

.daily-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.daily-item {
  padding: 18px;
  border-radius: 16px;
  background: rgba(247, 248, 253, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.daily-item h4 {
  margin: 0 0 6px;
}

.daily-item p {
  margin: 0;
  color: var(--daw-text-secondary);
  font-size: 0.85rem;
  max-width: 200px;
}

.daily-metrics {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--daw-text-secondary);
}

@media (max-width: 900px) {
  .controls-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .control-actions {
    justify-content: flex-start;
  }

  .table-head,
  .table-row {
    grid-template-columns: 1.6fr repeat(3, 1fr);
  }

  .table-head span:nth-child(5),
  .table-row span:nth-child(5) {
    display: none;
  }
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .daily-list {
    grid-template-columns: 1fr;
  }
}
</style>
