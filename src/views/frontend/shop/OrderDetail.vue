<template>
    <div class="order-detail-page dark-theme">
        <!-- 頁面標題 -->
        <section class="title-section">
            <div class="section-container">
                <h1 class="main-title">訂單 <span class="text-highlight">詳情</span></h1>
                <p class="subtitle">
                    訂單號: <span class="text-highlight">{{ getDisplayOrderId(orderId) }}</span>
                </p>
            </div>
        </section>

        <!-- 加載中 -->
        <section v-if="isLoading" class="content-section">
            <div class="section-container">
                <div class="loading-container">
                    <el-skeleton animated :count="4" />
                </div>
            </div>
        </section>

        <!-- 未找到訂單 -->
        <section v-else-if="!orderData" class="content-section">
            <div class="section-container">
                <div class="empty-container">
                    <el-empty description="未找到此訂單">
                        <template #extra>
                            <el-button type="primary" @click="$router.push('/shop/orders')">
                                返回訂單列表
                            </el-button>
                        </template>
                    </el-empty>
                </div>
            </div>
        </section>

        <!-- 訂單詳情內容 -->
        <section v-else class="content-section">
            <div class="section-container">
                <!-- 功能欄 -->
                <div class="function-bar">
                    <div class="back-button-wrapper">
                        <el-button @click="$router.push('/shop/orders')">
                            <el-icon class="el-icon--left"><arrow-left /></el-icon>返回訂單列表
                        </el-button>
                    </div>
                </div>

                <!-- 訂單卡片 -->
                <el-card class="order-card" shadow="hover">
                    <div class="card-header">
                        <div class="order-info">
                            <div class="order-id">
                                訂單號: {{ getDisplayOrderId(orderData.id) }}
                            </div>
                            <div class="order-date">{{ formatDate(orderData.createdAt) }}</div>
                        </div>
                        <div class="order-status">
                            <el-tag :type="getStatusType(orderData.status)" size="large">
                                {{ getStatusLabel(orderData.status) }}
                            </el-tag>
                        </div>
                    </div>

                    <!-- 訂單基本信息 -->
                    <div class="detail-section">
                        <h3>訂單信息</h3>
                        <el-descriptions :column="isMobile ? 1 : 2" border>
                            <el-descriptions-item label="更新時間">
                                {{ formatDate(orderData.updatedAt) }}
                            </el-descriptions-item>
                            <el-descriptions-item label="收件人">
                                {{ orderData.customerName || "未提供" }}
                            </el-descriptions-item>
                            <el-descriptions-item label="聯繫電話">
                                {{ orderData.phoneNumber || "未提供" }}
                            </el-descriptions-item>
                            <el-descriptions-item label="配送地址" :span="isMobile ? 1 : 2">
                                {{ orderData.shippingAddress || "未提供" }}
                            </el-descriptions-item>
                            <el-descriptions-item label="備註信息" :span="isMobile ? 1 : 2">
                                {{ orderData.notes || "無備註" }}
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>

                    <!-- 商品列表 -->
                    <div class="detail-section">
                        <h3>
                            商品列表
                            <span class="item-count"
                                >共 {{ orderData.orderItems?.length || 0 }} 件商品</span
                            >
                        </h3>

                        <div class="order-products">
                            <div
                                v-if="orderData.orderItems && orderData.orderItems.length > 0"
                                class="product-list"
                            >
                                <div
                                    v-for="(item, index) in orderData.orderItems"
                                    :key="index"
                                    class="product-item"
                                >
                                    <div class="product-image">
                                        <el-image
                                            :src="getProductImage(item)"
                                            fit="cover"
                                            :preview="false"
                                        >
                                            <template #error>
                                                <div class="image-placeholder">無圖片</div>
                                            </template>
                                        </el-image>
                                    </div>
                                    <div class="product-info">
                                        <div class="product-name">
                                            {{
                                                item.product?.name || item.productName || "未知商品"
                                            }}
                                        </div>
                                        <div class="product-id">
                                            ID: {{ item.product?.id || item.productId || "N/A" }}
                                        </div>
                                        <div class="product-price">
                                            NT$ {{ getProductPrice(item) }} x
                                            {{ item.quantity }}
                                        </div>
                                        <div class="item-total">
                                            小計:
                                            <span class="text-highlight"
                                                >NT$ {{ calculateItemTotal(item) }}</span
                                            >
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="no-products">無商品資訊</div>
                        </div>

                        <div
                            v-if="orderData.orderItems && orderData.orderItems.length > 0"
                            class="order-summary"
                        >
                            <div class="summary-item">
                                <span>商品總額:</span>
                                <span>NT$ {{ calculateSubtotal() }}</span>
                            </div>
                            <div class="summary-item">
                                <span>運費:</span>
                                <span>NT$ {{ Math.round(orderData.shippingFee || 0) }}</span>
                            </div>
                            <div class="summary-item">
                                <span>折扣:</span>
                                <span>-NT$ {{ Math.round(orderData.discount || 0) }}</span>
                            </div>
                            <div class="summary-item total">
                                <span>訂單總額:</span>
                                <span class="text-highlight"
                                    >NT$
                                    {{
                                        orderData.totalAmount
                                            ? Math.round(orderData.totalAmount)
                                            : calculateTotal()
                                    }}</span
                                >
                            </div>
                        </div>
                    </div>

                    <div class="card-footer">
                        <div class="order-amount"></div>

                        <div class="order-actions">
                            <el-button
                                v-if="isPendingPayment(orderData)"
                                type="primary"
                                size="default"
                                @click="goToPayment"
                            >
                                立即支付
                            </el-button>

                            <el-button type="primary" plain @click="$router.push('/shop/products')">
                                繼續購物
                            </el-button>
                        </div>
                    </div>
                </el-card>
            </div>
        </section>
    </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import { getOrderById } from "@/api/shop";

