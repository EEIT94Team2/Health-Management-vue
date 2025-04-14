<template>
    <div class="order-detail">
        <el-card class="detail-container" v-loading="loading">
            <template #header>
                <div class="detail-header">
                    <h2>訂單詳情</h2>
                    <div class="header-actions">
                        <el-button @click="$router.push('/backpage/shop/orders')"
                            >返回訂單列表</el-button
                        >
                    </div>
                </div>
            </template>

            <div v-if="order" class="order-content">
                <div class="order-info-card">
                    <div class="order-info-header">
                        <h3>訂單信息</h3>
                        <el-tag :type="getStatusType(order.status)">
                            {{ getStatusLabel(order.status) }}
                        </el-tag>
                    </div>

                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="訂單編號">{{ order.id }}</el-descriptions-item>
                        <el-descriptions-item label="下單時間">{{
                            formatDate(order.createdAt)
                        }}</el-descriptions-item>
                        <el-descriptions-item label="訂單金額"
                            >${{ order.totalAmount }}</el-descriptions-item
                        >
                        <el-descriptions-item label="支付方式">
                            {{ getPaymentMethod(order.status) }}
                        </el-descriptions-item>
                        <el-descriptions-item label="用戶郵箱">
                            {{ order.userName || `用戶${order.userId}` }}
                        </el-descriptions-item>
                        <el-descriptions-item label="聯繫方式" v-if="order.contactInfo">{{
                            order.contactInfo
                        }}</el-descriptions-item>
                        <el-descriptions-item label="備註" :span="2" v-if="order.note">{{
                            order.note
                        }}</el-descriptions-item>
                    </el-descriptions>

                    <div class="order-actions" v-if="order.status === 'PENDING_PAYMENT'">
                        <el-button type="primary" @click="goToPayment">去支付</el-button>
                        <el-button type="danger" @click="cancelOrder">取消訂單</el-button>
                    </div>
                </div>

                <div class="order-items-card">
                    <h3>訂單商品</h3>
                    <div v-if="!order.orderItems || order.orderItems.length === 0" class="no-items">
                        <el-empty description="暫無商品數據" />
                    </div>
                    <el-table v-else :data="order.orderItems" style="width: 100%">
                        <el-table-column label="商品圖片" width="100">
                            <template #default="{ row }">
                                <el-image
                                    v-if="row.productImageUrl"
                                    :src="row.productImageUrl"
                                    fit="cover"
                                    class="product-image"
                                    @click="viewProduct(row.productId)"
                                />
                                <el-image
                                    v-else
                                    src="https://via.placeholder.com/80x80?text=No+Image"
                                    fit="cover"
                                    class="product-image"
                                />
                            </template>
                        </el-table-column>

                        <el-table-column label="商品名稱" min-width="200">
                            <template #default="{ row }">
                                <div class="product-name" @click="viewProduct(row.productId)">
                                    {{ row.productName }}
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="單價" width="120">
                            <template #default="{ row }"> ${{ row.productPrice || 0 }} </template>
                        </el-table-column>

                        <el-table-column label="數量" width="80">
                            <template #default="{ row }">
                                {{ row.quantity || 0 }}
                            </template>
                        </el-table-column>

                        <el-table-column label="小計" width="120">
                            <template #default="{ row }">
                                ${{ row.subtotal || (row.productPrice * row.quantity).toFixed(2) }}
                            </template>
                        </el-table-column>
                    </el-table>

                    <div class="order-summary">
                        <div class="order-total">
                            <div>
                                商品總額: <span>${{ order.totalAmount || 0 }}</span>
                            </div>
                            <div>運費: <span>$0.00</span></div>
                            <div class="final-total">
                                實付金額: <span>${{ order.totalAmount || 0 }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="order-payment-card" v-if="order.payment">
                    <h3>支付信息</h3>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="支付編號">{{
                            order.payment.id
                        }}</el-descriptions-item>
                        <el-descriptions-item label="支付時間">{{
                            formatDate(order.payment.paidAt)
                        }}</el-descriptions-item>
                        <el-descriptions-item label="支付方式">{{
                            order.payment.method
                        }}</el-descriptions-item>
                        <el-descriptions-item label="支付金額"
                            >${{ order.payment.amount }}</el-descriptions-item
                        >
                        <el-descriptions-item label="交易狀態">
                            <el-tag :type="getPaymentStatusType(order.payment.status)">
                                {{ getPaymentStatusLabel(order.payment.status) }}
                            </el-tag>
                        </el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>

            <el-empty v-else-if="!loading" description="訂單不存在或已被刪除"></el-empty>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { getOrderById } from "@/api/shop";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const orderId = ref(parseInt(route.params.id));
const order = ref(null);
const loading = ref(false);

// 检查是否为管理员
const isAdmin = computed(() => {
    return authStore.userRole === "admin";
});

// 根据状态获取标签类型
const getStatusType = (status) => {
    switch (status) {
        case "PENDING_PAYMENT":
            return "warning";
        case "PAID":
            return "success";
        case "CANCELLED":
            return "info";
        case "COMPLETED":
            return "primary";
        default:
            return "";
    }
};

// 获取状态显示文本
const getStatusLabel = (status) => {
    switch (status) {
        case "PENDING_PAYMENT":
            return "待支付";
        case "PAID":
            return "已支付";
        case "CANCELLED":
            return "已取消";
        case "COMPLETED":
            return "已完成";
        default:
            return status;
    }
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

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
    ).padStart(2, "0")}`;
};

// 获取订单详情
const fetchOrder = async () => {
    if (!orderId.value) {
        ElMessage.error("訂單ID無效");
        router.push("/backpage/shop/orders");
        return;
    }

    loading.value = true;
    try {
        const response = await getOrderById(orderId.value);

        if (response && response.data) {
            // 处理API返回的数据
            order.value = response.data;

            // 确保显示用户名称
            if (!order.value.userName || order.value.userName === "未知用戶") {
                // 嘗試獲取用戶email
                try {
                    const userResponse = await axios.get(`/api/users/${order.value.userId}`);
                    if (userResponse.data && userResponse.data.email) {
                        order.value.userName = userResponse.data.email;
                    } else {
                        order.value.userName = `用戶${order.value.userId}`;
                    }
                } catch (error) {
                    console.error("獲取用戶信息失敗:", error);
                    order.value.userName = `用戶${order.value.userId}`;
                }
            }

            // 如果訂單狀態為completed或COMPLETED，嘗試獲取支付信息
            if (order.value.status === "completed" || order.value.status === "COMPLETED") {
                try {
                    // 模擬支付信息，實際應該從API獲取
                    if (!order.value.payment) {
                        order.value.payment = {
                            id: `PAY-${order.value.id}`,
                            method: "信用卡",
                            amount: order.value.totalAmount,
                            status: "SUCCESS",
                            paidAt: new Date().toISOString(),
                        };
                    }
                } catch (error) {
                    console.error("獲取支付信息失敗:", error);
                }
            }

            // 确保订单项目数据完整
            if (order.value.orderItems) {
                order.value.orderItems.forEach((item) => {
                    // 如果没有提供数量，默认为1
                    if (!item.quantity || item.quantity <= 0) {
                        item.quantity = 1;
                    }

                    // 添加基本的商品信息结构，如果不存在
                    if (!item.product) {
                        item.product = {
                            id: item.productId,
                            name: item.productName || `商品 #${item.productId}`,
                            price: item.productPrice,
                        };
                    }
                });
            }

            console.log("订单数据:", order.value);
        } else {
            ElMessage.error("獲取訂單詳情失敗");
            order.value = null;
        }
    } catch (error) {
        console.error("獲取訂單詳情時出錯:", error);
        ElMessage.error(`獲取訂單詳情失敗: ${error.message || "未知錯誤"}`);
        order.value = null;
    } finally {
        loading.value = false;
    }
};

