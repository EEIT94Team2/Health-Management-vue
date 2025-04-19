<template>
  <div class="profile-view">
    <div class="profile-container">
      <div class="page-header">
        <h1>會員中心</h1>
      </div>
      
      <!-- 點數顯示區塊 -->
      <el-card class="points-card">
        <div class="points-content">
          <div class="points-icon">
            <i class="el-icon-medal"></i>
          </div>
          <div class="points-info">
            <h2>會員點數</h2>
            <div class="points-value">{{ userInfo.userPoints || 0 }}</div>
            <p>累積點數可兌換優惠或課程</p>
          </div>
        </div>
      </el-card>
      
      <!-- 個人資料編輯區塊 -->
      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <h2>個人資料</h2>
          </div>
        </template>
        <div v-if="loading" class="loading-container">
          <el-skeleton animated :rows="6" />
        </div>
        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>
        <div v-else>
          <el-form 
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-position="top"
            class="profile-form"
          >
            <el-form-item label="姓名" prop="name">
              <el-input v-model="profileForm.name" placeholder="請輸入您的姓名" />
            </el-form-item>
            
            <el-form-item label="電子郵件" prop="email">
              <el-input v-model="profileForm.email" placeholder="請輸入您的電子郵件" />
            </el-form-item>
            
            <el-form-item label="性別" prop="gender">
              <el-radio-group v-model="profileForm.gender">
                <el-radio label="M">男</el-radio>
                <el-radio label="F">女</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="個人簡介" prop="bio">
              <el-input 
                v-model="profileForm.bio" 
                type="textarea" 
                :rows="4"
                placeholder="介紹一下您自己..." 
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="updateProfile"
                :loading="updating"
                class="update-btn"
              >
                更新資料
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
      
      <!-- 密碼修改區塊 -->
      <el-card class="password-card">
        <template #header>
          <div class="card-header">
            <h2>修改密碼</h2>
          </div>
        </template>
        <el-form 
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-position="top"
          class="password-form"
        >
          <el-form-item label="目前密碼" prop="currentPassword">
            <el-input 
              v-model="passwordForm.currentPassword" 
              type="password"
              placeholder="請輸入目前的密碼" 
              show-password
            />
          </el-form-item>
          
          <el-form-item label="新密碼" prop="newPassword">
            <el-input 
              v-model="passwordForm.newPassword" 
              type="password"
              placeholder="請輸入新密碼" 
              show-password
            />
          </el-form-item>
          
          <el-form-item label="確認新密碼" prop="confirmPassword">
            <el-input 
              v-model="passwordForm.confirmPassword" 
              type="password"
              placeholder="請再次輸入新密碼" 
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              @click="updatePassword"
              :loading="updatingPassword"
              class="update-btn"
            >
              更新密碼
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// 用戶資訊與狀態
const userInfo = computed(() => authStore.getUserInfo || {});
const userId = computed(() => userInfo.value?.id);
const loading = ref(false);
const error = ref(null);
const updating = ref(false);
const updatingPassword = ref(false);

// 表單引用
const profileFormRef = ref(null);
const passwordFormRef = ref(null);

// 個人資料表單
const profileForm = reactive({
  name: '',
  email: '',
  gender: 'M',
  bio: ''
});

