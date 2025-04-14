<template>
  <div class="forbidden-page">
    <el-result
      icon="error"
      title="403 禁止訪問"
      sub-title="抱歉，您無權訪問此頁面或資源"
    >
      <template #extra>
        <div class="error-details" v-if="errorDetails">
          <p class="error-message">{{ errorDetails.message }}</p>
          <div class="error-code" v-if="errorDetails.code">
            錯誤代碼: <span>{{ errorDetails.code }}</span>
          </div>
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="goBack">返回上一頁</el-button>
          <el-button @click="goHome">返回首頁</el-button>
          <el-button type="info" @click="tryAgain">重試</el-button>
        </div>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const errorDetails = ref(null);

onMounted(() => {
  // 從路由查詢參數中獲取錯誤信息
  if (route.query.message || route.query.code) {
    errorDetails.value = {
      message: route.query.message || '您沒有權限訪問此資源',
      code: route.query.code || 'ERR_BAD_REQUEST'
    };
  }
});

// 返回上一頁
const goBack = () => {
  router.back();
};

// 返回首頁
const goHome = () => {
  router.push('/');
};

// 重試當前請求
const tryAgain = () => {
  // 重新加載當前頁面，可能會觸發新的請求
  window.location.reload();
};
</script>

<style scoped>
.forbidden-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.error-details {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
  text-align: left;
  max-width: 500px;
}

.error-message {
  font-size: 16px;
  margin-bottom: 10px;
  color: #f56c6c;
}

.error-code {
  font-family: monospace;
  color: #606266;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 20px auto 0;
  }
  
  .forbidden-page {
    min-height: 70vh;
  }
}
</style> 