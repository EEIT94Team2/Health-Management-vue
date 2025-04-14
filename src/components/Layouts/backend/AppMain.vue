<!-- 主要內容區域組件 -->

<template>
    <main class="app-main">
      <router-view />
    </main>
  </template>
  
  <style lang="scss" scoped>
  .app-main {
    padding: 20px;
    flex: 1;
    overflow-y: auto;
  }
  </style>