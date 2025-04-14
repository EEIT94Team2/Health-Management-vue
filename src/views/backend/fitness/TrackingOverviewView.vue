<template>
    <div class="view-container">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageDescription }}</p>
      </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const pageTitle = ref('頁面標題');
  const pageDescription = ref('頁面描述。');
  </script>
  
  <style scoped>
  .view-container {
    padding: 20px;
  }
  h1 {
    margin-bottom: 15px;
  }
  </style>