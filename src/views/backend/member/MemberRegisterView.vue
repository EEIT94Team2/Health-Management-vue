<template>
    <div class="member-register-view">
        <div class="register-container">
            <h1 class="title">後台會員註冊</h1>
            <div class="form-container">
                <el-form ref="registerFormRef" :model="registerForm" :rules="rules" label-position="top">
                    <el-form-item label="姓名" prop="name">
                        <el-input v-model="registerForm.name" placeholder="請輸入您的姓名" />
                    </el-form-item>
                    <el-form-item label="電子郵件" prop="email">
                        <el-input v-model="registerForm.email" placeholder="請輸入您的電子郵件" />
                    </el-form-item>
                    <el-form-item label="密碼" prop="password">
                        <el-input 
                            type="password" 
                            v-model="registerForm.password" 
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
                            type="textarea" 
                            v-model="registerForm.bio" 
                            placeholder="請簡單介紹自己" 
                            :rows="4"
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" class="register-button" @click="register" :loading="isLoading">註冊</el-button>
                    </el-form-item>
                    <div class="links">
                        <router-link to="/backpage/member/login" class="login-link">已經有帳號了？立即登入</router-link>
                    </div>
                    <p v-if="registerError" class="error-message">{{ registerError }}</p>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const router = useRouter();
const registerFormRef = ref(null);
const registerForm = ref({
    name: "",
    email: "",
    password: "",
    gender: "M",
    bio: "",
});
const registerError = ref("");
const isLoading = ref(false);

// 密碼強度相關
const passwordScore = ref(0);
const strengthText = ref('');
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
    strengthColor.value = '#ef4444';
    strengthPercentage.value = 33;
  } else if (score <= 4) {
    strengthText.value = '中';
    strengthColor.value = '#f59e0b';
    strengthPercentage.value = 66;
  } else {
    strengthText.value = '強';
    strengthColor.value = '#3b82f6';
    strengthPercentage.value = 100;
  }
};

// 表單驗證規則
const rules = {
    name: [
        { required: true, message: "請輸入姓名", trigger: "blur" },
        {
            min: 2,
            max: 20,
            message: "姓名長度需在2到20個字符之間",
            trigger: "blur",
        },
    ],
    email: [
        { required: true, message: "請輸入電子郵件", trigger: "blur" },
        { type: "email", message: "請輸入有效的電子郵件地址", trigger: "blur" },
    ],
    password: [
        { required: true, message: "請輸入密碼", trigger: "blur" },
        { min: 6, message: "密碼長度至少為6個字符", trigger: "blur" },
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
    gender: [{ required: true, message: "請選擇性別", trigger: "change" }],
};

const register = async () => {
    registerError.value = "";
    
    try {
        // 表單驗證
        await registerFormRef.value.validate();
        
        isLoading.value = true;

        // 創建一個新的數據對象，確保數據編碼正確
        const formData = {
            name: registerForm.value.name,
            email: registerForm.value.email,
            password: registerForm.value.password,
            gender: registerForm.value.gender,
            bio: registerForm.value.bio || "",
        };

        // 設置請求頭，確保正確處理UTF-8編碼
        const config = {
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
            },
        };

        // 發送註冊請求
        const response = await axios.post("/api/auth/register", formData, config);

        // 註冊成功處理
        ElMessage.success("註冊成功！請前往登入。");
        router.push("/backpage/member/login");
    } catch (error) {
        console.error("註冊失敗", error);

        // 處理不同類型的錯誤
        if (error.response) {
            // 服務器返回的錯誤
            registerError.value =
                error.response?.data?.message || "註冊失敗，請檢查您的輸入或稍後重試。";
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
.member-register-view {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    padding: 50px 20px;
    background-color: #1a2a3a;
    background-image: linear-gradient(135deg, #1a2a3a 0%, #162536 100%);
    position: relative;
}

.register-container {
    width: 100%;
    max-width: 580px;
    padding: 40px;
    border-radius: 10px;
    background-color: #ffffff;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    margin: 60px 0;
}

.title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 30px;
    text-align: center;
    color: #1a2a3a;
}

.form-container {
    margin-top: 20px;
}

:deep(.el-form-item__label) {
    color: #1a2a3a;
    font-size: 0.95rem;
    font-weight: 600;
}

:deep(.el-input__inner) {
    height: 48px;
    border-radius: 6px;
}

:deep(.el-textarea__inner) {
    border-radius: 6px;
    padding: 12px 15px;
}

:deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #d0d7de !important;
}

:deep(.el-textarea__wrapper) {
    box-shadow: 0 0 0 1px #d0d7de !important;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__wrapper:hover) {
    box-shadow: 0 0 0 1px #3b82f6 !important;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #3b82f6 !important;
}

.register-button {
    width: 100%;
    height: 48px;
    font-size: 1.1rem;
    font-weight: 600;
    background-color: #3b82f6;
    border: none;
    margin-top: 15px;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.register-button:hover {
    background-color: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.links {
    margin-top: 20px;
    text-align: center;
}

.login-link {
    color: #3b82f6;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;
}

.login-link:hover {
    color: #2563eb;
    text-decoration: underline;
}

.error-message {
    color: #ef4444;
    margin-top: 15px;
    text-align: center;
    font-size: 0.9rem;
}

.gender-radio {
    margin-right: 20px;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
    background-color: #3b82f6;
    border-color: #3b82f6;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
    color: #3b82f6;
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
    font-size: 0.85rem;
    color: #666;
}

.strength-bar {
    height: 6px;
    background-color: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
    width: 100%;
}

.strength-indicator {
    height: 100%;
    border-radius: 3px;
    transition: all 0.3s ease;
}
</style>
