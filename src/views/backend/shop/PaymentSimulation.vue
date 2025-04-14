<template>
  <div class="payment-simulation">
    <el-card class="simulation-container" v-loading="loading">
      <template #header>
        <div class="simulation-header">
          <h2>支付模擬系統</h2>
          <div class="right">
            <el-tag type="warning">管理員專用</el-tag>
          </div>
        </div>
      </template>
      
      <!-- 管理员访问控制 -->
      <div v-if="!isAdmin" class="access-denied">
        <el-result
          icon="error"
          title="訪問被拒絕"
          sub-title="抱歉，只有管理員才能訪問此頁面"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/backpage/dashboard')">返回首頁</el-button>
          </template>
        </el-result>
      </div>
      
      <!-- 管理员访问内容 -->
      <div v-else class="simulation-content">
        <!-- 訂單支付部分 -->
        <div v-if="currentOrder && currentOrder.status === 'PENDING_PAYMENT'" class="section order-payment">
          <h3>訂單支付</h3>
          <el-alert
            type="info"
            :closable="false">
            您正在為訂單 <strong>{{ currentOrder.id }}</strong> 進行支付，總金額: <strong>${{ currentOrder.totalAmount }}</strong>
          </el-alert>
          
          <el-card class="payment-methods">
            <h4>選擇支付方式</h4>
            <div class="methods-list">
              <el-radio-group v-model="selectedPaymentMethod">
                <el-radio label="CREDIT_CARD">信用卡</el-radio>
                <el-radio label="ALIPAY">支付寶</el-radio>
                <el-radio label="WECHAT_PAY">微信支付</el-radio>
              </el-radio-group>
            </div>
            
            <div class="payment-summary">
              <div class="summary-row">
                <span>訂單金額：</span>
                <span>${{ currentOrder.totalAmount }}</span>
              </div>
              <div class="summary-row">
                <span>支付方式：</span>
                <span>{{ getPaymentMethodLabel(selectedPaymentMethod) }}</span>
              </div>
            </div>
            
            <div class="payment-actions">
              <el-button @click="$router.push(`/backpage/shop/orders/${currentOrder.id}`)">返回訂單</el-button>
              <el-button type="primary" @click="createPaymentForOrder(selectedPaymentMethod)">確認支付</el-button>
            </div>
          </el-card>
        </div>
        
        <div class="section order-search">
          <h3>查詢訂單支付狀態</h3>
          <el-form :model="searchForm" label-width="120px">
            <el-form-item label="訂單編號">
              <el-input v-model="searchForm.orderId" placeholder="請輸入訂單編號" />
            </el-form-item>
            <el-form-item label="支付編號">
              <el-input v-model="searchForm.paymentId" placeholder="請輸入支付編號" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchPayment">查詢支付狀態</el-button>
            </el-form-item>
          </el-form>
          
          <div v-if="paymentInfo" class="payment-info">
            <el-result
              :icon="getPaymentResultIcon(paymentInfo.status)"
              :title="getPaymentResultTitle(paymentInfo.status)"
              :sub-title="`支付編號: ${paymentInfo.id}`"
            >
              <template #extra>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="訂單編號">{{ paymentInfo.orderId }}</el-descriptions-item>
                  <el-descriptions-item label="支付時間">{{ formatDate(paymentInfo.paidAt) }}</el-descriptions-item>
                  <el-descriptions-item label="支付方式">{{ paymentInfo.method }}</el-descriptions-item>
                  <el-descriptions-item label="支付金額">${{ paymentInfo.amount }}</el-descriptions-item>
                </el-descriptions>
                
                <div class="actions" v-if="paymentInfo.status === 'PENDING'">
                  <el-button type="success" @click="simulatePaymentCallback(paymentInfo.id, 'SUCCESS')">
                    模擬支付成功
                  </el-button>
                  <el-button type="danger" @click="simulatePaymentCallback(paymentInfo.id, 'FAILED')">
                    模擬支付失敗
                  </el-button>
                </div>
              </template>
            </el-result>
          </div>
        </div>
        
        <el-divider content-position="center">或者</el-divider>
        
        <div class="section pending-payments">
          <h3>待處理支付清單</h3>
          <div v-if="pendingPayments.length === 0" class="empty-pending">
            <el-empty description="沒有待處理的支付" />
          </div>
          
          <el-table v-else :data="pendingPayments" style="width: 100%">
            <el-table-column prop="id" label="支付編號" width="150" />
            <el-table-column prop="orderId" label="訂單編號" width="120" />
            <el-table-column prop="amount" label="金額" width="120">
              <template #default="{ row }">
                ${{ row.amount }}
              </template>
            </el-table-column>
            <el-table-column prop="method" label="支付方式" width="120" />
            <el-table-column prop="createdAt" label="創建時間" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="狀態" width="120">
              <template #default="{ row }">
                <el-tag :type="getPaymentStatusType(row.status)">
                  {{ getPaymentStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button 
                  type="success" 
                  size="small"
                  @click="simulatePaymentCallback(row.id, 'SUCCESS')"
                >
                  模擬成功
                </el-button>
                <el-button 
                  type="danger" 
                  size="small"
                  @click="simulatePaymentCallback(row.id, 'FAILED')"
                >
                  模擬失敗
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { getPaymentStatus, mockPaymentCallback, createPayment, getOrderById } from '@/api/shop';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const searchForm = ref({
  orderId: '',
  paymentId: ''
});
const paymentInfo = ref(null);
const pendingPayments = ref([]);
const currentOrder = ref(null);
const orderLoaded = ref(false);
const selectedPaymentMethod = ref('CREDIT_CARD');

// 检查是否为管理员
const isAdmin = computed(() => {
  return authStore.userRole === 'admin';
});

// 获取支付状态标签类型
const getPaymentStatusType = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'SUCCESS':
      return 'success';
    case 'FAILED':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取支付状态显示文本
const getPaymentStatusLabel = (status) => {
  switch (status) {
    case 'PENDING':
      return '處理中';
    case 'SUCCESS':
      return '成功';
    case 'FAILED':
      return '失敗';
    default:
      return status;
  }
};

// 获取支付结果图标
const getPaymentResultIcon = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'SUCCESS':
      return 'success';
    case 'FAILED':
      return 'error';
    default:
      return 'info';
  }
};

