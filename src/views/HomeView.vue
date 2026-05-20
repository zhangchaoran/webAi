<template>
  <div class="dashboard">
    <!-- 主题切换按钮 -->
    <div class="theme-header">
      <h2>📊 数据看板</h2>
      <ThemeButtons />
    </div>
    
    <div class="dashboard-layout">
      <div class="left-side">
        <div class="chart-card">
          <BarChart :categories="barData.categories" :values="barData.values" />
        </div>
        <div class="chart-card">
          <LineBarChart :categories="lineBarData.categories" :sales="lineBarData.sales" :growth="lineBarData.growth" />
        </div>
      </div>

      <div class="center-ai">
        <AIAssistant :chart-data="aiChartData" />
      </div>

      <div class="right-side">
        <div class="chart-card">
          <PieChart :data="pieData" />
        </div>
        <div class="chart-card">
          <FunnelChart :data="funnelData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import BarChart from '@/components/common/charts/BarChart.vue'
import LineBarChart from '@/components/common/charts/LineBarChart.vue'
import PieChart from '@/components/common/charts/PieChart.vue'
import FunnelChart from '@/components/common/charts/FunnelChart.vue'
import AIAssistant from '@/components/common/AIAssistant/index.vue'
import ThemeButtons from '@/components/ThemeButtons.vue'
import { useChartData } from '@/components/common/hooks/useChartData'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const { barData, lineBarData, pieData, funnelData, buildDataContext, resetAllData } = useChartData()

const aiChartData = computed(() => ({
  barData,
  lineBarData,
  pieData,
  funnelData,
  buildDataContext,
  resetAllData
}))

// 监听主题变化，触发 ECharts 重新渲染
const handleThemeChange = (event: CustomEvent) => {
  // 重新触发图表渲染
  window.dispatchEvent(new CustomEvent('chart-refresh'))
}

onMounted(() => {
  window.addEventListener('theme-change', handleThemeChange as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('theme-change', handleThemeChange as EventListener)
})
</script>

<style scoped>
.dashboard {
  width: 100%;
  height: 100vh;
  padding: 1rem;
  background: var(--bg-primary);
  box-sizing: border-box;
}

.theme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.theme-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.dashboard-layout {
  display: flex;
  gap: 1rem;
  width: 100%;
  height: calc(100% - 60px);
}

.left-side, .right-side {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.center-ai {
  flex: 3;
  background: var(--bg-secondary);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

.chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  overflow: hidden;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .dashboard-layout { flex-direction: column; }
  .left-side, .right-side, .center-ai { flex: auto; min-height: 250px; }
  .left-side, .right-side { flex-direction: row; }
}
</style>