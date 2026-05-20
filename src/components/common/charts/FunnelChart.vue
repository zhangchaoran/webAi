<template>
  <div class="funnel-chart-container">
    <div class="chart-header">
      <div class="title-section">
        <span class="title-icon">📊</span>
        <span class="title">销售转化漏斗</span>
      </div>
      <div class="legend-section">
        <span class="legend-dot"></span>
        <span class="legend-text">转化率趋势</span>
      </div>
    </div>
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useChartTheme } from '@/composables/useChartTheme'

interface FunnelData {
  name: string
  value: number
}

interface Props {
  data: FunnelData[]
}

const props = defineProps<Props>()
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const { getThemeColors, initChartListeners } = useChartTheme({ value: chartInstance })

// 计算转化率
const calculateConversionRate = (data: FunnelData[]) => {
  const maxValue = data[0]?.value || 1
  return data.map(item => ({
    ...item,
    rate: ((item.value / maxValue) * 100).toFixed(1)
  }))
}

const updateChartOptions = () => {
  if (!chartInstance) return
  const colors = getThemeColors()
  const dataWithRate = calculateConversionRate(props.data)
  
  chartInstance.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: colors.bgCard,
      borderColor: colors.borderColor,
      borderWidth: 1,
      borderRadius: 8,
      textStyle: { color: colors.textPrimary, fontSize: 12 },
      formatter: (params: any) => {
        const data = dataWithRate[params.dataIndex]
        return `<strong>${data.name}</strong><br/>数量: ${data.value}<br/>转化率: ${data.rate}%`
      }
    },
    series: [{
      type: 'funnel',
      data: props.data,
      sort: 'descending',
      gap: 4,
      width: '70%',
      height: '80%',
      left: '15%',
      top: '10%',
      bottom: '10%',
      funnelAlign: 'center',
      label: {
        show: true,
        position: 'inside',
        formatter: (params: any) => {
          const rate = dataWithRate[params.dataIndex].rate
          return `${params.name}\n${params.value} (${rate}%)`
        },
        fontSize: 11,
        fontWeight: 'bold',
        color: '#fff',
        lineHeight: 18
      },
      itemStyle: {
        borderColor: colors.bgCard,
        borderWidth: 2,
        borderRadius: 8,
        shadowBlur: 8,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 1,
          colorStops: [
            { offset: 0, color: colors.chartColor1 },
            { offset: 0.5, color: colors.chartColor2 },
            { offset: 1, color: colors.chartColor3 }
          ]
        }
      },
      emphasis: {
        label: { fontSize: 12, fontWeight: 'bold' },
        itemStyle: {
          shadowBlur: 12,
          shadowColor: `${colors.chartColor1}80`,
          transform: 'scale(1.02)'
        }
      }
    }]
  }, { notMerge: false })
}

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  updateChartOptions()
}

watch(() => props.data, () => {
  if (chartInstance) updateChartOptions()
}, { deep: true })

onMounted(() => {
  initChart()
  initChartListeners(updateChartOptions)
})
</script>

<style scoped>
.funnel-chart-container {
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

.title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 18px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.legend-section {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, var(--chart-color-1), var(--chart-color-3));
  border-radius: 2px;
}

.legend-text {
  font-size: 11px;
  color: var(--text-secondary);
}

.chart {
  flex: 1;
  width: 100%;
  min-height: 0;
}
</style>