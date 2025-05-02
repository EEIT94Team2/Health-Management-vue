<template>
  <div class="frontend-layout">
    <NavBar :key="authState" />
    <router-view />
    <Footer />
    <BackToTop />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import NavBar from '@/components/Layouts/frontend/Navbar.vue'
import Footer from '@/components/Layouts/frontend/Footer.vue'
import BackToTop from '@/components/Layouts/frontend/BackToTop.vue'

// 使用authStore和route
const authStore = useAuthStore()
const route = useRoute()

// 創建一個計算屬性，監聽登錄狀態
const authState = computed(() => {
  // 創建一個唯一的標識符，包含認證狀態和時間戳
  return `${authStore.isAuthenticated}-${Date.now()}`
})

// 監聽路由變化
watch(() => route.path, async () => {
  // 在路由變化時檢查是否需要更新認證狀態
  if (localStorage.getItem('authToken') && !authStore.isAuthenticated) {
    // 如果localStorage中有token但authStore中沒有，則嘗試自動登錄
    console.log('檢測到認證不同步，正在同步狀態')
    authStore.autoLogin()
  }
})

// 初始化和事件監聽
onMounted(() => {
  // 確保authStore和localStorage同步
  if (localStorage.getItem('authToken') && !authStore.isAuthenticated) {
    authStore.autoLogin()
  }
  
  // 監聽localStorage的變更
  window.addEventListener('storage', checkAuthChanges)
  
  // 組件卸載時清除監聽器
  return () => {
    window.removeEventListener('storage', checkAuthChanges)
  }
})

// 檢查身份驗證狀態變更
function checkAuthChanges(event) {
  if (event.key === 'authToken' || event.key === 'userInfo' || event.key === 'userRole') {
    console.log('檢測到身份驗證狀態變更:', event.key)
    
    // 根據localStorage變更更新authStore
    if (event.key === 'authToken') {
      if (event.newValue) {
        authStore.autoLogin()
      } else {
        authStore.resetAuthState()
      }
    }
  }
}
</script>

<style lang="scss">
@use '@/assets/styles/index' as *;
</style>
