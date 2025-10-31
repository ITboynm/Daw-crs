<template>
  <section class="sub-analytics-view">
    <!-- 顶部控制区域 -->
    <n-card class="controls-card" :bordered="false">
      <div class="controls-header">
        <div>
          <h2>子账户数据分析</h2>
          <p>分析子账户账单走势，识别主要模型消耗与高频调用用户</p>
        </div>
      </div>

      <div class="controls-body">
        <div class="date-range-wrapper">
          <div class="control-block">
            <label>开始日期</label>
            <n-date-picker
              v-model:value="startDate"
              type="date"
              size="medium"
              :is-date-disabled="disableFuture"
              placeholder="选择开始日期"
            />
          </div>
          <span class="date-separator">至</span>
          <div class="control-block">
            <label>结束日期</label>
            <n-date-picker
              v-model:value="endDate"
              type="date"
              size="medium"
              :is-date-disabled="disableFuture"
              placeholder="选择结束日期"
            />
          </div>
        </div>

        <div class="control-actions">
          <span class="hint">{{ queryRangeText }}</span>
          <n-button type="primary" size="medium" :loading="loading" @click="runQuery">
            查询
          </n-button>
          <n-button size="medium" :loading="loading" @click="refreshData">
            刷新
          </n-button>
        </div>
      </div>
    </n-card>

    <!-- 汇总数据卡片 -->
    <n-card class="summary-card" :bordered="false">
      <div class="summary-grid">
        <div v-for="metric in summaryMetrics" :key="metric.key" class="summary-item">
          <span class="summary-label">{{ metric.label }}</span>
          <span class="summary-value">{{ metric.value }}</span>
          <span class="summary-hint">{{ metric.hint }}</span>
        </div>
      </div>
    </n-card>

    <!-- 图表区域 -->
    <div class="charts-section">
      <!-- 第一行：成本趋势和模型分布 -->
      <div class="charts-row">
        <n-card class="chart-card" :bordered="false">
          <header class="section-header">
            <div>
              <h3>成本趋势分析</h3>
            </div>
          </header>
          <div v-if="hasDailyData" class="chart-wrapper">
            <v-chart :option="costTrendOption" autoresize style="height: 300px" />
          </div>
          <div v-else class="empty-state">
            <p>暂无数据</p>
          </div>
        </n-card>

        <n-card class="chart-card" :bordered="false">
          <header class="section-header">
            <div>
              <h3>模型使用分布</h3>
            </div>
          </header>
          <div v-if="modelData.length" class="chart-wrapper">
            <v-chart :option="modelDistributionOption" autoresize style="height: 300px" />
          </div>
          <div v-else class="empty-state">
            <p>暂无数据</p>
          </div>
        </n-card>
      </div>

      <!-- 第二行：用户消耗（全宽） -->
      <n-card class="chart-card chart-card--full" :bordered="false">
        <header class="section-header">
          <div>
            <h3>Top 10 用户消耗</h3>
          </div>
        </header>
        <div v-if="userData.length" class="chart-wrapper">
          <v-chart :option="userConsumptionOption" autoresize style="height: 320px" />
        </div>
        <div v-else class="empty-state">
          <p>暂无数据</p>
        </div>
      </n-card>

      <!-- 第三行：请求分布和效率趋势 -->
      <div class="charts-row">
        <n-card class="chart-card" :bordered="false">
          <header class="section-header">
            <div>
              <h3>每日请求分布</h3>
            </div>
          </header>
          <div v-if="hasDailyData" class="chart-wrapper">
            <v-chart :option="dailyRequestsOption" autoresize style="height: 300px" />
          </div>
          <div v-else class="empty-state">
            <p>暂无数据</p>
          </div>
        </n-card>

        <n-card class="chart-card" :bordered="false">
          <header class="section-header">
            <div>
              <h3>成本效率趋势</h3>
              <p>每请求平均成本</p>
            </div>
          </header>
          <div v-if="hasDailyData" class="chart-wrapper">
            <v-chart :option="efficiencyTrendOption" autoresize style="height: 300px" />
          </div>
          <div v-else class="empty-state">
            <p>暂无数据</p>
          </div>
        </n-card>
      </div>
    </div>

    <!-- 模型费用与调用分布 -->
    <n-card class="models-detail-card" :bordered="false">
      <header class="section-header">
        <div>
          <h3>模型费用与调用分布</h3>
          <p>汇总模型请求占比与成本结构，定位主要成本来源</p>
        </div>
      </header>

      <div v-if="modelData.length" class="models-grid">
        <div v-for="(model, index) in modelData.slice(0, 4)" :key="model.name" class="model-card">
          <div class="model-rank">
            <span class="rank-number">#{{ index + 1 }}</span>
          </div>
          <div class="model-info">
            <h4 class="model-name" :title="model.name">{{ model.displayName }}</h4>
            <div class="model-cost">${{ model.cost }}</div>
            <div class="model-metrics">
              <div class="metric-item">
                <span class="metric-label">请求</span>
                <span class="metric-value">{{ model.requests }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Prompt</span>
                <span class="metric-value">{{ model.prompt }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Completion</span>
                <span class="metric-value">{{ model.completion }}</span>
              </div>
            </div>
            <div class="model-percentages">
              <span class="percentage-badge percentage-badge--cost">成本 {{ model.costPercentage }}</span>
              <span class="percentage-badge percentage-badge--request">请求 {{ model.requestPercentage }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>暂无模型数据</p>
      </div>

      <!-- 模型数据表格 -->
      <div v-if="modelData.length" class="models-table">
        <div class="table-head">
          <span>模型</span>
          <span>请求数</span>
          <span>Prompt</span>
          <span>Completion</span>
          <span>成本</span>
          <span>请求占比</span>
          <span>成本占比</span>
        </div>
        <div v-for="model in modelData" :key="model.name" class="table-row">
          <span class="model-name" :title="model.name">{{ model.displayName }}</span>
          <span>{{ model.requests }}</span>
          <span>{{ model.prompt }}</span>
          <span>{{ model.completion }}</span>
          <span>${{ model.cost }}</span>
          <span>{{ model.requestPercentage }}</span>
          <span>{{ model.costPercentage }}</span>
        </div>
      </div>
    </n-card>

    <!-- 子账户消耗概览 -->
    <n-card class="users-card" :bordered="false">
      <header class="section-header">
        <div>
          <h3>子账户消耗概览</h3>
          <p>对比子账户请求与成本分布，快速识别异常调用</p>
        </div>
      </header>

      <div v-if="userData.length" class="users-table">
        <div class="table-head">
          <span>用户</span>
          <span>请求数</span>
          <span>输入Tokens</span>
          <span>输出Tokens</span>
          <span>缓存Tokens</span>
          <span>图片数</span>
          <span>成本</span>
          <span>成本占比</span>
        </div>
        <div v-for="user in userData" :key="user.id" class="table-row">
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-id">#{{ user.id }}</div>
          </div>
          <span>{{ user.requests }}</span>
          <span>{{ user.prompt }}</span>
          <span>{{ user.completion }}</span>
          <span>{{ user.cached }}</span>
          <span>{{ user.images }}</span>
          <span>${{ user.cost }}</span>
          <span>{{ user.costPercentage }}</span>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>暂无用户数据</p>
      </div>
    </n-card>

    <!-- 每日账单明细 -->
    <n-card class="daily-detail-card" :bordered="false">
      <header class="section-header">
        <div>
          <h3>每日账单明细</h3>
          <p>按日查看总成本、模型占比与缓存命中，追踪区间趋势</p>
        </div>
      </header>

      <div v-if="dailyDetails.length" class="daily-list">
        <div v-for="day in dailyDetails" :key="day.date" class="daily-item">
          <div class="daily-header">
            <h4>{{ day.date }}</h4>
            <div class="daily-summary">
              <span class="daily-requests">总请求 {{ day.totalRequests }}</span>
              <span class="daily-cost">总消耗 ${{ day.totalCost }}</span>
            </div>
          </div>
          <div class="daily-tokens">
            Prompt {{ day.prompt }} · Completion {{ day.completion }} · Cache {{ day.cached }}
          </div>

          <div v-if="day.models.length" class="daily-models">
            <div v-for="model in day.models" :key="model.name" class="daily-model-item">
              <div class="daily-model-info">
                <span class="daily-model-name">{{ model.displayName }}</span>
                <span class="daily-model-requests">请求 {{ model.requests }}</span>
              </div>
              <div class="daily-model-stats">
                <span>Prompt {{ model.prompt }}</span>
                <span>Completion {{ model.completion }}</span>
              </div>
              <div class="daily-model-cost">${{ model.cost }}</div>
            </div>
            <div v-if="day.otherModelsCount > 0" class="daily-model-item daily-model-other">
              <span>其他模型 ({{ day.otherModelsCount }})</span>
              <span>${{ day.otherModelsCost }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>暂无每日明细</p>
      </div>
    </n-card>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { useMessage, NCard, NButton, NDatePicker } from 'naive-ui';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, LineChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import { getBillAnalytics } from '@/api/accounts';
import { formatCurrency, formatNumber, formatDateTime } from '@/utils/formatters';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

const message = useMessage();

// 状态
const loading = ref(false);
const startDate = ref(dayjs().startOf('day').valueOf());
const endDate = ref(dayjs().endOf('day').valueOf());
const billData = ref(null);
const lastQueryTime = ref(null);

// 挂载时自动查询今日数据
onMounted(() => {
  runQuery();
});

// 禁用未来日期
function disableFuture(ts) {
  return ts > Date.now();
}

// 查询范围文本
const queryRangeText = computed(() => {
  if (!lastQueryTime.value) {
    return '尚未查询';
  }
  const start = dayjs(startDate.value).format('YYYY-MM-DD');
  const end = dayjs(endDate.value).format('YYYY-MM-DD');
  const time = formatDateTime(lastQueryTime.value, 'YYYY-MM-DD HH:mm:ss');
  return `查询范围：${start} 至 ${end} · 总请求 ${billData.value?.total_requests || 0} · 刷新于 ${time}`;
});

// 执行查询
async function runQuery() {
  if (!startDate.value || !endDate.value) {
    message.error('请选择开始和结束日期');
    return;
  }

  loading.value = true;
  try {
    const params = {
      start: dayjs(startDate.value).format('YYYY-MM-DD'),
      end: dayjs(endDate.value).format('YYYY-MM-DD'),
    };
    const response = await getBillAnalytics(params);
    billData.value = response.data;
    lastQueryTime.value = new Date();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '查询失败';
    message.error(errorMessage);
  } finally {
    loading.value = false;
  }
}

// 刷新数据
async function refreshData() {
  await runQuery();
  message.success('数据已刷新');
}

// 汇总数据指标
const summaryMetrics = computed(() => {
  const data = billData.value || {};
  return [
    {
      key: 'cost',
      label: '总花费',
      value: formatCurrency(data.total_credit_used || 0),
      hint: 'USD',
    },
    {
      key: 'requests',
      label: '总请求',
      value: formatNumber(data.total_requests || 0),
      hint: 'Requests',
    },
    {
      key: 'tokens',
      label: '总Tokens',
      value: formatNumber((data.total_prompt || 0) + (data.total_completion || 0)),
      hint: 'Tokens',
    },
    {
      key: 'images',
      label: '总图片',
      value: formatNumber(data.total_image_n || 0),
      hint: 'Images',
    },
    {
      key: 'prompt',
      label: '输入Tokens',
      value: formatNumber(data.total_prompt || 0),
      hint: 'Tokens',
    },
    {
      key: 'completion',
      label: '输出Tokens',
      value: formatNumber(data.total_completion || 0),
      hint: 'Tokens',
    },
    {
      key: 'cached',
      label: '缓存Tokens',
      value: formatNumber(
        (data.total_cached_details?.cache_creation_input_tokens || 0) +
        (data.total_cached_details?.cache_read_input_tokens || 0)
      ),
      hint: 'Tokens',
    },
  ];
});

// 是否有每日数据
const hasDailyData = computed(() => {
  return (billData.value?.daily_costs || []).length > 0;
});

// 模型数据
const modelData = computed(() => {
  const summary = billData.value?.usage_summary || {};
  return Object.entries(summary)
    .map(([name, stats]) => {
      const modelStats = stats.model_stats || {};
      const analysis = stats.usage_analysis || {};
      return {
        name,
        displayName: name.length > 30 ? `${name.slice(0, 27)}...` : name,
        requests: formatNumber(modelStats.Requests || 0),
        prompt: formatNumber(modelStats.Prompt || 0),
        completion: formatNumber(modelStats.Completion || 0),
        cost: (modelStats.CreditUsed || 0).toFixed(2),
        costPercentage: `${(analysis.cost_percentage || 0).toFixed(2)}%`,
        requestPercentage: `${(analysis.request_percentage || 0).toFixed(2)}%`,
        raw: {
          requests: modelStats.Requests || 0,
          cost: modelStats.CreditUsed || 0,
        },
      };
    })
    .sort((a, b) => b.raw.cost - a.raw.cost);
});

// 用户数据
const userData = computed(() => {
  const users = billData.value?.usage_users || [];
  return users.map((user) => {
    const analysis = user.usage_analysis || {};
    const cachedDetails = user.total_cached_details || {};
    return {
      id: user.id,
      name: user.name || user.email || 'Unknown',
      email: user.email,
      requests: formatNumber(user.total_requests || 0),
      prompt: formatNumber(user.total_prompt || 0),
      completion: formatNumber(user.total_completion || 0),
      cached: formatNumber(
        (cachedDetails.cache_creation_input_tokens || 0) +
        (cachedDetails.cache_read_input_tokens || 0)
      ),
      images: formatNumber(user.total_image_n || 0),
      cost: (user.total_credit_used || 0).toFixed(2),
      costPercentage: `${(analysis.cost_percentage || 0).toFixed(2)}%`,
      raw: {
        cost: user.total_credit_used || 0,
      },
    };
  }).sort((a, b) => b.raw.cost - a.raw.cost);
});

// 每日明细
const dailyDetails = computed(() => {
  const daily = billData.value?.daily_costs || [];
  return daily
    .map((day) => {
      const models = (day.line_items || [])
        .map((item) => ({
          name: item.name,
          displayName: item.name.length > 30 ? `${item.name.slice(0, 27)}...` : item.name,
          requests: formatNumber(item.usage?.model_stats?.Requests || 0),
          prompt: formatNumber(item.usage?.model_stats?.Prompt || 0),
          completion: formatNumber(item.usage?.model_stats?.Completion || 0),
          cost: (item.cost || 0).toFixed(2),
          raw: { cost: item.cost || 0 },
        }))
        .sort((a, b) => b.raw.cost - a.raw.cost);

      const topModels = models.slice(0, 3);
      const otherModels = models.slice(3);
      const otherModelsCost = otherModels.reduce((sum, m) => sum + parseFloat(m.cost), 0);

      const cachedDetails = day.total_cached_details || {};

      return {
        date: day.date,
        totalRequests: formatNumber(day.total_requests || 0),
        totalCost: (day.total_credit_used || 0).toFixed(2),
        prompt: formatNumber(day.total_prompt || 0),
        completion: formatNumber(day.total_completion || 0),
        cached: formatNumber(
          (cachedDetails.cache_creation_input_tokens || 0) +
          (cachedDetails.cache_read_input_tokens || 0)
        ),
        models: topModels,
        otherModelsCount: otherModels.length,
        otherModelsCost: otherModelsCost.toFixed(2),
      };
    })
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
});

// 成本趋势图表选项
const costTrendOption = computed(() => {
  if (!hasDailyData.value) return {};
  const daily = billData.value?.daily_costs || [];
  const sorted = [...daily].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

  return {
    color: ['#5a56f6'],
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const point = params[0];
        return `<strong>${point.axisValue}</strong><br/>成本: $${point.data}`;
      },
    },
    grid: { left: '5%', right: '5%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: sorted.map((item) => item.date),
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (value) => `$${value}` },
    },
    series: [
      {
        name: '成本',
        type: 'line',
        smooth: true,
        data: sorted.map((item) => (item.total_credit_used || 0).toFixed(2)),
        areaStyle: { color: 'rgba(90, 86, 246, 0.12)' },
      },
    ],
  };
});

// 模型使用分布图表选项
const modelDistributionOption = computed(() => {
  if (!modelData.value.length) return {};

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>成本: ${c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: { fontSize: 12 },
    },
    series: [
      {
        name: '模型分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        data: modelData.value.map((model) => ({
          name: model.displayName,
          value: parseFloat(model.cost),
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
});

// 用户消耗图表选项
const userConsumptionOption = computed(() => {
  if (!userData.value.length) return {};

  const top10 = userData.value.slice(0, 10);

  return {
    color: ['#5a56f6'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const point = params[0];
        return `<strong>${point.axisValue}</strong><br/>成本: $${point.data}`;
      },
    },
    grid: { left: '5%', right: '5%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: top10.map((user) => user.name),
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (value) => `$${value}` },
    },
    series: [
      {
        name: '成本',
        type: 'bar',
        data: top10.map((user) => parseFloat(user.cost)),
        itemStyle: { borderRadius: [8, 8, 0, 0] },
      },
    ],
  };
});

// 每日请求分布图表选项
const dailyRequestsOption = computed(() => {
  if (!hasDailyData.value) return {};
  const daily = billData.value?.daily_costs || [];
  const sorted = [...daily].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

  return {
    color: ['#f472b6'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const point = params[0];
        return `<strong>${point.axisValue}</strong><br/>请求数: ${point.data}`;
      },
    },
    grid: { left: '5%', right: '5%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: sorted.map((item) => item.date),
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (value) => formatNumber(value) },
    },
    series: [
      {
        name: '请求数',
        type: 'bar',
        data: sorted.map((item) => item.total_requests || 0),
        itemStyle: { borderRadius: [8, 8, 0, 0] },
      },
    ],
  };
});

