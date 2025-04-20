<template>
  <div class="overview">
    <h2>概覽</h2>
    <div v-if="loadingOverviewChart">載入中...</div>
    <div v-else-if="overviewData">
      <p>總運動時間：{{ overviewData.totalWorkoutTime }}</p>
      <p>消耗總卡路里：{{ overviewData.totalCaloriesBurned }}</p>
      <p>運動次數：{{ overviewData.workoutCount }}</p>
      <p>連續運動天數：{{ overviewData.consecutiveDays }}</p>
    </div>
    <div v-else>沒有概覽數據。</div>
    <div id="overview-chart" style="width: 100%; height: 300px"></div>
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
