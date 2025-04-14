<template>
  <div class="forum-home">
    <div class="hero">
      <img src="@/assets/images/forum-hero.jpg" alt="論壇主圖" class="hero-img" />
      <div class="hero-text">
        <h1>健身論壇</h1>
        <p>一起分享訓練心得、交流健康生活吧！</p>
        <div class="hero-buttons">
          <el-button type="primary" @click="goTo('/backpage/social/posts')">查看文章</el-button>
          <el-button @click="goTo('/backpage/social/create')">發表新文章</el-button>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>🔥 熱門話題</h2>
      <div class="topics">
        <div class="topic-card" v-for="topic in topics" :key="topic.title">
          <img :src="topic.img" class="topic-img" />
          <div class="topic-info">
            <h3>{{ topic.title }}</h3>
            <p>{{ topic.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const goTo = (path) => router.push(path);

// 模擬資料（圖檔請自行放到 src/assets/images）
const topics = [
  {
    title: '如何打造胸肌線條？',
    desc: '分享你的重量訓練菜單與訣竅，幫助彼此突破平台期！',
    img: new URL('@/assets/images/topic-chest.jpg', import.meta.url).href,
  },
  {
    title: '飲食控制怎麼搭配？',
    desc: '減脂不只是節食！來看看大家的健康飲食建議。',
    img: new URL('@/assets/images/topic-meal.jpg', import.meta.url).href,
  },
  {
    title: '最喜歡的健身房推薦',
    desc: '你的私房健身地點是？歡迎推薦給社群！',
    img: new URL('@/assets/images/topic-gym.jpg', import.meta.url).href,
  },
];
</script>

<style scoped>
.forum-home {
  padding: 20px;
}

.hero {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 30px;
}

.hero-img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  filter: brightness(0.7);
}

.hero-text {
  position: absolute;
  top: 20%;
  left: 10%;
  color: white;
}

.hero-text h1 {
  font-size: 38px;
  margin-bottom: 10px;
}

.hero-buttons {
  margin-top: 15px;
}

.section {
  margin-top: 30px;
}

.section h2 {
  font-size: 24px;
  margin-bottom: 15px;
}

.topics {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.topic-card {
  background: #fff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
  width: calc(33.333% - 14px);
}

.topic-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.topic-info {
  padding: 15px;
}
</style>
