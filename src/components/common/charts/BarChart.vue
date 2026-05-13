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

interface Props {
  categories: string[]
  values: number[]
}

const props = defineProps<Props>()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    grid: {
      left: '8%',
      right: '5%',
      top: '15%',
      bottom: '10%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      borderRadius: 8,
      textStyle: { color: '#333', fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: props.categories,
      axisLabel: {
        fontSize: 11,
        color: '#666',
        rotate: 0
      },
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '销售额 (万元)',
      nameTextStyle: { fontSize: 11, color: '#888' },
      axisLabel: { fontSize: 11, color: '#666' },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
    },
    series: [
      {
        type: 'bar',
        data: props.values,
        barWidth: '60%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#42b883' },
              { offset: 1, color: '#2c8c5a' }
            ]
          },
          borderRadius: [6, 6, 0, 0],
          shadowColor: 'rgba(66, 184, 131, 0.3)',
          shadowBlur: 8
        },
        label: {
          show: true,
          position: 'top',
          color: '#42b883',
          fontWeight: 'bold',
          fontSize: 11,
          formatter: '{c}'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(66, 184, 131, 0.5)'
          }
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 监听数据变化
watch(() => [props.categories, props.values], () => {
  if (chartInstance) {
    chartInstance.setOption({
      xAxis: { data: props.categories },
      series: [{ data: props.values }]
    })
  }
}, { deep: true })

// 监听容器大小变化
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onMounted(() => {
  return () => {
    window.removeEventListener('resize', handleResize)
    chartInstance?.dispose()
  }
})
</script>

<style scoped>
.bar-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 0 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
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
  color: #2c3e50;
}

.legend-section {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #42b883, #2c8c5a);
  border-radius: 2px;
}

.legend-text {
  font-size: 11px;
  color: #888;
}

.chart {
  flex: 1;
  width: 100%;
  min-height: 0;
}
</style>