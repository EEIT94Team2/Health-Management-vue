<template>
  <div class="frontend-layout">
    <div class="forgot-password-page">
      <div class="forgot-password-container">
        <h1 class="title">忘記密碼</h1>
        <div class="form-container">
          <!-- 表單元素 -->
          <el-form 
            :model="forgotPasswordForm" 
            :rules="rules" 
            ref="forgotPasswordFormRef" 
            label-position="top"
          >
            <!-- 電子郵件輸入框 -->
            <el-form-item label="電子郵件" prop="email">
              <el-input 
                v-model="forgotPasswordForm.email" 
                placeholder="請輸入您的註冊電子郵件" 
              />
            </el-form-item>
            
            <!-- 送出按鈕 -->
            <el-form-item>
              <el-button 
                type="primary" 
                class="submit-button" 
                @click="handleSubmit" 
                :loading="isLoading"
              >
                發送重設密碼連結
              </el-button>
            </el-form-item>
            
            <!-- 返回登入的連結 -->
            <div class="links">
              <router-link to="/user/login" class="login-link">
                返回登入
              </router-link>
            </div>
            
            <!-- 顯示錯誤訊息 -->
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 引入所需的庫和工具
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { forgotPassword } from '@/api/auth';

// 路由器實例
const router = useRouter();

// 表單元素參考
const forgotPasswordFormRef = ref(null);

// 加載狀態
const isLoading = ref(false);

// 錯誤訊息
const errorMessage = ref('');

// 表單數據
const forgotPasswordForm = ref({
  email: ''
});

// 表單驗證規則
const rules = {
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電子郵件格式', trigger: 'blur' }
  ]
};

/**
 * 處理表單提交
 * 驗證表單，發送忘記密碼請求到後端API
 */
const handleSubmit = async () => {
  // 清除之前的錯誤訊息
  errorMessage.value = '';
  
  try {
    // 表單驗證
    await forgotPasswordFormRef.value.validate();
    
    // 設定加載狀態
    isLoading.value = true;
    
    // 發送忘記密碼請求
    await forgotPassword({
      email: forgotPasswordForm.value.email
    });
    
    // 處理成功響應
    ElMessage({
      message: '已寄送重設連結到您的信箱，請查收',
      type: 'success',
      duration: 3000
    });
    
    // 返回登入頁面
    setTimeout(() => {
      router.push('/user/login');
    }, 2000);
    
  } catch (error) {
    // 處理錯誤
    console.error('忘記密碼請求失敗', error);
    
    // 顯示錯誤訊息
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = '無法發送重設密碼連結，請稍後再試';
    }
  } finally {
    // 設定加載狀態為false
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 頁面基本佈局 */
.forgot-password-page {
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

/* 主容器樣式 */
.forgot-password-container {
  width: 100%;
  max-width: 480px;
  padding: 40px;
  border-radius: 16px;
  background-color: var(--card-bg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* 標題樣式 */
.title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 30px;
  text-align: center;
  color: var(--text-primary);
}

/* 表單容器樣式 */
.form-container {
  margin-top: 20px;
}

/* 輸入框標籤樣式 */
:deep(.el-form-item__label) {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
}

/* 輸入框樣式 */
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

/* 按鈕樣式 */
.submit-button {
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

.submit-button:hover {
  background-color: var(--highlight-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* 錯誤訊息樣式 */
.error-message {
  color: #e74c3c;
  margin-top: 15px;
  text-align: center;
}

/* 連結容器樣式 */
.links {
  margin-top: 20px;
  text-align: center;
}

/* 登入連結樣式 */
.login-link {
  color: var(--highlight-color);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: var(--highlight-hover);
  text-decoration: underline;
}
</style> 