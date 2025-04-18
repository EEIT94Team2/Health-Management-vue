<template>
  <div class="product-detail-page dark-theme">
    <!-- 返回按鈕 -->
    <div class="back-navigation">
      <div class="section-container">
        <el-button @click="$router.push('/shop/products')" plain>
          <el-icon><ArrowLeft /></el-icon> 返回商品列表
        </el-button>
      </div>
    </div>
    
    <!-- 商品詳情 -->
    <section class="product-detail-section">
      <div class="section-container" v-if="product">
        <div class="product-wrapper">
          <!-- 商品圖片 -->
          <div class="product-gallery">
            <div class="main-image">
              <img 
                :src="getProductImageUrl(product)" 
                :alt="product.name"
                onerror="this.src='https://placehold.co/600x600/cccccc/ffffff?text=Image+Not+Found'"
              />
            </div>
          </div>
          
          <!-- 商品資訊 -->
          <div class="product-info">
            <h1 class="product-title">{{ product.name }}</h1>
            
            <div class="product-category" v-if="product.category">
              <el-tag>{{ product.category }}</el-tag>
            </div>
            
            <div class="product-price">NT$ {{ product.price }}</div>
            
            <div class="product-description">
              <h3>商品描述</h3>
              <p>{{ product.description }}</p>
            </div>
            
            <div class="product-stock">
              <span class="stock-label">庫存數量:</span>
              <span :class="['stock-quantity', product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock']">
                {{ product.stockQuantity > 0 ? product.stockQuantity + ' 件' : '售罄' }}
              </span>
            </div>
            
            <div class="product-actions">
              <div class="quantity-control">
                <span>數量:</span>
                <el-input-number 
                  v-model="quantity" 
                  :min="1" 
                  :max="product.stockQuantity"
                  :disabled="product.stockQuantity <= 0"
                ></el-input-number>
              </div>
              
              <div class="action-buttons">
                <el-button 
                  type="success" 
                  :disabled="product.stockQuantity <= 0"
                  @click="addToCart"
                  :loading="isLoading"
                >
                  <el-icon><ShoppingCart /></el-icon> 加入購物車
                </el-button>
                
                <el-button 
                  type="primary" 
                  :disabled="product.stockQuantity <= 0"
                  @click="buyNow"
                  :loading="isLoading"
                >
                  立即購買
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加載中狀態 -->
      <div class="loading-container section-container" v-if="isLoading">
        <el-skeleton style="width: 100%">
          <template #template>
            <div style="display: flex; gap: 20px;">
              <div style="width: 50%;">
                <el-skeleton-item variant="image" style="width: 100%; height: 400px;" />
              </div>
              <div style="width: 50%;">
                <el-skeleton-item variant="h1" style="width: 50%; height: 30px; margin-bottom: 20px;" />
                <el-skeleton-item variant="text" style="width: 30%; margin-bottom: 20px;" />
                <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 10px;" />
                <el-skeleton-item variant="text" style="width: 90%; margin-bottom: 10px;" />
                <el-skeleton-item variant="text" style="width: 70%; margin-bottom: 10px;" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
      
      <!-- 錯誤提示 -->
      <div class="error-container section-container" v-if="error">
        <el-empty 
          description="商品不存在或已下架" 
          image="https://placehold.co/300x300/FF5252/ffffff?text=找不到商品"
        >
          <el-button type="primary" @click="$router.push('/shop/products')">
            返回商品列表
          </el-button>
        </el-empty>
      </div>
    </section>
    
    <!-- 推薦商品 -->
    <section class="related-products-section" v-if="relatedProducts.length > 0">
      <div class="section-container">
        <h2 class="section-title">
          相關 <span class="text-highlight">推薦商品</span>
        </h2>
        
        <el-row :gutter="20" class="product-list">
          <el-col :xs="24" :sm="12" :md="6" v-for="item in relatedProducts" :key="item.id">
            <div class="product-card">
              <div class="product-image">
                <img
                  :src="getProductImageUrl(item)"
                  :alt="item.name"
                  onerror="this.src='https://placehold.co/300x300/cccccc/ffffff?text=Image+Not+Found'"
                  @click="viewProductDetail(item.id)"
                />
              </div>
              <div class="product-content">
                <h3 @click="viewProductDetail(item.id)">{{ item.name }}</h3>
                <p class="product-description">{{ truncateText(item.description, 50) }}</p>
                <div class="product-price">NT$ {{ item.price }}</div>
                <div class="product-actions">
                  <el-button type="success" @click="addRelatedToCart(item)">加入購物車</el-button>
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
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductById, addToCart, getProducts } from '@/api/shop'
import { ArrowLeft, ShoppingCart } from '@element-plus/icons-vue'

