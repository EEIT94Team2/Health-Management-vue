<template>
  <div class="member-profile-view">
    <h1>會員資料</h1>
    <div v-if="loading">載入中...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="user">
      <el-form :model="formData" label-width="120px">
        <el-form-item label="使用者 ID">
          <span>{{ user.userId }}</span>
        </el-form-item>
        <el-form-item label="使用者名稱">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="電子郵件">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="性別">
          <el-radio-group v-model="formData.gender">
            <el-radio label="M">男</el-radio>
            <el-radio label="F">女</el-radio>
            <el-radio label="O">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="個人簡介">
          <el-input type="textarea" v-model="formData.bio" />
        </el-form-item>
        <el-form-item label="會員積分">
          <span>{{ user.userPoints }}</span>
        </el-form-item>
        <el-form-item label="上次登入">
          <span>{{ formatDate(user.lastLogin) }}</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateProfile" :loading="updating">更新資料</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref(null);
const loading = ref(false);
const updating = ref(false);
const error = ref(null);
const formData = ref({});

const getToken = () => localStorage.getItem('authToken');

const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('🔍 JWT payload:', payload); // ← 加這一行
    return payload.userId;
  } catch (e) {
    console.error('Token 解析失敗:', e);
    return null;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '未登入';
  const date = new Date(dateString);
  return date.toLocaleString('zh-TW');
};

const fetchProfile = async () => {
  loading.value = true;
  error.value = null;
  const token = getToken();
  const userId = getUserIdFromToken();

  if (!token || !userId) {
    error.value = '未登入或 token 無效';
    router.push('/backpage/member/login');
    return;
  }

  try {
    const response = await axios.get(`/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data && response.data.success) {
      user.value = response.data.data;
      const cleanData = { ...response.data.data };
      delete cleanData.passwordHash;
      formData.value = cleanData;
    } else {
      throw new Error(response.data?.message || '獲取資料失敗');
    }
  } catch (err) {
    console.error('獲取個人資料失敗', err);
    error.value = err.response?.data?.message || '無法獲取個人資料';
    if (err.response?.status === 401 || err.response?.status === 403) {
      ElMessage.error('登入憑證已過期，請重新登入');
      localStorage.removeItem('authToken');
      router.push('/backpage/member/login');
    }
  } finally {
    loading.value = false;
  }
};

const updateProfile = async () => {
  updating.value = true;
  error.value = null;
  const token = getToken();
  const userId = user.value?.userId;

  if (!token || !userId) {
    error.value = '無效的登入狀態';
    router.push('/backpage/member/login');
    return;
  }

  try {
    const updateData = {
      userId: userId,
      name: formData.value.name,
      email: formData.value.email,
      gender: formData.value.gender,
      bio: formData.value.bio,
      role: user.value.role,
      userPoints: user.value.userPoints,
      lastLogin: user.value.lastLogin
    };

    const response = await axios.put(`/api/users/${userId}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=UTF-8'
      }
    });

    if (response.data && response.data.success) {
      user.value = response.data.data;
      const cleanData = { ...response.data.data };
      delete cleanData.passwordHash;
      formData.value = cleanData;
      ElMessage.success('個人資料更新成功！');
    } else {
      throw new Error(response.data?.message || '更新失敗');
    }
  } catch (err) {
    console.error('更新失敗', err);
    error.value = err.response?.data?.message || '更新個人資料失敗';
    if (err.response?.status === 401 || err.response?.status === 403) {
      ElMessage.error('登入憑證已過期，請重新登入');
      localStorage.removeItem('authToken');
      router.push('/backpage/member/login');
    }
  } finally {
    updating.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.member-profile-view {
  padding: 20px;
}
h1 {
  margin-bottom: 20px;
}
.el-form {
  max-width: 500px;
}
</style>
