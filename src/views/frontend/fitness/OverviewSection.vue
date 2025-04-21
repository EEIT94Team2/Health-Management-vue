<template>
  <div>
    <h2 class="card-title">概覽</h2>
    <div v-if="loadingOverviewChart" class="loading-text">載入中...</div>
    <div v-else-if="overviewData" class="overview-data">
      <p>總運動時間：{{ overviewData.totalWorkoutTime }}</p>
      <p>消耗總卡路里：{{ overviewData.totalCaloriesBurned }}</p>
      <p>運動次數：{{ overviewData.workoutCount }}</p>
      <p>連續運動天數：{{ overviewData.consecutiveDays }}</p>
    </div>
    <div v-else class="no-data-text">沒有概覽數據。</div>
    <div id="overview-chart" class="overview-chart"></div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  overviewData: {
    type: Object,
    default: null,
  },
  loadingOverviewChart: {
    type: Boolean,
    required: true,
  },
});
</script>

<style scoped>
.card-title {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.5rem; /* 與健身追蹤頁面 el-card header 的 h2 一致 */
  color: var(--text-primary); /* 假設您有定義這個變數 */
}

.loading-text,
.no-data-text,
.overview-data {
  color: var(--text-secondary); /* 假設您有定義這個變數 */
  margin-bottom: 10px;
}

.overview-chart {
  width: 100%;
  height: 300px;
}
</style>
