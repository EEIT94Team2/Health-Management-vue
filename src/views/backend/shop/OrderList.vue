<template>
  <div class="order-list">
    <el-card class="order-container">
      <template #header>
        <div class="order-header">
          <h2>{{ isAdmin ? '訂單管理' : '我的訂單' }}</h2>
          <div class="filter-container" v-if="isAdmin">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索訂單" 
              class="search-input"
              clearable 
              @keyup.enter="searchOrders"
            >
              <template #append>
                <el-button icon="Search" @click="searchOrders"></el-button>
              </template>
            </el-input>
            
            <el-select v-model="statusFilter" placeholder="訂單狀態" @change="fetchOrders">
              <el-option 
                v-for="item in statusOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value">
              </el-option>
            </el-select>
            
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="開始日期"
              end-placeholder="結束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="fetchOrders"
            />
          </div>
        </div>
      </template>
      
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else-if="orders.length === 0" class="empty-orders">
        <el-empty description="暫無訂單">
          <el-button type="primary" @click="$router.push('/shop/products')">去購物</el-button>
        </el-empty>
      </div>
      
      <div v-else class="order-content">
        <el-table :data="orders" style="width: 100%">
          <el-table-column prop="id" label="訂單編號" width="120" />
          
          <el-table-column prop="createdAt" label="下單時間" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          
          <el-table-column label="訂單金額" width="120">
            <template #default="{ row }">
              ${{ row.totalAmount }}
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="訂單狀態" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="商品數量" width="120">
            <template #default="{ row }">
              {{ getItemsQuantity(row) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="userName" label="用戶郵箱" min-width="120" v-if="isAdmin" />
          
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small" 
                @click="viewOrder(row.id)"
              >
                查看詳情
              </el-button>
              
              <el-button 
                v-if="row.status === 'PENDING_PAYMENT'" 
                type="success" 
                size="small" 
                @click="goToPayment(row)"
              >
                支付
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { getOrders, getOrdersByUserId } from '@/api/shop';

const router = useRouter();
const authStore = useAuthStore();
const orders = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchQuery = ref('');
const statusFilter = ref('');
const dateRange = ref([]);

// 检查是否为管理员
const isAdmin = computed(() => {
  return authStore.userRole === 'admin';
});

// 订单状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '待支付', value: 'PENDING_PAYMENT' },
  { label: '已支付', value: 'PAID' },
  { label: '已取消', value: 'CANCELLED' },
  { label: '已完成', value: 'COMPLETED' }
];

// 根据状态获取标签类型
const getStatusType = (status) => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'warning';
    case 'PAID':
      return 'success';
    case 'CANCELLED':
      return 'info';
    case 'COMPLETED':
      return 'primary';
    default:
      return '';
  }
};

// 获取状态显示文本
const getStatusLabel = (status) => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return '待支付';
    case 'PAID':
      return '已支付';
    case 'CANCELLED':
      return '已取消';
    case 'COMPLETED':
      return '已完成';
    default:
      return status;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 获取订单列表
const fetchOrders = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('請先登入');
    router.push('/member/login');
    return;
  }
  
  loading.value = true;
  try {
    let response;
    const params = {
      page: currentPage.value,
      size: pageSize.value
    };
    
    // 如果存在搜索關鍵詞，添加到請求參數中
    if (searchQuery.value && searchQuery.value.trim() !== '') {
      params.query = searchQuery.value.trim();
    }
    
    if (isAdmin.value) {
      // 管理员可以看到所有订单
      if (statusFilter.value) params.status = statusFilter.value;
      if (dateRange.value && dateRange.value.length === 2) {
        params.startDate = dateRange.value[0];
        params.endDate = dateRange.value[1];
      }
      
      response = await getOrders(params);
    } else {
      // 普通用户只能看到自己的订单
      response = await getOrdersByUserId(authStore.userId, params);
    }
    
    if (response && response.data) {
      // 後端已實現分頁
      if (response.data.content && Array.isArray(response.data.content)) {
        orders.value = response.data.content;
        total.value = response.data.totalElements || orders.value.length;
      } 
      // 後端未實現分頁，在前端進行處理
      else if (Array.isArray(response.data)) {
        // 先過濾搜索條件
        let filteredOrders = response.data;
        
        // 根據搜索關鍵詞過濾
        if (searchQuery.value && searchQuery.value.trim() !== '') {
          const query = searchQuery.value.toLowerCase().trim();
          filteredOrders = filteredOrders.filter(order => 
            order.id.toString().includes(query) ||
            (order.userName && order.userName.toLowerCase().includes(query))
          );
        }
        
        // 保存總數量
        total.value = filteredOrders.length;
        
        // 根據分頁參數切片數據
        const start = (currentPage.value - 1) * pageSize.value;
        const end = start + pageSize.value;
        orders.value = filteredOrders.slice(start, end);
      } else {
        // 無法處理的響應格式
        orders.value = [];
        total.value = 0;
        ElMessage.error('獲取訂單列表失敗：無效響應格式');
      }
      
      console.log('訂單數據:', orders.value, '總數:', total.value);
    } else {
      orders.value = [];
      total.value = 0;
      ElMessage.error('獲取訂單列表失敗：無效響應');
    }
  } catch (error) {
    console.error('獲取訂單列表失敗:', error);
    ElMessage.error('獲取訂單列表失敗');
    orders.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 搜索订单
const searchOrders = () => {
  fetchOrders();
};

// 查看订单详情
const viewOrder = (orderId) => {
  router.push(`/shop/orders/${orderId}`);
};

// 去支付
const goToPayment = (order) => {
  router.push(`/shop/checkout?orderId=${order.id}`);
};

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchOrders();
};

// 处理当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchOrders();
};

// 计算订单中的商品总数量
const getItemsQuantity = (order) => {
  if (!order.orderItems || order.orderItems.length === 0) {
    return 0;
  }
  
  return order.orderItems.reduce((total, item) => {
    return total + (parseInt(item.quantity) || 0);
  }, 0);
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('請先登入');
    router.push('/member/login');
    return;
  }
  fetchOrders();
});
</script>

<style scoped>
.order-list {
  padding: 20px;
}

.order-container {
  max-width: 1200px;
  margin: 0 auto;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  width: 250px;
}

.loading-container {
  padding: 20px;
}

.empty-orders {
  padding: 40px 0;
  text-align: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 