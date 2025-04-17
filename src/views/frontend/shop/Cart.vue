<template>
  <div class="cart-page">
    <!-- 頁面標題 -->
    <section class="page-header">
      <div class="section-container">
        <h1>我的 <span class="text-highlight">購物車</span></h1>
        <p>查看已選商品，完成結帳流程</p>
      </div>
    </section>

    <!-- 購物車內容 -->
    <section class="cart-section">
      <div class="section-container">
        <!-- 有商品時的購物車表格 -->
        <div v-if="cartItems.length > 0 && !isLoading">
          <div class="cart-table">
            <div class="cart-header">
              <div class="cart-column product-info">商品</div>
              <div class="cart-column product-price">單價</div>
              <div class="cart-column product-quantity">數量</div>
              <div class="cart-column product-total">小計</div>
              <div class="cart-column product-action">操作</div>
            </div>
            
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <div class="cart-column product-info">
                <div class="product-image">
                  <img 
                    :src="getProductImageUrl(item.product)" 
                    :alt="item.product.name"
                    onerror="this.src='https://placehold.co/100x100/cccccc/ffffff?text=Image+Not+Found'"
                  />
                </div>
                <div class="product-details">
                  <div class="product-name" @click="viewProductDetail(item.product.id)">
                    {{ item.product.name }}
                  </div>
                  <div v-if="item.product.category" class="product-category">
                    <el-tag size="small">{{ item.product.category }}</el-tag>
                  </div>
                </div>
              </div>
              
              <div class="cart-column product-price">
                NT$ {{ item.product.price }}
              </div>
              
              <div class="cart-column product-quantity">
                <el-input-number 
                  v-model="item.quantity" 
                  :min="1" 
                  :max="item.product.stockQuantity"
                  size="small"
                  @change="(val) => updateQuantity(item.id, val)"
                ></el-input-number>
              </div>
              
              <div class="cart-column product-total">
                NT$ {{ calculateItemTotal(item) }}
              </div>
              
              <div class="cart-column product-action">
                <el-button 
                  type="danger" 
                  size="small" 
                  plain
                  @click="removeItem(item.id)"
                  :loading="removingItem === item.id"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 購物車摘要和結帳按鈕 -->
          <div class="cart-summary">
            <div class="cart-total">
              <div class="total-row">
                <span>商品總數：</span>
                <span>{{ cartItems.length }} 件</span>
              </div>
              <div class="total-row">
                <span>商品總額：</span>
                <span class="total-price">NT$ {{ cartTotal }}</span>
              </div>
            </div>
            
            <div class="cart-actions">
              <el-button @click="$router.push('/shop/products')">
                <el-icon><ArrowLeft /></el-icon> 繼續購物
              </el-button>
              <el-button type="danger" @click="clearCart" :loading="isClearing">
                <el-icon><Delete /></el-icon> 清空購物車
              </el-button>
              <el-button type="success" @click="checkout" :loading="isCheckingOut">
                去結帳 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 加載中狀態 -->
        <div class="loading-container" v-if="isLoading">
          <el-skeleton style="width: 100%" :rows="4" animated />
        </div>
        
        <!-- 空購物車提示 -->
        <div class="empty-cart" v-if="cartItems.length === 0 && !isLoading">
          <el-empty description="您的購物車還是空的">
            <el-button type="primary" @click="$router.push('/shop/products')">
              立即去購物
            </el-button>
          </el-empty>
        </div>
      </div>
    </section>
    
    <!-- 相關推薦商品 -->
    <section class="recommended-products" v-if="recommendedProducts.length > 0">
      <div class="section-container">
        <h2 class="section-title">
          為您 <span class="text-highlight">推薦</span>
        </h2>
        
        <el-row :gutter="20" class="product-list">
          <el-col :xs="24" :sm="12" :md="6" v-for="product in recommendedProducts" :key="product.id">
            <div class="product-card">
              <div class="product-image">
                <img
                  :src="product.imageUrl || 'https://placehold.co/300x300/4CAF50/ffffff?text=Product'"
                  :alt="product.name"
                  onerror="this.src='https://placehold.co/300x300/cccccc/ffffff?text=Image+Not+Found'"
                  @click="viewProductDetail(product.id)"
                />
              </div>
              <div class="product-content">
                <h3 @click="viewProductDetail(product.id)">{{ product.name }}</h3>
                <p class="product-description">{{ truncateText(product.description, 50) }}</p>
                <div class="product-price">NT$ {{ product.price }}</div>
                <div class="product-actions">
                  <el-button type="success" @click="addToCart(product)">
                    加入購物車
                  </el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCartItems, updateCartItemQuantity, removeFromCart, clearCart as apiClearCart, calculateCartTotal, addToCart, getProducts } from '@/api/shop'
