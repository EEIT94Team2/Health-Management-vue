<template>
  <div class="frontend-layout">
    <div class="reset-password-page">
      <div class="reset-password-container">
        <h1 class="title">重設密碼</h1>
        <div class="form-container">
          <!-- 表單元素 -->
          <el-form 
            :model="resetPasswordForm" 
            :rules="rules" 
            ref="resetPasswordFormRef" 
            label-position="top"
          >
            <!-- 新密碼輸入框 -->
            <el-form-item label="新密碼" prop="newPassword">
              <el-input 
                v-model="resetPasswordForm.newPassword" 
                type="password"
                show-password
                placeholder="請輸入新密碼" 
              />
              <!-- 密碼強度提示 -->
              <div class="password-strength" v-if="resetPasswordForm.newPassword">
                <div class="strength-label">密碼強度：</div>
                <div class="strength-meter">
                  <div 
                    class="strength-value" 
                    :style="{ width: passwordStrength.percentage + '%' }"
                    :class="passwordStrength.level"
                  ></div>
                </div>
                <span class="strength-text" :class="passwordStrength.level">
                  {{ passwordStrength.text }}
                </span>
                <div class="password-tips">
                  <p>密碼建議：</p>
                  <ul>
                    <li :class="{ fulfilled: passwordCriteria.hasLength }">至少8個字符</li>
                    <li :class="{ fulfilled: passwordCriteria.hasUpperCase }">至少一個大寫字母</li>
                    <li :class="{ fulfilled: passwordCriteria.hasLowerCase }">至少一個小寫字母</li>
                    <li :class="{ fulfilled: passwordCriteria.hasNumber }">至少一個數字</li>
                    <li :class="{ fulfilled: passwordCriteria.hasSpecial }">至少一個特殊字符 (@#$%^&*)</li>
                  </ul>
                </div>
              </div>
            </el-form-item>
            
            <!-- 確認密碼輸入框 -->
            <el-form-item label="確認密碼" prop="confirmPassword">
              <el-input 
                v-model="resetPasswordForm.confirmPassword" 
                type="password"
                show-password
                placeholder="請再次輸入新密碼" 
              />
            </el-form-item>
            
            <!-- 送出按鈕 -->
            <el-form-item>
              <el-button 
                type="primary" 
                class="submit-button" 
                @click="handleSubmit" 
                :loading="isLoading"
                :disabled="!isValidToken || !passwordIsStrong"
              >
                確認重設密碼
              </el-button>
            </el-form-item>
            
            <!-- 顯示錯誤訊息 -->
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <p v-if="!isValidToken" class="error-message">重設連結無效或已過期，請重新申請</p>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 引入所需的庫和工具
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { validateResetToken, resetPassword } from '@/api/auth';

// 路由器和當前路由實例
const router = useRouter();
const route = useRoute();

// 表單元素參考
const resetPasswordFormRef = ref(null);

// 加載狀態
const isLoading = ref(false);

// 錯誤訊息
const errorMessage = ref('');

// 令牌狀態
const isValidToken = ref(true);

// 從URL獲取令牌
const token = ref('');

// 表單數據
const resetPasswordForm = ref({
  newPassword: '',
  confirmPassword: ''
});

// 密碼條件檢查
const passwordCriteria = computed(() => {
  const password = resetPasswordForm.value.newPassword;
  return {
    hasLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[@#$%^&*]/.test(password)
  };
});

// 計算密碼強度
const passwordStrength = computed(() => {
  const criteria = passwordCriteria.value;
  const password = resetPasswordForm.value.newPassword;
  
  if (!password) {
    return { percentage: 0, level: '', text: '' };
  }
  
  let strength = 0;
  let maxStrength = 5;
  
  if (criteria.hasLength) strength++;
  if (criteria.hasUpperCase) strength++;
  if (criteria.hasLowerCase) strength++;
  if (criteria.hasNumber) strength++;
  if (criteria.hasSpecial) strength++;
  
  const percentage = (strength / maxStrength) * 100;
  
  let level = 'weak';
  let text = '弱';
  
  if (strength >= 4) {
    level = 'strong';
    text = '強';
  } else if (strength >= 3) {
    level = 'medium';
    text = '中';
  }
  
  return { percentage, level, text };
});

// 密碼是否足夠強
const passwordIsStrong = computed(() => {
  return passwordStrength.value.percentage >= 60; // 至少達到中等強度
});

// 表單驗證規則
const rules = {
  newPassword: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 8, message: '密碼長度至少為8個字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '請確認新密碼', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetPasswordForm.value.newPassword) {
          callback(new Error('兩次輸入的密碼不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 組件掛載時執行
onMounted(() => {
  // 從URL獲取重設令牌
  token.value = route.query.token;
  
  // 如果沒有令牌，則標記為無效
  if (!token.value) {
    isValidToken.value = false;
    errorMessage.value = '重設連結無效，請重新申請';
    return;
  }
  
  // 驗證令牌有效性
  validateToken();
});

/**
 * 驗證令牌是否有效
 */
const validateToken = async () => {
  try {
    // 呼叫後端API驗證令牌
    await validateResetToken({ token: token.value });
    
    // 令牌有效
    isValidToken.value = true;
  } catch (error) {
    console.error('令牌驗證失敗', error);
    isValidToken.value = false;
    errorMessage.value = '重設連結已過期，請重新申請';
  }
};

/**
 * 處理表單提交
 * 驗證表單，發送重設密碼請求到後端API
 */
const handleSubmit = async () => {
  // 清除之前的錯誤訊息
  errorMessage.value = '';
  
  // 檢查令牌是否有效
  if (!isValidToken.value) {
    errorMessage.value = '重設連結已過期，請重新申請';
    return;
  }
  
  try {
    // 表單驗證
    await resetPasswordFormRef.value.validate();
    
    // 檢查密碼強度
    if (!passwordIsStrong.value) {
      errorMessage.value = '請設定一個更強的密碼';
      return;
    }
    
    // 設定加載狀態
    isLoading.value = true;
    
    // 發送重設密碼請求
    await resetPassword({
      token: token.value,
      newPassword: resetPasswordForm.value.newPassword
    });
    
    // 處理成功響應
    ElMessage({
      message: '密碼重設成功，請使用新密碼登入',
      type: 'success',
      duration: 3000
    });
    
    // 跳轉到登入頁面
    setTimeout(() => {
      router.push('/user/login');
    }, 2000);
    
  } catch (error) {
    // 處理錯誤
    console.error('重設密碼失敗', error);
    
    // 顯示錯誤訊息
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = '重設密碼失敗，請稍後再試';
    }
  } finally {
    // 設定加載狀態為false
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 頁面基本佈局 */
.reset-password-page {
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
.reset-password-container {
  width: 100%;
  max-width: 500px;
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
  margin-top: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--highlight-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 錯誤訊息樣式 */
.error-message {
  color: #e74c3c;
  margin-top: 15px;
  text-align: center;
}

/* 密碼強度指示器樣式 */
.password-strength {
  margin-top: 10px;
}

.strength-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.strength-meter {
  height: 6px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.strength-value {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-value.weak {
  background-color: #e74c3c;
}

.strength-value.medium {
  background-color: #f39c12;
}

.strength-value.strong {
  background-color: #2ecc71;
}

.strength-text {
  font-size: 0.85rem;
  margin-left: 5px;
  font-weight: 500;
}

.strength-text.weak {
  color: #e74c3c;
}

.strength-text.medium {
  color: #f39c12;
}

.strength-text.strong {
  color: #2ecc71;
}

.password-tips {
  margin-top: 15px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.password-tips p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.password-tips ul {
  list-style-type: none;
  padding-left: 5px;
}

.password-tips li {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 3px;
  position: relative;
  padding-left: 20px;
}

.password-tips li:before {
  content: '✕';
  position: absolute;
  left: 0;
  color: #e74c3c;
}

.password-tips li.fulfilled:before {
  content: '✓';
  color: #2ecc71;
}
</style> 