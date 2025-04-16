<template>
  <div class="checkout-page dark-theme">
    <!-- 頁面標題 -->
    <section class="page-header">
      <div class="container">
        <h1>訂單 <span class="text-highlight">結帳</span></h1>
        <p>完成您的購物流程，確認訂單並付款</p>
      </div>
    </section>

    <!-- 結帳流程 -->
    <section class="checkout-section">
      <div class="container">
        <!-- 步驟指示器 -->
        <div class="checkout-steps">
          <el-steps :active="currentStep" finish-status="success" simple>
            <el-step title="確認購物車" />
            <el-step title="填寫資訊" />
            <el-step title="確認訂單" />
            <el-step title="完成付款" />
          </el-steps>
        </div>

        <!-- 載入中 -->
        <div class="loading-container" v-if="isLoading">
          <el-skeleton style="width: 100%" :rows="10" animated />
        </div>

        <!-- 步驟1: 購物車確認 -->
        <div v-if="currentStep === 0 && !isLoading">
          <div class="step-container">
            <h2 class="step-title">確認購物清單</h2>

            <div class="cart-items" v-if="cartItems.length > 0">
              <div class="cart-table">
                <div class="cart-header">
                  <div class="cart-column product-info">商品</div>
                  <div class="cart-column product-price">單價</div>
                  <div class="cart-column product-quantity">數量</div>
                  <div class="cart-column product-total">小計</div>
                </div>

                <div v-for="item in cartItems" :key="item.id" class="cart-item">
                  <div class="cart-column product-info">
                    <div class="product-image">
                      <img 
                        :src="item.product.imageUrl || 'https://placehold.co/100x100/4CAF50/ffffff?text=Product'" 
                        :alt="item.product.name"
                        onerror="this.src='https://placehold.co/100x100/cccccc/ffffff?text=Image+Not+Found'"
                      />
                    </div>
                    <div class="product-details">
                      <div class="product-name">{{ item.product.name }}</div>
                      <div v-if="item.product.category" class="product-category">
                        <el-tag size="small">{{ item.product.category }}</el-tag>
                      </div>
                    </div>
                  </div>

                  <div class="cart-column product-price">
                    NT$ {{ item.product.price }}
                  </div>

                  <div class="cart-column product-quantity">
                    {{ item.quantity }}
                  </div>

                  <div class="cart-column product-total">
                    NT$ {{ calculateItemTotal(item) }}
                  </div>
                </div>
              </div>

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
              </div>

              <div class="step-actions">
                <el-button @click="goToCart">返回購物車</el-button>
                <el-button type="primary" @click="nextStep">下一步</el-button>
              </div>
            </div>

            <div class="empty-cart" v-else>
              <el-empty description="您的購物車是空的">
                <el-button type="primary" @click="$router.push('/shop/products')">
                  立即去購物
                </el-button>
              </el-empty>
            </div>
          </div>
        </div>

        <!-- 步驟2: 填寫訂單資訊 -->
        <div v-if="currentStep === 1 && !isLoading">
          <div class="step-container">
            <h2 class="step-title">填寫訂單資訊</h2>

            <el-form 
              ref="orderFormRef" 
              :model="orderForm" 
              :rules="orderRules" 
              label-position="top"
              class="order-form"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="收件人姓名" prop="receiverName">
                    <el-input v-model="orderForm.receiverName" placeholder="請輸入收件人姓名" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="聯絡電話" prop="receiverPhone">
                    <el-input v-model="orderForm.receiverPhone" placeholder="請輸入聯絡電話" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="送貨地址" prop="shippingAddress">
                <el-input 
                  v-model="orderForm.shippingAddress" 
                  type="textarea" 
                  placeholder="請輸入完整送貨地址"
                  :rows="2"
                />
              </el-form-item>

              <el-form-item label="付款方式" prop="paymentMethod">
                <el-radio-group v-model="orderForm.paymentMethod">
                  <el-radio-button label="credit_card">信用卡</el-radio-button>
                  <el-radio-button label="bank_transfer">銀行轉帳</el-radio-button>
                  <el-radio-button label="cash_on_delivery">貨到付款</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="備註" prop="note">
                <el-input 
                  v-model="orderForm.note" 
                  type="textarea" 
                  placeholder="有什麼需要告訴我們的嗎？"
                  :rows="3"
                />
              </el-form-item>
            </el-form>

            <div class="step-actions">
              <el-button @click="prevStep">上一步</el-button>
              <el-button type="primary" @click="submitOrderForm">下一步</el-button>
            </div>
          </div>
        </div>

        <!-- 步驟3: 確認訂單 -->
        <div v-if="currentStep === 2 && !isLoading">
          <div class="step-container">
            <h2 class="step-title">確認訂單詳情</h2>

            <div class="order-summary">
              <div class="summary-section">
                <h3>訂單摘要</h3>
                <div class="summary-row">
                  <span>商品總額</span>
                  <span>NT$ {{ cartTotal }}</span>
                </div>
                <div class="summary-row">
                  <span>運費</span>
                  <span>NT$ {{ shippingFee }}</span>
                </div>
                <div class="summary-row total">
                  <span>應付總額</span>
                  <span>NT$ {{ orderTotal }}</span>
                </div>
              </div>

              <div class="summary-section">
                <h3>收件人資訊</h3>
                <div class="summary-row">
                  <span>收件人</span>
                  <span>{{ orderForm.receiverName }}</span>
                </div>
                <div class="summary-row">
                  <span>聯絡電話</span>
                  <span>{{ orderForm.receiverPhone }}</span>
                </div>
                <div class="summary-row">
                  <span>送貨地址</span>
                  <span>{{ orderForm.shippingAddress }}</span>
                </div>
              </div>

              <div class="summary-section">
                <h3>付款方式</h3>
                <div class="summary-row">
                  <span>{{ getPaymentMethodLabel(orderForm.paymentMethod) }}</span>
                </div>
              </div>

              <div class="summary-section" v-if="orderForm.note">
                <h3>備註</h3>
                <div class="summary-row">
                  <span>{{ orderForm.note }}</span>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <el-button @click="prevStep">上一步</el-button>
              <el-button type="success" @click="createOrder" :loading="isCreatingOrder">確認下單</el-button>
            </div>
          </div>
        </div>

        <!-- 步驟4: 訂單完成 -->
        <div v-if="currentStep === 3 && !isLoading">
          <div class="step-container">
            <div class="order-success">
              <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
              <h2>訂單已成功提交！</h2>
              <p>訂單編號：{{ createdOrderId }}</p>
              <p>感謝您的購買，我們會盡快處理您的訂單</p>
              
              <div class="success-actions">
                <el-button @click="$router.push(`/shop/orders/${createdOrderId}`)">查看訂單</el-button>
                <el-button type="primary" @click="$router.push('/shop/products')">繼續購物</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCartItems, createOrder as apiCreateOrder, createOrderFromCart } from '@/api/shop'
