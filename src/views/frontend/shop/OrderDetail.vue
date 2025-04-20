<template>
  <div class="order-detail-page dark-theme">
    <!-- 頁面標題 -->
    <section class="page-header">
      <div class="section-container">
        <h1>訂單 <span class="text-highlight">詳情</span></h1>
        <p>查看訂單的詳細信息與狀態</p>
      </div>
    </section>

    <!-- 訂單詳情內容 -->
    <section class="order-section">
      <div class="section-container">
        <!-- 返回按鈕 -->
        <div class="back-button-container">
          <el-button @click="goBack">
            <el-icon><ArrowLeft /></el-icon> 返回訂單列表
          </el-button>
        </div>

        <!-- 載入中 -->
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
            </template>
          </el-skeleton>
        </div>

        <!-- 訂單詳情 -->
        <div v-if="!isLoading && order">
          <!-- 訂單狀態卡 -->
          <div class="order-status-card">
            <div class="order-status-header">
              <div class="order-status-title">
                <h2>訂單狀態</h2>
                <el-tag :type="getStatusTagType(order.status)" size="large">
                  {{ getStatusText(order.status) }}
                </el-tag>
              </div>
              <div class="order-dates">
                <div class="date-row">
                  <span>訂單日期：</span>
                  <span>{{ formatDate(order.createdAt) }}</span>
                </div>
                <div class="date-row" v-if="order.updatedAt && order.updatedAt !== order.createdAt">
                  <span>最後更新：</span>
                  <span>{{ formatDate(order.updatedAt) }}</span>
                </div>
              </div>
            </div>

            <div class="order-id-section">
              <div class="order-id">
                <span>訂單編號：</span>
                <span class="id-text">{{ order.orderNumber || order.id }}</span>
              </div>
              <div class="order-actions">
                <el-button 
                  type="danger" 
                  plain 
                  size="small" 
                  v-if="canCancelOrder"
                  :loading="isCancelling"
                  @click="cancelOrder"
                >
                  取消訂單
                </el-button>
              </div>
            </div>
          </div>

          <!-- 訂單詳情卡 -->
          <div class="detail-card">
            <h2>訂單資訊</h2>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="收件人">
                {{ order.receiverName || '未提供' }}
              </el-descriptions-item>
              <el-descriptions-item label="聯絡電話">
                {{ order.receiverPhone || '未提供' }}
              </el-descriptions-item>
              <el-descriptions-item label="送貨地址" :span="2">
                {{ order.shippingAddress || '未提供' }}
              </el-descriptions-item>
              <el-descriptions-item label="付款方式">
                {{ getPaymentMethodLabel(order.paymentMethod) }}
              </el-descriptions-item>
              <el-descriptions-item label="付款狀態">
                <el-tag 
                  :type="order.paymentStatus === 'PAID' ? 'success' : 'warning'" 
                  size="small"
                >
                  {{ order.paymentStatus === 'PAID' ? '已付款' : '未付款' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item v-if="order.note" label="備註" :span="2">
                {{ order.note }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 商品明細 -->
          <div class="detail-card">
            <h2>商品明細</h2>
            
            <div class="order-items">
              <div class="order-item" v-for="(item, index) in order.orderItems" :key="index">
                <div class="item-image">
                  <img 
                    :src="getProductImageUrl(item.product)" 
                    :alt="item.product.name"
                    onerror="this.src='https://placehold.co/100x100/cccccc/ffffff?text=Image+Not+Found'"
                  />
                </div>
                <div class="item-details">
                  <div class="item-name">
                    {{ item.product.name }}
                    <el-tag size="small" v-if="item.product.category">
                      {{ item.product.category }}
                    </el-tag>
                  </div>
                  <div class="item-description" v-if="item.product.description">
                    {{ truncateText(item.product.description, 100) }}
                  </div>
                </div>
                <div class="item-price-info">
                  <div class="item-quantity">
                    x {{ item.quantity }}
                  </div>
                  <div class="item-price">
                    NT$ {{ item.price }}
                  </div>
                  <div class="item-total">
                    NT$ {{ calculateItemTotal(item) }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="order-summary">
              <div class="summary-row">
                <span>商品總額</span>
                <span>NT$ {{ order.subtotal || calculateSubtotal() }}</span>
              </div>
              <div class="summary-row">
                <span>運費</span>
                <span>NT$ {{ order.shippingFee || 100 }}</span>
              </div>
              <div class="summary-row total">
                <span>訂單總額</span>
                <span>NT$ {{ order.totalAmount }}</span>
              </div>
            </div>
          </div>

          <!-- 物流信息 -->
          <div class="detail-card" v-if="order.status !== 'PENDING' && order.status !== 'CANCELLED'">
            <h2>物流信息</h2>
            
            <div class="timeline-container">
              <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in orderTimeline"
                  :key="index"
                  :timestamp="activity.timestamp"
                  :type="activity.type"
                  :hollow="activity.hollow"
                  :color="activity.color"
                >
                  {{ activity.content }}
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </div>

        <!-- 訂單不存在 -->
        <div class="not-found-container" v-if="!isLoading && !order">
          <el-empty description="找不到訂單信息">
            <el-button type="primary" @click="goBack">返回訂單列表</el-button>
          </el-empty>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrder, cancelOrder as apiCancelOrder } from '@/api/shop'
import { ArrowLeft } from '@element-plus/icons-vue'

export default {
  name: 'OrderDetail',
  components: {
    ArrowLeft
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const order = ref(null)
    const isLoading = ref(true)
    const isCancelling = ref(false)
    
    // 獲取訂單詳情
    const fetchOrderDetails = async () => {
      try {
        isLoading.value = true
        
        const orderId = route.params.id
        if (!orderId) {
          ElMessage.error('訂單ID無效')
          router.push('/shop/orders')
          return
        }
        
        const response = await getOrder(orderId)
        if (response.data) {
          order.value = response.data
        } else {
          ElMessage.warning('找不到訂單信息')
          order.value = null
        }
      } catch (error) {
        console.error('獲取訂單詳情失敗:', error)
        if (error.response && error.response.status === 401) {
          ElMessage.warning('請先登入後再查看訂單')
          router.push('/backpage/member/login')
        } else if (error.response && error.response.status === 404) {
          ElMessage.warning('訂單不存在')
          order.value = null
        } else {
          ElMessage.error('無法載入訂單詳情，請稍後再試')
          order.value = null
        }
      } finally {
        isLoading.value = false
      }
    }
    
    // 訂單時間線
    const orderTimeline = computed(() => {
      if (!order.value) return []
      
      const timeline = []
      
      // 訂單創建
      timeline.push({
        content: '訂單已創建',
        timestamp: formatDate(order.value.createdAt),
        type: 'primary',
        hollow: false,
        color: '#10b981'
      })
      
      // 付款狀態
      if (order.value.paymentStatus === 'PAID') {
        timeline.push({
          content: '付款成功',
          timestamp: formatDate(order.value.paymentTime || order.value.updatedAt),
          type: 'success',
          hollow: false
        })
      }
      
      // 訂單狀態
      if (order.value.status === 'PROCESSING') {
        timeline.push({
          content: '訂單處理中',
          timestamp: formatDate(order.value.updatedAt),
          type: 'warning',
          hollow: false
        })
      }
      
      if (order.value.status === 'SHIPPED') {
        timeline.push({
          content: '訂單已發貨',
          timestamp: formatDate(order.value.shippingTime || order.value.updatedAt),
          type: 'info',
          hollow: false
        })
      }
      
      if (order.value.status === 'COMPLETED') {
        timeline.push({
          content: '訂單已完成',
          timestamp: formatDate(order.value.completionTime || order.value.updatedAt),
          type: 'success',
          hollow: false
        })
      }
      
      if (order.value.status === 'CANCELLED') {
        timeline.push({
          content: '訂單已取消',
          timestamp: formatDate(order.value.cancellationTime || order.value.updatedAt),
          type: 'danger',
          hollow: false
        })
      }
      
      return timeline
    })
    
    // 是否可以取消訂單
    const canCancelOrder = computed(() => {
      if (!order.value) return false
      return ['PENDING', 'PROCESSING'].includes(order.value.status)
    })
    
    // 取消訂單
    const cancelOrder = async () => {
      try {
        await ElMessageBox.confirm('確定要取消此訂單嗎？此操作不可撤銷。', '取消訂單', {
          confirmButtonText: '確定取消',
          cancelButtonText: '返回',
          type: 'warning'
        })
        
        isCancelling.value = true
        
        const response = await apiCancelOrder(order.value.id)
        if (response.data) {
          ElMessage.success('訂單已成功取消')
          // 重新獲取訂單詳情
          await fetchOrderDetails()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消訂單失敗:', error)
          ElMessage.error('取消訂單失敗，請稍後再試')
        }
      } finally {
        isCancelling.value = false
      }
    }
    
    // 返回列表
    const goBack = () => {
      router.push('/shop/orders')
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
    
    // 獲取付款方式標籤
    const getPaymentMethodLabel = (method) => {
      const methodMap = {
        'credit_card': '信用卡',
        'bank_transfer': '銀行轉帳',
        'cash_on_delivery': '貨到付款'
      }
      return methodMap[method] || method
    }
    
    // 計算單項商品總金額
    const calculateItemTotal = (item) => {
      return (item.price * item.quantity).toFixed(2)
    }
    
    // 計算商品小計
    const calculateSubtotal = () => {
      if (!order.value || !order.value.orderItems) return 0
      
      return order.value.orderItems
        .reduce((total, item) => total + (item.price * item.quantity), 0)
        .toFixed(2)
    }
    
    // 截斷文字
    const truncateText = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }
    
    // 獲取商品圖片URL的方法，處理各種可能的URL格式
    const getProductImageUrl = (product) => {
      if (!product) return 'https://placehold.co/100x100/cccccc/ffffff?text=No+Product';
      
      // 檢查各種可能的圖片URL屬性
      if (product.imageUrl) {
        // 檢查是否為完整URL還是相對路徑
        if (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('https')) {
          return product.imageUrl;
        } else {
          // 假設是相對路徑，添加後端基礎URL
          return `http://localhost:8080${product.imageUrl}`;
        }
      }
      
      if (product.image) {
        if (product.image.startsWith('http') || product.image.startsWith('https')) {
          return product.image;
        } else {
          return `http://localhost:8080${product.image}`;
        }
      }
      
      if (product.img || product.imgUrl) {
        const imgPath = product.img || product.imgUrl;
        if (imgPath.startsWith('http') || imgPath.startsWith('https')) {
          return imgPath;
        } else {
          return `http://localhost:8080${imgPath}`;
        }
      }
      
      // 如果所有嘗試都失敗，返回默認圖片
      return 'https://placehold.co/100x100/4CAF50/ffffff?text=' + encodeURIComponent(product.name || 'Product');
    };
    
    onMounted(() => {
      window.scrollTo(0, 0);
      fetchOrderDetails()
    })
    
    return {
      order,
      isLoading,
      isCancelling,
      orderTimeline,
      canCancelOrder,
      goBack,
      cancelOrder,
      formatDate,
      getStatusText,
      getStatusTagType,
      getPaymentMethodLabel,
      calculateItemTotal,
      calculateSubtotal,
      truncateText,
      getProductImageUrl
    }
  }
}
</script>

<style lang="scss" scoped>
.order-detail-page {
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

.section-container {
  width: 100%;
  margin: 0 auto;
  padding: 0 40px;
}

// 頁面標題
.page-header {
  padding: 3rem 0;
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

// 返回按鈕
.back-button-container {
  margin-bottom: 2rem;
}

// 訂單詳情區
.order-section {
  padding-bottom: 4rem;
}

// 共通卡片樣式
.order-status-card,
.detail-card {
  background-color: var(--card-bg);
  border-radius: 12px;
  margin-bottom: 2rem;
  overflow: hidden;
}

// 訂單狀態卡片
.order-status-card {
  padding: 1.5rem;
  
  .order-status-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
    
    .order-status-title {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      h2 {
        margin: 0;
      }
    }
    
    .order-dates {
      color: var(--text-secondary);
      
      .date-row {
        margin-bottom: 0.5rem;
        text-align: right;
      }
    }
  }
  
  .order-id-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
    
    .order-id {
      font-size: 1.1rem;
      
      .id-text {
        font-weight: 600;
      }
    }
  }
}

// 詳情卡片
.detail-card {
  padding: 1.5rem;
  
  h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
  }
}

// 商品列表
.order-items {
  .order-item {
    display: flex;
    padding: 1.5rem 0;
    border-bottom: 1px solid var(--border-color);
    
    &:first-child {
      padding-top: 0;
    }
    
    &:last-child {
      border-bottom: none;
    }
    
    .item-image {
      width: 100px;
      height: 100px;
      min-width: 100px;
      border-radius: 8px;
      overflow: hidden;
      margin-right: 1.5rem;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background-color: #ffffff;
      }
    }
    
    .item-details {
      flex: 1;
      
      .item-name {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      
      .item-description {
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
      }
    }
    
    .item-price-info {
      min-width: 120px;
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      .item-quantity {
        color: var(--text-secondary);
      }
      
      .item-price {
        color: var(--text-secondary);
      }
      
      .item-total {
        font-weight: 600;
        font-size: 1.1rem;
      }
    }
  }
}

// 訂單摘要
.order-summary {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    
    &.total {
      margin-top: 1rem;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--highlight-color);
    }
  }
}

// 時間線
.timeline-container {
  padding: 1rem 0;
}

// 加載中和未找到
.loading-container,
.not-found-container {
  padding: 3rem;
  text-align: center;
  background-color: var(--card-bg);
  border-radius: 12px;
}

// 響應式設計
@media (max-width: 768px) {
  .order-status-header {
    flex-direction: column;
    gap: 1rem;
    
    .order-dates {
      width: 100%;
      .date-row {
        text-align: left;
      }
    }
  }
  
  .order-id-section {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem;
    
    .order-actions {
      width: 100%;
      display: flex;
      justify-content: flex-end;
    }
  }
  
  .order-item {
    flex-direction: column;
    
    .item-image {
      margin-bottom: 1rem;
    }
    
    .item-price-info {
      width: 100%;
      text-align: left;
      flex-direction: row !important;
      justify-content: space-between;
      margin-top: 1rem;
    }
  }
}
</style> 