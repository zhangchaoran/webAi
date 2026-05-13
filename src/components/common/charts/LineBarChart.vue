<template>
  <div class="line-bar-chart-container">
    <div class="chart-header">
      <div class="title-section">
        <span class="title-icon">📈</span>
        <span class="title">销量与增长率趋势</span>
      </div>
      <div class="legend-section">
        <div class="legend-item">
          <span class="legend-dot bar"></span>
          <span class="legend-text">销量 (万件)</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot line"></span>
          <span class="legend-text">增长率 (%)</span>
        </div>
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
  sales: number[]
  growth: number[]
}

const props = defineProps<Props>()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      borderRadius: 8,
      textStyle: { color: '#333', fontSize: 12 }
    },
    legend: { show: false },
    grid: {
      left: '8%',
      right: '8%',
      top: '12%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.categories,
      axisLabel: {
        fontSize: 11,
        color: '#666'
      },
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '销量 (万件)',
        nameTextStyle: { fontSize: 11, color: '#888' },
        axisLabel: { fontSize: 11, color: '#666' },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
      },
      {
        type: 'value',
        name: '增长率 (%)',
        nameTextStyle: { fontSize: 11, color: '#888' },
        axisLabel: { fontSize: 11, color: '#666' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '销量 (万件)',
        type: 'bar',
        data: props.sales,
        barWidth: '50%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#89b4fa' },
              { offset: 1, color: '#5c8fd6' }
            ]
          },
          borderRadius: [6, 6, 0, 0],
          shadowColor: 'rgba(137, 180, 250, 0.3)',
          shadowBlur: 8
        },
        label: {
          show: true,
          position: 'top',
          color: '#5c8fd6',
          fontWeight: 'bold',
          fontSize: 11,
          formatter: '{c}'
        }
      },
      {
        name: '增长率 (%)',
        type: 'line',
        yAxisIndex: 1,
        data: props.growth,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#f38ba8',
          width: 3,
          shadowColor: 'rgba(243, 139, 168, 0.3)',
          shadowBlur: 6,
          type: 'solid'
        },
        itemStyle: {
          color: '#f38ba8',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(243, 139, 168, 0.2)' },
              { offset: 1, color: 'rgba(243, 139, 168, 0.02)' }
            ]
          }
        },
        label: {
          show: true,
          position: 'top',
          color: '#f38ba8',
          fontWeight: 'bold',
          fontSize: 11,
          formatter: '{c}%'
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 监听数据变化
watch(() => [props.sales, props.growth], () => {
  if (chartInstance) {
    chartInstance.setOption({
      series: [
        { data: props.sales },
        { data: props.growth }
      ]
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
.line-bar-chart-container {
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
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot.bar {
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #89b4fa, #5c8fd6);
  border-radius: 2px;
}

.legend-dot.line {
  width: 10px;
  height: 10px;
  background: #f38ba8;
  border-radius: 50%;
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