export default {
    name: "OrderDetail",
    components: {
        ArrowLeft,
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const orderId = ref(route.params.id || "");
        const orderData = ref(null);
        const isLoading = ref(true);
        const paymentId = ref("");

        // 判斷是否為移動設備
        const isMobile = computed(() => {
            return window.innerWidth < 768;
        });

        // 獲取訂單詳情
        const fetchOrderDetail = async () => {
            if (!orderId.value) {
                ElMessage.error("訂單ID無效");
                router.push("/shop/orders");
                return;
            }

            isLoading.value = true;

            try {
                // 檢查用戶是否登入
                const authToken = localStorage.getItem("authToken");
                if (!authToken) {
                    ElMessage.warning("請先登入後再查看訂單");
                    router.push("/user/login");
                    return;
                }

                console.log("獲取訂單詳情，訂單ID:", orderId.value);
                const response = await getOrderById(orderId.value);
                console.log("訂單詳情響應:", response);

                if (response && response.data) {
                    let orderInfo = null;

                    // 處理不同格式的API響應
                    if (response.data.success === true && response.data.data) {
                        orderInfo = response.data.data;
                        // 為測試添加缺失的收件人信息
                        if (!orderInfo.customerName && !orderInfo.phoneNumber) {
                            console.log("添加測試收件人信息");
                            if (!orderInfo.customerName && orderInfo.userName) {
                                orderInfo.customerName = orderInfo.userName;
                            }
                            if (!orderInfo.phoneNumber) {
                                // 如果後端沒有返回電話號碼，添加測試值
                                orderInfo.phoneNumber = "0987654321";
                            }
                            if (!orderInfo.shippingAddress) {
                                // 如果後端沒有返回地址，添加測試值
                                orderInfo.shippingAddress = "台北市中正區測試地址123號";
                            }
                        }
                    } else if (response.data.code === 200 && response.data.data) {
                        orderInfo = response.data.data;
                    } else if (typeof response.data === "object" && !Array.isArray(response.data)) {
                        // 直接使用返回的對象
                        orderInfo = response.data;
                    }

                    if (orderInfo) {
                        // 處理訂單數據
                        processOrderData(orderInfo);

                        // 如果仍然缺少必要信息，添加測試數據
                        if (!orderInfo.customerName) {
                            orderInfo.customerName = "測試用戶";
                        }

                        if (!orderInfo.phoneNumber) {
                            orderInfo.phoneNumber = "0987654321";
                        }

                        if (!orderInfo.shippingAddress) {
                            orderInfo.shippingAddress = "台北市中正區測試地址123號";
                        }

                        orderData.value = orderInfo;
                        // 生成隨機支付ID(用於演示)
                        paymentId.value = generatePaymentId();

                        // 檢查處理後的數據
                        console.log("訂單數據處理後結果:", JSON.stringify(orderData.value));
                    } else {
                        ElMessage.error("獲取訂單詳情失敗：無效數據格式");
                        orderData.value = null;
                    }
                } else {
                    ElMessage.error("獲取訂單詳情失敗：無效響應");
                    orderData.value = null;
                }
            } catch (error) {
                console.error("獲取訂單詳情失敗:", error);
                ElMessage.error("獲取訂單詳情失敗: " + (error.message || "未知錯誤"));
                orderData.value = null;
            } finally {
                isLoading.value = false;
            }
        };

        // 處理訂單數據
        const processOrderData = (data) => {
            // 記錄原始數據
            console.log("處理訂單數據前的原始數據:", JSON.stringify(data));

            // 標準化訂單ID
            if (!data.id && data.orderId) {
                data.id = data.orderId;
            }

            // 确保訂單項數組存在
            if (!data.orderItems && data.items) {
                data.orderItems = data.items;
            } else if (!data.orderItems) {
                data.orderItems = [];
            }

            // 從DTO中的專用字段提取用戶信息
            if (!data.customerName && data.userName) {
                data.customerName = data.userName;
            }

            if (!data.phoneNumber && data.userPhone) {
                data.phoneNumber = data.userPhone;
            }

            // 從後端DTO直接設置用戶地址
            if (!data.shippingAddress && data.userAddress) {
                data.shippingAddress = data.userAddress;
            }

            // 處理用戶對象
            if (data.user) {
                console.log("處理用戶信息:", data.user);
                // 從用戶對象中獲取收件人信息
                if (!data.customerName && data.user.name) {
                    data.customerName = data.user.name;
                }

                // 提取用戶電話號碼(檢查可能的字段)
                if (data.user.phone) {
                    data.phoneNumber = data.user.phone;
                } else if (data.user.phoneNumber) {
                    data.phoneNumber = data.user.phoneNumber;
                } else if (data.user.contactPhone) {
                    data.phoneNumber = data.user.contactPhone;
                }

                // 提取用戶地址(檢查可能的字段)
                if (data.user.address) {
                    data.shippingAddress = data.user.address;
                } else if (data.user.shippingAddress) {
                    data.shippingAddress = data.user.shippingAddress;
                } else if (data.user.deliveryAddress) {
                    data.shippingAddress = data.user.deliveryAddress;
                }
            } else if (data.userName) {
                // 如果沒有user對象但有userName，嘗試使用它作為customerName
                console.log("沒有user對象，但有userName:", data.userName);
                if (!data.customerName) {
                    data.customerName = data.userName;
                }
            }

            // 處理支付信息 - 基於payment表
            // 在hm-spring中，payment是一個單獨的實體，通過order_id關聯
            if (data.payment) {
                if (!data.paymentStatus && data.payment.status) {
                    data.paymentStatus = data.payment.status.toUpperCase();
                }

                if (!data.paymentMethod && data.payment.method) {
                    data.paymentMethod = data.payment.method;
                }

                if (!data.paymentTime && data.payment.paidAt) {
                    data.paymentTime = data.payment.paidAt;
                }

                if (!data.transactionId && data.payment.id) {
                    data.transactionId = data.payment.id;
                }
            }

            // 處理訂單狀態
            if (data.status) {
                // 根據訂單狀態推斷支付狀態
                const statusLower = data.status.toLowerCase();
                if (statusLower.includes("paid") || statusLower.includes("completed")) {
                    data.paymentStatus = "PAID";
                } else if (statusLower.includes("pending")) {
                    data.paymentStatus = "PENDING";
                }
            }

            // 處理訂單項(orderItems)，基於OrderItem.java
            if (data.orderItems && Array.isArray(data.orderItems)) {
                data.orderItems.forEach((item) => {
                    // 確保product對象存在
                    if (item.product) {
                        // 已有product對象，不需要創建
                        if (!item.productName && item.product.name) {
                            item.productName = item.product.name;
                        }

                        if (!item.price && item.product.price) {
                            item.price = parseFloat(item.product.price);
                        }

                        if (!item.productId && item.product.id) {
                            item.productId = item.product.id;
                        }

                        if (!item.imageUrl && item.product.imageUrl) {
                            item.imageUrl = item.product.imageUrl;
                        }
                    } else if (item.productId) {
                        // 沒有product對象，但有productId，創建一個簡單的product對象
                        item.product = {
                            id: item.productId,
                            name: item.productName || "未知商品",
                            price: item.price || item.subtotal / item.quantity || 0,
                            imageUrl: item.imageUrl || "",
                        };
                    }

                    // 確保數量欄位存在
                    if (!item.quantity && item.quantity !== 0) {
                        item.quantity = 1;
                    }

                    // 從subtotal計算單價(如果需要)
                    if ((!item.price || item.price === 0) && item.subtotal && item.quantity > 0) {
                        item.price = parseFloat((item.subtotal / item.quantity).toFixed(2));
                    }
                });
            }

            // 確保支付狀態存在
            if (!data.paymentStatus) {
                data.paymentStatus =
                    data.status &&
                    (data.status.toLowerCase().includes("paid") ||
                        data.status.toLowerCase().includes("completed"))
                        ? "PAID"
                        : "PENDING";
            }

            console.log("處理後的訂單數據:", data);
        };

        // 生成隨機支付ID (演示用)
        const generatePaymentId = () => {
            const prefix = "PAY";
            const timestamp = new Date().getTime().toString().substring(6);
            const random = Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, "0");
            return `${prefix}${timestamp}${random}`;
        };

        // 獲取商品圖片
        const getProductImage = (item) => {
            if (!item) return "";

            // 檢查多個可能的圖片來源
            if (item.product?.imageUrl && item.product.imageUrl.trim() !== "") {
                return item.product.imageUrl;
            } else if (item.imageUrl && item.imageUrl.trim() !== "") {
                return item.imageUrl;
            } else if (item.productImageUrl && item.productImageUrl.trim() !== "") {
                return item.productImageUrl;
            } else if (item.product?.image && item.product.image.trim() !== "") {
                return item.product.image;
            } else if (item.image && item.image.trim() !== "") {
                return item.image;
            }

            // 默認圖片
            return "https://via.placeholder.com/60x60?text=無圖片";
        };

        // 獲取商品價格
        const getProductPrice = (item) => {
            if (!item) return "0";

            // 檢查多個可能的價格源
            if (item.price) {
                return Math.round(parseFloat(item.price));
            } else if (item.product && item.product.price) {
                return Math.round(parseFloat(item.product.price));
            } else if (item.totalPrice && item.quantity) {
                return Math.round(parseFloat(item.totalPrice / item.quantity));
            } else if (
                orderData.value &&
                orderData.value.totalAmount &&
                orderData.value.orderItems.length === 1
            ) {
                return Math.round(parseFloat(orderData.value.totalAmount / item.quantity));
            }

            return "0";
        };

        // 計算商品總價
        const calculateItemTotal = (item) => {
            if (!item) return "0";

            const price = parseFloat(getProductPrice(item));
            const quantity = parseInt(item.quantity) || 0;
            return Math.round(price * quantity).toString();
        };

        // 計算商品小計
        const calculateSubtotal = () => {
            if (
                !orderData.value ||
                !orderData.value.orderItems ||
                !orderData.value.orderItems.length
            ) {
                return "0";
            }

            let subtotal = 0;
            orderData.value.orderItems.forEach((item) => {
                const price = parseFloat(getProductPrice(item));
                const quantity = parseInt(item.quantity) || 0;
                subtotal += price * quantity;
            });

            return Math.round(subtotal).toString();
        };

        // 計算訂單總額
        const calculateTotal = () => {
            if (!orderData.value) return "0";

            const subtotal = parseFloat(calculateSubtotal());
            const shippingFee = parseFloat(orderData.value.shippingFee || 0);
            const discount = parseFloat(orderData.value.discount || 0);

            return Math.round(subtotal + shippingFee - discount).toString();
        };

        // 處理訂單ID顯示邏輯
        const getDisplayOrderId = (id) => {
            if (!id) return "";

            // 如果ID以數字開頭且大於1000，則截取尾部部分
            const numericId = parseInt(id);
            if (!isNaN(numericId) && numericId > 1000) {
                // 取模，確保我們只顯示後面的數字
                return (numericId % 1000).toString();
            }

            return id;
        };

        // 獲取支付方式文本
        const getPaymentMethod = (method) => {
            if (!method) return "未指定";

            const methodLower = method.toLowerCase();
            if (methodLower.includes("credit") || methodLower.includes("card")) {
                return "信用卡";
            } else if (methodLower.includes("transfer") || methodLower.includes("bank")) {
                return "銀行轉帳";
            } else if (methodLower.includes("paypal")) {
                return "PayPal";
            } else if (methodLower.includes("cash")) {
                return "貨到付款";
            }

            return method;
        };

        // 獲取訂單狀態樣式
        const getStatusType = (status) => {
            if (!status) return "";

            const statusLower = status.toLowerCase();
            if (statusLower.includes("pending") || statusLower === "pending_payment") {
                return "warning";
            } else if (statusLower.includes("process") || statusLower === "processing") {
                return "";
            } else if (statusLower.includes("complet") || statusLower === "completed") {
                return "success";
            } else if (statusLower.includes("cancel") || statusLower === "cancelled") {
                return "danger";
            } else if (statusLower.includes("paid") || statusLower === "paid") {
                return "success";
            }

            return "";
        };

        // 獲取訂單狀態文本
        const getStatusLabel = (status) => {
            if (!status) return "未知";

            const statusLower = status.toLowerCase();
            if (statusLower.includes("pending")) {
                return "待付款";
            } else if (statusLower.includes("process")) {
                return "處理中";
            } else if (statusLower.includes("complet")) {
                return "已完成";
            } else if (statusLower.includes("cancel")) {
                return "已取消";
            } else if (statusLower.includes("paid")) {
                return "已支付";
            }

            return status;
        };

        // 格式化日期
        const formatDate = (dateString) => {
            if (!dateString) return "N/A";
            const date = new Date(dateString);
            return date.toLocaleString("zh-TW");
        };

        // 檢查是否為待付款狀態
        const isPendingPayment = (order) => {
            if (!order || !order.status) return false;

            const statusLower = order.status.toLowerCase();
            return statusLower.includes("pending") || statusLower === "pending_payment";
        };

        // 跳轉到支付頁面
        const goToPayment = () => {
            if (!orderData.value || !orderData.value.id) {
                ElMessage.warning("訂單信息不完整，無法跳轉到支付頁面");
                return;
            }

            // 使用完整URL形式跳轉到backpage支付頁面
            const baseUrl = window.location.origin; // 獲取當前網站的基本URL (http://localhost:5173)
            const paymentUrl = `${baseUrl}/backpage/shop/payment?orderId=${orderData.value.id}`;

            // 使用window.location.href進行跳轉，而不是使用Vue Router
            window.location.href = paymentUrl;

            // 如果希望使用Vue Router，請使用以下代碼替代
            // router.push({
            //     path: "/backpage/shop/payment",
            //     query: { orderId: orderData.value.id },
            // });
        };

        onMounted(() => {
            window.scrollTo(0, 0);
            fetchOrderDetail();
        });

        return {
            orderId,
            orderData,
            isLoading,
            isMobile,
            getProductImage,
            getProductPrice,
            calculateItemTotal,
            calculateSubtotal,
            calculateTotal,
            getPaymentMethod,
            getStatusType,
            getStatusLabel,
            formatDate,
            isPendingPayment,
            goToPayment,
            getDisplayOrderId,
        };
    },
};
</script>

