<template>
  <div class="order-list-page dark-theme">
    <!-- 頁面標題 -->
    <section class="page-header">
      <div class="container">
        <h1>我的 <span class="text-highlight">訂單</span></h1>
        <p>查看和管理您的所有訂單</p>
      </div>
    </section>

    <!-- 訂單列表內容 -->
    <section class="order-section">
      <div class="container">
        <!-- 搜尋和篩選 -->
        <div class="filter-container">
          <div class="search-container">
            <el-input
              v-model="searchQuery"
              placeholder="搜尋訂單..."
              prefix-icon="Search"
              clearable
              @clear="clearSearch"
            />
          </div>
          <div class="status-filter">
            <el-select v-model="statusFilter" placeholder="訂單狀態" @change="filterOrders">
              <el-option label="全部狀態" value="" />
              <el-option label="處理中" value="PROCESSING" />
              <el-option label="已發貨" value="SHIPPED" />
              <el-option label="已完成" value="COMPLETED" />
              <el-option label="已取消" value="CANCELLED" />
            </el-select>
          </div>
          <div class="time-filter">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="開始日期"
              end-placeholder="結束日期"
              :shortcuts="dateShortcuts"
              @change="filterOrders"
            />
          </div>
        </div>

        <!-- 訂單列表 -->
        <div class="orders-container" v-if="!isLoading">
          <div v-if="displayedOrders.length > 0">
            <div class="order-card" v-for="order in displayedOrders" :key="order.id" @click="viewOrderDetail(order.id)">
              <div class="order-header">
                <div class="order-info">
                  <div class="order-id">
                    <span>訂單號：</span>
                    <span class="order-id-text">{{ order.orderNumber || order.id }}</span>
                  </div>
                  <div class="order-date">
                    <span>下單時間：</span>
                    <span>{{ formatDate(order.createdAt) }}</span>
                  </div>
                </div>
                <div class="order-status">
                  <el-tag :type="getStatusTagType(order.status)">
                    {{ getStatusText(order.status) }}
                  </el-tag>
                </div>
              </div>
              
              <div class="order-items">
                <div class="order-item" v-for="(item, index) in order.orderItems" :key="index">
                  <div class="item-image">
                    <img 
                      :src="item.product.imageUrl || 'https://placehold.co/80x80/4CAF50/ffffff?text=Product'" 
                      :alt="item.product.name"
                      onerror="this.src='https://placehold.co/80x80/cccccc/ffffff?text=Image+Not+Found'"
                    />
                  </div>
                  <div class="item-details">
                    <div class="item-name">{{ item.product.name }}</div>
                    <div class="item-quantity">x {{ item.quantity }}</div>
                  </div>
                  <div class="item-price">NT$ {{ item.price }}</div>
                </div>
              </div>
              
              <div class="order-footer">
                <div class="order-summary">
                  <span>共 {{ getTotalItems(order) }} 件商品</span>
                  <span class="order-total">總計：NT$ {{ order.totalAmount }}</span>
                </div>
                <div class="order-actions">
                  <el-button size="small" @click.stop="viewOrderDetail(order.id)">查看詳情</el-button>
                </div>
              </div>
            </div>

            <!-- 分頁 -->
            <div class="pagination-container" v-if="totalPages > 1">
              <el-pagination
                layout="prev, pager, next"
                :total="totalItems"
                :page-size="pageSize"
                :current-page="currentPage"
                @current-change="handlePageChange"
                background
              />
            </div>
          </div>
          
          <!-- 無結果提示 -->
          <div class="no-orders" v-else>
            <el-empty description="沒有找到符合條件的訂單">
              <el-button type="primary" @click="$router.push('/shop/products')">
                立即去購物
              </el-button>
            </el-empty>
          </div>
        </div>
        
        <!-- 加載中狀態 -->
        <div class="loading-container" v-if="isLoading">
          <el-skeleton style="width: 100%">
            <template #template>
              <div style="padding: 20px; border-radius: 12px; background: var(--card-bg); margin-bottom: 20px;">
                <el-skeleton-item variant="p" style="width: 50%; margin-bottom: 20px;" />
                <div style="display: flex; gap: 20px;">
                  <el-skeleton-item variant="image" style="width: 80px; height: 80px;" />
                  <div style="flex: 1;">
                    <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 10px;" />
                    <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 10px;" />
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                  <el-skeleton-item variant="text" style="width: 30%;" />
                  <el-skeleton-item variant="text" style="width: 20%;" />
                </div>
              </div>
              <div style="padding: 20px; border-radius: 12px; background: var(--card-bg);">
                <el-skeleton-item variant="p" style="width: 50%; margin-bottom: 20px;" />
                <div style="display: flex; gap: 20px;">
                  <el-skeleton-item variant="image" style="width: 80px; height: 80px;" />
                  <div style="flex: 1;">
                    <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 10px;" />
                    <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 10px;" />
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                  <el-skeleton-item variant="text" style="width: 30%;" />
                  <el-skeleton-item variant="text" style="width: 20%;" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrdersByUserId } from '@/api/shop'
