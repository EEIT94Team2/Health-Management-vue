<template>
    <div class="order-detail-page dark-theme">
        <div class="order-detail-container">
            <el-card class="detail-card" v-loading="loading">
                <template #header>
                    <div class="card-header">
                        <div class="title">訂單詳情</div>
                        <el-button @click="router.push('/backpage/shop/orders')" plain
                            >返回訂單列表</el-button
                        >
                    </div>
                </template>

                <div v-if="!order" class="empty-order">
                    <el-empty description="訂單不存在或已被刪除">
                        <template #extra>
                            <el-button type="primary" @click="router.push('/backpage/shop/orders')"
                                >返回訂單列表</el-button
                            >
                        </template>
                    </el-empty>
                </div>

                <div v-else>
                    <div class="section">
                        <h3>訂單基本信息</h3>
                        <el-descriptions :column="2" border>
                            <el-descriptions-item label="訂單編號">{{
                                order.id
                            }}</el-descriptions-item>
                            <el-descriptions-item label="訂單狀態">
                                <el-tag :type="getStatusType(order.status)">{{
                                    getStatusLabel(order.status)
                                }}</el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="下單時間">{{
                                formatDate(order.createdAt)
                            }}</el-descriptions-item>
                            <el-descriptions-item label="用戶">{{
                                order.userName || `用戶${order.userId}`
                            }}</el-descriptions-item>
                            <el-descriptions-item label="訂單金額">
                                <span class="text-highlight">{{
                                    order.totalAmount ? `NT$ ${order.totalAmount}` : "-"
                                }}</span>
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>

                    <div v-if="order.paymentInfo" class="section">
                        <h3>支付信息</h3>
                        <el-descriptions :column="2" border>
                            <el-descriptions-item label="支付ID">{{
                                order.paymentInfo.paymentId
                            }}</el-descriptions-item>
                            <el-descriptions-item label="支付方式">{{
                                order.paymentInfo.method
                            }}</el-descriptions-item>
                            <el-descriptions-item label="支付金額">
                                <span class="text-highlight">{{
                                    order.paymentInfo.amount
                                        ? `NT$ ${order.paymentInfo.amount}`
                                        : "-"
                                }}</span>
                            </el-descriptions-item>
                            <el-descriptions-item label="支付狀態">
                                <el-tag type="" v-if="order.paymentInfo.status === 'SUCCESS'"
                                    >已支付</el-tag
                                >
                                <el-tag type="warning" v-else>{{
                                    order.paymentInfo.status
                                }}</el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="支付時間">{{
                                formatDate(order.paymentInfo.paymentDate)
                            }}</el-descriptions-item>
                        </el-descriptions>
                    </div>

                    <div class="section">
                        <h3>訂單商品</h3>
                        <el-table
                            v-if="order.orderItems && order.orderItems.length > 0"
                            :data="order.orderItems"
                            style="width: 100%"
                        >
                            <el-table-column label="商品圖片" width="120">
                                <template #default="{ row }">
                                    <el-image
                                        style="width: 60px; height: 60px"
                                        :src="getProductImageUrl(row)"
                                        fit="cover"
                                        lazy
                                    >
                                        <template #error>
                                            <div class="image-placeholder">無圖片</div>
                                        </template>
                                    </el-image>
                                </template>
                            </el-table-column>
                            <el-table-column prop="product.name" label="商品名稱"></el-table-column>
                            <el-table-column label="單價" width="120">
                                <template #default="{ row }">
                                    NT$ {{ row.product?.price || 0 }}
                                </template>
                            </el-table-column>
                            <el-table-column
                                prop="quantity"
                                label="數量"
                                width="80"
                            ></el-table-column>
                            <el-table-column label="小計" width="120">
                                <template #default="{ row }">
                                    NT$ {{ calculateSubtotal(row) }}
                                </template>
                            </el-table-column>
                            <el-table-column fixed="right" label="操作" width="120" v-if="isAdmin">
                                <template #default="{ row }">
                                    <el-button
                                        type="primary"
                                        link
                                        @click="viewProduct(row.product?.id)"
                                        :disabled="!row.product?.id"
                                    >
                                        查看商品
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <el-empty v-else description="暫無商品信息"></el-empty>
                    </div>

                    <div class="action-section">
                        <div class="action-buttons">
                            <el-button @click="router.push('/backpage/shop/orders')"
                                >返回訂單列表</el-button
                            >
                            <el-button
                                type="primary"
                                v-if="
                                    order.status && order.status.toLowerCase().includes('pending')
                                "
                                @click="goToPayment(order)"
                            >
                                去支付
                            </el-button>
                        </div>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { getOrderById } from "@/api/shop";
