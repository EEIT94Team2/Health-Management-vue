<template>
  <div class="frontend-layout">
    <div class="register-page">
      <div class="register-container">
        <h1 class="title">會員註冊</h1>
        <div class="form-container">
          <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-position="top">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="registerForm.name" placeholder="請輸入您的姓名" />
            </el-form-item>
            <el-form-item label="電子郵件" prop="email">
              <el-input v-model="registerForm.email" placeholder="請輸入您的電子郵件" />
            </el-form-item>
            <el-form-item label="密碼" prop="password">
              <el-input 
                v-model="registerForm.password" 
                type="password" 
                placeholder="請輸入您的密碼" 
                show-password

                @input="checkPasswordStrength"
              />
              <div class="password-strength-container" v-if="registerForm.password">
                <div class="strength-labels">
                  <span>弱</span>
                  <span>中</span>
                  <span>強</span>
                </div>
                <div class="strength-bar">
                  <div 
                    class="strength-indicator" 
                    :style="{ width: strengthPercentage + '%', backgroundColor: strengthColor }"
                  ></div>
                </div>
              </div>

            </el-form-item>
            <el-form-item label="性別" prop="gender">
              <el-radio-group v-model="registerForm.gender">
                <el-radio label="M" class="gender-radio">男</el-radio>
                <el-radio label="F" class="gender-radio">女</el-radio>
                <el-radio label="O" class="gender-radio">其他</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="個人簡介" prop="bio">
              <el-input 
                v-model="registerForm.bio" 
                type="textarea" 
                placeholder="請簡單介紹自己" 
                :rows="4"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="register-button" @click="handleRegister" :loading="isLoading">立即註冊</el-button>
            </el-form-item>
            <div class="links">
              <router-link to="/user/login" class="login-link">已有帳號？立即登入</router-link>
            </div>
            <p v-if="registerError" class="error-message">{{ registerError }}</p>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, computed } from 'vue';

import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const router = useRouter();
const registerFormRef = ref(null);
const isLoading = ref(false);
const registerError = ref('');

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  gender: 'M',
  bio: ''
});


// 密碼強度相關
const passwordScore = ref(0);
const strengthTex=t = ref('');
const strengthColor = ref('');
const strengthPercentage = ref(0);

// 檢查密碼強度
const checkPasswordStrength = () => {
  const password = registerForm.value.password;
  let score = 0;

  // 如果密碼為空，重置所有值
  if (!password) {
    passwordScore.value = 0;
    strengthText.value = '';
    strengthColor.value = '';
    strengthPercentage.value = 0;
    return;
  }

  // 密碼長度得分
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // 包含大寫字母
  if (/[A-Z]/.test(password)) score += 1;
  
  // 包含小寫字母
  if (/[a-z]/.test(password)) score += 1;
  
  // 包含數字
  if (/[0-9]/.test(password)) score += 1;
  
  // 包含特殊字符
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // 設置最終分數
  passwordScore.value = score;

  // 根據分數設置強度文字和顏色
  if (score <= 2) {
    strengthText.value = '弱';
    strengthColor.value = '#e74c3c';
    strengthPercentage.value = 33;
  } else if (score <= 4) {
    strengthText.value = '中';
    strengthColor.value = '#f39c12';
    strengthPercentage.value = 66;
  } else {
    strengthText.value = '強';
    strengthColor.value = '#2ecc71';
    strengthPercentage.value = 100;
  }
};

const rules = {
  name: [
    { required: true, message: '請輸入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名長度需在2到20個字符之間', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電子郵件地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },

    { min: 8, message: '密碼長度至少為8個字符', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!/[A-Z]/.test(value)) {
          callback(new Error('密碼必須包含至少一個大寫字母'));
        } else if (!/[a-z]/.test(value)) {
          callback(new Error('密碼必須包含至少一個小寫字母'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }

  ],
  gender: [
    { required: true, message: '請選擇性別', trigger: 'change' }
  ]
};

const handleRegister = async () => {
  registerError.value = '';
  
  try {
    // 表單驗證
    await registerFormRef.value.validate();
    
    // 註冊處理
    isLoading.value = true;
    
    // 創建一個新的數據對象，確保數據編碼正確
    const formData = {
      name: registerForm.value.name,
      email: registerForm.value.email,
      password: registerForm.value.password,
      gender: registerForm.value.gender,
      bio: registerForm.value.bio || ""
    };

    // 設置請求頭，確保正確處理UTF-8編碼
    const config = {
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      }
    };

    // 發送註冊請求
    const response = await axios.post("/api/auth/register", formData, config);

    // 註冊成功處理
    ElMessage({
      message: '註冊成功！請前往登入',
      type: 'success',
      duration: 2000
    });
    
    // 重定向到登入頁面
    router.push('/user/login');
  } catch (error) {
    console.error('註冊失敗', error);
    
    // 處理不同類型的錯誤
    if (error.response) {
      // 服務器返回的錯誤
      registerError.value = error.response?.data?.message || "註冊失敗，請檢查您的輸入或稍後重試";
    } else if (error.name === "ValidationError") {
      // 表單驗證錯誤
      registerError.value = "請檢查表單填寫是否正確";
    } else {
      // 其他錯誤
      registerError.value = "註冊失敗，請稍後重試";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 50px 20px;
  background-color: var(--bg-primary);
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('@/assets/images/Weightlifting.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
}

.register-container {
  width: 100%;
  max-width: 580px;
  padding: 40px;
  border-radius: 16px;
  background-color: var(--card-bg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  margin: 60px 0;
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

:deep(.el-textarea__inner) {
  background-color: transparent !important;
  border: 1px solid var(--highlight-color);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 12px 15px;
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

:deep(.el-textarea__wrapper) {
  background-color: transparent !important;
  box-shadow: 0 0 0 1px var(--highlight-color) !important;
  padding: 0;
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
  border-color: var(--highlight-color);
  box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
}

.register-button {
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

.register-button:hover {
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
}

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

.gender-radio {
  color: var(--text-primary);
  margin-right: 20px;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: var(--highlight-color);
  border-color: var(--highlight-color);
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: var(--highlight-color);
}


/* 密碼強度樣式 */
.password-strength-container {
  margin-top: 8px;
  width: 100%;
}

.strength-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  font-size: 0.9rem;
}

.strength-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
}

.strength-indicator {
  height: 100%;
  border-radius: 4px;
  transition: all 0.3s ease;
}

</style> 