import { CircleCheckFilled } from '@element-plus/icons-vue'

export default {
  name: 'Checkout',
  components: {
    CircleCheckFilled
  },
  setup() {
    const router = useRouter()
    const currentStep = ref(0)
    const isLoading = ref(true)
    const cartItems = ref([])
    const isCreatingOrder = ref(false)
    const createdOrderId = ref('')
    const orderFormRef = ref(null)
    
    // 訂單表單
    const orderForm = reactive({
      receiverName: '',
      receiverPhone: '',
      shippingAddress: '',
      paymentMethod: 'credit_card',
      note: ''
    })
    
    // 表單驗證規則
    const orderRules = {
      receiverName: [
        { required: true, message: '請輸入收件人姓名', trigger: 'blur' },
        { min: 2, message: '姓名長度至少為2個字符', trigger: 'blur' }
      ],
      receiverPhone: [
        { required: true, message: '請輸入聯絡電話', trigger: 'blur' },
        { pattern: /^[0-9-]{7,15}$/, message: '請輸入有效的電話號碼', trigger: 'blur' }
      ],
      shippingAddress: [
        { required: true, message: '請輸入送貨地址', trigger: 'blur' },
        { min: 8, message: '地址長度至少為8個字符', trigger: 'blur' }
      ],
      paymentMethod: [
        { required: true, message: '請選擇付款方式', trigger: 'change' }
      ]
    }
    
    // 運費計算
    const shippingFee = ref(100)
    
    // 計算購物車總金額
    const cartTotal = computed(() => {
      return cartItems.value
        .reduce((total, item) => total + (item.product.price * item.quantity), 0)
        .toFixed(2)
    })
    
    // 計算訂單總金額
    const orderTotal = computed(() => {
      return (parseFloat(cartTotal.value) + shippingFee.value).toFixed(2)
    })
    
    // 獲取購物車內容
    const fetchCartItems = async () => {
      try {
        isLoading.value = true
        const response = await getCartItems()
        if (response.data && Array.isArray(response.data)) {
          cartItems.value = response.data
          
          if (cartItems.value.length === 0) {
            ElMessage.warning('您的購物車是空的，無法進行結帳')
            router.push('/shop/cart')
          }
        }
      } catch (error) {
        console.error('獲取購物車失敗:', error)
        if (error.response && error.response.status === 401) {
          ElMessage.warning('請先登入後再進行結帳')
          router.push('/backpage/member/login')
        } else {
          ElMessage.error('無法載入購物車，請稍後再試')
          router.push('/shop/cart')
        }
      } finally {
        isLoading.value = false
      }
    }
    
    // 計算單項商品總金額
    const calculateItemTotal = (item) => {
      return (item.product.price * item.quantity).toFixed(2)
    }
    
    // 下一步
    const nextStep = () => {
      if (currentStep.value < 3) {
        currentStep.value++
      }
    }
    
    // 上一步
    const prevStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }
    
    // 返回購物車
    const goToCart = () => {
      router.push('/shop/cart')
    }
    
    // 驗證訂單表單
    const submitOrderForm = async () => {
      if (!orderFormRef.value) return
      
      await orderFormRef.value.validate((valid) => {
        if (valid) {
          nextStep()
        } else {
          ElMessage.error('請填寫必要的訂單資訊')
        }
      })
    }
    
    // 付款方式標籤
    const getPaymentMethodLabel = (method) => {
      const methods = {
        credit_card: '信用卡支付',
        bank_transfer: '銀行轉帳',
        cash_on_delivery: '貨到付款'
      }
      return methods[method] || method
    }
    
    // 創建訂單
    const createOrder = async () => {
      try {
        isCreatingOrder.value = true
        
        // 從購物車創建訂單
        const response = await createOrderFromCart()
        
        if (response && response.data) {
          createdOrderId.value = response.data.id
          
          // 清除訂單表單數據
          Object.keys(orderForm).forEach(key => {
            orderForm[key] = key === 'paymentMethod' ? 'credit_card' : ''
          })
          
          nextStep() // 前往完成頁面
          
          // 清空購物車後的處理
          cartItems.value = []
        } else {
          throw new Error('未能獲取訂單ID')
        }
      } catch (error) {
        console.error('創建訂單失敗:', error)
        ElMessage.error('訂單提交失敗，請稍後再試')
      } finally {
        isCreatingOrder.value = false
      }
    }
    
    onMounted(() => {
      fetchCartItems()
    })
    
    return {
      currentStep,
      isLoading,
      cartItems,
      orderForm,
      orderRules,
      orderFormRef,
      shippingFee,
      cartTotal,
      orderTotal,
      isCreatingOrder,
      createdOrderId,
      calculateItemTotal,
      nextStep,
      prevStep,
      goToCart,
      submitOrderForm,
      getPaymentMethodLabel,
      createOrder
    }
  }
}
</script>

