<template>
  <div class="home-container">
    <h2 class="page-title">歡迎來到健身房管理系統</h2>
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
      
      <!-- 社交數據分析區域 -->
      <el-card class="analytics-card">
        <template #header>
          <div class="card-header">
            <span>📊 每月發文數</span>
          </div>
        </template>
        <v-chart :option="monthlyPostOption" style="height: 300px" />
      </el-card>
      
      <el-card class="analytics-card">
        <template #header>
          <div class="card-header">
            <span>💬 每月留言數</span>
          </div>
        </template>
        <v-chart :option="monthlyCommentOption" style="height: 300px" />
      </el-card>
      
      <el-card class="analytics-card">
        <template #header>
          <div class="card-header">
            <span>👍 最多按讚文章 TOP 5</span>
          </div>
        </template>
        <v-chart :option="mostLikedOption" style="height: 300px" />
      </el-card>
      
      <el-card class="analytics-card">
        <template #header>
          <div class="card-header">
            <span>🌟 最多收藏文章 TOP 5</span>
          </div>
        </template>
        <v-chart :option="mostFavoritedOption" style="height: 300px" />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import { use } from 'echarts/core';
import VChart from 'vue-echarts';
import { BarChart, LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

use([BarChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

const loading = ref(true);
const userInfo = ref(null);

// 圖表配置
const monthlyPostOption = ref({});
const monthlyCommentOption = ref({});
const mostLikedOption = ref({});
const mostFavoritedOption = ref({});

onMounted(async () => {
  // 從localStorage獲取用戶信息
  const role = localStorage.getItem('userRole');
  
  // 設置用戶信息
  userInfo.value = {
    role: role || '一般用戶'
  };
  
  try {
    // 獲取社交數據分析
    const [postStats, commentStats, likedPosts, favoritedPosts] = await Promise.all([
      axios.get('/api/analytics/posts/monthly').catch(() => ({
        data: { months: ['1月', '2月', '3月', '4月', '5月', '6月'], counts: [12, 19, 25, 22, 30, 28] }
      })),
      axios.get('/api/analytics/comments/monthly').catch(() => ({
        data: { months: ['1月', '2月', '3月', '4月', '5月', '6月'], counts: [45, 58, 68, 75, 80, 92] }
      })),
      axios.get('/api/analytics/posts/top-liked').catch(() => ({
        data: { 
          titles: ['健身初學者指南', '增肌飲食計劃', '如何正確深蹲', '居家訓練全攻略', '有效的心肺訓練方法'],
          counts: [125, 98, 87, 76, 65]
        }
      })),
      axios.get('/api/analytics/posts/top-favorited').catch(() => ({
        data: {
          titles: ['健身房器材使用指南', '30天腹肌訓練', '健身常見迷思解析', '增強核心肌群運動', '伸展放鬆技巧'],
          counts: [85, 72, 68, 55, 48]
        }
      }))
    ]);

    // 設置圖表數據
    monthlyPostOption.value = {
      xAxis: { type: 'category', data: postStats.data.months },
      yAxis: { type: 'value' },
      series: [{ data: postStats.data.counts, type: 'line', smooth: true }]
    };

    monthlyCommentOption.value = {
      xAxis: { type: 'category', data: commentStats.data.months },
      yAxis: { type: 'value' },
      series: [{ data: commentStats.data.counts, type: 'line', smooth: true }]
    };

    mostLikedOption.value = {
      xAxis: { type: 'category', data: likedPosts.data.titles },
      yAxis: { type: 'value' },
      series: [{ data: likedPosts.data.counts, type: 'bar' }]
    };

    mostFavoritedOption.value = {
      xAxis: { type: 'category', data: favoritedPosts.data.titles },
      yAxis: { type: 'value' },
      series: [{ data: favoritedPosts.data.counts, type: 'bar' }]
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

/* 2. 新增 page-title class 的樣式 */
.page-title {
  text-align: left; /* 設定文字靠左 */
  margin-bottom: 20px; /* 可以選擇性地加個下邊距，讓標題和按鈕間有些空間 */
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.user-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
}

.welcome-card, .analytics-card {
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

.analytics-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: box-shadow 0.3s;
}

.analytics-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}
</style>