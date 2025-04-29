<template>
  <div class="dashboard-container">
    <h1 class="dashboard-title">綜合數據報告</h1>
    <div class="stats-grid">
      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span style="font-size: 1.8rem">📊 總訓練次數</span>
          </div>
        </template>
        <div class="stats-value">{{ dashboardStats.totalWorkouts }}</div>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span style="font-size: 1.8rem">⏱️ 總訓練時長 (分鐘)</span>
          </div>
        </template>
        <div class="stats-value">{{ dashboardStats.totalWorkoutMinutes }}</div>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span style="font-size: 1.8rem">🔥總燃燒卡路里</span>
          </div>
        </template>
        <div class="stats-value">
          {{
            dashboardStats.totalCaloriesBurned
              ? dashboardStats.totalCaloriesBurned.toFixed(2)
              : 0
          }}
        </div>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span style="font-size: 1.8rem">🌟 本週活躍用戶數</span>
          </div>
        </template>
        <div class="stats-value">{{ dashboardStats.activeUsersThisWeek }}</div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";

const dashboardStats = ref({
  totalWorkouts: 0,
  totalWorkoutMinutes: 0,
  totalCaloriesBurned: 0,
  activeUsersThisWeek: 0,
});

onMounted(() => {
  fetchDashboardStats();
});

const fetchDashboardStats = async () => {
  try {
    const token = localStorage.getItem("authToken");
    console.log("從 localStorage 獲取的 token:", token); // 檢查 token 值

    const response = await axios.get("/api/fitness/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${token}`, // 直接在請求中設置 Authorization header
      },
    });
    dashboardStats.value = response.data;
    console.log("儀表板統計數據:", response.data);
  } catch (error) {
    console.error("獲取儀表板統計數據失敗", error);
    ElMessage.error("獲取儀表板統計數據失敗");
  }
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  min-height: 80vh;
}

.dashboard-title {
  margin-bottom: 60px;
  color: #333;
  font-size: 4rem;
  text-align: center;
}

.stats-grid {
  display: flex;
  flex-direction: column; /* 關鍵：垂直排列 */
  align-items: center; /* 水平居中每個卡片 */
  gap: 30px; /* 垂直間距 */
  max-width: 600px; /* 控制整體寬度 */
  width: 100%;
  margin: 0 auto; /* 水平居中卡片組 */
}

.stats-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  border: none;
  width: 100%; /* 使卡片佔滿容器寬度 */
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.card-header {
  color: #555;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.card-header i {
  margin-right: 10px;
}

.stats-value {
  font-size: 4rem;
  font-weight: bold;
  color: #007bff;
}
</style>
