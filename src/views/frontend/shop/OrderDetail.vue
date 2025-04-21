<template>
    <div class="order-detail-page dark-theme">
        <!-- 頁面標題 -->
        <section class="title-section">
            <div class="section-container">
                <div class="title-wrapper">
                    <div class="back-button" @click="$router.back()">
                        <el-icon><arrow-left /></el-icon>
                    </div>
                    <h1 class="main-title">訂單 <span class="text-highlight">詳情</span></h1>
                </div>
                <p class="subtitle">
                    訂單號: <span class="text-highlight">{{ orderId }}</span>
                </p>
            </div>
        </section>

        <!-- 加載中 -->
        <section v-if="loading" class="content-section">
            <div class="section-container">
                <div class="loading-container">
                    <el-skeleton :rows="10" animated />
                </div>
            </div>
        </section>

        <!-- 未找到訂單 -->
        <section v-else-if="!orderData" class="content-section">
            <div class="section-container">
                <div class="not-found-container">
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
        <template v-else>
            <!-- 訂單基本信息 -->
            <section class="content-section">
                <div class="section-container">
                    <el-card class="detail-card">
                        <template #header>
                            <div class="card-header">
                                <h2>訂單信息</h2>
                                <el-tag :type="getStatusType(orderData.status)" size="large">
                                    {{ getStatusLabel(orderData.status) }}
                                </el-tag>
                            </div>
                        </template>

                        <el-descriptions :column="isMobile ? 1 : 2" border>
                            <el-descriptions-item label="訂單編號">
                                {{ orderData.id }}
                            </el-descriptions-item>

                            <el-descriptions-item label="下單時間">
                                {{ formatDate(orderData.createdAt) }}
                            </el-descriptions-item>

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
                    </el-card>
                </div>
            </section>

            <!-- 支付信息 -->
            <section class="content-section">
                <div class="section-container">
                    <el-card class="detail-card">
                        <template #header>
                            <div class="card-header">
                                <h2>支付信息</h2>
                                <el-tag
                                    :type="
                                        orderData.paymentStatus === 'PAID' ? 'success' : 'warning'
                                    "
                                    size="large"
                                >
                                    {{ orderData.paymentStatus === "PAID" ? "已支付" : "待支付" }}
                                </el-tag>
                            </div>
                        </template>

                        <el-descriptions :column="isMobile ? 1 : 2" border>
                            <el-descriptions-item label="支付方式">
                                {{ getPaymentMethod(orderData.paymentMethod) }}
                            </el-descriptions-item>

                            <el-descriptions-item label="支付時間">
                                {{
                                    orderData.paymentTime
                                        ? formatDate(orderData.paymentTime)
                                        : "未支付"
                                }}
                            </el-descriptions-item>

                            <el-descriptions-item label="交易編號">
                                {{ orderData.transactionId || paymentId || "未生成" }}
                            </el-descriptions-item>

                            <el-descriptions-item label="訂單總額">
                                <span class="text-highlight"
                                    >NT$ {{ orderData.totalAmount || calculateTotal() }}</span
                                >
                            </el-descriptions-item>
                        </el-descriptions>

                        <div v-if="isPendingPayment(orderData)" class="payment-action">
                            <el-button type="primary" @click="goToPayment"> 前往支付 </el-button>
                        </div>
                    </el-card>
                </div>
            </section>

            <!-- 商品列表 -->
            <section class="content-section">
                <div class="section-container">
                    <el-card class="detail-card">
                        <template #header>
                            <div class="card-header">
                                <h2>商品列表</h2>
                                <span>共 {{ orderData.orderItems?.length || 0 }} 件商品</span>
                            </div>
                        </template>

                        <el-table
                            v-if="orderData.orderItems && orderData.orderItems.length > 0"
                            :data="orderData.orderItems"
                            style="width: 100%"
                            :max-height="500"
                        >
                            <el-table-column label="商品圖片" width="100" align="center">
                                <template #default="{ row }">
                                    <el-image
                                        style="width: 60px; height: 60px"
                                        :src="getProductImage(row)"
                                        fit="contain"
                                    >
                                        <template #error>
                                            <div class="image-placeholder">無圖片</div>
                                        </template>
                                    </el-image>
                                </template>
                            </el-table-column>

                            <el-table-column prop="product.name" label="商品名稱">
                                <template #default="{ row }">
                                    <div>
                                        {{ row.product?.name || row.productName || "未知商品" }}
                                    </div>
                                    <div class="product-id">
                                        ID: {{ row.product?.id || row.productId || "N/A" }}
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column prop="price" label="單價" width="120">
                                <template #default="{ row }">
                                    NT$ {{ row.product?.price || row.price || 0 }}
                                </template>
                            </el-table-column>

                            <el-table-column
                                prop="quantity"
                                label="數量"
                                width="80"
                                align="center"
                            />

                            <el-table-column label="小計" width="120" align="right">
                                <template #default="{ row }">
                                    NT$ {{ calculateItemTotal(row) }}
                                </template>
                            </el-table-column>
                        </el-table>

                        <el-empty v-else description="暫無商品明細" :image-size="100" />

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
                                <span>NT$ {{ orderData.shippingFee || 0 }}</span>
                            </div>
                            <div class="summary-item">
                                <span>折扣:</span>
                                <span>-NT$ {{ orderData.discount || 0 }}</span>
                            </div>
                            <div class="summary-item total">
                                <span>訂單總額:</span>
                                <span class="text-highlight"
                                    >NT$ {{ orderData.totalAmount || calculateTotal() }}</span
                                >
                            </div>
                        </div>
                    </el-card>
                </div>
            </section>

            <!-- 底部操作區 -->
            <section class="action-section">
                <div class="section-container">
                    <div class="action-buttons">
                        <el-button @click="$router.push('/shop/orders')">返回訂單列表</el-button>
                        <el-button type="primary" @click="$router.push('/shop/products')"
                            >繼續購物</el-button
                        >
                    </div>
                </div>
            </section>
        </template>
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
        const loading = ref(true);
        const paymentId = ref("");
        const isLoading = ref(true);

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

            loading.value = true;

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
                    } else if (response.data.code === 200 && response.data.data) {
                        orderInfo = response.data.data;
                    } else if (typeof response.data === "object" && !Array.isArray(response.data)) {
                        // 直接使用返回的對象
                        orderInfo = response.data;
                    }

                    if (orderInfo) {
                        // 處理訂單數據
                        processOrderData(orderInfo);
                        orderData.value = orderInfo;
                        // 生成隨機支付ID(用於演示)
                        paymentId.value = generatePaymentId();
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
                loading.value = false;
            }
        };

        // 處理訂單數據
        const processOrderData = (data) => {
            // 標準化訂單ID
            if (!data.id && data.orderId) {
                data.id = data.orderId;
            }

            // 確保訂單項數組存在
            if (!data.orderItems || !Array.isArray(data.orderItems)) {
                data.orderItems = [];
            }

            // 處理訂單項商品數據
            data.orderItems.forEach((item) => {
                // 確保product對象存在
                if (!item.product && item.productId) {
                    item.product = {
                        id: item.productId,
                        name: item.productName || "未知商品",
                        price: item.price || 0,
                        imageUrl: item.imageUrl || "",
                    };
                }

                // 確保數量欄位存在
                if (!item.quantity && item.quantity !== 0) {
                    item.quantity = 1;
                }
            });

            // 確保支付狀態存在
            if (!data.paymentStatus) {
                data.paymentStatus =
                    data.status && data.status.includes("PAID") ? "PAID" : "PENDING";
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

        // 計算商品總價
        const calculateItemTotal = (item) => {
            if (!item) return "0.00";

            const price = parseFloat(item.product?.price || item.price || 0);
            const quantity = parseInt(item.quantity) || 0;
            return (price * quantity).toFixed(2);
        };

        // 計算商品小計
        const calculateSubtotal = () => {
            if (
                !orderData.value ||
                !orderData.value.orderItems ||
                !orderData.value.orderItems.length
            ) {
                return "0.00";
            }

            let subtotal = 0;
            orderData.value.orderItems.forEach((item) => {
                const price = parseFloat(item.product?.price || item.price || 0);
                const quantity = parseInt(item.quantity) || 0;
                subtotal += price * quantity;
            });

            return subtotal.toFixed(2);
        };

        // 計算訂單總額
        const calculateTotal = () => {
            if (!orderData.value) return "0.00";

            const subtotal = parseFloat(calculateSubtotal());
            const shippingFee = parseFloat(orderData.value.shippingFee || 0);
            const discount = parseFloat(orderData.value.discount || 0);

            return (subtotal + shippingFee - discount).toFixed(2);
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
            if (!status) return "info";

            const statusLower = status.toLowerCase();
            if (statusLower.includes("pending") || statusLower === "pending_payment") {
                return "warning";
            } else if (statusLower.includes("process") || statusLower === "processing") {
                return "primary";
            } else if (statusLower.includes("complet") || statusLower === "completed") {
                return "success";
            } else if (statusLower.includes("cancel") || statusLower === "cancelled") {
                return "danger";
            } else if (statusLower.includes("paid") || statusLower === "paid") {
                return "success";
            }

            return "info";
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

            router.push({
                path: "/shop/payment",
                query: { orderId: orderData.value.id },
            });
        };

        onMounted(() => {
            window.scrollTo(0, 0);
            fetchOrderDetail();
        });

        return {
            orderId,
            orderData,
            loading,
            isLoading,
            paymentId,
            isMobile,
            getProductImage,
            calculateItemTotal,
            calculateSubtotal,
            calculateTotal,
            getPaymentMethod,
            getStatusType,
            getStatusLabel,
            formatDate,
            isPendingPayment,
            goToPayment,
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

    .title-wrapper {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;

        .back-button {
            margin-right: 1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.1);
            transition: background-color 0.3s;

            &:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }
        }

        .main-title {
            font-size: 2.2rem;
            margin: 0;
        }
    }

    .subtitle {
        font-size: 1.1rem;
        color: #9ca3af;
        margin-top: 0.5rem;
    }
}