<style lang="scss" scoped>
.order-detail-page {
    background-color: #111827;
    color: #f5f5f5;
    min-height: 100vh;
    width: 100%;
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
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
}

// 標題區域
.title-section {
    padding: 2rem 0;
    text-align: center;

    .main-title {
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }

    .subtitle {
        font-size: 1.2rem;
        color: #9ca3af;
    }
}

// 內容區域
.content-section {
    margin-bottom: 3rem;
}

// 加載容器
.loading-container {
    background-color: #1e293b;
    border-radius: 12px;
    padding: 2rem;
    min-height: 300px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

// 空訂單容器
.empty-container {
    background-color: #1e293b;
    border-radius: 12px;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

// 功能欄
.function-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

// 訂單卡片
.order-card {
    background-color: #1e293b;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1.5rem;
    transition: transform 0.3s, box-shadow 0.3s;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
    }

    :deep(.el-card__body) {
        padding: 0;
    }
}

// 卡片頭部
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background-color: #1f2937;
    border-bottom: 1px solid #374151;

    .order-info {
        .order-id {
            font-weight: 600;
            margin-bottom: 0.25rem;
            color: #f3f4f6;
        }

        .order-date {
            font-size: 0.9rem;
            color: #9ca3af;
        }
    }
}

// 詳情部分
.detail-section {
    padding: 1.5rem;
    border-bottom: 1px solid #374151;

    h3 {
        font-size: 1.2rem;
        margin-top: 0;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #f3f4f6;

        .item-count {
            font-size: 0.9rem;
            color: #9ca3af;
            font-weight: normal;
        }
    }
}