export default {
  name: 'ProductDetail',
  components: {
    ArrowLeft,
    ShoppingCart
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const product = ref(null)
    const isLoading = ref(true)
    const error = ref(false)
    const quantity = ref(1)
    const relatedProducts = ref([])
    
    // 獲取商品圖片URL的方法，處理各種可能的URL格式
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
      return 'https://placehold.co/600x600/4CAF50/ffffff?text=Product';
    };
    
    // 獲取商品詳情
    const fetchProductDetail = async () => {
      const productId = route.params.id
      if (!productId) {
        error.value = true
        isLoading.value = false
        return
      }
      
      try {
        isLoading.value = true
        const response = await getProductById(productId)
        
        if (response.data) {
          product.value = response.data
          
          // 設定默認數量
          quantity.value = 1
          
          // 獲取相關商品
          fetchRelatedProducts(response.data.category)
        } else {
          error.value = true
        }
      } catch (err) {
        console.error('獲取商品詳情失敗:', err)
        error.value = true
      } finally {
        isLoading.value = false
      }
    }
    
    // 獲取相關商品
    const fetchRelatedProducts = async (category) => {
      if (!category || !product.value) return
      
      try {
        const response = await getProducts()
        if (response.data && Array.isArray(response.data)) {
          // 篩選同類別但不是當前商品的其他產品
          const filtered = response.data
            .filter(item => 
              item.category === category && 
              item.id !== product.value.id
            )
            .map(item => ({
              ...item,
              image: item.imageUrl || 'https://placehold.co/300x300/4CAF50/ffffff?text=Product'
            }))
            .slice(0, 4) // 最多顯示4個相關商品
          
          relatedProducts.value = filtered
        }
      } catch (err) {
        console.error('獲取相關商品失敗:', err)
      }
    }
    
    // 加入購物車
    const addToCart = async () => {
      if (!product.value || isLoading.value) return
      
      try {
        isLoading.value = true
        await addToCart({
          productId: product.value.id,
          quantity: quantity.value
        }).then(() => {
          ElMessage.success(`已將 ${quantity.value} 件「${product.value.name}」加入購物車`)
        }).catch(error => {
          if (error.response && error.response.status === 401) {
            ElMessage.warning('請先登入後再加入購物車')
            router.push('/backpage/member/login')
          } else {
            ElMessage.error('加入購物車失敗，請稍後再試')
          }
        })
      } catch (err) {
        console.error('加入購物車失敗:', err)
        ElMessage.error('系統錯誤，請稍後再試')
      } finally {
        isLoading.value = false
      }
    }
    
    // 加入相關商品到購物車
    const addRelatedToCart = async (item) => {
      try {
        await addToCart({
          productId: item.id,
          quantity: 1
        }).then(() => {
          ElMessage.success(`已將「${item.name}」加入購物車`)
        }).catch(error => {
          if (error.response && error.response.status === 401) {
            ElMessage.warning('請先登入後再加入購物車')
            router.push('/backpage/member/login')
          } else {
            ElMessage.error('加入購物車失敗，請稍後再試')
          }
        })
      } catch (err) {
        console.error('加入購物車失敗:', err)
        ElMessage.error('系統錯誤，請稍後再試')
      }
    }
    
    // 立即購買
    const buyNow = async () => {
      if (!product.value || isLoading.value) return
      
      try {
        isLoading.value = true
        await addToCart({
          productId: product.value.id,
          quantity: quantity.value
        }).then(() => {
          router.push('/shop/cart')
        }).catch(error => {
          if (error.response && error.response.status === 401) {
            ElMessage.warning('請先登入後再進行購買')
            router.push('/backpage/member/login')
          } else {
            ElMessage.error('加入購物車失敗，請稍後再試')
          }
        })
      } catch (err) {
        console.error('立即購買失敗:', err)
        ElMessage.error('系統錯誤，請稍後再試')
      } finally {
        isLoading.value = false
      }
    }
    
    // 查看其他商品詳情
    const viewProductDetail = (id) => {
      if (id === product.value.id) return
      router.push(`/shop/products/${id}`)
    }
    
    // 截斷文字
    const truncateText = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }
    
    onMounted(() => {
      window.scrollTo(0, 0);
      fetchProductDetail();
    })
    
    return {
      product,
      isLoading,
      error,
      quantity,
      relatedProducts,
      addToCart,
      addRelatedToCart,
      buyNow,
      viewProductDetail,
      truncateText,
      getProductImageUrl
    }
  }
}
</script>

