<template>
    <router-view />
</template>

<script setup>
import { RouterView } from "vue-router";
import { onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRoute } from "vue-router";

const authStore = useAuthStore();
const route = useRoute();

// 根據路由路徑切換主題
const setThemeByRoute = (path) => {
  if (path.startsWith('/backpage')) {
    // 後台路由
    document.body.classList.remove('frontend-theme');
  } else {
    // 前台路由
    document.body.classList.add('frontend-theme');
  }
};

watch(() => route.path, (newPath) => {
  setThemeByRoute(newPath);
}, { immediate: true });

onMounted(() => {
    // 應用啟動時檢查是否有token並恢復登錄狀態
    authStore.autoLogin();
    
    // 初始設置主題
    setThemeByRoute(route.path);
    
    // 添加事件監聽，以便在localStorage變更時更新登錄狀態
    window.addEventListener('storage', (event) => {
      if (event.key === 'authToken') {
        if (event.newValue) {
          // 有新token
          authStore.autoLogin();
        } else {
          // token被移除
          authStore.token = null;
          authStore.userRole = null;
          authStore.userInfo = null;
        }
      }
    });
});
</script>
