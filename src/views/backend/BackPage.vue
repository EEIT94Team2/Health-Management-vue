<template>
  <div class="home-container">
    <h2>歡迎來到健身房管理系統</h2>
    <div v-if="loading" class="loading">
      加載中...
    </div>
    <div v-else class="user-info">
      <el-card class="welcome-card">
        <template #header>
          <div class="card-header">
            <span>用戶信息</span>
          </div>
        </template>
        <div v-if="userInfo">
          <p><strong>角色:</strong> {{ userInfo.role || '一般用戶' }}</p>
          <p><strong>登入時間:</strong> {{ new Date().toLocaleString() }}</p>
        </div>
        <div v-else>
          <p>無法獲取用戶信息</p>
        </div>
      </el-card>
      
      <el-card class="dashboard-card">
        <template #header>
          <div class="card-header">
            <span>系統狀態</span>
          </div>
        </template>
        <div class="dashboard-stats">
          <div class="stat-item">
            <el-icon><User /></el-icon>
            <span>用戶</span>
            <div class="stat-value">{{ stats.users || 0 }}</div>
          </div>
          <div class="stat-item">
            <el-icon><Calendar /></el-icon>
            <span>課程</span>
            <div class="stat-value">{{ stats.courses || 0 }}</div>
          </div>
          <div class="stat-item">
            <el-icon><Document /></el-icon>
            <span>文章</span>
            <div class="stat-value">{{ stats.posts || 0 }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Calendar, Document } from '@element-plus/icons-vue';

const loading = ref(true);
const userInfo = ref(null);
const stats = ref({
  users: 0,
  courses: 0,
  posts: 0
});

onMounted(async () => {
  // 從localStorage獲取用戶信息
  const role = localStorage.getItem('userRole');
  
  // 設置用戶信息
  userInfo.value = {
    role: role || '一般用戶'
  };
  
  try {
    // 這只是一個示例API調用，實際使用時可根據後端API進行修改
    // 獲取系統統計數據
    // const response = await axios.get('/api/dashboard/stats');
    // if (response.data && response.data.success) {
    //   stats.value = response.data.data;
    // }
    
    // 模擬數據
    stats.value = {
      users: 120,
      courses: 25,
      posts: 78
    };
  } catch (error) {
    console.error('獲取數據失敗', error);
    ElMessage.error('獲取數據失敗，請稍後再試');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.user-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.welcome-card, .dashboard-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
  color: #409EFF;
}
</style>