// 成本效率趋势图表选项
const efficiencyTrendOption = computed(() => {
  if (!hasDailyData.value) return {};
  const daily = billData.value?.daily_costs || [];
  const sorted = [...daily].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

  return {
    color: ['#10b981'],
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const point = params[0];
        return `<strong>${point.axisValue}</strong><br/>每请求成本: $${point.data}`;
      },
    },
    grid: { left: '5%', right: '5%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: sorted.map((item) => item.date),
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (value) => `$${value.toFixed(4)}` },
    },
    series: [
      {
        name: '效率',
        type: 'line',
        smooth: true,
        data: sorted.map((item) => {
          const cost = item.total_credit_used || 0;
          const requests = item.total_requests || 1;
          return (cost / requests).toFixed(4);
        }),
        areaStyle: { color: 'rgba(16, 185, 129, 0.12)' },
      },
    ],
  };
});
</script>

<style scoped>
.sub-analytics-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 控制卡片 */
.controls-card,
.summary-card,
.chart-card,
.models-detail-card,
.users-card,
.daily-detail-card {
  border-radius: 26px;
  background: var(--daw-surface);
  box-shadow: var(--daw-shadow-md);
  padding: 30px 32px;
}

.controls-header {
  margin-bottom: 24px;
}

.controls-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.controls-header p {
  margin: 6px 0 0;
  color: var(--daw-text-secondary);
  font-size: 0.9rem;
}

