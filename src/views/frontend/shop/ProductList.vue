<template>
  <div class="product-list-page dark-theme">
    <!-- 頁面標題 -->
    <section class="title-section">
      <div>
        <h1 class="main-title">健康 <span class="text-highlight">精選商品</span></h1>
        <p class="subtitle">專業健身設備和營養品，助您達成健康目標</p>
      </div>
    </section>

    <!-- 篩選搜尋區 -->
    <section class="search-section">
      <div class="section-container">
        <div class="search-container">
          <el-input 
            v-model="keyword" 
            placeholder="搜尋商品名稱" 
            :prefix-icon="Search"
            clearable
            @keyup.enter="searchProducts"
          >
            <template #append>
              <el-button :icon="Search" @click="searchProducts" />
            </template>
          </el-input>
          <el-button type="primary" @click="goToCart">
            <el-icon><ShoppingCart /></el-icon> 購物車
          </el-button>
        </div>
      </div>
    </section>

    <!-- 分類商品區域 -->
    <section v-for="category in displayCategories" :key="category.value" class="category-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">
            {{ category.label }} <span class="text-highlight">專區</span>
          </h2>
          <el-button v-if="getCategoryProducts(category.value).length > 4" link type="primary" @click="viewAllInCategory(category.value)">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="1" animated>
            <template #template>
              <div style="display: flex; justify-content: space-between; gap: 20px;">
                <el-skeleton-item v-for="i in 4" :key="i" variant="image" style="width: 240px; height: 240px" />
              </div>
            </template>
          </el-skeleton>
        </div>
        
        <div v-else-if="getCategoryProducts(category.value).length === 0" class="empty-category">
          <el-empty description="該分類下暫無商品" />
        </div>
        
        <div v-else class="product-grid">
          <div 
            v-for="product in displayCategoryProducts(category.value)" 
            :key="product.id" 
            class="product-card"
            @click="goToProductDetail(product.id)"
          >
            <div class="product-image">
              <img 
                :src="getProductImageUrl(product)" 
                :alt="product.name"
                onerror="this.src='https://placehold.co/300x300/cccccc/ffffff?text=Image+Not+Found'"
              />
              <div v-if="product.discount > 0" class="discount-badge">
                {{ product.discount }}% OFF
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ truncateText(product.description, 60) }}</p>
              <div class="product-price">
                <span v-if="product.discount > 0" class="original-price">NT$ {{ product.price }}</span>
                <span class="current-price">NT$ {{ calculateDiscountedPrice(product) }}</span>
              </div>
              <el-button 
                type="success" 
                class="add-to-cart-btn"
                @click.stop="addToCart(product)"
                :disabled="product.stockQuantity <= 0"
              >
                加入購物車
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProducts, addToCart } from '@/api/shop'
import { Search, ShoppingCart, ArrowRight } from '@element-plus/icons-vue'