<style lang="scss" scoped>
.checkout-page {
  padding-top: 80px; /* 為導航欄留出空間 */
  min-height: 100vh;
  background-color: #121b24;
  color: #f5f5f5;
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

// 結帳流程
.checkout-section {
  padding-bottom: 4rem;
}

.checkout-steps {
  margin-bottom: 3rem;
}

.step-container {
  background-color: var(--card-bg);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.step-title {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

// 購物車表格
.cart-table {
  width: 100%;
  margin-bottom: 2rem;
}

.cart-header {
  display: flex;
  padding: 1rem;
  background-color: var(--bg-secondary);
  font-weight: 600;
  text-align: center;
  border-radius: 8px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  
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
  &.product-total {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.product-image {
  width: 60px;
  height: 60px;
  margin-right: 1rem;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.product-details {
  .product-name {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .product-category {
    margin-top: 0.5rem;
  }
}

// 購物車摘要
.cart-summary {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.cart-total {
  .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    
    &:last-child {
      margin-top: 1rem;
      font-size: 1.2rem;
      font-weight: 700;
      
      .total-price {
        color: var(--highlight-color);
      }
    }
  }
}

// 訂單表單
.order-form {
  margin-bottom: 2rem;
}

// 訂單摘要
.order-summary {
  .summary-section {
    margin-bottom: 2rem;
    
    h3 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      color: var(--highlight-color);
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-color);
      
      &.total {
        margin-top: 1rem;
        font-size: 1.2rem;
        font-weight: 700;
        border-bottom: none;
        color: var(--highlight-color);
      }
    }
  }
}

// 訂單成功
.order-success {
  text-align: center;
  padding: 2rem 0;
  
  .success-icon {
    font-size: 5rem;
    color: var(--highlight-color);
    margin-bottom: 2rem;
  }
  
  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
    
    &:first-of-type {
      font-size: 1.2rem;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }
  }
  
  .success-actions {
    margin-top: 2rem;
  }
}

// 步驟按鈕
.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

// 空購物車
.empty-cart {
  padding: 3rem;
  text-align: center;
}

// 加載中
.loading-container {
  padding: 2rem;
  background-color: var(--card-bg);
  border-radius: 12px;
}

@media (max-width: 768px) {
  .cart-header {
    display: none;
  }
  
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem 1rem;
    gap: 1rem;
  }
  
  .cart-column {
    width: 100%;
    
    &.product-info {
      flex-direction: row;
    }
    
    &.product-price,
    &.product-quantity,
    &.product-total {
      justify-content: flex-start;
      
      &:before {
        content: attr(class);
        width: 80px;
        font-weight: 600;
      }
    }
  }
  
  .step-actions {
    flex-direction: column;
    gap: 1rem;
    
    .el-button {
      width: 100%;
    }
  }
  
  .order-summary .summary-section .summary-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style> 