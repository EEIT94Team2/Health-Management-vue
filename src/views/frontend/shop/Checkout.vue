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
                        <el-step title="訂單完成" />
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
                                                :src="
                                                    item.product.imageUrl ||
                                                    'https://placehold.co/100x100/4CAF50/ffffff?text=Product'
                                                "
                                                :alt="item.product.name"
                                                onerror="this.src='https://placehold.co/100x100/cccccc/ffffff?text=Image+Not+Found'"
                                            />
                                        </div>
                                        <div class="product-details">
                                            <div class="product-name">{{ item.product.name }}</div>
                                            <div
                                                v-if="item.product.category"
                                                class="product-category"
                                            >
                                                <el-tag size="small">{{
                                                    item.product.category
                                                }}</el-tag>
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
                                        <el-input
                                            v-model="orderForm.receiverName"
                                            placeholder="請輸入收件人姓名"
                                        />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="聯絡電話" prop="receiverPhone">
                                        <el-input
                                            v-model="orderForm.receiverPhone"
                                            placeholder="請輸入聯絡電話"
                                        />
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
                                    <el-radio-button label="bank_transfer"
                                        >銀行轉帳</el-radio-button
                                    >
                                    <el-radio-button label="cash_on_delivery"
                                        >貨到付款</el-radio-button
                                    >
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
                                    <span>{{
                                        getPaymentMethodLabel(orderForm.paymentMethod)
                                    }}</span>
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
                            <el-button
                                type="success"
                                @click="verifyAndCreateOrder"
                                :loading="isCreatingOrder"
                                >確認下單</el-button
                            >
                        </div>
                    </div>
                </div>

                <!-- 步驟4: 訂單完成與支付選項 -->
                <div v-if="currentStep === 3 && !isLoading">
                    <div class="step-container">
                        <div class="order-success">
                            <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
                            <h2>訂單已成功提交！</h2>
                            <p>訂單編號：{{ createdOrderId }}</p>
                            <p>感謝您的購買，您現在可以選擇支付方式或稍後付款</p>

                            <div class="payment-options">
                                <h3>支付選項</h3>
                                <el-radio-group
                                    v-model="selectedPaymentOption"
                                    class="payment-radio-group"
                                >
                                    <el-radio label="now">
                                        <div class="payment-option">
                                            <el-icon><CreditCard /></el-icon>
                                            <div>
                                                <div class="option-title">立即支付</div>
                                                <div class="option-desc">
                                                    使用信用卡、銀行轉帳等方式立即完成付款
                                                </div>
                                            </div>
                                        </div>
                                    </el-radio>
                                    <el-radio label="later">
                                        <div class="payment-option">
                                            <el-icon><Timer /></el-icon>
                                            <div>
                                                <div class="option-title">稍後付款</div>
                                                <div class="option-desc">
                                                    您可以稍後在訂單管理中完成付款
                                                </div>
                                            </div>
                                        </div>
                                    </el-radio>
                                </el-radio-group>
                            </div>

                            <div class="success-actions">
                                <el-button
                                    type="primary"
                                    @click="handlePaymentChoice"
                                    :disabled="!selectedPaymentOption"
                                >
                                    {{ selectedPaymentOption === "now" ? "前往付款" : "完成" }}
                                </el-button>
                                <el-button @click="$router.push(`/shop/orders/${createdOrderId}`)">
                                    查看訂單
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
    getCartItems,
    createOrder as apiCreateOrder,
    createOrderFromCart,
    getOrderById as getOrder,
    clearCart,
    getProductById,
} from "@/api/shop";
import { CircleCheckFilled, CreditCard, Timer } from "@element-plus/icons-vue";

