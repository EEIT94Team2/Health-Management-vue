<template>
    <div class="member-login-view">
        <!-- 登入表單 -->
        <div class="login-container">
            <h1 class="title">後台管理登入</h1>
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
                        <el-button type="primary" class="login-button" @click="login" :loading="isLoading">登入系統</el-button>
                    </el-form-item>
                    <p v-if="loginError" class="error-message">{{ loginError }}</p>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loginFormRef = ref(null);

const loginForm = ref({
    email: "",
    password: "",
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

const loginError = ref("");
const isLoading = ref(false);

const login = async () => {
    loginError.value = "";
    
    try {
        // 表單驗證
        await loginFormRef.value.validate();
        
        isLoading.value = true;
        const result = await authStore.login(loginForm.value);

        if (result.success) {
            ElMessage.success("登入成功！");

            // 如果 userId 有從後端回傳，記得存起來
            if (result.data?.userId) {
                localStorage.setItem("userId", result.data.userId.toString());
            }

            // 登入成功後導向 redirect 或 dashboard
            const redirectPath = route.query.redirect || "/backpage/dashboard";
            router.push(redirectPath);
        } else {
            loginError.value = result.message || "登入失敗，請稍後再試";
        }
    } catch (error) {
        console.error("登入失敗", error);
        loginError.value = "無法連接到伺服器，請檢查網絡連線。";
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.member-login-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    background-color: #1a2a3a;
    background-image: linear-gradient(135deg, #1a2a3a 0%, #162536 100%);
    position: relative;
    padding-top: 0;
}

/* 登入表單容器樣式 */
.login-container {
    width: 100%;
    max-width: 480px;
    padding: 40px;
    border-radius: 0 0 10px 10px;
    background-color: #ffffff;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    margin-top: 0;
    border: 3px solid #43a478;
    border-top-width: 3px;
    position: relative;
    padding-bottom: 20px;
}

/* 移除突兀的頂部漸變背景 */
.login-container::before {
    display: none;
}

.title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 30px;
    text-align: center;
    color: #1a2a3a;
    position: relative;
}

.title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: #43a478;
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

:deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #d0d7de !important;
}

:deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #43a478 !important;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #43a478 !important;
}

.login-button {
    width: 100%;
    height: 48px;
    font-size: 1.1rem;
    font-weight: 600;
    background-color: #43a478;
    border: none;
    margin-top: 15px;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.login-button:hover {
    background-color: #368e68;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(67, 164, 120, 0.3);
}

.error-message {
    color: #ef4444;
    margin-top: 15px;
    text-align: center;
    font-size: 0.9rem;
}
</style>