import { ArrowLeft, ArrowRight, Delete } from '@element-plus/icons-vue'

export default {
  name: 'Cart',
  components: {
    ArrowLeft,
    ArrowRight,
    Delete
  },
  setup() {
    const router = useRouter()
    const cartItems = ref([])
    const recommendedProducts = ref([])
    const isLoading = ref(true)
    const isClearing = ref(false)
    const isCheckingOut = ref(false)
    const removingItem = ref(null)
    
    // 獲取購物車內容
    const fetchCartItems = async () => {
      try {
        isLoading.value = true
        const response = await getCartItems()
        if (response.data && Array.isArray(response.data)) {
          cartItems.value = response.data
          
          // 獲取推薦商品
          fetchRecommendedProducts()
        }
      } catch (error) {
        console.error('獲取購物車失敗:', error)
        if (error.response && error.response.status === 401) {
          ElMessage.warning('請先登入後再查看購物車')
          router.push('/backpage/member/login')
        } else {
          ElMessage.error('無法載入購物車，請稍後再試')
        }
      } finally {
        isLoading.value = false
      }
    }
    
    // 獲取推薦商品
    const fetchRecommendedProducts = async () => {
      try {
        const response = await getProducts({ sort: 'popular', limit: 4 })
        if (response.data && Array.isArray(response.data)) {
          // 過濾掉已經在購物車中的商品
          const cartProductIds = cartItems.value.map(item => item.product.id)
          recommendedProducts.value = response.data
            .filter(product => !cartProductIds.includes(product.id))
            .slice(0, 4)
        }
      } catch (error) {
        console.error('獲取推薦商品失敗:', error)
      }
    }
    
    // 更新商品數量
    const updateQuantity = async (itemId, newQuantity) => {
      try {
        await updateCartItemQuantity(itemId, newQuantity)
        ElMessage.success('購物車已更新')
      } catch (error) {
        console.error('更新數量失敗:', error)
        ElMessage.error('更新失敗，請稍後再試')
        fetchCartItems() // 重新獲取購物車以還原數據
      }
    }
    
    // 移除商品
    const removeItem = async (itemId) => {
      try {
        removingItem.value = itemId
        
        await ElMessageBox.confirm('確定要從購物車中移除此商品嗎？', '提示', {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await removeFromCart(itemId)
        ElMessage.success('已從購物車移除')
        
        // 更新購物車列表
        cartItems.value = cartItems.value.filter(item => item.id !== itemId)
        
        // 如果購物車空了，重新獲取推薦商品
        if (cartItems.value.length === 0) {
          fetchRecommendedProducts()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('移除商品失敗:', error)
          ElMessage.error('移除失敗，請稍後再試')
        }
      } finally {
        removingItem.value = null
      }
    }
    
    // 清空購物車
    const clearCart = async () => {
      try {
        await ElMessageBox.confirm('確定要清空購物車嗎？此操作不可撤銷。', '警告', {
          confirmButtonText: '確定清空',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        isClearing.value = true
        await apiClearCart()
        cartItems.value = []
        ElMessage.success('購物車已清空')
        
        // 重新獲取推薦商品
        fetchRecommendedProducts()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('清空購物車失敗:', error)
          ElMessage.error('操作失敗，請稍後再試')
        }
      } finally {
        isClearing.value = false
      }
    }
    
    // 前往結帳
    const checkout = () => {
      isCheckingOut.value = true
      setTimeout(() => {
        router.push('/shop/checkout')
        isCheckingOut.value = false
      }, 500)
    }
    
    // 查看商品詳情
    const viewProductDetail = (productId) => {
      router.push(`/shop/products/${productId}`)
    }
    
    // 添加推薦商品到購物車
    const addToCart = async (product) => {
      try {
        await addToCart({
          productId: product.id,
          quantity: 1
        })
        ElMessage.success(`已將「${product.name}」加入購物車`)
        
        // 重新加載購物車
        fetchCartItems()
      } catch (error) {
        console.error('加入購物車失敗:', error)
        ElMessage.error('加入購物車失敗，請稍後再試')
      }
    }
    
    // 計算購物車總金額
    const cartTotal = computed(() => {
      return cartItems.value
        .reduce((total, item) => total + (item.product.price * item.quantity), 0)
        .toFixed(2)
    })
    
    // 計算單項商品總金額
    const calculateItemTotal = (item) => {
      return (item.product.price * item.quantity).toFixed(2)
    }
    
    // 截斷文字
    const truncateText = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }
    
    // 獲取商品圖片URL的方法
    const getProductImageUrl = (product) => {
      if (!product) return '';
      
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
      return 'https://placehold.co/300x300/4CAF50/ffffff?text=Product';
    };
    
    onMounted(() => {
      window.scrollTo(0, 0);
      fetchCartItems();
    })
    
    return {
      cartItems,
      recommendedProducts,
      isLoading,
      isClearing,
      isCheckingOut,
      removingItem,
      cartTotal,
      updateQuantity,
      removeItem,
      clearCart,
      checkout,
      viewProductDetail,
      addToCart,
      calculateItemTotal,
      truncateText,
      getProductImageUrl
    }
  }
}
</script>

<style lang="scss" scoped>
.dark-theme {
  // 深色主題變數
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --highlight-color: #10b981;
  --button-color: #10b981;
  --button-hover: #059669;
  --border-color: #374151;
  --card-bg: #1e293b;
  
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  padding-top: 80px; /* 為導航欄預留空間 */
}

.cart-page {
  background-color: #111827;
  color: #f5f5f5;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding-top: 80px; /* 為導航欄預留空間 */
  overflow-x: hidden;
}

.text-highlight {
  color: #10b981;
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
    color: #9ca3af;
    max-width: 800px;
    margin: 0 auto;
  }
}

// 購物車表格
.cart-section {
  padding-bottom: 4rem;
}

.cart-table {
  background-color: #1f2937;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.cart-header {
  display: flex;
  padding: 1rem;
  background-color: #111827;
  font-weight: 600;
  text-align: center;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #374151;
  
  &:last-child {
    border-bottom: none;
  }
}

.cart-column {
  &.product-info {
    flex: 3;
    display: flex;
    align-items: center;
    text-align: left;
  }
  
  &.product-price,
  &.product-quantity,
  &.product-total,
  &.product-action {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 1rem;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.product-details {
  .product-name {
    font-weight: 600;
    margin-bottom: 0.5rem;
    cursor: pointer;
    
    &:hover {
      color: #10b981;
    }
  }
  
  .product-category {
    margin-top: 0.5rem;
  }
}

// 購物車摘要
.cart-summary {
  background-color: #1f2937;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.cart-total {
  .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    
    &:last-child {
      margin-top: 1rem;
      font-size: 1.5rem;
      font-weight: 700;
      
      .total-price {
        color: #10b981;
      }
    }
  }
}

.cart-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

// 推薦商品區
.recommended-products {
  padding: 4rem 0;
  background-color: #1f2937;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  text-align: center;
}

.product-list {
  margin-top: 1rem;
}

.product-card {
  background-color: #1f2937;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  margin-bottom: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
  
  .product-image {
    height: 200px;
    overflow: hidden;
    cursor: pointer;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.5s;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
  
  .product-content {
    padding: 1.2rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    
    h3 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      cursor: pointer;
      
      &:hover {
        color: #10b981;
      }
    }
    
    .product-description {
      color: #9ca3af;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      flex: 1;
    }
    
    .product-price {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #10b981;
    }
  }
}

// 加載中狀態和空購物車
.loading-container,
.empty-cart {
  padding: 3rem;
  text-align: center;
  background-color: #1f2937;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .cart-header {
    display: none;
  }
  
  .cart-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .cart-column {
    width: 100%;
    justify-content: flex-start;
    
    &.product-info {
      flex-direction: column;
      align-items: center;
    }
    
    &.product-price,
    &.product-quantity,
    &.product-total,
    &.product-action {
      justify-content: center;
    }
  }
  
  .product-image {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .product-details {
    text-align: center;
  }
  
  .cart-summary {
    flex-direction: column;
    
    .cart-total {
      width: 100%;
    }
    
    .cart-actions {
      width: 100%;
      justify-content: center;
    }
  }
}
</style> 