export default {
    name: "Checkout",
    components: {
        CircleCheckFilled,
        CreditCard,
        Timer,
    },
    setup() {
        const router = useRouter();
        const currentStep = ref(0);
        const isLoading = ref(true);
        const cartItems = ref([]);
        const isCreatingOrder = ref(false);
        const createdOrderId = ref("");
        const orderFormRef = ref(null);
        const selectedPaymentOption = ref("");

        // 訂單表單
        const orderForm = reactive({
            receiverName: "",
            receiverPhone: "",
            shippingAddress: "",
            paymentMethod: "credit_card",
            note: "",
        });

        // 表單驗證規則
        const orderRules = {
            receiverName: [
                { required: true, message: "請輸入收件人姓名", trigger: "blur" },
                { min: 2, message: "姓名長度至少為2個字符", trigger: "blur" },
            ],
            receiverPhone: [
                { required: true, message: "請輸入聯絡電話", trigger: "blur" },
                { pattern: /^[0-9-]{7,15}$/, message: "請輸入有效的電話號碼", trigger: "blur" },
            ],
            shippingAddress: [
                { required: true, message: "請輸入送貨地址", trigger: "blur" },
                { min: 8, message: "地址長度至少為8個字符", trigger: "blur" },
            ],
            paymentMethod: [{ required: true, message: "請選擇付款方式", trigger: "change" }],
        };

        // 運費計算
        const shippingFee = ref(100);

        // 計算購物車總金額
        const cartTotal = computed(() => {
            if (!cartItems.value || cartItems.value.length === 0) {
                return "0.00";
            }

            return cartItems.value
                .reduce((total, item) => {
                    if (!item || !item.product || !item.product.price || !item.quantity) {
                        return total;
                    }
                    return total + parseFloat(item.product.price) * parseInt(item.quantity);
                }, 0)
                .toFixed(2);
        });

        // 計算訂單總金額
        const orderTotal = computed(() => {
            return (parseFloat(cartTotal.value) + shippingFee.value).toFixed(2);
        });

        // 獲取購物車內容
        const fetchCartItems = async () => {
            try {
                isLoading.value = true;
                const response = await getCartItems();

                // 初始化為空數組
                cartItems.value = [];

                if (response && response.data) {
                    // 處理不同格式的響應數據
                    let items = [];

                    if (Array.isArray(response.data)) {
                        items = response.data;
                    } else if (response.data.content && Array.isArray(response.data.content)) {
                        items = response.data.content;
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        items = response.data.data;
                    }

                    // 過濾掉沒有有效產品信息的項目
                    cartItems.value = items.filter(
                        (item) => item && item.product && item.product.price && item.quantity
                    );

                    console.log(`成功載入${cartItems.value.length}個購物車項目`);
                }

                // 檢查購物車是否為空
                if (cartItems.value.length === 0) {
                    ElMessage.warning("您的購物車是空的，無法進行結帳");
                    router.push("/shop/cart");
                }
            } catch (error) {
                console.error("獲取購物車失敗:", error);
                if (error.response && error.response.status === 401) {
                    ElMessage.warning("請先登入後再進行結帳");
                    router.push("/backpage/member/login");
                } else {
                    ElMessage.error("無法載入購物車，請稍後再試");
                    router.push("/shop/cart");
                }
            } finally {
                isLoading.value = false;
            }
        };

        // 計算單項商品總金額
        const calculateItemTotal = (item) => {
            if (!item || !item.product || !item.product.price || !item.quantity) {
                return "0.00";
            }
            return (parseFloat(item.product.price) * parseInt(item.quantity)).toFixed(2);
        };

        // 下一步
        const nextStep = () => {
            if (currentStep.value < 3) {
                currentStep.value++;
            }
        };

        // 上一步
        const prevStep = () => {
            if (currentStep.value > 0) {
                currentStep.value--;
            }
        };

        // 返回購物車
        const goToCart = () => {
            router.push("/shop/cart");
        };

        // 驗證訂單表單
        const submitOrderForm = async () => {
            if (!orderFormRef.value) return;

            await orderFormRef.value.validate((valid) => {
                if (valid) {
                    nextStep();
                } else {
                    ElMessage.error("請填寫必要的訂單資訊");
                }
            });
        };

        // 付款方式標籤
        const getPaymentMethodLabel = (method) => {
            const methods = {
                credit_card: "信用卡支付",
                bank_transfer: "銀行轉帳",
                cash_on_delivery: "貨到付款",
            };
            return methods[method] || method;
        };

        // 先驗證再創建訂單
        const verifyAndCreateOrder = async () => {
            try {
                // 檢查購物車是否為空
                if (cartItems.value.length === 0) {
                    ElMessage.warning("購物車為空，無法創建訂單");
                    return;
                }

                // 確保用戶已登入 - 使用多種方法檢查
                const authToken = localStorage.getItem("authToken");
                const token = localStorage.getItem("token");
                const userInfoStr = localStorage.getItem("userInfo");
                const authUserStr = localStorage.getItem("authUser");

                let userInfo = null;
                let authUser = null;

                try {
                    if (userInfoStr) userInfo = JSON.parse(userInfoStr);
                    if (authUserStr) authUser = JSON.parse(authUserStr);
                } catch (e) {
                    console.error("解析用戶信息失敗:", e);
                }

                const isLoggedIn =
                    authToken || token || (userInfo && userInfo.id) || (authUser && authUser.id);

                console.log("驗證用戶身份:", {
                    hasAuthToken: !!authToken,
                    hasToken: !!token,
                    hasUserInfo: !!userInfo,
                    userInfoId: userInfo?.id,
                    hasAuthUser: !!authUser,
                    authUserId: authUser?.id,
                    isLoggedIn: !!isLoggedIn,
                });

                if (!isLoggedIn) {
                    ElMessage.warning("您需要先登入才能完成結帳");
                    // 保存當前URL作為重定向目標
                    localStorage.setItem("redirectAfterLogin", window.location.pathname);
                    router.push("/backpage/member/login?redirect=/shop/checkout");
                    return;
                }

                // 驗證訂單資訊
                if (!orderFormRef.value) {
                    ElMessage.error("表單驗證失敗，請檢查並重試");
                    return;
                }

                // 手動驗證必填項目
                if (!orderForm.receiverName || orderForm.receiverName.trim() === "") {
                    ElMessage.warning("請填寫收件人姓名");
                    return;
                }

                if (!orderForm.receiverPhone || orderForm.receiverPhone.trim() === "") {
                    ElMessage.warning("請填寫聯絡電話");
                    return;
                }

                if (!orderForm.shippingAddress || orderForm.shippingAddress.trim() === "") {
                    ElMessage.warning("請填寫送貨地址");
                    return;
                }

                // 所有驗證通過，創建訂單
                await createOrder();
            } catch (error) {
                console.error("訂單創建前驗證失敗:", error);
                ElMessage.error("訂單驗證失敗: " + (error.message || "未知錯誤"));
            }
        };

        // 創建訂單
        const createOrder = async () => {
            try {
                if (cartItems.value.length === 0) {
                    ElMessage.warning("購物車為空，無法創建訂單");
                    return;
                }

                // 检查必填字段
                if (
                    !orderForm.receiverName ||
                    !orderForm.receiverPhone ||
                    !orderForm.shippingAddress
                ) {
                    console.warn("訂單表單不完整:", orderForm);
                    ElMessage.warning("請填寫完整的訂單信息");
                    return;
                }

                // 檢查用戶是否已登入
                const token = localStorage.getItem("authToken");
                if (!token) {
                    ElMessage.warning("請先登入才能完成訂單");
                    router.push("/backpage/member/login?redirect=/shop/checkout");
                    return;
                }

                // 檢查備用的身份驗證方式
                const userInfo = localStorage.getItem("userInfo");
                const authUser = localStorage.getItem("authUser");
                console.log("身份驗證狀態檢查：", {
                    hasAuthToken: !!token,
                    hasUserInfo: !!userInfo,
                    hasAuthUser: !!authUser,
                    userInfoContent: userInfo ? JSON.parse(userInfo) : null,
                });

                console.log("準備創建訂單，購物車物品數量:", cartItems.value.length);
                console.log("訂單表單數據:", orderForm);

                isCreatingOrder.value = true;

                // 從購物車創建訂單
                console.log("調用 createOrderFromCart API...");
                const response = await createOrderFromCart();
                console.log("API 響應完整數據:", response);

                if (response && response.data) {
                    let orderId = null;
                    console.log("解析訂單ID，響應數據類型:", typeof response.data);

                    // 詳細日誌記錄響應結構
                    if (typeof response.data === "object") {
                        console.log("響應數據鍵:", Object.keys(response.data));
                    }

                    // 處理不同格式的響應
                    if (response.data.id) {
                        console.log("使用 response.data.id:", response.data.id);
                        orderId = response.data.id;
                    } else if (response.data.orderId) {
                        console.log("使用 response.data.orderId:", response.data.orderId);
                        orderId = response.data.orderId;
                    } else if (typeof response.data === "string") {
                        console.log("響應是字符串，嘗試直接作為訂單ID:", response.data);
                        // 嘗試處理可能直接返回訂單ID的情況
                        orderId = response.data;
                    } else if (response.data.data && response.data.data.id) {
                        console.log("使用嵌套的 response.data.data.id:", response.data.data.id);
                        orderId = response.data.data.id;
                    } else {
                        console.error("無法從響應中找到訂單ID，完整響應:", response);
                    }

                    if (orderId) {
                        createdOrderId.value = orderId;
                        console.log(`成功創建訂單，ID: ${orderId}`);

                        // 提交訂單後處理
                        try {
                            // 清除購物車數據
                            console.log("清除購物車數據...");
                            await clearCart();

                            // 清除訂單表單數據
                            console.log("重置訂單表單...");
                            Object.keys(orderForm).forEach((key) => {
                                orderForm[key] = key === "paymentMethod" ? "credit_card" : "";
                            });

                            console.log("訂單創建完成，進入下一步");
                            nextStep(); // 前往完成頁面
                            cartItems.value = []; // 本地購物車清空

                            // 显示成功消息
                            ElMessage.success(`訂單創建成功，訂單編號: ${orderId}`);
                        } catch (cleanupError) {
                            console.error("訂單後續處理失敗:", cleanupError);
                            ElMessage.warning("訂單已創建，但清理購物車時出錯");
                            // 仍然进入下一步，因为订单已创建成功
                            nextStep();
                        }
                    } else {
                        throw new Error("無法解析訂單ID，請檢查後端API響應格式");
                    }
                } else {
                    console.error("API 響應無效:", response);
                    throw new Error("未能獲取訂單ID，後端返回數據無效");
                }
            } catch (error) {
                console.error("創建訂單失敗:", error);

                // 尝试提取更具体的错误信息
                let errorMessage = "訂單提交失敗，請稍後再試";
                if (error.displayMessage) {
                    errorMessage = error.displayMessage;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                if (error.originalError && error.originalError.response) {
                    console.error("HTTP 錯誤狀態:", error.originalError.response.status);
                    console.error("錯誤響應:", error.originalError.response.data);
                }

                ElMessage.error(errorMessage);
            } finally {
                isCreatingOrder.value = false;
            }
        };

        // 處理支付選擇
        const handlePaymentChoice = () => {
            console.log(
                "處理支付選擇，選項:",
                selectedPaymentOption.value,
                "訂單ID:",
                createdOrderId.value
            );

            // 確保訂單ID存在
            if (!createdOrderId.value) {
                ElMessage.error("訂單ID無效，無法處理支付");
                return;
            }

            if (selectedPaymentOption.value === "now") {
                // 導航到支付頁面
                const paymentUrl = `/backpage/shop/payment?orderId=${createdOrderId.value}&redirect=/shop/orders`;
                console.log("導航到支付頁面:", paymentUrl);
                router.push(paymentUrl);
            } else {
                // 稍後支付，直接導航到訂單列表
                ElMessage.success("訂單已創建，您可以稍後在訂單頁面完成支付");
                router.push("/shop/orders");
            }
        };

        onMounted(() => {
            fetchCartItems();
        });

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
            selectedPaymentOption,
            calculateItemTotal,
            nextStep,
            prevStep,
            goToCart,
            submitOrderForm,
            getPaymentMethodLabel,
            verifyAndCreateOrder,
            handlePaymentChoice,
        };
    },
};
</script>