import { Search } from '@element-plus/icons-vue'

export default {
  name: 'OrderList',
  components: {
    Search
  },
  setup() {
    const router = useRouter()
    const orders = ref([])
    const displayedOrders = ref([])
    const isLoading = ref(true)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const dateRange = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(5)
    const totalItems = ref(0)
    
    // 計算總頁數
    const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))
    
    // 日期快捷選項
    const dateShortcuts = [
      {
        text: '最近一週',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
          return [start, end]
        }
      },
      {
        text: '最近一個月',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
          return [start, end]
        }
      },
      {
        text: '最近三個月',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
          return [start, end]
        }
      }
    ]
    
    // 獲取訂單列表
    const fetchOrders = async () => {
      try {
        isLoading.value = true
        
        // 使用從本地存儲獲取的用戶ID，或者使用默認值
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        const userId = userInfo.id || null
        
        if (!userId) {
          ElMessage.warning('請先登入後再查看訂單')
          router.push('/backpage/member/login')
          return
        }
        
        const response = await getOrdersByUserId(userId)
        if (response.data) {
          if (Array.isArray(response.data.content)) {
            orders.value = response.data.content
          } else if (Array.isArray(response.data)) {
            orders.value = response.data
          } else {
            orders.value = []
          }
          
          applyFilters()
        }
      } catch (error) {
        console.error('獲取訂單失敗:', error)
        if (error.response && error.response.status === 401) {
          ElMessage.warning('請先登入後再查看訂單')
          router.push('/backpage/member/login')
        } else {
          ElMessage.error('無法載入訂單，請稍後再試')
        }
      } finally {
        isLoading.value = false
      }
    }
    
    // 根據條件篩選訂單
    const applyFilters = () => {
      let filtered = [...orders.value]
      
      // 搜尋過濾
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(order => 
          (order.orderNumber && order.orderNumber.toLowerCase().includes(query)) || 
          (order.id && order.id.toString().includes(query))
        )
      }
      
      // 狀態過濾
      if (statusFilter.value) {
        filtered = filtered.filter(order => order.status === statusFilter.value)
      }
      
      // 日期範圍過濾
      if (dateRange.value && dateRange.value.length === 2) {
        const startDate = new Date(dateRange.value[0])
        startDate.setHours(0, 0, 0, 0)
        
        const endDate = new Date(dateRange.value[1])
        endDate.setHours(23, 59, 59, 999)
        
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= startDate && orderDate <= endDate
        })
      }
      
      totalItems.value = filtered.length
      
      // 分頁
      const startIndex = (currentPage.value - 1) * pageSize.value
      displayedOrders.value = filtered.slice(startIndex, startIndex + pageSize.value)
    }
    
    // 清空搜尋
    const clearSearch = () => {
      searchQuery.value = ''
      filterOrders()
    }
    
    // 篩選操作
    const filterOrders = () => {
      currentPage.value = 1
      applyFilters()
    }
    
    // 換頁
    const handlePageChange = (page) => {
      currentPage.value = page
      applyFilters()
    }
    
    // 查看訂單詳情
    const viewOrderDetail = (orderId) => {
      router.push(`/shop/orders/${orderId}`)
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // 獲取狀態文字
    const getStatusText = (status) => {
      const statusMap = {
        'PENDING': '待處理',
        'PROCESSING': '處理中',
        'SHIPPED': '已發貨',
        'COMPLETED': '已完成',
        'CANCELLED': '已取消'
      }
      return statusMap[status] || status
    }
    
    // 獲取狀態標籤類型
    const getStatusTagType = (status) => {
      const typeMap = {
        'PENDING': 'info',
        'PROCESSING': 'warning',
        'SHIPPED': 'success',
        'COMPLETED': 'success',
        'CANCELLED': 'danger'
      }
      return typeMap[status] || 'info'
    }
    
    // 計算訂單總商品數
    const getTotalItems = (order) => {
      if (!order.orderItems || !Array.isArray(order.orderItems)) return 0
      return order.orderItems.reduce((total, item) => total + (item.quantity || 0), 0)
    }
    
    // 監聽搜尋條件變化
    watch(searchQuery, () => {
      filterOrders()
    })
    
    onMounted(() => {
      window.scrollTo(0, 0);
      fetchOrders()
    })
    
    return {
      orders,
      displayedOrders,
      isLoading,
      searchQuery,
      statusFilter,
      dateRange,
      dateShortcuts,
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      clearSearch,
      filterOrders,
      handlePageChange,
      viewOrderDetail,
      formatDate,
      getStatusText,
      getStatusTagType,
      getTotalItems
    }
  }
}
</script>

