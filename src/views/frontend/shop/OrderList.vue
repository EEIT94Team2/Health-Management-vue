<template>
    <div class="order-list-page dark-theme">
        <!-- 頁面標題 -->
        <section class="title-section">
            <div class="section-container">
                <h1 class="main-title">我的 <span class="text-highlight">訂單</span></h1>
                <p class="subtitle">查看您的訂單歷史記錄</p>
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

        <!-- 無訂單 -->
        <section v-else-if="!orders || orders.length === 0" class="content-section">
            <div class="section-container">
                <div class="empty-container">
                    <el-empty description="暫無訂單記錄">
                        <template #extra>
                            <el-button type="primary" @click="$router.push('/shop/products')">
                                去購物
                            </el-button>
                        </template>
                    </el-empty>
                </div>
            </div>
        </section>

        <!-- 訂單列表 -->
        <section v-else class="content-section">
            <div class="section-container">
                <!-- 功能欄 -->
                <div class="function-bar">
                    <div class="filter-group">
                        <el-radio-group v-model="statusFilter" size="large" @change="filterOrders">
                            <el-radio-button value="all">全部</el-radio-button>
                            <el-radio-button value="pending">待付款</el-radio-button>
                            <el-radio-button value="processing">處理中</el-radio-button>
                            <el-radio-button value="completed">已完成</el-radio-button>
                        </el-radio-group>
                    </div>
                </div>

                <!-- 訂單卡片列表 -->
                <div class="order-cards">
                    <el-card
                        v-for="order in displayOrders"
                        :key="order.id"
                        class="order-card"
                        shadow="hover"
                        @click="goToOrderDetail(order.id)"
                    >
                        <div class="card-header">
                            <div class="order-info">
                                <div class="order-id">訂單號: {{ order.id }}</div>
                                <div class="order-date">{{ formatDate(order.createdAt) }}</div>
                            </div>
                            <div class="order-status">
                                <el-tag :type="getStatusType(order.status)">
                                    {{ getStatusLabel(order.status) }}
                                </el-tag>
                            </div>
                        </div>

                        <div class="order-products">
                            <div
                                v-if="order.orderItems && order.orderItems.length > 0"
                                class="product-list"
                            >
                                <div
                                    v-for="(item, index) in order.orderItems.slice(0, 3)"
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
                                        <div class="product-price">
                                            NT$ {{ item.product?.price || item.price || 0 }} x
                                            {{ item.quantity }}
                                        </div>
                                    </div>
                                </div>

                                <div v-if="order.orderItems.length > 3" class="more-products">
                                    +{{ order.orderItems.length - 3 }} 項商品
                                </div>
                            </div>
                            <div v-else class="no-products">無商品資訊</div>
                        </div>

                        <div class="card-footer">
                            <div class="order-amount">
                                <span>總計:</span>
                                <span class="text-highlight"
                                    >NT$ {{ order.totalAmount || calculateOrderTotal(order) }}</span
                                >
                            </div>

                            <div class="order-actions">
                                <el-button
                                    v-if="isPendingPayment(order)"
                                    type="primary"
                                    size="small"
                                    @click.stop="goToPayment(order)"
                                >
                                    立即支付
                                </el-button>

                                <el-button size="small" @click.stop="goToOrderDetail(order.id)">
                                    查看詳情
                                </el-button>
                            </div>
                        </div>
                    </el-card>
                </div>

                <!-- 分頁 -->
                <div class="pagination-container" v-if="totalPages > 1">
                    <el-pagination
                        background
                        layout="prev, pager, next"
                        :page-size="pageSize"
                        :total="filteredOrders.length"
                        :current-page="currentPage"
                        @current-change="handlePageChange"
                    />
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getOrdersByUserId, getOrders } from "@/api/shop";

