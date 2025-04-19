<template>
    <div class="view-container">
      <h1>健身論壇</h1>
      <p>歡迎來到我們的健身論壇，探索討論與交流的社群空間。</p>
  
      <el-button type="primary" @click="goToForum">前往討論區</el-button>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  const router = useRouter();
  
  const goToForum = () => {
    router.push("/backpage/social/posts");
  };
  </script>
  
  <style scoped>
  .view-container {
    padding: 40px;
    text-align: center;
  }
  </style>
  