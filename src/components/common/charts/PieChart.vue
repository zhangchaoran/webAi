<template>
  <div class="pie-chart-container">
    <div class="chart-header">
      <div class="title-section">
        <span class="title-icon">🥧</span>
        <span class="title">商品销售占比</span>
      </div>
      <div class="legend-section">
        <div class="legend-item" v-for="item in props.data" :key="item.name">
          <span class="legend-dot" :style="{ background: item.color }"></span>
          <span class="legend-text">{{ item.name }}</span>
        </div>
      </div>
    </div>
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

interface DataItem {
  name: string
  value: number
  color?: string
}

interface Props {
  data: DataItem[]
}

const props = defineProps<Props>()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      borderRadius: 8,
      textStyle: { color: '#333', fontSize: 12 },
      formatter: '{b}: {d}% ({c})'
    },
    legend: { show: false },  // 使用自定义图例
    series: [
      {
        name: '销售占比',
        type: 'pie',
        radius: ['45%', '70%'],  // 环形图效果
        center: ['50%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {d}%',
          color: '#333',
          fontSize: 11,
          fontWeight: 'normal',
          lineHeight: 18
        },
        labelLine: {
          length: 10,
          length2: 8,
          smooth: true
        },
        emphasis: {
          scale: true,
          label: { show: true, fontWeight: 'bold' }
        },
        data: props.data.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color }
        }))
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 监听数据变化
watch(() => props.data, () => {
  if (chartInstance) {
    chartInstance.setOption({
      series: [{
        data: props.data.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color }
        }))
      }]
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
.pie-chart-container {
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
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-text {
  font-size: 11px;
  color: #666;
}

.chart {
  flex: 1;
  width: 100%;
  min-height: 0;
}
</style>