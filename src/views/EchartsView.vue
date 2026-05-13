<template>
  <div class="dashboard">
    <div class="dashboard-layout">
      
      <!-- 左侧：两个小图（上下排列） -->
      <div class="left-side">
        <div class="chart-card">
          <BarChart :categories="barData.categories" :values="barData.values" />
        </div>
        <div class="chart-card">
          <LineBarChart :categories="lineBarData.categories" :sales="lineBarData.sales" :growth="lineBarData.growth" />
        </div>
      </div>

      <!-- 中间：大图 -->
      <div class="center-big">
        <div class="center-content">
          <h2>📊 核心数据看板</h2>
          <div class="big-chart-placeholder">
            <div class="placeholder-icon">🗺️</div>
            <p>中间大图预留位置</p>
          </div>
        </div>
      </div>

      <!-- 右侧：两个小图（上下排列） -->
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
import BarChart from '@/components/common/charts/BarChart.vue'
import LineBarChart from '@/components/common/charts/LineBarChart.vue'
import PieChart from '@/components/common/charts/PieChart.vue'
import FunnelChart from '@/components/common/charts/FunnelChart.vue'
import { useChartData } from '@/components/common/hooks/useChartData'

const { barData, lineBarData, pieData, funnelData } = useChartData()
</script>

<style scoped>
.dashboard {
  width: 100%;
  height: 100vh;
  padding: .5rem;
  background: #f0f2f5;
  box-sizing: border-box;
}

.dashboard-layout {
  display: flex;
  gap: 1rem;
  width: 100%;
  height: 100%;
}

/* 左侧区域 - 宽度增加 */
.left-side {
  flex: 2;  /* 原来是 1，改成 2 */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

/* 右侧区域 - 宽度增加 */
.right-side {
  flex: 2;  /* 原来是 1，改成 2 */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

/* 中间大图区域 - 宽度保持不变 */
.center-big {
  flex: 3;  /* 保持不变 */
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 图表卡片 */
.chart-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.2s;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.chart-card:hover {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

/* 中间大图内容 */
.center-content {
  text-align: center;
  width: 100%;
  height: 100%;
  padding: 1rem;
}

.center-content h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.big-chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 60px);
  background: #f8f9fa;
  border-radius: 0.75rem;
  border: 1px dashed #d0d5dd;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }
  .left-side, .right-side, .center-big {
    flex: auto;
    min-height: 250px;
  }
  .left-side, .right-side {
    flex-direction: row;
  }
  .left-side .chart-card, .right-side .chart-card {
    flex: 1;
  }
}
</style>