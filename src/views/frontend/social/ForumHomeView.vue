<template>
  <div class="homepage-container">
    <!-- Hero Banner -->
    <section class="hero">
      <div class="overlay">
        <h1>健康管理專家，<span class="highlight">掌握你的健康</span></h1>
        <p>{{ bannerText }}</p>
        <div class="hero-buttons">
          <el-button type="primary" @click="$router.push('/social/forum')">文章列表</el-button>
          <el-button type="success" @click="$router.push('/social/forumcreate')">立即發表文章</el-button>
        </div>
      </div>
    </section>

    <!-- 三個廣告卡片區 -->
    <section class="promo-section">
      <div class="promo-card" v-for="n in 3" :key="n">
        <img :src="getPromoImagePath(n)" alt="廣告圖片" />
        <p class="promo-text">廣告文案：{{ promoTexts[n - 1] }}</p>
      </div>
    </section>

    <!-- 熱門文章 + 最新文章 -->
    <section class="post-section">
      <div class="post-half">
        <h2>🔥 熱門文章排行榜</h2>
        <ul>
          <li
            v-for="(p, i) in topFivePosts"
            :key="p.id"
            class="post-item"
            :data-post-id="p.id"
            @click="$router.push({ path: '/social/forum', query: { postId: p.id } })"
            style="cursor: pointer"
          >
            <span class="rank">TOP{{ i + 1 }}</span>
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
          <li
            v-for="(p, i) in latestFivePosts"
            :key="p.id"
            class="post-item"
            :data-post-id="p.id"
            @click="$router.push({ path: '/social/forum', query: { postId: p.id } })"
            style="cursor: pointer"
          >
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
        <iframe width="100%" height="200" :src="embedUrl" frameborder="0" allowfullscreen></iframe>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const allPosts = ref([]);
const bannerText = ref('');
const promoTexts = ref(['', '', '']);
const videoUrl = ref('');
const route = useRoute();

onMounted(async () => {
  bannerText.value = localStorage.getItem('home_bannerText') ||
    '專業數據分析、個人化健康計劃，全方位追蹤功能，讓健康管理更簡單有效';
  promoTexts.value = JSON.parse(localStorage.getItem('home_promoTexts') || '["廣告一文案", "廣告二文案", "廣告三文案"]');
  videoUrl.value = localStorage.getItem('home_videoUrl') || 'https://www.youtube.com/embed/WUZZ0N7pmlc';

  const res = await axios.get('/api/posts');
  allPosts.value = res.data;

  await nextTick();
  const targetId = route.query.postId;
  if (targetId) {
    const el = document.querySelector(`[data-post-id="${targetId}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

const getPromoImagePath = (n) => `/src/assets/images/promo-${n}.jpg`;

const embedUrl = computed(() => {
  const match = videoUrl.value.match(/(?:\?v=|\.be\/|embed\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : videoUrl.value;
});

const topFivePosts = computed(() => {
  return [...allPosts.value]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);
});

const latestFivePosts = computed(() => {
  return [...allPosts.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
});
</script>

<style scoped>
.homepage-container {
  background-color: #0f172a;
  color: #fff;
  font-family: 'Segoe UI', sans-serif;
}

/* ✨ Banner 區塊樣式 */
.hero {
  background-image: url('/src/assets/images/banner.jpg');
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
  padding: 60px;
  border-radius: 12px;
  position: relative;
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
.hero-buttons {
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: flex;
  gap: 10px;
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
/* 廣告文案 */
.promo-text {
  font-size: 14px;
  color: #ccc; 
  font-weight: 500;
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