.controls-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.date-range-wrapper {
  display: flex;
  align-items: end;
  gap: 16px;
  flex-wrap: wrap;
}

.control-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 200px;
}

.control-block label {
  font-size: 0.85rem;
  color: var(--daw-text-secondary);
  font-weight: 500;
}

.date-separator {
  padding-bottom: 8px;
  color: var(--daw-text-secondary);
  font-weight: 600;
}

.control-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.hint {
  font-size: 0.82rem;
  color: var(--daw-text-secondary);
  flex: 1;
}

/* 汇总卡片 */
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

/* 图表区域 */
.charts-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;
}

.chart-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-card--full {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.section-header p {
  margin: 6px 0 0;
  color: var(--daw-text-secondary);
  font-size: 0.85rem;
}

.chart-wrapper {
  width: 100%;
}

.empty-state {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--daw-text-secondary);
  border: 1px dashed rgba(148, 163, 184, 0.25);
  border-radius: 14px;
  background: rgba(248, 250, 255, 0.7);
}

/* 模型卡片网格 */
.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.model-card {
  padding: 24px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.06), rgba(247, 114, 182, 0.06));
  border: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  gap: 20px;
  align-items: flex-start;
  transition: all 0.3s ease;
}

.model-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(90, 86, 246, 0.12);
}

