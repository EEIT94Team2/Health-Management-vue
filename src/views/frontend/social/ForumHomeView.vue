<template>
  <div class="homepage-container">
    <!-- Hero Banner -->
    <section class="hero">
      <div class="overlay">
        <h1>健康管理專家，<span class="highlight">掌握你的健康</span></h1>
        <p>專業數據分析、個人化健康計劃，全方位追蹤功能，讓健康管理更簡單有效</p>
        <el-button type="success" @click="$router.push('/social/forumcreate')">立即發表文章</el-button>
      </div>
    </section>

    <!-- 三個廣告卡片區 -->
    <section class="promo-section">
      <div class="promo-card" v-for="n in 3" :key="n">
        <img :src="`/api/home/promo-${n}.jpg`" alt="廣告圖片" />
        <p class="promo-text">這裡是廣告文案{{ n }}</p>
      </div>
    </section>

    <!-- 熱門文章 + 最新文章 -->
    <section class="post-section">
      <div class="post-half">
        <h2>🔥 熱門文章排行榜</h2>
        <ul>
          <li v-for="p in topPosts" :key="p.id" class="post-item">
            <span class="rank">TOP{{ p.rank }}</span>
            <div>
              <strong>{{ p.title }}</strong>
              <p class="meta">👀 {{ p.viewCount }} 次瀏覽</p>
            </div>
          </li>
        </ul>
      </div>

      <div class="post-half">
        <h2>🆕 最新文章</h2>
        <ul>
          <li v-for="p in latestPosts" :key="p.id" class="post-item">
            <strong>{{ p.title }}</strong>
            <p class="meta">{{ p.summary }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- 推薦課程 + YouTube -->
    <section class="bottom-section">
      <div class="recommend-box">
        <h2>📌 今日推薦課程</h2>
        <div class="course-card">
          <h3>重訓核心訓練入門</h3>
          <p>由專業教練帶領，30分鐘改善體態、增強肌力！</p>
        </div>
      </div>
      <div class="video-box">
        <h2>📺 推薦影片</h2>
        <iframe width="100%" height="200" :src="youtubeEmbedUrl" frameborder="0" allowfullscreen></iframe>
      </div>
    </section>
  </div>
</template>

<script setup>
const topPosts = [
  { id: 1, title: '增肌飲食計畫', viewCount: 345, rank: 1 },
  { id: 2, title: '減脂訓練菜單', viewCount: 300, rank: 2 },
  { id: 3, title: '健身必備補給品', viewCount: 280, rank: 3 },
  { id: 4, title: '從零開始跑步習慣', viewCount: 210, rank: 4 },
  { id: 5, title: '運動傷害預防知識', viewCount: 198, rank: 5 },
];

const latestPosts = [
  { id: 101, title: '最新訓練技巧', summary: '學習如何快速進入訓練節奏，提升效率。' },
  { id: 102, title: '健身房新手入門', summary: '第一次進健身房就上手！' },
  { id: 103, title: '如何避免運動疲勞', summary: '改善休息策略與補給觀念。' },
];

const youtubeEmbedUrl = 'https://www.youtube.com/embed/WUZZ0N7pmlc'; // 可後端管理
</script>

<style scoped>
.homepage-container {
  background-color: #0f172a;
  color: #fff;
  font-family: 'Segoe UI', sans-serif;
}

.hero {
  background-image: url('/api/home/banner.jpg');
  background-size: cover;
  background-position: center;
  height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
}
.hero .overlay {
  background: rgba(0, 0, 0, 0.5);
  padding: 40px;
  border-radius: 12px;
}
.hero h1 {
  font-size: 32px;
  margin-bottom: 10px;
}
.hero .highlight {
  color: #4caf50;
}
.hero p {
  color: #ccc;
  margin-bottom: 20px;
}

.promo-section {
  display: flex;
  justify-content: space-around;
  padding: 40px 20px;
  background-color: #1e293b;
}
.promo-card {
  width: 30%;
  background-color: #2c3e50;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}
.promo-card img {
  width: 100%;
  border-radius: 6px;
  margin-bottom: 10px;
}
.promo-text {
  font-size: 14px;
  color: #ccc;
}

.post-section {
  display: flex;
  gap: 32px;
  padding: 40px;
  background-color: #0f172a;
}
.post-half {
  width: 50%;
}
.post-half h2 {
  font-size: 20px;
  margin-bottom: 16px;
  color: #4caf50;
}
.post-item {
  background: #1f2a3a;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 10px;
}
.rank {
  font-weight: bold;
  margin-right: 8px;
  color: #facc15;
}
.meta {
  font-size: 13px;
  color: #ccc;
}

.bottom-section {
  display: flex;
  padding: 40px;
  gap: 32px;
  background-color: #1e293b;
}
.recommend-box, .video-box {
  flex: 1;
}
.course-card {
  background-color: #2c3e50;
  padding: 20px;
  border-radius: 12px;
}
.course-card h3 {
  color: #4caf50;
  margin-bottom: 8px;
}
.course-card p {
  color: #ccc;
}
</style>
