// composables/useChartTheme.ts
import { onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

export function useChartTheme(chartInstance: { value: echarts.ECharts | null }) {
  
  // 获取当前主题色
  const getThemeColors = () => {
    const style = getComputedStyle(document.documentElement)
    return {
      bgPrimary: style.getPropertyValue('--bg-primary').trim() || '#0a0e1a',
      bgCard: style.getPropertyValue('--bg-card').trim() || '#1e293b',
      borderColor: style.getPropertyValue('--border-color').trim() || '#1f2937',
      textPrimary: style.getPropertyValue('--text-primary').trim() || '#e0e0e0',
      textSecondary: style.getPropertyValue('--text-secondary').trim() || '#6b7280',
      accentColor: style.getPropertyValue('--accent-color').trim() || '#3b82f6',
      chartColor1: style.getPropertyValue('--chart-color-1').trim() || '#3b82f6',
      chartColor2: style.getPropertyValue('--chart-color-2').trim() || '#60a5fa',
      chartColor3: style.getPropertyValue('--chart-color-3').trim() || '#8b5cf6',
      chartColor4: style.getPropertyValue('--chart-color-4').trim() || '#f59e0b',
      chartColor5: style.getPropertyValue('--chart-color-5').trim() || '#10b981',
    }
  }

  // 监听主题变化
  const setupThemeListener = (updateCallback: () => void) => {
    const handleThemeChange = () => {
      updateCallback()
    }
    window.addEventListener('theme-change', handleThemeChange)
    
    onUnmounted(() => {
      window.removeEventListener('theme-change', handleThemeChange)
    })
  }

  // 监听窗口大小变化
  const setupResizeListener = () => {
    const handleResize = () => {
      chartInstance.value?.resize()
    }
    window.addEventListener('resize', handleResize)
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
  }

  // 初始化所有监听
  const initChartListeners = (updateCallback: () => void) => {
    setupThemeListener(updateCallback)
    setupResizeListener()
  }

  return {
    getThemeColors,
    setupThemeListener,
    setupResizeListener,
    initChartListeners
  }
}