.model-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(90, 86, 246, 0.15), rgba(247, 114, 182, 0.15));
  border: 2px solid rgba(90, 86, 246, 0.2);
}

.rank-number {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--daw-primary);
}

.model-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.model-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-cost {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--daw-primary);
}

.model-metrics {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 0.7rem;
  color: var(--daw-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 0.9rem;
  font-weight: 600;
}

.model-percentages {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.percentage-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.percentage-badge--cost {
  background: rgba(90, 86, 246, 0.12);
  color: var(--daw-primary);
}

.percentage-badge--request {
  background: rgba(247, 114, 182, 0.12);
  color: #f472b6;
}

/* 表格样式 */
.models-table,
.users-table {
  display: grid;
  gap: 12px;
  margin-top: 20px;
}

.models-table .table-head,
.models-table .table-row {
  display: grid;
  grid-template-columns: 1.5fr repeat(6, 1fr);
  gap: 16px;
  align-items: center;
}

.users-table .table-head,
.users-table .table-row {
  display: grid;
  grid-template-columns: 1.2fr repeat(7, 1fr);
  gap: 16px;
  align-items: center;
}

.table-head {
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--daw-text-secondary);
  padding: 0 14px;
}

.table-row {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(247, 248, 253, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
}

.user-id {
  font-size: 0.75rem;
  color: var(--daw-text-secondary);
}

/* 每日明细 */
.daily-list {
  display: grid;
  gap: 20px;
}

.daily-item {
  padding: 20px;
  border-radius: 16px;
  background: rgba(247, 248, 253, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.daily-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.daily-header h4 {
  margin: 0;
  font-size: 1.1rem;
}

.daily-summary {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
}

.daily-requests {
  color: var(--daw-text-secondary);
}

.daily-cost {
  font-weight: 600;
  color: var(--daw-primary);
}

.daily-tokens {
  font-size: 0.85rem;
  color: var(--daw-text-secondary);
}

.daily-models {
  display: grid;
  gap: 12px;
}

.daily-model-item {
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.daily-model-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.daily-model-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.daily-model-requests {
  font-size: 0.8rem;
  color: var(--daw-text-secondary);
}

.daily-model-stats {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: var(--daw-text-secondary);
}

.daily-model-cost {
  font-weight: 600;
  color: var(--daw-primary);
  font-size: 0.95rem;
}

.daily-model-other {
  background: rgba(240, 242, 255, 0.6);
  font-size: 0.85rem;
  color: var(--daw-text-secondary);
}

/* 响应式 */
@media (max-width: 1400px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .models-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 900px) {
  .date-range-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .date-separator {
    padding: 0;
    text-align: center;
  }

  .control-block {
    min-width: auto;
  }

  .models-table .table-head,
  .models-table .table-row {
    grid-template-columns: 1.5fr repeat(4, 1fr);
  }

  .models-table .table-head span:nth-child(6),
  .models-table .table-row span:nth-child(6) {
    display: none;
  }

  .users-table .table-head,
  .users-table .table-row {
    grid-template-columns: 1.2fr repeat(4, 1fr);
  }

  .users-table .table-head span:nth-child(n+6),
  .users-table .table-row span:nth-child(n+6) {
    display: none;
  }
}

@media (max-width: 640px) {
  .controls-card,
  .summary-card,
  .chart-card,
  .models-detail-card,
  .users-card,
  .daily-detail-card {
    padding: 20px 18px;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .models-grid {
    grid-template-columns: 1fr;
  }

  .models-table .table-head,
  .models-table .table-row {
    grid-template-columns: 1.8fr 1fr 1fr;
  }

  .models-table .table-head span:nth-child(n+4),
  .models-table .table-row span:nth-child(n+4) {
    display: none;
  }

  .users-table .table-head,
  .users-table .table-row {
    grid-template-columns: 1.5fr 1fr 1fr;
  }

  .users-table .table-head span:nth-child(n+4),
  .users-table .table-row span:nth-child(n+4) {
    display: none;
  }

  .model-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .model-metrics {
    justify-content: center;
  }
}
</style>
