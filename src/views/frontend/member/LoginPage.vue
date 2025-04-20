<template>
  <div class="frontend-layout">
    <div class="login-page">
      <div class="login-container">
        <h1 class="title">會員登入</h1>
        <div class="form-container">
          <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-position="top">
            <el-form-item label="電子郵件" prop="email">
              <el-input v-model="loginForm.email" placeholder="請輸入您的電子郵件" />
            </el-form-item>
            <el-form-item label="密碼" prop="password">
              <el-input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="請輸入您的密碼"
                show-password 
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="login-button" @click="handleLogin" :loading="isLoading">登入</el-button>
            </el-form-item>
            <div class="links">
              <router-link to="/user/register" class="register-link">還沒有帳號？立即註冊</router-link>
              <div class="separator"></div>
              <a href="http://localhost:8080/oauth2/authorization/google" class="google-login-link">
                <el-button class="google-btn" type="info">
                  <i class="bi bi-google"></i>
                  使用Google帳號登入
                </el-button>
              </a>
              <div class="separator"></div>
              <router-link to="/user/forgot-password" class="forgot-password-link">忘記密碼？</router-link>
            </div>
            <p v-if="loginError" class="error-message">{{ loginError }}</p>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loginFormRef = ref(null);
const isLoading = ref(false);
const loginError = ref('');

const loginForm = ref({
  email: '',
  password: ''
});

const rules = {
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電子郵件格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少為6個字符', trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  loginError.value = '';
  
  try {
    // 表單驗證
    await loginFormRef.value.validate();
    
    // 登入處理
    isLoading.value = true;
    const result = await authStore.login(loginForm.value);

    if (result.success) {
      ElMessage({
        message: '登入成功！歡迎回來',
        type: 'success',
        duration: 2000
      });

      // 如果 userId 有從後端回傳，儲存起來
      if (result.data?.userId) {
        localStorage.setItem('userId', result.data.userId.toString());
      }

      // 登入成功後導向首頁或指定頁面
      const redirectPath = route.query.redirect || '/';
      router.push(redirectPath);
    } else {
      loginError.value = result.message || '登入失敗，請檢查您的憑證';
    }
  } catch (error) {
    console.error('登入失敗', error);
    loginError.value = '登入失敗，請稍後再試';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 50px 20px;
  background-color: var(--bg-primary);
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('@/assets/images/Gym.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
}

.login-container {
  width: 100%;
  max-width: 480px;
  padding: 40px;
  border-radius: 16px;
  background-color: var(--card-bg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 30px;
  text-align: center;
  color: var(--text-primary);
}

.form-container {
  margin-top: 20px;
}

:deep(.el-form-item__label) {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
}

:deep(.el-input__inner) {
  background-color: transparent !important;
  border: 1px solid var(--highlight-color);
  color: var(--text-primary);
  height: 50px;
  border-radius: 8px;
  padding-left: 15px;
}

/* 去掉輸入框周圍的白色背景 */
:deep(.el-input) {
  background-color: transparent !important;
}

:deep(.el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: 0 0 0 1px var(--highlight-color) !important;
  padding: 0;
}

:deep(.el-input__inner:focus) {
  border-color: var(--highlight-color);
  box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
}

.login-button {
  width: 100%;
  height: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  background-color: var(--highlight-color);
  border: none;
  margin-top: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.login-button:hover {
  background-color: var(--highlight-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.error-message {
  color: #e74c3c;
  margin-top: 15px;
  text-align: center;
}

.links {
  margin-top: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.register-link, .forgot-password-link {
  color: var(--highlight-color);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.register-link:hover, .forgot-password-link:hover {
  color: var(--highlight-hover);
  text-decoration: underline;
}

.separator {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 5px 0;
}

.google-btn {
  width: 100%;
  height: 44px;
  font-size: 1rem;
  font-weight: 500;
  background-color: #f46342;
  color: white;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.google-btn:hover {
  background-color: #1f8d1a;
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}

.google-login-link {
  text-decoration: none;
  width: 100%;
  display: block;
}
</style>
