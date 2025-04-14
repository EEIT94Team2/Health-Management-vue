// src/views/frontend/LoginPage.vue
<template>
  <div class="health-platform dark-theme">
    <main class="content">
      <section class="login-section">
        <div class="container">
          <h1 class="section-title">登入入口</h1>
          <div class="login-form">
            <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="100px" class="login-form-container">
              <el-form-item label="帳號" prop="account">
                <el-input v-model="loginForm.account" autocomplete="off" />
              </el-form-item>
              <el-form-item label="密碼" prop="password">
                <el-input type="password" v-model="loginForm.password" autocomplete="off" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitLogin">登入</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
//import { ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'; // 確import Element Plus

export default {
  name: 'LoginPage',
  components: {  // 註冊使用的Element Plus
    //ElForm,
    //ElFormItem,
   // ElInput,
    //ElButton,
  },
  setup() {
    const loginFormRef = ref();
    const loginForm = reactive({
      account: '',
      password: '',
    });
    const loginRules = reactive({
      account: [{ required: true, message: '請輸入帳號', trigger: 'blur' }],
      password: [{ required: true, message: '請輸入密碼', trigger: 'blur' }],
    });

    const submitLogin = () => {
      loginFormRef.value.validate((valid) => {
        if (valid) {
          // 在此處理登入邏輯
          console.log('登入表單提交', loginForm);
          // 顯示登入成功的消息
          //ElMessage({
           // message: '登入成功',
           // type: 'success',
          //});
        } else {
          // 顯示驗證失敗的消息
          console.log('登入表單驗證失敗');
          return false;
        }
      });
    };

    return {
      loginForm,
      loginRules,
      loginFormRef,
      submitLogin,
    };
  },
};
</script>

<style scoped>
.login-section {
  padding: 5rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-form-container {
  width: 400px;
  background-color: var(--card-bg);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.login-form {
  margin-top: 1rem;
}
</style>
