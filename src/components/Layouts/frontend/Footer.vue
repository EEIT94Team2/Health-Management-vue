<template>
  <footer id="page-bottom">
    <p>Copyright © 2025 享健你，遇見更好的自己.　All rights reserved.</p>
  </footer>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/index' as *;

#page-bottom {
  display: flex; /* 啟用 Flexbox */
  justify-content: center; /* 水平置中 */
  align-items: center; /* 垂直置中 */
  padding: 10px; /* 調整 padding 來縮小區塊，你可以根據需要調整這個值 */
  text-align: center; /* 確保文字本身也是水平置中，雖然 flexbox 的 justify-content 也會影響 */
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  min-height: 50px; /* 可以設定一個最小高度，確保區塊不會過於縮小，你可以根據需要調整 */  
}
#page-bottom p {
  margin-bottom: 0; /* 移除下邊距 */
}
</style>