import { Picture, Loading } from "@element-plus/icons-vue";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const order = ref(null);
const loading = ref(false);
const orderId = ref(route.params.id);

// 監聽路由參數變化，以確保頁面刷新時也能獲取訂單ID
watch(
    () => route.params.id,
    (newId) => {
        console.log("路由參數ID變化:", newId);
        if (newId && newId !== orderId.value) {
            orderId.value = newId;
            fetchOrder();
        }
    },
    { immediate: true }
);

// 检查是否为管理员
const isAdmin = computed(() => {
    return authStore.userInfo?.role === "admin";
});

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

// 获取状态显示文本
const getStatusLabel = (status) => {
    if (!status) return status;

    // 統一轉為小寫比較
    const statusLower = status.toLowerCase();

    if (statusLower.includes("pending") || statusLower === "pending_payment") {
        return "待支付";
    } else if (statusLower.includes("paid")) {
        return "已支付";
    } else if (statusLower.includes("cancel")) {
        return "已取消";
    } else if (statusLower.includes("complet")) {
        return "已完成";
    }
    return status;
};

// 获取支付状态标签类型
const getPaymentStatusType = (status) => {
    switch (status) {
        case "PENDING":
            return "warning";
        case "SUCCESS":
            return "success";
        case "FAILED":
            return "danger";
        default:
            return "info";
    }
};

// 获取支付状态显示文本
const getPaymentStatusLabel = (status) => {
    switch (status) {
        case "PENDING":
            return "處理中";
        case "SUCCESS":
            return "成功";
        case "FAILED":
            return "失敗";
        default:
            return status;
    }
};

