<template>
  <div class="dashboard">
    <div class="dashboard-layout">
      
      <div class="left-side">
        <div class="chart-card">
          <BarChart :categories="barData.categories" :values="barData.values" />
        </div>
        <div class="chart-card">
          <LineBarChart :categories="lineBarData.categories" :sales="lineBarData.sales" :growth="lineBarData.growth" />
        </div>
      </div>

      <!-- 中间：AI 助手，传入图表数据 -->
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
import { computed } from 'vue'
import BarChart from '@/components/common/charts/BarChart.vue'
import LineBarChart from '@/components/common/charts/LineBarChart.vue'
import PieChart from '@/components/common/charts/PieChart.vue'
import FunnelChart from '@/components/common/charts/FunnelChart.vue'
import AIAssistant from '@/components/common/AIAssistant/index.vue'
import { useChartData } from '@/components/common/hooks/useChartData'

const { barData, lineBarData, pieData, funnelData, buildDataContext, resetAllData } = useChartData()

// 组装传给 AI 助手的数据
const aiChartData = computed(() => ({
  barData,
  lineBarData,
  pieData,
  funnelData,
  buildDataContext,
  resetAllData
}))
</script>

<style scoped>
/* 你的原有样式保持不变 */
.dashboard {
  width: 100%;
  height: 100vh;
  padding: 1rem;
  background: #f0f2f5;
  box-sizing: border-box;
}

.dashboard-layout {
  display: flex;
  gap: 1rem;
  width: 100%;
  height: 100%;
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
  background: #1e1e2e;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

.chart-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
  overflow: hidden;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .dashboard-layout { flex-direction: column; }
  .left-side, .right-side, .center-ai { flex: auto; min-height: 250px; }
  .left-side, .right-side { flex-direction: row; }
}
</style>