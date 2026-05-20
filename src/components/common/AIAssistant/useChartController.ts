// useChartController.ts
import type { Ref } from 'vue'

interface ChartDataRefs {
  barData: Ref<{ categories: string[]; values: number[] }>
  lineBarData: Ref<{ categories: string[]; sales: number[]; growth: number[] }>
  pieData: Ref<{ name: string; value: number; color: string }[]>
  funnelData: Ref<{ name: string; value: number }[]>
  resetAllData: () => void
}

export function useChartController(chartData: ChartDataRefs) {
  
  // 执行 AI 返回的指令
  const executeCommands = (commands: any[]) => {
    if (!Array.isArray(commands)) {
      console.warn('指令格式错误：不是数组')
      return false
    }
    
    let hasUpdate = false
    
    for (const cmd of commands) {
      switch (cmd.action) {
        case 'updateBar':
          updateBarData(cmd)
          hasUpdate = true
          break
        case 'updateLineBar':
          updateLineBarData(cmd)
          hasUpdate = true
          break
        case 'updatePie':
          updatePieData(cmd)
          hasUpdate = true
          break
        case 'updateFunnel':
          updateFunnelData(cmd)
          hasUpdate = true
          break
        case 'reset':
          chartData.resetAllData()
          hasUpdate = true
          break
        default:
          console.warn('未知指令:', cmd.action)
      }
    }
    
    return hasUpdate
  }
  
  // 更新柱形图
  const updateBarData = (cmd: any) => {
    const { index, category, value } = cmd
    
    if (index !== undefined && chartData.barData.value.values[index] !== undefined) {
      chartData.barData.value.values[index] = value
      return
    }
    
    if (category !== undefined) {
      const idx = chartData.barData.value.categories.indexOf(category)
      if (idx !== -1) {
        chartData.barData.value.values[idx] = value
      }
    }
  }
  
  // 更新柱线混合图
  const updateLineBarData = (cmd: any) => {
    const { index, category, sales, growth } = cmd
    
    if (index !== undefined) {
      if (sales !== undefined) chartData.lineBarData.value.sales[index] = sales
      if (growth !== undefined) chartData.lineBarData.value.growth[index] = growth
      return
    }
    
    if (category !== undefined) {
      const idx = chartData.lineBarData.value.categories.indexOf(category)
      if (idx !== -1) {
        if (sales !== undefined) chartData.lineBarData.value.sales[idx] = sales
        if (growth !== undefined) chartData.lineBarData.value.growth[idx] = growth
      }
    }
  }
  
  // 更新扇形图
  const updatePieData = (cmd: any) => {
    const { name, value } = cmd
    const item = chartData.pieData.value.find(p => p.name === name)
    if (item) {
      item.value = value
    }
  }
  
  // 更新漏斗图
  const updateFunnelData = (cmd: any) => {
    const { name, value } = cmd
    const item = chartData.funnelData.value.find(f => f.name === name)
    if (item) {
      item.value = value
    }
  }
  
  return { executeCommands }
}