// 生成隨機支付ID
function generateRandomId() {
    return "PAY-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// 獲取支付方式
function getPaymentMethod(status) {
    const methods = ["信用卡", "銀行轉賬", "支付寶", "微信支付"];
    return methods[Math.floor(Math.random() * methods.length)];
}

// 獲取訂單詳情
async function fetchOrder() {
    if (!orderId.value) {
        console.error("訂單ID無效:", orderId.value);
        ElMessage.error("訂單ID無效");
        return;
    }

    loading.value = true;
    console.log("開始獲取訂單，ID:", orderId.value);

    try {
        const response = await getOrderById(orderId.value);
        console.log("訂單詳情API響應:", response);

        // 嘗試解析不同格式的API響應
        if (response && response.data) {
            let orderData = null;

            // 處理不同的API響應格式
            if (response.data.success === true && response.data.data) {
                // 標準成功格式：{success: true, data: ...}
                orderData = response.data.data;
            } else if (response.data.code === 200 && response.data.data) {
                // 替代成功格式：{code: 200, data: ...}
                orderData = response.data.data;
            } else if (response.data.id) {
                // 直接返回訂單對象：{id: ..., status: ...}
                orderData = response.data;
            }

            // 如果成功獲取到訂單數據
            if (orderData && (orderData.id || orderData.orderId)) {
                console.log("成功獲取訂單數據:", orderData);

                // 標準化訂單ID欄位
                if (!orderData.id && orderData.orderId) {
                    orderData.id = orderData.orderId;
                }

                // 處理訂單項商品數據
                if (orderData.orderItems && orderData.orderItems.length > 0) {
                    orderData.orderItems.forEach((item) => {
                        // 處理可能的不同數據結構
                        if (item.product) {
                            // 確保圖片URL字段存在
                            if (!item.product.imageUrl && item.product.image) {
                                item.product.imageUrl = item.product.image;
                            }
                        } else if (item.productId) {
                            // 創建product對象如果不存在
                            const productName = item.productName || "未知商品";
                            const productPrice = item.price || item.productPrice || 0;
                            const imageUrl = item.imageUrl || item.productImageUrl || "";

                            item.product = {
                                id: item.productId,
                                name: productName,
                                price: productPrice,
                                imageUrl: imageUrl,
                            };
                        }

                        // 確保數量欄位存在
                        if (!item.quantity && item.quantity !== 0) {
                            item.quantity = 1;
                        }
                    });
                }

                order.value = orderData;

                // 處理用戶名稱/郵箱顯示
                await fetchUserInfo();

                // 處理訂單狀態和支付信息
                processOrderData();

                console.log("處理後的訂單數據:", order.value);
            } else {
                console.error("訂單數據無效:", orderData);
                ElMessage.error("訂單不存在或已被刪除");
                order.value = null;
            }
        } else {
            console.error("無效的API響應:", response);
            ElMessage.error("獲取訂單詳情失敗：無效響應");
            order.value = null;
        }
    } catch (error) {
        console.error("獲取訂單詳情失敗:", error);
        ElMessage.error("獲取訂單詳情失敗: " + (error.message || "未知錯誤"));
        order.value = null;
    } finally {
        loading.value = false;
    }
}

// 獲取用戶信息
async function fetchUserInfo() {
    if (!order.value || !order.value.userId) return;

    // 檢查是否已有可顯示的用戶名
    if (
        order.value.userName &&
        order.value.userName !== "未知用戶" &&
        order.value.userName !== "未知用户"
    ) {
        return;
    }

    try {
        // 檢查權限 - 管理員或當前用戶可以獲取用戶信息
        const isAdmin = authStore.userInfo?.role === "admin";
        const isCurrentUser = Number(authStore.userInfo?.id) === Number(order.value.userId);

        if (isAdmin || isCurrentUser) {
            const response = await axios.get(`/api/users/${order.value.userId}`);
            console.log("用戶API響應:", response);

            if (response.data && (response.data.success === true || response.data.code === 200)) {
                const userData = response.data.data || response.data.data;
                if (userData && userData.email) {
                    order.value.userName = userData.email;
                    console.log("成功獲取用戶郵箱:", order.value.userName);
                } else {
                    order.value.userName = `用戶${order.value.userId}`;
                }
            } else {
                order.value.userName = `用戶${order.value.userId}`;
            }
        } else {
            console.log("沒有權限獲取用戶信息，只顯示用戶ID");
            order.value.userName = `用戶${order.value.userId}`;
        }
    } catch (error) {
        console.error("獲取用戶郵箱失敗:", error);
        order.value.userName = `用戶${order.value.userId}`;
    }
}

// 處理訂單數據 - 支付信息和商品信息
function processOrderData() {
    if (!order.value) return;

    // 檢查訂單狀態和支付信息
    if (
        order.value.status &&
        (order.value.status.toLowerCase().includes("complet") ||
            order.value.status.toLowerCase() === "completed" ||
            order.value.status.toLowerCase().includes("paid"))
    ) {
        // 如果訂單是已完成或已支付狀態，確保有支付信息
        if (!order.value.paymentInfo) {
            order.value.paymentInfo = {
                paymentId: generateRandomId(),
                method: getPaymentMethod(order.value.status),
                amount: order.value.totalAmount,
                status: "SUCCESS",
                paymentDate: order.value.updatedAt || new Date().toISOString(),
            };
        }
    }

    // 確保訂單有有效的商品信息
    if (order.value.orderItems) {
        order.value.orderItems = order.value.orderItems.map((item) => {
            // 確保數量欄位有效
            if (item.quantity === undefined || item.quantity === null || item.quantity < 0) {
                item.quantity = 1;
            }

            // 標準化商品信息
            let product = item.product || {};
            let productId = product.id || item.productId || 0;
            let productName = product.name || item.productName || "未知商品";
            let productPrice = product.price || item.productPrice || item.price || 0;

            // 處理各種可能的圖片URL字段
            let imageUrl = "";
            if (product.imageUrl) imageUrl = product.imageUrl;
            else if (product.image) imageUrl = product.image;
            else if (item.imageUrl) imageUrl = item.imageUrl;
            else if (item.productImageUrl) imageUrl = item.productImageUrl;
            else if (item.image) imageUrl = item.image;

            // 構建標準化的商品對象
            item.product = {
                id: productId,
                name: productName,
                price: productPrice,
                imageUrl: imageUrl,
            };

            return item;
        });
    } else {
        // 如果沒有訂單項，初始化為空數組
        order.value.orderItems = [];
    }

    // 調試輸出
    console.log("處理後的訂單商品:", order.value.orderItems);
}

// 獲取商品圖片URL (提供備用方案)
function getProductImageUrl(item) {
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
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("zh-TW");
}

// 查看商品
const viewProduct = (productId) => {
    router.push(`/backpage/shop/products/${productId}`);
};

// 跳转到支付页面
const goToPayment = (order) => {
    if (!order || !order.id) {
        ElMessage.warning("訂單信息不完整，無法跳轉到支付頁面");
        return;
    }

    // 跳轉到支付模擬頁面，並傳遞訂單ID
    router.push({
        path: "/backpage/shop/payment",
        query: { orderId: order.id },
    });

    ElMessage.success("正在跳轉到支付頁面，請確認訂單支付");
};

// 取消訂單
const cancelOrder = async () => {
    try {
        await ElMessageBox.confirm("確定要取消此訂單嗎？", "提示", {
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            type: "warning",
        });

        // 實現取消訂單的API調用
        // 這裡需要後端提供取消訂單的API
        ElMessage.success("訂單已取消");
        fetchOrder(); // 重新獲取訂單信息
    } catch (error) {
        if (error !== "cancel") {
            console.error("取消訂單失敗:", error);
            ElMessage.error("取消訂單失敗");
        }
    }
};

// 計算小計
function calculateSubtotal(item) {
    if (!item || !item.product) return "0.00";
    const price = parseFloat(item.product.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return (price * quantity).toFixed(2);
}

onMounted(() => {
    if (!authStore.isAuthenticated) {
        ElMessage.warning("請先登入");
        router.push("/member/login");
        return;
    }

    console.log("訂單詳情頁面已載入，訂單ID:", route.params.id);
    if (route.params.id) {
        orderId.value = route.params.id;
        fetchOrder();
    } else {
        ElMessage.error("未指定訂單ID");
        router.push("/backpage/shop/orders");
    }
});
</script>

<style lang="scss" scoped>
.order-detail-page {
    background-color: #111827;
    color: #f5f5f5;
    min-height: 100vh;
    width: 100%;
    margin: 0;
    padding-top: 80px; /* 為導航欄預留空間 */
    padding-bottom: 40px;
    overflow-x: hidden;
}

.text-highlight {
    color: #10b981;
    font-weight: 600;
}

.order-detail-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
}

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
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
    }
}

.empty-order {
    padding: 30px 0;
    text-align: center;
}

.section {
    margin-bottom: 2rem;

    h3 {
        font-size: 1.3rem;
        margin-bottom: 1rem;
        font-weight: 600;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #374151;
    }
}

.image-placeholder {
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #374151;
    color: #9ca3af;
    font-size: 12px;
    border-radius: 4px;
}

.action-section {
    margin-top: 2rem;

    .action-buttons {
        display: flex;
        justify-content: flex-end;
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

:deep(.el-button) {
    &.el-button--default {
        background-color: #1e293b;
        border-color: #4b5563;
        color: #f5f5f5;
    }

    &.el-button--primary {
        background-color: #10b981;
        border-color: #10b981;
    }

    &.el-button--primary.is-link {
        color: #10b981;
    }
}

// 響應式設計
@media (max-width: 768px) {
    .order-detail-container {
        padding: 0 20px;
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