// 訂單商品
.order-products {
    margin-bottom: 1.5rem;

    .product-list {
        .product-item {
            display: flex;
            padding: 1rem;
            border-bottom: 1px solid #374151;
            background-color: #1e1e1e; // 深黑色背景

            &:last-child {
                border-bottom: none;
            }

            .product-image {
                width: 60px;
                height: 60px;
                margin-right: 1rem;
                border-radius: 6px;
                overflow: hidden;

                .el-image {
                    width: 100%;
                    height: 100%;
                }

                .image-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: #374151;
                    color: #ffffff; // 純白色文字
                    font-size: 12px;
                }
            }

            .product-info {
                flex: 1;

                .product-name {
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                    color: #ffffff; // 純白色文字
                }

                .product-id {
                    font-size: 0.85rem;
                    color: #e2e8f0; // 較亮的文字
                    margin-bottom: 0.25rem;
                }

                .product-price {
                    font-size: 0.9rem;
                    color: #e2e8f0; // 較亮的文字
                    margin-bottom: 0.25rem;
                }

                .item-total {
                    font-size: 0.9rem;
                    text-align: right;
                    color: #ffffff; // 純白色文字
                }
            }
        }
    }

    .no-products {
        color: #e2e8f0; // 較亮的文字
        font-style: italic;
        text-align: center;
        padding: 1rem 0;
        background-color: #1e1e1e; // 深黑色背景
    }
}

