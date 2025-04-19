<!-- src/views/oauth/OAuthCallback.vue -->
<template>
  <div class="oauth-callback">
    <div class="loading-container">
      <div class="spinner"></div>
      <p>處理登入中，請稍候...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { ElMessage } from "element-plus";
import axios from "axios";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isProcessing = ref(true);

onMounted(() => {
  console.log("OAuth回調頁面載入，檢查URL參數:", route.query);
  processOAuthCallback();
});

const processOAuthCallback = async () => {
  try {
    const token = route.query.token;
    const userId = route.query.userId;
    const email = route.query.email;
    const role = route.query.role;
    const name = route.query.name;
    
    console.log("OAuth回調獲取到的參數：", {
      token: token ? "已獲取" : "缺失",
      userId,
      email,
      role,
      name
    });
    
    if (!token) {
      throw new Error("缺少token參數");
    }
    
    console.log("成功獲取token，儲存登入狀態");
    
    // 先清除之前的認證狀態
    authStore.resetAuthState();
    
    //// 儲存到 localStorage
    localStorage.setItem("authToken", token);
    if (role) localStorage.setItem("userRole", role);
    
    if (userId && email) {
      try {
        // 嘗試從API獲取完整用戶信息
        localStorage.setItem("authToken", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        // 使用 userinfo 端點獲取當前用戶信息，不需要特定ID
        const userResponse = await axios.get('/api/users/userinfo');
        
        if (userResponse.data && userResponse.data.data && userResponse.data.data.name) {
          // 使用從API獲取的完整信息
          const apiUser = userResponse.data.data;
          const userInfo = {
            id: userId,
            email: email,
            name: apiUser.name // 使用資料庫中的實際名稱
          };
          
          console.log('從API獲取的用戶信息，名稱為:', userInfo.name);
          localStorage.setItem('userName', userInfo.name);
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          authStore.setUserInfo(userInfo);
        } else {
          // 如果API請求失敗，使用URL參數
          const userInfo = { 
            id: userId, 
            email: email,
            name: name || 'User_' + userId 
          };
          
          console.log('使用URL參數的用戶信息，名稱為:', userInfo.name);
          localStorage.setItem('userName', userInfo.name);
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          authStore.setUserInfo(userInfo);
        }
      } catch (apiError) {
        console.error('獲取用戶詳細信息失敗:', apiError);
        
        // API請求失敗時的備用方案
        const userInfo = { 
          id: userId, 
          email: email,
          name: name || 'User_' + userId 
        };
        
        console.log('API請求失敗，使用備用信息，名稱為:', userInfo.name);
        localStorage.setItem('userName', userInfo.name);
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        authStore.setUserInfo(userInfo);
      }
    }
    
    // 更新authStore狀態
    authStore.setToken(token);
    if (role) authStore.setRole(role);
    
    // 顯示成功訊息
    ElMessage.success("Google 帳號登入成功！");
    
    // 設置一個短延遲確保數據已保存
    setTimeout(() => {
      // 使用window.location.href而不是router.replace來確保完全刷新
      window.location.href = "/";
    }, 500); // 延長時間以確保API請求有時間完成
  } catch (error) {
    console.error("OAuth回調處理失敗:", error.message);
    ElMessage.error(error.message || "登入失敗，請重試");
    setTimeout(() => {
      window.location.href = "/user/login";
    }, 200);
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.oauth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--highlight-color);
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

p {
  font-size: 1.2rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 