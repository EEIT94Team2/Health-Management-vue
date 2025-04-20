<template>
  <el-card class="user-achievements-container">
    <template #header>
      <div class="user-achievements-header">
        <span>我的獎章</span>
      </div>
    </template>

    <el-table :data="achievements" border style="width: 100%">
      <el-table-column prop="achievementType" label="類型"></el-table-column>
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
.user-achievements-container {
  max-width: 800px;
  margin: 20px auto;
}

.user-achievements-header {
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.no-data {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