export default {
    name: "OrderList",
    setup() {
        const router = useRouter();
        const orders = ref([]);
        const loading = ref(true);
        const statusFilter = ref("all");
        const filteredOrders = ref([]);
        const currentPage = ref(1);
        const pageSize = ref(10);

        // 獲取用戶訂單
        const fetchOrders = async () => {
            loading.value = true;

            try {
                // 檢查用戶是否登入
                const authToken = localStorage.getItem("authToken");
                if (!authToken) {
                    ElMessage.warning("請先登入後再查看訂單");
                    router.push("/user/login");
                    return;
                }

                // 獲取用戶ID
                const userData = localStorage.getItem("userData");
                let userId = null;

                if (userData) {
                    try {
                        const userObj = JSON.parse(userData);
                        userId = userObj.id || userObj.userId;
                    } catch (e) {
                        console.error("解析用戶數據失敗：", e);
                    }
                }

                // 嘗試從其他來源獲取用戶ID
                if (!userId) {
                    const userInfo = localStorage.getItem("userInfo");
                    if (userInfo) {
                        try {
                            const userObj = JSON.parse(userInfo);
                            userId = userObj.id || userObj.userId;
                        } catch (e) {
                            console.error("解析userInfo失敗：", e);
                        }
                    }
                }

                // 最後嘗試從JWT token解析
                if (!userId) {
                    try {
                        const payload = JSON.parse(atob(authToken.split(".")[1]));
                        userId = payload.userId || payload.sub || 1; // 使用userId或sub字段，或默認使用1
                    } catch (e) {
                        console.error("解析JWT token失敗：", e);
                    }
                }

                // 如果仍然無法獲取用戶ID，使用默認值
                if (!userId) {
                    console.warn("無法從任何來源獲取用戶ID，使用預設值1");
                    userId = 1;
                }

                console.log("獲取用戶訂單，用戶ID:", userId);

                // 嘗試獲取訂單數據
                let response;
                try {
                    // 首先嘗試使用/api/orders/user/{userId}端點
                    response = await getOrdersByUserId(userId);
                } catch (apiError) {
                    console.warn("透過/api/orders/user/接口獲取訂單失敗，嘗試替代方案", apiError);

                    // 如果第一個接口失敗，嘗試使用舊接口或備用接口
                    try {
                        // 使用帶有userId參數的接口
                        response = await getOrders({ userId: userId });
                    } catch (backupError) {
                        throw new Error("所有獲取訂單的嘗試均失敗");
                    }
                }

                console.log("訂單響應:", response);

                if (response && response.data) {
                    let orderData = [];

                    // 處理不同格式的API響應
                    if (response.data.success === true && response.data.data) {
                        if (Array.isArray(response.data.data)) {
                            orderData = response.data.data;
                        } else {
                            console.warn("API響應中的data不是數組:", response.data.data);
                            orderData = [response.data.data]; // 如果是單個對象，轉為數組
                        }
                    } else if (response.data.code === 200 && response.data.data) {
                        if (Array.isArray(response.data.data)) {
                            orderData = response.data.data;
                        } else {
                            console.warn("API響應中的data不是數組:", response.data.data);
                            orderData = [response.data.data]; // 如果是單個對象，轉為數組
                        }
                    } else if (Array.isArray(response.data)) {
                        orderData = response.data;
                    } else {
                        console.warn("未識別的API響應格式，嘗試提取可能的訂單數據:", response.data);
                        // 最後嘗試將響應視為單個訂單
                        if (response.data.id || response.data.orderId) {
                            orderData = [response.data];
                        }
                    }

                    // 處理訂單數據
                    if (orderData.length > 0) {
                        orderData = processOrdersData(orderData);
                        orders.value = orderData;
                        filterOrders();
                    } else {
                        console.warn("獲取的訂單數據為空");
                        orders.value = [];
                    }
                } else {
                    console.error("獲取訂單列表失敗：無效響應");
                    ElMessage.error("獲取訂單列表失敗：無效響應");
                    orders.value = [];
                }
            } catch (error) {
                console.error("獲取訂單列表失敗:", error);
                ElMessage.error("獲取訂單列表失敗: " + (error.message || "未知錯誤"));
                orders.value = [];
            } finally {
                loading.value = false;
            }
        };

        // 處理訂單數據
        const processOrdersData = (ordersList) => {
            if (!Array.isArray(ordersList)) return [];

            return ordersList.map((order) => {
                // 標準化訂單ID
                if (!order.id && order.orderId) {
                    order.id = order.orderId;
                }

                // 確保訂單項數組存在
                if (!order.orderItems || !Array.isArray(order.orderItems)) {
                    order.orderItems = [];
                }

                // 處理訂單項商品數據
                order.orderItems.forEach((item) => {
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

                return order;
            });
        };

        // 過濾訂單
        const filterOrders = () => {
            if (!orders.value || !Array.isArray(orders.value)) {
                filteredOrders.value = [];
                return;
            }

            if (statusFilter.value === "all") {
                filteredOrders.value = [...orders.value];
            } else {
                filteredOrders.value = orders.value.filter((order) => {
                    if (!order.status) return false;

                    const status = order.status.toLowerCase();
                    if (statusFilter.value === "pending") {
                        return status.includes("pending") || status === "pending_payment";
                    } else if (statusFilter.value === "processing") {
                        return status.includes("process") || status === "processing";
                    } else if (statusFilter.value === "completed") {
                        return (
                            status.includes("complet") ||
                            status === "completed" ||
                            status.includes("paid")
                        );
                    }
                    return false;
                });
            }

            // 重置分頁
            currentPage.value = 1;
        };

        // 計算當前頁面的訂單
        const displayOrders = computed(() => {
            const startIdx = (currentPage.value - 1) * pageSize.value;
            const endIdx = startIdx + pageSize.value;
            return filteredOrders.value.slice(startIdx, endIdx);
        });

        // 計算總頁數
        const totalPages = computed(() => {
            return Math.ceil(filteredOrders.value.length / pageSize.value);
        });

        // 處理頁碼變更
        const handlePageChange = (page) => {
            currentPage.value = page;
            // 滾動到頁面頂部
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
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
            return "https://via.placeholder.com/80x80?text=無圖片";
        };

        // 計算訂單總額
        const calculateOrderTotal = (order) => {
            if (!order || !order.orderItems || !order.orderItems.length) {
                return "0.00";
            }

            let total = 0;
            order.orderItems.forEach((item) => {
                const price = parseFloat(item.product?.price || item.price || 0);
                const quantity = parseInt(item.quantity) || 0;
                total += price * quantity;
            });

            // 加上運費和減去折扣
            const shippingFee = parseFloat(order.shippingFee || 0);
            const discount = parseFloat(order.discount || 0);

            return (total + shippingFee - discount).toFixed(2);
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

        // 檢查是否為待付款狀態
        const isPendingPayment = (order) => {
            if (!order || !order.status) return false;

            const statusLower = order.status.toLowerCase();
            return statusLower.includes("pending") || statusLower === "pending_payment";
        };

        // 跳轉到訂單詳情頁
        const goToOrderDetail = (orderId) => {
            if (!orderId) {
                ElMessage.warning("訂單ID無效");
                return;
            }

            router.push(`/shop/orders/${orderId}`);
        };

        // 跳轉到支付頁面
        const goToPayment = (order) => {
            if (!order || !order.id) {
                ElMessage.warning("訂單信息不完整，無法跳轉到支付頁面");
                return;
            }

            router.push({
                path: "/shop/payment",
                query: { orderId: order.id },
            });
        };

        // 格式化日期
        const formatDate = (dateString) => {
            if (!dateString) return "N/A";
            const date = new Date(dateString);
            return date.toLocaleString("zh-TW", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
        };

        // 監聽狀態過濾器變化
        watch(statusFilter, () => {
            filterOrders();
        });

        onMounted(() => {
            fetchOrders();
        });

        return {
            orders,
            loading,
            statusFilter,
            filteredOrders,
            displayOrders,
            currentPage,
            pageSize,
            totalPages,
            getProductImage,
            calculateOrderTotal,
            getStatusType,
            getStatusLabel,
            isPendingPayment,
            handlePageChange,
            goToOrderDetail,
            goToPayment,
            filterOrders,
            formatDate,
        };
    },
};
</script>

<style lang="scss" scoped>
.order-list-page {
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

    .filter-group {
        display: flex;
        gap: 1rem;
    }
}

// 訂單卡片
.order-cards {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .order-card {
        background-color: #1e293b;
        border-radius: 12px;
        overflow: hidden;
        transition: transform 0.3s, box-shadow 0.3s;
        cursor: pointer;

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
        }

        :deep(.el-card__body) {
            padding: 0;
        }
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
        }

        .order-date {
            font-size: 0.9rem;
            color: #9ca3af;
        }
    }
}

// 訂單商品
.order-products {
    padding: 1rem 1.5rem;

    .product-list {
        .product-item {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;

            &:last-child {
                margin-bottom: 0;
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
                    color: #9ca3af;
                    font-size: 12px;
                }
            }

            .product-info {
                flex: 1;

                .product-name {
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                    color: #f3f4f6;
                    // 限制文本行數
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                }

                .product-price {
                    font-size: 0.9rem;
                    color: #9ca3af;
                }
            }
        }

        .more-products {
            color: #9ca3af;
            font-size: 0.9rem;
            font-style: italic;
            padding-top: 0.5rem;
            text-align: center;
        }
    }

    .no-products {
        color: #9ca3af;
        font-style: italic;
        text-align: center;
        padding: 1rem 0;
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

// 分頁容器
.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
}

// Element Plus 元素樣式覆蓋
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

    .card-footer {
        flex-direction: column;
        gap: 1rem;

        .order-amount {
            text-align: center;
        }

        .order-actions {
            width: 100%;

            .el-button {
                flex: 1;
            }
        }
    }
}
</style>