// 訂單摘要
.order-summary {
    margin-top: 1.5rem;
    border-top: 1px solid #374151;
    padding-top: 1.5rem;
    background-color: #1e1e1e; // 深黑色背景
    padding: 1rem;
    border-radius: 8px;

    .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        color: #ffffff; // 純白色文字

        &.total {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #374151;
            font-size: 1.1rem;
            font-weight: 600;
            color: #ffffff; // 純白色文字
        }
    }
}

// 卡片底部
.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background-color: #1f2937;
    border-top: 1px solid #374151;

    .order-amount {
        font-weight: 600;

        .text-highlight {
            font-size: 1.1rem;
            margin-left: 0.5rem;
        }
    }

    .order-actions {
        display: flex;
        gap: 0.5rem;
    }
}

// Element Plus 元素樣式覆蓋
:deep(.el-descriptions) {
    --el-descriptions-item-bordered-label-background: #0f172a; // 更深的背景色
    --el-descriptions-item-bordered-content-background: #1e1e1e; // 內容背景色為深黑色
    color: #ffffff; // 確保文字為純白色
    --el-descriptions-border-color: #334155; // 保留邊框顏色
    --el-text-color-primary: #ffffff; // 確保主要文字為純白色

    .el-descriptions__label {
        color: #ffffff; // 確保標籤文字為純白色
        font-weight: 600;
    }

    .el-descriptions__content {
        color: #ffffff; // 確保內容文字為純白色
    }

    .el-descriptions__body {
        background-color: #1e1e1e; // 表格整體背景色
    }
}