// 內容區域
.content-section {
    margin-bottom: 2rem;
}

// 卡片樣式
.detail-card {
    background-color: #1e293b;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1.5rem;

    :deep(.el-card__header) {
        background-color: #1f2937;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #374151;
    }

    :deep(.el-card__body) {
        padding: 1.5rem;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h2 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
        }
    }
}

// 加載容器
.loading-container {
    background-color: #1e293b;
    border-radius: 12px;
    padding: 2rem;
    min-height: 300px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

// 未找到容器
.not-found-container {
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

// 支付操作
.payment-action {
    margin-top: 1.5rem;
    display: flex;
    justify-content: center;
}

// 商品ID
.product-id {
    font-size: 0.85rem;
    color: #9ca3af;
    margin-top: 0.25rem;
}

// 圖片佔位符
.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #374151;
    color: #9ca3af;
    font-size: 12px;
    border-radius: 4px;
}

// 訂單摘要
.order-summary {
    margin-top: 1.5rem;
    border-top: 1px solid #374151;
    padding-top: 1.5rem;

    .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;

        &.total {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #374151;
            font-size: 1.1rem;
            font-weight: 600;
        }
    }
}

// 操作區域
.action-section {
    margin-bottom: 3rem;

    .action-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }
}

// Element Plus 元素樣式覆蓋
:deep(.el-descriptions) {
    --el-descriptions-item-bordered-label-background: #1f2937;
    --el-descriptions-item-bordered-content-background: transparent;
    --el-descriptions-border-color: #374151;
    --el-text-color-primary: #f5f5f5;
}

:deep(.el-table) {
    --el-table-border-color: #374151;
    --el-table-header-bg-color: #1f2937;
    --el-table-header-text-color: #f5f5f5;
    --el-table-row-hover-bg-color: #2d3748;
    --el-table-text-color: #f5f5f5;
    --el-table-bg-color: transparent;

    &::before {
        display: none;
    }

    .el-table__inner-wrapper::before {
        display: none;
    }
}

:deep(.el-empty) {
    --el-empty-fill-color-0: #1f2937;
    --el-empty-fill-color-1: #374151;
    --el-empty-fill-color-2: #4b5563;
    --el-empty-fill-color-3: #6b7280;
    --el-empty-fill-color-4: #9ca3af;
    --el-empty-fill-color-5: #d1d5db;

    padding: 2rem 0;

    .el-empty__description p {
        color: #9ca3af;
    }
}

// 響應式設計
@media (max-width: 768px) {
    .section-container {
        padding: 0 20px;
    }

    .title-section {
        .title-wrapper {
            .main-title {
                font-size: 1.8rem;
            }
        }
    }

    .action-section {
        .action-buttons {
            flex-direction: column;

            .el-button {
                width: 100%;
            }
        }
    }
}
</style>
