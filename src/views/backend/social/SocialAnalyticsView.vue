<template>
    <div class="analytics-container">
      <h2>📊 社群互動分析儀表板</h2>
  
      <div class="chart-card">
        <h3>📝 每月發文數</h3>
        <v-chart :option="monthlyPostOption" style="height: 300px" />
      </div>
  
      <div class="chart-card">
        <h3>💬 每月留言數</h3>
        <v-chart :option="monthlyCommentOption" style="height: 300px" />
      </div>
  
      <div class="chart-card">
        <h3>👍 最多按讚文章 TOP 5</h3>
        <v-chart :option="mostLikedOption" style="height: 300px" />
      </div>
  
      <div class="chart-card">
        <h3>🌟 最多收藏文章 TOP 5</h3>
        <v-chart :option="mostFavoritedOption" style="height: 300px" />
      </div>
  
      <div class="chart-card">
        <h3>👤 發文最多的使用者 TOP 5</h3>
        <v-chart :option="mostActiveUsersOption" style="height: 300px" />
      </div>
  
      <div class="chart-card">
        <h3>🧑‍🤝‍🧑 好友數最多 TOP 5</h3>
        <v-chart :option="mostFriendsOption" style="height: 300px" />
      </div>
  
      <div class="chart-card">
        <h3>🏋️ 訓練邀請狀態統計</h3>
        <v-chart :option="trainingInviteOption" style="height: 300px" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import { use } from 'echarts/core'
  import VChart from 'vue-echarts'
  import { BarChart, LineChart, PieChart } from 'echarts/charts'
  import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  
  use([BarChart, LineChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])
  
  const monthlyPostOption = ref({})
  const monthlyCommentOption = ref({})
  const mostLikedOption = ref({})
  const mostFavoritedOption = ref({})
  const mostActiveUsersOption = ref({})
  const mostFriendsOption = ref({})
  const trainingInviteOption = ref({})
  
  onMounted(async () => {
    const [postStats, commentStats, likedPosts, favoritedPosts, activeUsers, friendRanks, trainingStats] = await Promise.all([
      axios.get('/api/analytics/posts/monthly'),
      axios.get('/api/analytics/comments/monthly'),
      axios.get('/api/analytics/posts/top-liked'),
      axios.get('/api/analytics/posts/top-favorited'),
      axios.get('/api/analytics/users/top-posts'),
      axios.get('/api/analytics/users/top-friends'),
      axios.get('/api/analytics/training-invitations')
    ])
  
    monthlyPostOption.value = {
      xAxis: { type: 'category', data: postStats.data.months },
      yAxis: { type: 'value' },
      series: [{ data: postStats.data.counts, type: 'line' }]
    }
  
    monthlyCommentOption.value = {
      xAxis: { type: 'category', data: commentStats.data.months },
      yAxis: { type: 'value' },
      series: [{ data: commentStats.data.counts, type: 'line' }]
    }
  
    mostLikedOption.value = {
      xAxis: { type: 'category', data: likedPosts.data.titles },
      yAxis: { type: 'value' },
      series: [{ data: likedPosts.data.counts, type: 'bar' }]
    }
  
    mostFavoritedOption.value = {
      xAxis: { type: 'category', data: favoritedPosts.data.titles },
      yAxis: { type: 'value' },
      series: [{ data: favoritedPosts.data.counts, type: 'bar' }]
    }
  
    mostActiveUsersOption.value = {
      xAxis: { type: 'category', data: activeUsers.data.names },
      yAxis: { type: 'value' },
      series: [{ data: activeUsers.data.counts, type: 'bar' }]
    }
  
    mostFriendsOption.value = {
      xAxis: { type: 'category', data: friendRanks.data.names },
      yAxis: { type: 'value' },
      series: [{ data: friendRanks.data.counts, type: 'bar' }]
    }
  
    trainingInviteOption.value = {
      tooltip: { trigger: 'item' },
      legend: { top: '5%', left: 'center' },
      series: [
        {
          name: '邀請狀態',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
          labelLine: { show: false },
          data: [
            { value: trainingStats.data.accepted, name: '已接受' },
            { value: trainingStats.data.rejected, name: '已拒絕' },
            { value: trainingStats.data.pending, name: '等待中' }
          ]
        }
      ]
    }
  })
  </script>
  
  
  <style scoped>
  .analytics-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  background-color: #f9f9f9;
  color: #333;
}

.chart-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  color: #333;
  transition: box-shadow 0.3s;
}

.chart-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

h2, h3 {
  color: #222;
}
</style>
  