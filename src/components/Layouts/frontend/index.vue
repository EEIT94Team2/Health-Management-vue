<template>
  <div class="frontend-layout">
    <NavBar :key="authState" />
    <router-view v-if="isReady" />
    <Footer />
    <BackToTop />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import NavBar from '@/components/Layouts/frontend/Navbar.vue'
import Footer from '@/components/Layouts/frontend/Footer.vue'
import BackToTop from '@/components/Layouts/frontend/BackToTop.vue'

// 用於確保組件已完全準備好
const isReady = ref(true)

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
  
  // 刷新組件以確保正確顯示
  isReady.value = false
  await nextTick()
  isReady.value = true
  // 添加第二次延遲更新，確保組件完全刷新
  setTimeout(() => {
    isReady.value = false
    nextTick(() => {
      isReady.value = true
    })
  }, 100)
})

// 初始化和事件監聽
onMounted(() => {
  // 確保authStore和localStorage同步
  if (localStorage.getItem('authToken') && !authStore.isAuthenticated) {
    authStore.autoLogin()
  }
  
  // 監聽localStorage的變更
  window.addEventListener('storage', checkAuthChanges)
  
  // 添加定期檢查，以防localStorage和authStore狀態不同步
  const checkInterval = setInterval(() => {
    const hasTokenInStorage = !!localStorage.getItem('authToken')
    const isAuthInStore = authStore.isAuthenticated
    
    if (hasTokenInStorage !== isAuthInStore) {
      console.log('檢測到認證狀態不同步，正在重新同步')
      if (hasTokenInStorage) {
        authStore.autoLogin()
      } else {
        authStore.resetAuthState()
      }
    }
  }, 5000) // 每5秒檢查一次
  
  // 組件卸載時清除定時器
  return () => {
    clearInterval(checkInterval)
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
