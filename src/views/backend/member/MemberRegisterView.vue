<template>
    <div class="member-register-view">
        <h1>會員註冊</h1>
        <el-form ref="registerFormRef" :model="registerForm" :rules="rules" label-width="80px">
            <el-form-item label="姓名" prop="name">
                <el-input v-model="registerForm.name" />
            </el-form-item>
            <el-form-item label="電子郵件" prop="email">
                <el-input v-model="registerForm.email" />
            </el-form-item>
            <el-form-item label="密碼" prop="password">
                <el-input type="password" v-model="registerForm.password" />
            </el-form-item>
            <el-form-item label="性別" prop="gender">
                <el-radio-group v-model="registerForm.gender">
                    <el-radio label="M">男</el-radio>
                    <el-radio label="F">女</el-radio>
                    <el-radio label="O">其他</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="個人簡介" prop="bio">
                <el-input type="textarea" v-model="registerForm.bio" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="register">註冊</el-button>
            </el-form-item>
            <p v-if="registerError" style="color: red">{{ registerError }}</p>
        </el-form>
        <p>已經有帳號了？<router-link to="/backpage/member/login">立即登入</router-link></p>
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
    ],
    gender: [{ required: true, message: "請選擇性別", trigger: "change" }],
};

const register = async () => {
    registerError.value = "";

    try {
        // 表單驗證
        await registerFormRef.value.validate();

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
    }
};
</script>

<style scoped>
.member-register-view {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}
h1 {
    margin-bottom: 20px;
}
.el-form {
    width: 300px;
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