// 密碼修改表單
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 個人資料驗證規則
const profileRules = {
  name: [
    { required: true, message: '請輸入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名長度必須在 2 到 50 個字符之間', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電子郵件格式', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '請選擇性別', trigger: 'change' }
  ]
};

// 密碼驗證規則
const passwordRules = {
  currentPassword: [
    { required: true, message: '請輸入目前密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少為 6 個字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少為 6 個字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '請確認新密碼', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('兩次輸入的密碼不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 獲取用戶資料
const fetchUserProfile = async () => {
  if (!authStore.isAuthenticated || !userId.value) {
    router.push('/user/login');
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const token = authStore.getToken;
    const response = await axios.get(`/api/users/${userId.value}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data && response.data.success) {
      const userData = response.data.data;
      
      // 更新表單數據
      profileForm.name = userData.name || '';
      profileForm.email = userData.email || '';
      profileForm.gender = userData.gender || 'M';
      profileForm.bio = userData.bio || '';
    } else {
      throw new Error(response.data?.message || '獲取用戶資料失敗');
    }
  } catch (err) {
    console.error('獲取用戶資料失敗', err);
    error.value = err.response?.data?.message || '無法獲取用戶資料';
    
    if (err.response?.status === 401 || err.response?.status === 403) {
      ElMessage.error('登入憑證已過期，請重新登入');
      authStore.logout();
      router.push('/user/login');
    }
  } finally {
    loading.value = false;
  }
};

// 更新個人資料
const updateProfile = async () => {
  if (!profileFormRef.value) return;

  await profileFormRef.value.validate(async (valid) => {
    if (!valid) return;

    updating.value = true;
    
    try {
      const token = authStore.getToken;
      
      const updateData = {
        id: userId.value,
        name: profileForm.name,
        email: profileForm.email,
        gender: profileForm.gender,
        bio: profileForm.bio,
        // 保留原有值
        role: userInfo.value.role,
        userPoints: userInfo.value.userPoints
      };

      const response = await axios.put(`/api/users/${userId.value}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        ElMessage.success('個人資料更新成功！');
        
        // 更新 store 中的用戶信息
        const userData = response.data.data;
        authStore.$patch({ userInfo: userData });
      } else {
        throw new Error(response.data?.message || '更新失敗');
      }
    } catch (err) {
      console.error('更新個人資料失敗', err);
      ElMessage.error(err.response?.data?.message || '更新個人資料失敗');
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        ElMessage.error('登入憑證已過期，請重新登入');
        authStore.logout();
        router.push('/user/login');
      }
    } finally {
      updating.value = false;
    }
  });
};

// 更新密碼
const updatePassword = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return;

    updatingPassword.value = true;
    
    try {
      const token = authStore.getToken;
      
      // 使用登入API驗證當前密碼是否正確
      try {
        // 這裡使用現有的登入API驗證當前密碼
        await axios.post('/api/auth/login', {
          email: userInfo.value.email,
          password: passwordForm.currentPassword
        });
      } catch (error) {
        // 如果登入失敗，表示當前密碼不正確
        ElMessage.error('目前密碼不正確，請重新輸入');
        updatingPassword.value = false;
        return;
      }
      
      // 當前密碼驗證通過，繼續更新密碼
      const updateData = {
        id: userId.value,
        name: userInfo.value.name,
        email: userInfo.value.email,
        passwordHash: passwordForm.newPassword,
        gender: userInfo.value.gender,
        bio: userInfo.value.bio,
        role: userInfo.value.role,
        userPoints: userInfo.value.userPoints
      };

      // 發送更新請求
      const response = await axios.put(`/api/users/${userId.value}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        ElMessage.success('密碼更新成功！');
        
        // 清空密碼表單
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        
        // 重置表單驗證
        passwordFormRef.value.resetFields();
      } else {
        throw new Error(response.data?.message || '更新密碼失敗');
      }
    } catch (err) {
      console.error('更新密碼失敗', err);
      // 如果不是密碼驗證的錯誤，顯示其他錯誤信息
      if (err.message !== '目前密碼不正確，請重新輸入') {
        ElMessage.error(err.response?.data?.message || '更新密碼失敗');
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          ElMessage.error('登入憑證已過期，請重新登入');
          authStore.logout();
          router.push('/user/login');
        }
      }
    } finally {
      updatingPassword.value = false;
    }
  });
};

// 頁面加載時獲取用戶資料
onMounted(() => {
  fetchUserProfile();
});
</script>

<style lang="scss" scoped>
.profile-view {
  min-height: 100vh;
  padding: 100px 0 50px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
  
  h1 {
    font-size: 2.5rem;
    color: var(--text-primary);
    margin-bottom: 10px;
  }
}

.el-card {
  margin-bottom: 30px;
  border-radius: 12px;
  background-color: var(--card-bg);
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  
  &.points-card {
    background: linear-gradient(135deg, #10202B, #234567);
    color: #fff;
  }
  
  :deep(.el-card__header) {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  :deep(.el-card__body) {
    padding: 25px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-primary);
  }
}

.points-content {
  display: flex;
  align-items: center;
  
  .points-icon {
    font-size: 3rem;
    margin-right: 20px;
    color: var(--highlight-color);
  }
  
  .points-info {
    h2 {
      margin: 0 0 5px;
      font-size: 1.2rem;
    }
    
    .points-value {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 5px;
      color: var(--highlight-color);
    }
    
    p {
      margin: 0;
      opacity: 0.8;
    }
  }
}

.profile-form,
.password-form {
  .el-form-item {
    margin-bottom: 25px;
  }
  
  :deep(.el-form-item__label) {
    padding-bottom: 8px;
    font-size: 1rem;
    color: var(--text-primary);
  }
  
  :deep(.el-input__inner) {
    background-color: #fff !important;
    border: 1px solid var(--highlight-color);
    color: #333;
    height: 50px;
    border-radius: 8px;
    padding-left: 15px;
  }
  
  :deep(.el-textarea__inner) {
    background-color: #fff !important;
    border: 1px solid var(--highlight-color);
    color: #333;
    border-radius: 8px;
    padding: 12px 15px;
  }
  
  /* 去掉輸入框周圍的白色背景 */
  :deep(.el-input) {
    background-color: transparent !important;
  }
  
  :deep(.el-input__wrapper) {
    background-color: #fff !important;
    box-shadow: 0 0 0 1px var(--highlight-color) !important;
    padding: 0;
  }
  
  :deep(.el-textarea__wrapper) {
    background-color: #fff !important;
    box-shadow: 0 0 0 1px var(--highlight-color) !important;
    padding: 0;
  }
  
  :deep(.el-input__inner:focus),
  :deep(.el-textarea__inner:focus) {
    border-color: var(--highlight-color);
    box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
  }
  
  :deep(.el-radio__label) {
    color: var(--text-primary);
  }
  
  :deep(.el-radio__input.is-checked .el-radio__inner) {
    background-color: var(--highlight-color);
    border-color: var(--highlight-color);
  }
  
  :deep(.el-radio__input.is-checked + .el-radio__label) {
    color: var(--highlight-color);
  }
}

.update-btn {
  width: 100%;
  height: 44px;
  font-size: 1rem;
  background-color: var(--highlight-color);
  border: none;
  
  &:hover, &:focus {
    background-color: darken(#43a478, 10%);
  }
}

.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  padding: 20px;
}

@media (max-width: 767px) {
  .profile-container {
    padding: 0 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .points-content {
    flex-direction: column;
    text-align: center;
    
    .points-icon {
      margin-right: 0;
      margin-bottom: 15px;
    }
  }
}
</style> 