<style lang="scss" scoped>
.order-list-page {
  // 深色主題變數
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --highlight-color: #10b981;
  --highlight-hover: #059669;
  --border-color: #374151;
  --card-bg: #1e293b;
  
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding-top: 80px; /* 為導航欄預留空間 */
  overflow-x: hidden;
}

.text-highlight {
  color: var(--highlight-color);
  font-weight: 600;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

// 頁面標題
.page-header {
  padding: 4rem 0;
  text-align: center;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.2rem;
    color: var(--text-secondary);
    max-width: 800px;
    margin: 0 auto;
  }
}

// 篩選區
.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  
  .search-container {
    flex: 1;
    min-width: 200px;
  }
  
  .status-filter {
    width: 160px;
  }
  
  .time-filter {
    min-width: 300px;
  }
}

// 訂單區
.order-section {
  padding-bottom: 4rem;
}

.order-card {
  background-color: var(--card-bg);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
}

.order-header {
  padding: 1.5rem;
  background-color: var(--bg-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .order-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    .order-id {
      .order-id-text {
        font-weight: 600;
      }
    }
    
    .order-date {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
  }
}

.order-items {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  
  .order-item {
    display: flex;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px dashed var(--border-color);
    
    &:last-child {
      border-bottom: none;
    }
    
    .item-image {
      width: 60px;
      height: 60px;
      min-width: 60px;
      border-radius: 6px;
      overflow: hidden;
      margin-right: 1rem;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .item-details {
      flex: 1;
      
      .item-name {
        font-weight: 600;
        margin-bottom: 0.3rem;
      }
      
      .item-quantity {
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
    }
    
    .item-price {
      margin-left: 1rem;
      font-weight: 600;
    }
  }
}

.order-footer {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .order-summary {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    .order-total {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--highlight-color);
    }
  }
}

// 分頁
.pagination-container {
  margin: 2rem 0;
  display: flex;
  justify-content: center;
}

// 加載和無結果
.loading-container,
.no-orders {
  padding: 3rem;
  text-align: center;
  background-color: var(--card-bg);
  border-radius: 12px;
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    
    .search-container,
    .status-filter,
    .time-filter {
      width: 100%;
    }
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    
    .order-status {
      align-self: flex-end;
    }
  }
  
  .order-footer {
    flex-direction: column;
    gap: 1rem;
    
    .order-actions {
      align-self: flex-end;
    }
  }
}
</style> 