:deep(.el-radio-button__inner) {
    background-color: #1f2937;
    border-color: #374151;
    color: #f5f5f5;

    &:hover {
        color: #10b981;
    }
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: #10b981;
    border-color: #10b981;
    box-shadow: -1px 0 0 0 #10b981;
}

:deep(.el-empty) {
    --el-empty-fill-color-0: #1f2937;
    --el-empty-fill-color-1: #374151;
    --el-empty-fill-color-2: #4b5563;
    --el-empty-fill-color-3: #6b7280;
    --el-empty-fill-color-4: #9ca3af;
    --el-empty-fill-color-5: #d1d5db;

    .el-empty__description p {
        color: #9ca3af;
    }
}

:deep(.el-pagination) {
    --el-pagination-bg-color: #1f2937;
    --el-pagination-button-color: #f5f5f5;
    --el-pagination-hover-color: #10b981;

    .el-pagination__total {
        color: #9ca3af;
    }

    button:disabled {
        background-color: #111827;
        color: #6b7280;
    }

    .el-pager li {
        background-color: #1f2937;
        color: #f5f5f5;

        &.is-active {
            background-color: #10b981;
            color: #fff;
        }

        &:hover {
            color: #10b981;
        }
    }
}

// 響應式設計
@media (max-width: 768px) {
    .section-container {
        padding: 0 20px;
    }

    .title-section {
        .main-title {
            font-size: 2rem;
        }
    }

    .function-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;

        .filter-group {
            width: 100%;
            overflow-x: auto;
            padding-bottom: 0.5rem;
        }
    }

    .product-item {
        flex-direction: column;

        .product-image {
            margin-bottom: 0.5rem;
        }
    }

    .card-footer {
        flex-direction: column;
        gap: 1rem;

        .order-amount {
            text-align: center;
        }

        .order-actions {
            width: 100%;
            flex-direction: column;

            .el-button {
                width: 100%;
            }
        }
    }
}
</style>