<style lang="scss" scoped>
.checkout-page {
    padding-top: 80px; /* 為導航欄留出空間 */
    min-height: 100vh;
    background-color: #111827;
    color: #f5f5f5;
}

.text-highlight {
    color: #10b981;
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
        color: #9ca3af;
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
    background-color: #1e293b;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
}

.step-title {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid #2d3748;
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
    background-color: #111827;
    font-weight: 600;
    text-align: center;
    border-radius: 8px;
}

.cart-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #2d3748;

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
    background-color: #1e293b;
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
                color: #10b981;
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
            color: #10b981;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #2d3748;

            &.total {
                margin-top: 1rem;
                font-size: 1.2rem;
                font-weight: 700;
                border-bottom: none;
                color: #10b981;
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
        color: #10b981;
        margin-bottom: 2rem;
    }

    h2 {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    p {
        margin-bottom: 0.5rem;
        color: #9ca3af;

        &:first-of-type {
            font-size: 1.2rem;
            color: #f5f5f5;
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

// 添加深色主題覆蓋樣式
:deep(.el-button) {
    &.el-button--default {
        background-color: #1e293b;
        border-color: #4b5563;
        color: #f5f5f5;

        &:hover,
        &:focus {
            background-color: #2d3748;
            border-color: #6b7280;
            color: #ffffff;
        }
    }

    &.el-button--primary {
        background-color: #10b981;
        border-color: #10b981;

        &:hover,
        &:focus {
            background-color: #059669;
            border-color: #059669;
        }
    }

    &.el-button--success {
        background-color: #10b981;
        border-color: #10b981;

        &:hover,
        &:focus {
            background-color: #059669;
            border-color: #059669;
        }
    }
}

:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper) {
    background-color: #1e293b;
    box-shadow: 0 0 0 1px #4b5563 inset;

    .el-input__inner,
    .el-textarea__inner {
        color: #f5f5f5;
    }
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: #10b981;
    border-color: #10b981;
    box-shadow: -1px 0 0 0 #10b981;
}

:deep(.el-radio-button__inner) {
    background-color: #1e293b;
    border-color: #4b5563;
    color: #f5f5f5;
}

:deep(.el-steps) {
    background-color: #1e293b;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 2rem;

    .el-step__title {
        color: #f5f5f5;
    }

    .el-step__head.is-process {
        color: #10b981;
        border-color: #10b981;
    }

    .el-step__head.is-finish {
        color: #10b981;
        border-color: #10b981;
    }
}

:deep(.el-form-item__label) {
    color: #f5f5f5;
}

:deep(.el-message-box) {
    background-color: #1e293b;
    border-color: #4b5563;

    .el-message-box__title,
    .el-message-box__message {
        color: #f5f5f5;
    }
}

:deep(.el-message) {
    background-color: #1e293b;
    border-color: #4b5563;

    &.el-message--success {
        background-color: rgba(16, 185, 129, 0.2);
        border-color: #10b981;
    }

    &.el-message--warning {
        background-color: rgba(255, 152, 0, 0.2);
        border-color: #ff9800;
    }

    &.el-message--error {
        background-color: rgba(255, 71, 87, 0.2);
        border-color: #ff4757;
    }
}

// 支付選項
.payment-options {
    margin-top: 2rem;
    padding: 2rem;
    background-color: #1e293b;
    border-radius: 8px;
    width: 100%;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;

    h3 {
        font-size: 1.3rem;
        margin-bottom: 1.5rem;
        text-align: left;
    }
}

.payment-radio-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
}

.payment-option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;

    .el-icon {
        font-size: 1.5rem;
        color: #10b981;
    }

    .option-title {
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 0.3rem;
    }

    .option-desc {
        color: #9ca3af;
        font-size: 0.9rem;
    }
}

:deep(.el-radio) {
    width: 100%;
    margin-right: 0;

    .el-radio__input.is-checked .el-radio__inner {
        background-color: #10b981;
        border-color: #10b981;
    }

    .el-radio__input.is-checked + .el-radio__label {
        color: #f5f5f5;
    }

    .el-radio__label {
        padding-left: 10px;
        width: 100%;
    }

    &:hover {
        background-color: #2d3748;
        border-radius: 8px;
    }
}

.success-actions {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
}
</style>