<style lang="scss" scoped>
.product-detail-page {
  // 深色主題變數
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --highlight-color: #10b981;
  --highlight-hover: #059669;
  --border-color: #374151;
  --card-bg: #1e293b;
  
  background-color: #111827;
  color: #f5f5f5;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding-top: 80px;
  overflow-x: hidden;
}

.text-highlight {
  color: var(--highlight-color);
  font-weight: 600;
}

.container {
  width: 100%;
  margin: 0;
  padding: 0;
}

.section-container {
  width: 100%;
  margin: 0 auto;
  padding: 0 40px;
}

// 返回導航
.back-navigation {
  padding: 2rem 0 1rem;
  
  .el-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

// 商品詳情
.product-detail-section {
  padding: 1rem 0 3rem;
}

.product-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

// 商品圖片
.product-gallery {
  flex: 1;
  min-width: 300px;
  
  .main-image {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    height: 600px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
  }
}

// 商品資訊
.product-info {
  flex: 1;
  min-width: 300px;
  
  .product-title {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .product-category {
    margin-bottom: 1.5rem;
  }
  
  .product-price {
    font-size: 2rem;
    font-weight: 700;
    color: var(--highlight-color);
    margin-bottom: 1.5rem;
  }
  
  .product-description {
    margin-bottom: 2rem;
    
    h3 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }
    
    p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }
  
  .product-stock {
    margin-bottom: 1.5rem;
    
    .stock-label {
      margin-right: 0.5rem;
    }
    
    .stock-quantity {
      &.in-stock {
        color: var(--highlight-color);
      }
      
      &.out-of-stock {
        color: #ef4444;
      }
    }
  }
  
  .product-actions {
    .quantity-control {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: flex-start;
      
      .el-button {
        min-width: 120px;
        width: auto;
        padding-left: 20px;
        padding-right: 20px;
      }
    }
  }
}

// 相關商品
.related-products-section {
  padding: 3rem 0;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
}

.product-list {
  margin-top: 2rem;
}

.product-card {
  background-color: var(--card-bg);
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
        color: var(--highlight-color);
      }
    }
    
    .product-description {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 1rem;
      flex: 1;
    }
    
    .product-price {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--highlight-color);
    }
  }
}

// 加載和錯誤
.loading-container,
.error-container {
  padding: 4rem 0;
  text-align: center;
}

@media (max-width: 768px) {
  .product-wrapper {
    flex-direction: column;
  }
  
  .product-info .product-actions .action-buttons {
    flex-direction: column;
  }
}
</style> 