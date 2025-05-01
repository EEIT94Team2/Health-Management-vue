<template>
  <div class="overview-section-modular-carousel">
    <div v-if="loadingOverviewChart" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      載入概覽數據中...
    </div>

    <div v-else-if="overviewData.length > 0" class="overview-container">
      <div class="time-range-selector">
        <button
          @click="handleButtonClick('week')"
          :class="{ active: selectedTimeRange === 'week' }"
        >
          本週
        </button>
        <button
          @click="handleButtonClick('month')"
          :class="{ active: selectedTimeRange === 'month' }"
        >
          本月
        </button>
        <button
          @click="handleButtonClick('quarter')"
          :class="{ active: selectedTimeRange === 'quarter' }"
        >
          本季
        </button>
      </div>

      <div class="overview-modules">
        <div
          v-for="(module, index) in overviewModules"
          :key="index"
          class="overview-module"
          :class="module.className"
        >
          <div class="module-icon">
            <el-icon>
              <component :is="module.icon" />
            </el-icon>
          </div>
          <div class="module-content">
            <span class="label">{{ module.label }}</span>
            <span class="value">{{ module.value }}</span>
            <span class="unit">{{ module.unit }}</span>
          </div>
        </div>
      </div>

      <div class="overview-progress">
        <el-progress
          type="dashboard"
          :percentage="calculateProgressPercentage()"
          :color="progressColor"
        >
          <template #default="{ percentage }">
            <span class="percentage-label"> {{ percentage }}% 運動目標 </span>
          </template>
        </el-progress>
      </div>
    </div>

    <div v-else class="no-data">
      <el-empty description="暫無運動概覽數據" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import { ElMessage } from "element-plus";
import {
  Clock,
  Bicycle,
  Calendar,
  Timer,
  Loading,
} from "@element-plus/icons-vue";

const authStore = useAuthStore();
const overviewData = ref([]);
const loadingOverviewChart = ref(false);
const selectedTimeRange = ref("week");
const activeWorkoutGoals = ref([]); // 用於儲存進行中的運動目標

const fetchOverviewData = async () => {
  if (!authStore.userInfo?.id) return;
  loadingOverviewChart.value = true;

  const timeRange = selectedTimeRange.value || "week";

  console.log("即將發送請求，時間範圍:", timeRange);

  try {
    const token = authStore.getToken;
    const response = await axios.get(
      `/api/tracking/exercise-records/overview/user/${authStore.userInfo.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          timeRange: timeRange,
        },
      }
    );
    console.log("運動概覽數據:", response.data);
    console.log("實際請求 URL:", response.request.responseURL);
    overviewData.value = response.data ? [response.data] : [];
  } catch (error) {
    console.error("獲取概覽數據失敗", error);
    ElMessage.error("獲取概覽數據失敗");
  } finally {
    loadingOverviewChart.value = false;
  }
};

const fetchActiveWorkoutGoals = async () => {
  if (!authStore.userInfo?.id) return;
  try {
    const token = authStore.getToken;
    const response = await axios.get(
      `/api/tracking/fitnessgoals/user/${authStore.userInfo.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("進行中的運動目標:", response.data);
    activeWorkoutGoals.value = response.data?.content || [];
  } catch (error) {
    console.error("獲取進行中的運動目標失敗", error);
    ElMessage.error("無法獲取運動目標");
  }
};

// 添加一個新的處理函數
const handleButtonClick = (value) => {
  console.log("按鈕點擊，選擇:", value);
  selectedTimeRange.value = value;
  fetchOverviewData();
};

const overviewModules = computed(() => {
  if (overviewData.value.length === 0) return [];

  const data = overviewData.value[0];
  return [
    {
      label: "總運動時間",
      value: data.totalWorkoutTime,
      unit: "分鐘",
      icon: Clock,
      className: "time-module",
    },
    {
      label: "消耗卡路里",
      value: Math.round(data.totalCaloriesBurned),
      unit: "卡路里",
      icon: Timer,
      className: "calories-module",
    },
    {
      label: "運動次數",
      value: data.workoutCount,
      unit: "次",
      icon: Bicycle,
      className: "count-module",
    },
    {
      label: "連續運動天",
      value: data.consecutiveDays,
      unit: "天",
      icon: Calendar,
      className: "streak-module",
    },
  ];
});

const calculateProgressPercentage = () => {
  const data = overviewData.value[0] || {};
  const workoutDurationGoal = activeWorkoutGoals.value.find(
    (goal) => goal.目標類別 === "每週運動時長" && goal.狀態 === "進行中"
  );

  if (workoutDurationGoal && workoutDurationGoal.目標值) {
    const goalMinutes = workoutDurationGoal.目標值;
    const percentage = Math.min(
      (data.totalWorkoutTime / goalMinutes) * 100,
      100
    );
    return Math.round(percentage);
  } else {
    return 0;
  }
};

const progressColor = [
  { color: "#f56c6c", percentage: 20 },
  { color: "#e6a23c", percentage: 40 },
  { color: "#5cb87a", percentage: 60 },
  { color: "#1989fa", percentage: 80 },
  { color: "#6f7ad3", percentage: 100 },
];

onMounted(() => {
  fetchOverviewData();
  fetchActiveWorkoutGoals();
});
</script>

<style scoped>
.overview-section-modular-carousel {
  background-color: var(--bg-secondary, #f5f7fa);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.time-range-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}
.time-range-selector button {
  padding: 8px 15px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  color: #333;
  cursor: pointer;
  border-radius: 5px;
}

.time-range-selector button:hover {
  background-color: #e0e0e0;
}

.time-range-selector button.active {
  background-color: #8caae7;
  color: white;
  border-color: #8caae7;
}

.overview-modules {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.overview-module {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.overview-module:hover {
  transform: translateY(-5px);
}

.module-icon {
  font-size: 2.5rem;
  margin-right: 15px;
  opacity: 0.7;
}

.time-module .module-icon {
  color: #409eff;
}
.calories-module .module-icon {
  color: #f56c6c;
}
.count-module .module-icon {
  color: #67c23a;
}
.streak-module .module-icon {
  color: #e6a23c;
}

.module-content {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  margin-bottom: 5px;
}

.value {
  font-size: 1.5rem;
  font-weight: bold;
}

.unit {
  font-size: 0.8rem;
  color: var(--text-hint, #999);
}

.overview-progress {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.percentage-label {
  font-size: 1rem;
  font-weight: bold;
}

.loading,
.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--text-hint, #999);
}
</style>
