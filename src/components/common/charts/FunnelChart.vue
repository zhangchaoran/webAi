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

// 计算转化率
const calculateConversionRate = (data: FunnelData[]) => {
  const maxValue = data[0]?.value || 1
  return data.map(item => ({
    ...item,
    rate: ((item.value / maxValue) * 100).toFixed(1)
  }))
}

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  
  const dataWithRate = calculateConversionRate(props.data)
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      borderRadius: 8,
      textStyle: { color: '#333', fontSize: 12 },
      formatter: (params: any) => {
        const data = dataWithRate[params.dataIndex]
        return `
          <strong>${data.name}</strong><br/>
          数量: ${data.value}<br/>
          转化率: ${data.rate}%
        `
      }
    },
    series: [
      {
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
          borderColor: '#fff',
          borderWidth: 2,
          borderRadius: 8,
          shadowBlur: 8,
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 1,
            colorStops: [
              { offset: 0, color: '#42b883' },
              { offset: 0.5, color: '#89b4fa' },
              { offset: 1, color: '#5c8fd6' }
            ]
          }
        },
        emphasis: {
          label: {
            fontSize: 12,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(66, 184, 131, 0.5)',
            transform: 'scale(1.02)'
          }
        }
      }
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: 5,
        style: {
          text: '浏览 → 购买 转化路径',
          fill: '#888',
          fontSize: 11
        },
        invisible: true
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 监听数据变化
watch(() => props.data, () => {
  if (chartInstance) {
    const dataWithRate = calculateConversionRate(props.data)
    chartInstance.setOption({
      series: [{ data: props.data }]
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
.funnel-chart-container {
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
  background: linear-gradient(135deg, #42b883, #5c8fd6);
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