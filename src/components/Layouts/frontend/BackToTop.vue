<template>
    <el-button
      v-if="showBackToTop"
      class="back-to-top-button"
      @click="scrollToTop"
    >
      TOP
    </el-button>
  </template>
  
  <script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const showBackToTop = ref(false);

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 200;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
  
<style lang="scss" scoped>
/* 這裡的樣式只會作用在這個 BackToTop 組件 */
.back-to-top-button {
  position: fixed;
  bottom: 50px; /* 往上移動 */
  right: 80px; /* 往左移動 */
  z-index: 999;
  opacity: 0.7;
  transition: opacity 0.3s ease-in-out, background-color 0.3s ease-in-out;
  font-size: 1rem; /* 調整文字大小 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 15px; /* 調整內邊距以適應文字 */
  width: 80px; /* 寬度根據內容自動調整 */
  height: 50px; /* 調整高度 */
  line-height: 1;
  background-color: #9ca3af; /* 使用專案的綠色 */
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 5px; /* 可以保留或調整圓角 */
  font-weight: bold; /* 可以讓文字加粗 */

  &:hover {
    color:#10b981;
    opacity: 1;
    background-color: #f9fafb; /* 保留原始背景色 */
    filter: brightness(90%); /* 將亮度降低 10% */
  }
}
</style>