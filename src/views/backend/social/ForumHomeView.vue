<template>
  <div class="admin-home-edit">
    <!-- 📷 Banner 圖片管理 -->
    <h2>首頁 Banner 圖片</h2>
    <img v-if="bannerPreview" :src="bannerPreview" class="preview-img" />
    <el-upload
      class="upload-area"
      action="/api/home/banner"
      :show-file-list="false"
      :on-success="handleBannerSuccess"
    >
      <el-button>更換 Banner 圖片</el-button>
    </el-upload>

    <!-- 🖼️ 廣告卡片區塊管理 -->
    <h2 style="margin-top: 40px">廣告卡片管理</h2>
    <div class="promo-card-editor" v-for="(card, i) in promoCards" :key="i">
      <img v-if="card.imageUrl" :src="card.imageUrl" class="preview-img" />
      <el-upload
        :action="`/api/home/promo/${i+1}/image`"
        :show-file-list="false"
        :on-success="(res) => updatePromoImage(i, res.url)"
      >
        <el-button>上傳圖片 {{ i + 1 }}</el-button>
      </el-upload>
      <el-input
        type="textarea"
        v-model="card.text"
        placeholder="輸入卡片文案..."
        :rows="2"
        @blur="saveCardText(i)"
      />
    </div>

    <!-- 📺 推薦影片管理 -->
    <h2 style="margin-top: 40px">推薦影片連結</h2>
    <el-input
      v-model="youtubeUrl"
      placeholder="請輸入 YouTube 分享連結（例如：https://youtu.be/abc123）"
      @blur="saveYoutube"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const promoCards = ref([
  { text: '', imageUrl: '' },
  { text: '', imageUrl: '' },
  { text: '', imageUrl: '' }
]);
const youtubeUrl = ref('');
const bannerPreview = ref('');

onMounted(async () => {
  const [promos, video, bannerRes] = await Promise.all([
    axios.get('/api/home/promos'),
    axios.get('/api/home/video'),
    axios.get('/api/home/banner')
  ]);
  promoCards.value = promos.data;
  youtubeUrl.value = video.data.originalUrl;
  bannerPreview.value = bannerRes.data.url;
});

const saveCardText = async (index) => {
  await axios.put(`/api/home/promo/${index + 1}/text`, {
    text: promoCards.value[index].text
  });
  ElMessage.success('文案已儲存');
};

const saveYoutube = async () => {
  await axios.put('/api/home/video', {
    url: youtubeUrl.value
  });
  ElMessage.success('影片連結已更新');
};

const updatePromoImage = (index, url) => {
  promoCards.value[index].imageUrl = url;
};

const handleBannerSuccess = (res) => {
  bannerPreview.value = res.url;
  ElMessage.success('Banner 已更新');
};
</script>

<style scoped>
.admin-home-edit {
  max-width: 800px;
  margin: 40px auto;
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  color: #333;
  font-family: 'Segoe UI', sans-serif;
}

h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 12px;
}
.upload-area {
  margin-bottom: 24px;
}
.promo-card-editor {
  margin-bottom: 20px;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}
.preview-img {
  max-width: 100%;
  height: auto;
  margin-bottom: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
</style>