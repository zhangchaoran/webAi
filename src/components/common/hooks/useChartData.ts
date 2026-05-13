import { ref } from 'vue'

export function useChartData() {
  // 柱形图数据（可修改）
  const barData = ref({
    categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    values: [120, 200, 150, 80, 70, 110, 130]
  })

  // 柱线混合图数据（可修改）
  const lineBarData = ref({
    categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
    sales: [820, 932, 901, 934, 1290, 1330],
    growth: [2.0, 2.5, 3.0, 3.5, 4.0, 4.5]
  })

  // 扇形图数据（可修改）
  const pieData = ref([
    { name: '电子产品', value: 45, color: '#42b883' },
    { name: '服装', value: 25, color: '#89b4fa' },
    { name: '食品', value: 15, color: '#f38ba8' },
    { name: '美妆', value: 10, color: '#f9e45b' },
    { name: '其他', value: 5, color: '#a6adc8' }
  ])

  // 漏斗图数据（可修改）
  const funnelData = ref([
    { name: '访问网站', value: 10000 },
    { name: '加入购物车', value: 3500 },
    { name: '发起下单', value: 1500 },
    { name: '完成支付', value: 800 },
    { name: '复购用户', value: 200 }
  ])

  // 重置所有数据
  const resetAllData = () => {
    barData.value.values = [120, 200, 150, 80, 70, 110, 130]
    lineBarData.value.sales = [820, 932, 901, 934, 1290, 1330]
    lineBarData.value.growth = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5]
    pieData.value = [
      { name: '电子产品', value: 45, color: '#42b883' },
      { name: '服装', value: 25, color: '#89b4fa' },
      { name: '食品', value: 15, color: '#f38ba8' },
      { name: '美妆', value: 10, color: '#f9e45b' },
      { name: '其他', value: 5, color: '#a6adc8' }
    ]
    funnelData.value = [
      { name: '访问网站', value: 10000 },
      { name: '加入购物车', value: 3500 },
      { name: '发起下单', value: 1500 },
      { name: '完成支付', value: 800 },
      { name: '复购用户', value: 200 }
    ]
  }

  // 构建数据上下文（发给 AI）
  const buildDataContext = () => {
    const barContext = `周销售额（柱形图）：\n${barData.value.categories.map((cat, i) => `  ${cat}: ${barData.value.values[i]}万`).join('\n')}`
    
    const lineBarContext = `月销量与增长率（柱线混合图）：\n${lineBarData.value.categories.map((cat, i) => `  ${cat}: 销量 ${lineBarData.value.sales[i]}万件, 增长率 ${lineBarData.value.growth[i]}%`).join('\n')}`
    
    const pieContext = `商品销售占比（扇形图）：\n${pieData.value.map(item => `  ${item.name}: ${item.value}%`).join('\n')}`
    
    const funnelContext = `销售转化漏斗（漏斗图）：\n${funnelData.value.map((item, i) => {
      const rate = i === 0 ? 100 : ((item.value / funnelData.value[0].value) * 100).toFixed(1)
      return `  ${item.name}: ${item.value}人 (转化率 ${rate}%)`
    }).join('\n')}`
    
    return `${barContext}\n\n${lineBarContext}\n\n${pieContext}\n\n${funnelContext}`
  }

  return {
    barData,
    lineBarData,
    pieData,
    funnelData,
    resetAllData,
    buildDataContext
  }
}