// 查看商品
const viewProduct = (productId) => {
    router.push(`/backpage/shop/products/${productId}`);
};

// 去支付
const goToPayment = () => {
    if (!order.value || order.value.status !== "PENDING_PAYMENT") {
        ElMessage.warning("當前訂單狀態不支持支付");
        return;
    }

    // 跳轉到支付頁面
    router.push({
        path: "/shop/checkout",
        query: { orderId: order.value.id },
    });
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

// 根据订单状态获取支付方式
const getPaymentMethod = (status) => {
    switch (status) {
        case "completed":
        case "COMPLETED":
            return "已完成支付";
        case "PAID":
        case "paid":
            return "已支付";
        case "CANCELLED":
        case "cancelled":
            return "已取消";
        case "PENDING_PAYMENT":
        case "pending":
        default:
            return "未支付";
    }
};

onMounted(() => {
    if (!authStore.isAuthenticated) {
        ElMessage.warning("請先登入");
        router.push("/member/login");
        return;
    }
    fetchOrder();
});
</script>

<style scoped>
.order-detail {
    padding: 20px;
}

.detail-container {
    max-width: 1000px;
    margin: 0 auto;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.order-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.order-info-card,
.order-items-card,
.order-payment-card {
    padding: 20px;
    background-color: #f8f8f8;
    border-radius: 4px;
}

.order-info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.order-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.product-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    cursor: pointer;
}

.product-name {
    cursor: pointer;
    color: #409eff;
}

.product-name:hover {
    text-decoration: underline;
}

.text-muted {
    color: #909399;
    cursor: default;
}

.text-muted:hover {
    text-decoration: none;
}

.no-items {
    padding: 30px 0;
    text-align: center;
}

.order-summary {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.order-total {
    width: 300px;
    padding: 15px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.order-total div {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.order-total .final-total {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #eee;
    font-weight: bold;
    font-size: 18px;
}

.final-total span {
    color: #f56c6c;
}
</style>