export default {
  name: 'ProductList',
  components: {
    Search,
    ShoppingCart,
    ArrowRight
  },
  setup() {
    const router = useRouter()
    const products = ref([])
    const loading = ref(false)
    const keyword = ref('')
    const selectedCategory = ref('')
    
    // 分類選項
    const categoryOptions = ref([
      { value: 'protein', label: '蛋白粉' },
      { value: 'preworkout', label: '增肌粉' },
      { value: 'creatine', label: '肌酸' },
      { value: 'equipment', label: '健身器材' },
      { value: 'accessories', label: '健身配件' },
      { value: 'yoga', label: '瑜伽用品' }
    ])
    
    // 計算需要顯示的分類
    const displayCategories = computed(() => {
      if (selectedCategory.value) {
        return categoryOptions.value.filter(cat => cat.value === selectedCategory.value)
      } else if (keyword.value) {
        // 當有搜尋關鍵字時，顯示所有分類
        return [{ value: '', label: '搜尋結果' }]
      } else {
        return categoryOptions.value
      }
    })
    
    // 獲取指定分類的商品
    const getCategoryProducts = (category) => {
      if (!category) {
        return products.value.filter(p => 
          p.name.toLowerCase().includes(keyword.value.toLowerCase()) || 
          (p.description && p.description.toLowerCase().includes(keyword.value.toLowerCase()))
        )
      }
      return products.value.filter(p => p.category === category)
    }
    
    // 獲取需要顯示的分類商品
    const displayCategoryProducts = (category) => {
      const categoryProducts = getCategoryProducts(category)
      // 當特別選擇某個分類或搜尋時，顯示全部結果；否則只顯示前4個
      if (selectedCategory.value || keyword.value) {
        return categoryProducts
      }
      return categoryProducts.slice(0, 4)
    }
    
    // 計算折扣價格
    const calculateDiscountedPrice = (product) => {
      if (!product.discount) return product.price
      return Math.round(product.price * (1 - product.discount / 100))
    }

    // 截斷文本
    const truncateText = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    // 獲取商品圖片URL的方法，處理各種可能的URL格式
    const getProductImageUrl = (product) => {
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
      
      // 如果所有嘗試都失敗，使用默認顏色佔位圖
      const colors = {
        'protein': '4CAF50',
        'preworkout': 'FF9800',
        'creatine': '2196F3',
        'equipment': 'FF5722',
        'accessories': '9C27B0',
        'yoga': '3F51B5'
      };
      
      const color = colors[product.category] || '4CAF50';
      return `https://placehold.co/400x300/${color}/ffffff?text=${encodeURIComponent(product.name)}`;
    };

    // 加載所有商品
    const loadAllProducts = async () => {
      try {
        loading.value = true
        
        const res = await getProducts({
          page: 0,
          size: 100, // 獲取大量商品
          keyword: keyword.value
        })
        
        if (res && res.data) {
          if (Array.isArray(res.data)) {
            products.value = res.data
          } else if (res.data.content && Array.isArray(res.data.content)) {
            products.value = res.data.content
          } else {
            // 使用示例數據
            useExampleProducts()
          }
        } else {
          useExampleProducts()
        }
      } catch (error) {
        console.error('Failed to load products:', error)
        ElMessage.error('載入商品列表失敗，使用示例數據')
        useExampleProducts()
      } finally {
        loading.value = false
      }
    }
    
    // 使用示例數據
    const useExampleProducts = () => {
      products.value = [
        { id: 1, name: '蛋白粉', description: '乳清蛋白粉，巧克力口味', price: 1200, category: 'protein', stockQuantity: 20, imageUrl: null, discount: 0 },
        { id: 2, name: '健身手套', description: '防滑透氣健身手套', price: 450, category: 'accessories', stockQuantity: 30, imageUrl: null, discount: 10 },
        { id: 3, name: '瑜伽墊', description: '加厚防滑瑜伽墊', price: 800, category: 'yoga', stockQuantity: 15, imageUrl: null, discount: 5 },
        { id: 4, name: '啞鈴組', description: '可調節重量啞鈴組', price: 2500, category: 'equipment', stockQuantity: 10, imageUrl: null, discount: 0 },
        { id: 5, name: '彈力帶', description: '5種阻力強力彈帶組', price: 600, category: 'accessories', stockQuantity: 25, imageUrl: null, discount: 0 },
        { id: 6, name: '跳繩', description: '競速跳繩', price: 300, category: 'accessories', stockQuantity: 0, imageUrl: null, discount: 0 },
        { id: 7, name: '增肌粉', description: '高熱量增肌粉，香草口味', price: 1400, category: 'preworkout', stockQuantity: 18, imageUrl: null, discount: 0 },
        { id: 8, name: '肌酸粉', description: '純肌酸粉，增加爆發力', price: 900, category: 'creatine', stockQuantity: 22, imageUrl: null, discount: 15 }
      ]
    }

    // 搜索商品
    const searchProducts = () => {
      selectedCategory.value = ''
      loadAllProducts()
    }

    // 查看分類下全部商品
    const viewAllInCategory = (category) => {
      selectedCategory.value = category
      keyword.value = ''
    }

    // 前往商品詳情頁
    const goToProductDetail = (productId) => {
      router.push(`/shop/products/${productId}`)
    }

    // 前往購物車頁面
    const goToCart = () => {
      router.push('/shop/cart')
    }

    // 添加到購物車
    const addToCart = async (product) => {
      try {
        if (product.stockQuantity <= 0) {
          ElMessage.warning('該商品目前無庫存')
          return
        }
        
        await addToCart({
          productId: product.id,
          quantity: 1
        })
        ElMessage.success('成功加入購物車')
      } catch (error) {
        console.error('Failed to add to cart:', error)
        if (error.response && error.response.status === 401) {
          ElMessage.warning('請先登入後再加入購物車')
          router.push('/backpage/member/login')
        } else {
          ElMessage.error('加入購物車失敗')
        }
      }
    }

    // 初始化
    onMounted(() => {
      loadAllProducts()
    })

    return {
      products,
      loading,
      keyword,
      selectedCategory,
      categoryOptions,
      displayCategories,
      getCategoryProducts,
      displayCategoryProducts,
      calculateDiscountedPrice,
      truncateText,
      getProductImageUrl,
      searchProducts,
      viewAllInCategory,
      goToProductDetail,
      goToCart,
      addToCart
    }
  }
}
</script>

<style lang="scss" scoped>
.product-list-page {
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
.title-section {
  padding: 3rem 0;
  text-align: center;
  
  .main-title {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    display: inline-block;
  }
  
  .subtitle {
    font-size: 1.2rem;
    color: #9ca3af;
    max-width: 800px;
    margin: 0 auto;
  }
}

// 搜尋區域
.search-section {
  padding-bottom: 2rem;
  
  .search-container {
    display: flex;
    gap: 1rem;
    max-width: 800px;
    margin: 0 auto;
    
    .el-input {
      flex: 1;
    }
  }
}

// 分類區域
.category-section {
  padding: 2.5rem 0;
  
  &:nth-child(odd) {
    background-color: #1f2937;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    
    .section-title {
      font-size: 1.8rem;
      margin: 0;
    }
  }
}

// 商品網格
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

// 商品卡片
.product-card {
  background-color: #1e293b;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
  
  .product-image {
    height: 220px;
    position: relative;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    
    .discount-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: #ef4444;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-weight: bold;
    }
  }
  
  .product-info {
    padding: 1.2rem;
    
    .product-name {
      font-size: 1.2rem;
      margin-top: 0;
      margin-bottom: 0.5rem;
    }
    
    .product-description {
      color: #9ca3af;
      margin-bottom: 1rem;
      height: 40px;
    }
    
    .product-price {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      
      .original-price {
        color: #9ca3af;
        text-decoration: line-through;
        margin-right: 10px;
        font-size: 0.9rem;
      }
      
      .current-price {
        color: #10b981;
        font-size: 1.3rem;
        font-weight: bold;
      }
    }
    
    .add-to-cart-btn {
      width: 100%;
    }
  }
}

// 加載和空狀態
.loading-container,
.empty-category {
  padding: 2rem 0;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 響應式設計
@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }
  
  .section-container {
    padding: 0 20px;
  }
  
  .search-container {
    flex-direction: column;
  }
  
  .category-section .section-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}
</style> 