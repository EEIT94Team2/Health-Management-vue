<template>
  <div class="achievements-view">
    <div class="achievements-container">
      <div class="page-header">
        <h1>我的獎章</h1>
      </div>

      <el-card class="achievements-card">
        <el-table :data="achievements" style="width: 100%">
          <el-table-column
            prop="achievementType"
            label="類型"
          ></el-table-column>
          <el-table-column prop="title" label="標題"></el-table-column>
          <el-table-column prop="description" label="描述"></el-table-column>
          <el-table-column prop="achievedDate" label="獲得日期">
            <template #default="scope">
              {{ formatDate(scope.row.achievedDate) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="no-data" v-if="achievements.length === 0">
          <el-empty description="暫無獎章"></el-empty>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";

const achievements = ref([]);

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const fetchUserAchievements = async () => {
  try {
    const response = await axios.get("/api/tracking/achievements/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    achievements.value = response.data;
  } catch (error) {
    console.error("獲取我的獎章失敗:", error);
    ElMessage.error("獲取我的獎章失敗");
  }
};

onMounted(() => {
  fetchUserAchievements();
});
</script>

<style scoped>
.achievements-view {
  min-height: 100vh;
  padding: 100px 0 50px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.achievements-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;

  h1 {
    font-size: 2.5rem;
    color: var(--text-primary);
    margin-bottom: 10px;
  }
}

.achievements-card {
  border-radius: 12px;
  background-color: var(--card-bg);
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 可以根據需要調整表格樣式 */
:deep(.el-table) {
  background-color: transparent;
  color: var(--text-primary);
}

:deep(.el-table th.el-table__cell) {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.no-data {
  margin-top: 20px;
  display: flex;
  justify-content: center;

  :deep(.el-empty__description) {
    color: var(--text-secondary);
  }
}
</style>
