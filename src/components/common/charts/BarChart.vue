<template>
  <div class="bar-chart-container">
    <div class="chart-header">
      <div class="title-section">
        <span class="title-icon">📊</span>
        <span class="title">周销售额趋势</span>
      </div>
      <div class="legend-section">
        <span class="legend-dot"></span>
        <span class="legend-text">销售额 (万元)</span>
      </div>
    </div>
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useChartTheme } from '@/composables/useChartTheme'

interface Props {
  categories: string[]
  values: number[]
}

const props = defineProps<Props>()
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const { getThemeColors, initChartListeners } = useChartTheme({ value: chartInstance })

const updateChartOptions = () => {
  if (!chartInstance) return
  const colors = getThemeColors()
  
  chartInstance.setOption({
    grid: { left: '8%', right: '5%', top: '15%', bottom: '10%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: colors.bgCard,
      borderColor: colors.borderColor,
      borderWidth: 1,
      borderRadius: 8,
      textStyle: { color: colors.textPrimary, fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: props.categories,
      axisLabel: { fontSize: 11, color: colors.textSecondary },
      axisLine: { lineStyle: { color: colors.borderColor } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '销售额 (万元)',
      nameTextStyle: { fontSize: 11, color: colors.textSecondary },
      axisLabel: { fontSize: 11, color: colors.textSecondary },
      splitLine: { lineStyle: { color: colors.borderColor, type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      data: props.values,
      barWidth: '60%',
      itemStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: colors.chartColor1 }, { offset: 1, color: colors.chartColor2 }] },
        borderRadius: [6, 6, 0, 0],
        shadowColor: `${colors.chartColor1}4D`,
        shadowBlur: 8
      },
      label: { show: true, position: 'top', color: colors.chartColor1, fontWeight: 'bold', fontSize: 11, formatter: '{c}' }
    }]
  }, { notMerge: false })
}

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  updateChartOptions()
}

watch(() => [props.categories, props.values], () => {
  if (chartInstance) {
    chartInstance.setOption({
      xAxis: { data: props.categories },
      series: [{ data: props.values }]
    })
  }
}, { deep: true })

onMounted(() => {
  initChart()
  initChartListeners(updateChartOptions)
})
</script>

<style scoped>
.bar-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 0 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}
.title-section { display: flex; align-items: center; gap: 8px; }
.title-icon { font-size: 18px; }
.title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.legend-section { display: flex; align-items: center; gap: 6px; }
.legend-dot { width: 10px; height: 10px; background: linear-gradient(135deg, var(--chart-color-1), var(--chart-color-2)); border-radius: 2px; }
.legend-text { font-size: 11px; color: var(--text-secondary); }
.chart { flex: 1; width: 100%; min-height: 0; }
</style>