// 获取支付结果标题
const getPaymentResultTitle = (status) => {
  switch (status) {
    case 'PENDING':
      return '支付處理中';
    case 'SUCCESS':
      return '支付成功';
    case 'FAILED':
      return '支付失敗';
    default:
      return '支付狀態未知';
  }
};

// 获取支付方式标签
const getPaymentMethodLabel = (method) => {
  switch (method) {
    case 'CREDIT_CARD':
      return '信用卡';
    case 'ALIPAY':
      return '支付寶';
    case 'WECHAT_PAY':
      return '微信支付';
    default:
      return method;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 查询支付状态
const searchPayment = async () => {
  if (!searchForm.value.paymentId && !searchForm.value.orderId) {
    ElMessage.warning('請輸入訂單編號或支付編號');
    return;
  }
  
  loading.value = true;
  try {
    const response = await getPaymentStatus(searchForm.value.paymentId);
    paymentInfo.value = response.data;
    
    if (!paymentInfo.value) {
      ElMessage.warning('未找到支付信息');
    }
  } catch (error) {
    console.error('查詢支付狀態失敗:', error);
    ElMessage.error('查詢支付狀態失敗');
  } finally {
    loading.value = false;
  }
};

// 从URL参数中获取订单ID并加载订单
const loadOrderFromParams = async () => {
  const orderId = route.query.orderId;
  if (orderId && !isNaN(parseInt(orderId))) {
    loading.value = true;
    try {
      const response = await getOrderById(parseInt(orderId));
      currentOrder.value = response.data;
      orderLoaded.value = true;
      searchForm.value.orderId = orderId.toString();
      
      // 如果訂單尚未支付，顯示支付表單
      if (currentOrder.value.status === 'PENDING_PAYMENT') {
        ElMessage.info('請為訂單進行支付');
      }
    } catch (error) {
      console.error('加載訂單失敗:', error);
      ElMessage.error('加載訂單失敗');
    } finally {
      loading.value = false;
    }
  }
};

// 为当前订单创建支付
const createPaymentForOrder = async (paymentMethod = 'CREDIT_CARD') => {
  if (!currentOrder.value || currentOrder.value.status !== 'PENDING_PAYMENT') {
    ElMessage.warning('當前訂單狀態不支持支付');
    return;
  }
  
  loading.value = true;
  try {
    const paymentRequest = {
      method: paymentMethod,
      amount: currentOrder.value.totalAmount
    };
    
    const response = await createPayment(currentOrder.value.id, paymentRequest);
    paymentInfo.value = response.data;
    ElMessage.success('支付請求已創建，請確認支付');
    
    // 刷新待處理支付列表
    fetchPendingPayments();
  } catch (error) {
    console.error('創建支付失敗:', error);
    ElMessage.error('創建支付失敗');
  } finally {
    loading.value = false;
  }
};

// 模拟支付回调
const simulatePaymentCallback = async (paymentId, status) => {
  loading.value = true;
  try {
    await mockPaymentCallback(paymentId, status);
    ElMessage.success('模擬支付回調處理成功');
    
    // 更新支付狀態
    const response = await getPaymentStatus(paymentId);
    paymentInfo.value = response.data;
    
    // 重新获取待处理支付列表
    fetchPendingPayments();
  } catch (error) {
    console.error('模擬支付回調失敗:', error);
    ElMessage.error('模擬支付回調失敗');
  } finally {
    loading.value = false;
  }
};

// 获取所有待处理的支付
const fetchPendingPayments = async () => {
  // 這裡應該調用API獲取所有待處理的支付
  // 目前後端可能沒有提供這個API，所以用空數組代替
  pendingPayments.value = [];
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('請先登入');
    router.push('/backpage/member/login');
    return;
  }
  
  // 加載URL中可能帶的訂單ID
  loadOrderFromParams();
  
  // 獲取待處理支付列表
  fetchPendingPayments();
});
</script>

<style scoped>
.payment-simulation {
  padding: 20px;
}

.simulation-container {
  max-width: 1000px;
  margin: 0 auto;
}

.simulation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.access-denied {
  padding: 20px;
  text-align: center;
}

.simulation-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section {
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #409EFF;
  font-weight: 500;
}

.payment-info {
  margin-top: 20px;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.empty-pending {
  padding: 30px 0;
}

:deep(.el-descriptions) {
  margin-bottom: 20px;
}
</style> 