<template>
    <div class="order-list">
        <el-card class="order-container">
            <template #header>
                <div class="order-header">
                    <h2>訂單管理</h2>
                    <div class="filter-container">
                        <el-input
                            v-model="searchQuery"
                            placeholder="搜索訂單"
                            class="search-input"
                            clearable
                            @keyup.enter="searchOrders"
                        >
                            <template #append>
                                <el-button icon="Search" @click="searchOrders"></el-button>
                            </template>
                        </el-input>

                        <el-select
                            v-model="statusFilter"
                            placeholder="訂單狀態"
                            class="status-select"
                            @change="fetchOrders"
                        >
                            <el-option
                                v-for="item in statusOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            >
                            </el-option>
                        </el-select>

                        <el-date-picker
                            v-model="dateRange"
                            type="daterange"
                            class="date-picker"
                            range-separator="至"
                            start-placeholder="開始日期"
                            end-placeholder="結束日期"
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            @change="fetchOrders"
                        />
                    </div>
                </div>
            </template>

            <div v-if="loading" class="loading-container">
                <el-skeleton :rows="5" animated />
            </div>

            <div v-else-if="orders.length === 0" class="empty-orders">
                <el-empty description="暫無訂單">
                    <el-button type="primary" @click="$router.push('/backpage/shop/products')"
                        >去購物</el-button
                    >
                </el-empty>
            </div>

            <div v-else class="order-content">
                <el-table :data="orders" style="width: 100%" border stripe>
                    <el-table-column prop="id" label="訂單編號" width="100" />

                    <el-table-column prop="createdAt" label="下單時間" width="160">
                        <template #default="{ row }">
                            {{ formatDate(row.createdAt) }}
                        </template>
                    </el-table-column>

                    <el-table-column label="訂單金額" width="120" align="right">
                        <template #default="{ row }">
                            <span class="price-tag">${{ row.totalAmount }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="status" label="訂單狀態" width="100" align="center">
                        <template #default="{ row }">
                            <el-tag :type="getStatusType(row.status)" effect="dark">
                                {{ getStatusLabel(row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column label="商品數量" width="100" align="center">
                        <template #default="{ row }">
                            {{ getItemsQuantity(row) }}
                        </template>
                    </el-table-column>

                    <el-table-column prop="userName" label="用戶" min-width="180" v-if="isAdmin">
                        <template #default="{ row }">
                            <div
                                v-if="
                                    row.userName &&
                                    row.userName !== '未知用戶' &&
                                    row.userName !== '未知用户'
                                "
                                class="user-info"
                            >
                                <el-avatar :size="28" class="user-avatar">
                                    {{ row.userName.substring(0, 1).toUpperCase() }}
                                </el-avatar>
                                {{ row.userName }}
                            </div>
                            <div v-else>
                                <el-tooltip
                                    effect="dark"
                                    content="正在獲取用戶信息..."
                                    placement="top"
                                    v-if="loadingUsers[row.id]"
                                >
                                    <span>加載中...</span>
                                </el-tooltip>
                                <span v-else @click="fetchUserEmail(row)" class="user-id-text">
                                    用戶{{ row.userId }}
                                    <i class="el-icon-refresh-right"></i>
                                </span>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="180" fixed="right" align="center">
                        <template #default="{ row }">
                            <div class="operation-buttons">
                                <el-button
                                    type="primary"
                                    size="small"
                                    @click="viewOrder(row.id)"
                                    class="view-btn"
                                    :icon="View"
                                >
                                    查看
                                </el-button>

                                <el-button
                                    v-if="
                                        row.status &&
                                        (row.status.toLowerCase().includes('pending') ||
                                            row.status === 'PENDING_PAYMENT')
                                    "
                                    type="success"
                                    size="small"
                                    @click="goToPayment(row)"
                                    :icon="Wallet"
                                >
                                    支付
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="pagination">
                    <el-pagination
                        v-model:current-page="currentPage"
                        v-model:page-size="pageSize"
                        :page-sizes="[10, 20, 50, 100]"
                        layout="total, sizes, prev, pager, next"
                        :total="total"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        background
                    />
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Search, View, Wallet } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { getOrders, getOrdersByUserId } from "@/api/shop";
import axios from "axios";

const router = useRouter();
const authStore = useAuthStore();
const orders = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchQuery = ref("");
const statusFilter = ref("");
const dateRange = ref([]);
const loadingUsers = ref({});

// 检查是否为管理员
const isAdmin = computed(() => {
    return authStore.userRole === "admin";
});

// 订单状态选项
const statusOptions = [
    { label: "全部", value: "" },
    { label: "待處理", value: "pending" },
    { label: "處理中", value: "processing" },
    { label: "已支付", value: "paid" },
    { label: "已完成", value: "completed" },
    { label: "已取消", value: "cancelled" },
];

// 獲取狀態顯示類型
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

// 獲取用戶友好的狀態文本
function getStatusLabel(status) {
    if (!status) return "未知";

    // 統一轉為小寫比較
    const statusLower = status.toLowerCase();

    if (statusLower.includes("pending")) {
        return "待處理";
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
}

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

// 获取订单列表
const fetchOrders = async () => {
    if (!authStore.isAuthenticated) {
        ElMessage.warning("請先登入");
        router.push("/member/login");
        return;
    }

    loading.value = true;
    try {
        // 構建查詢參數
        const queryParams = {
            page: currentPage.value,
            size: pageSize.value,
        };

        // 如果存在搜索關鍵詞，添加到請求參數中
        if (searchQuery.value && searchQuery.value.trim() !== "") {
            queryParams.query = searchQuery.value.trim();
        }

        // 添加狀態篩選，如果已選擇
        if (statusFilter.value) {
            queryParams.status = statusFilter.value;
        }

        // 添加日期範圍篩選，如果已選擇
        if (dateRange.value && dateRange.value.length === 2) {
            queryParams.startDate = dateRange.value[0];
            queryParams.endDate = dateRange.value[1];
        }

        console.log("查詢訂單參數:", queryParams);

        let response;
        // 根據用戶角色選擇合適的API
        if (isAdmin.value) {
            response = await getOrders(queryParams);
        } else {
            // 普通用戶只能查看自己的訂單
            const userId = authStore.userInfo?.id;
            if (!userId) {
                ElMessage.error("獲取用戶ID失敗，請重新登錄");
                loading.value = false;
                return;
            }
            response = await getOrdersByUserId(userId, queryParams);
        }

        console.log("獲取訂單響應:", response);

        // 處理API返回的數據
        if (response && response.data) {
            let ordersData = [];
            let totalCount = 0;

            // 檢查不同可能的數據結構
            if (response.data.data) {
                // 標準API響應格式: {success: true, data: {...}}
                const data = response.data.data;

                if (data.content) {
                    // 分頁格式: {content: [], totalElements: 10}
                    ordersData = data.content;
                    totalCount = data.totalElements || 0;
                } else if (Array.isArray(data)) {
                    // 直接數組格式
                    ordersData = data;
                    totalCount = data.length;
                } else {
                    console.warn("未知的訂單數據格式", data);
                }
            } else if (response.data.content) {
                // 直接分頁格式
                ordersData = response.data.content;
                totalCount = response.data.totalElements || 0;
            } else if (Array.isArray(response.data)) {
                // 直接數組
                ordersData = response.data;
                totalCount = response.data.length;
            } else {
                console.warn("無法識別的訂單API響應格式", response.data);
            }

            orders.value = ordersData;
            total.value = totalCount;

            // 如果是管理員，嘗試獲取用戶郵箱
            if (isAdmin.value && orders.value.length > 0) {
                orders.value.forEach((order) => {
                    if (
                        !order.userName ||
                        order.userName === "未知用戶" ||
                        order.userName === "未知用户"
                    ) {
                        fetchUserEmail(order);
                    }
                });
            }
        } else {
            console.error("獲取訂單列表失敗：無效響應", response);
            ElMessage.error("獲取訂單列表失敗：無效響應");
            orders.value = [];
            total.value = 0;
        }
    } catch (error) {
        console.error("獲取訂單列表失敗:", error);
        ElMessage.error(error.message || "獲取訂單列表失敗");
        orders.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

// 搜索订单
const searchOrders = () => {
    fetchOrders();
};

// 查看订单详情
const viewOrder = (orderId) => {
    if (!orderId) {
        console.error("無效的訂單ID:", orderId);
        ElMessage.error("無效的訂單ID");
        return;
    }

    console.log("正在打開訂單詳情，訂單ID:", orderId);
    try {
        const detailPath = `/backpage/shop/orders/${orderId}`;
        console.log("跳轉到路徑:", detailPath);
        router.push({
            path: detailPath,
            replace: false,
        });
    } catch (error) {
        console.error("導航到訂單詳情頁面失敗:", error);
        ElMessage.error("無法打開訂單詳情，請稍後再試");
    }
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

// 处理分页大小变化
const handleSizeChange = (val) => {
    pageSize.value = val;
    fetchOrders();
};

// 处理当前页变化
const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchOrders();
};

// 计算订单中的商品总数量
const getItemsQuantity = (order) => {
    if (!order.orderItems || order.orderItems.length === 0) {
        return 0;
    }

    return order.orderItems.reduce((total, item) => {
        return total + (parseInt(item.quantity) || 0);
    }, 0);
};

// 獲取用戶郵箱的方法
async function fetchUserEmail(order) {
    if (!order || !order.userId) return;

    loadingUsers.value[order.id] = true;
    try {
        const response = await axios.get(`/api/users/${order.userId}`);
        if (response.data.code === 200 && response.data.data) {
            order.userName = response.data.data.email || `用戶${order.userId}`;
        }
    } catch (error) {
        console.error("獲取用戶郵箱失敗:", error);
        order.userName = `用戶${order.userId}`;
    } finally {
        loadingUsers.value[order.id] = false;
    }
}

onMounted(() => {
    if (!authStore.isAuthenticated) {
        ElMessage.warning("請先登入");
        router.push("/member/login");
        return;
    }
    fetchOrders();
});
</script>

<style scoped>
.order-list {
    padding: 20px;
}

.order-container {
    max-width: 1200px;
    margin: 0 auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
}

.order-header h2 {
    margin: 0;
    font-size: 20px;
    color: #303133;
}

.filter-container {
    display: flex;
    gap: 15px;
    align-items: center;
    flex-wrap: wrap;
}

.search-input {
    width: 240px;
}

.status-select {
    width: 140px;
}

.date-picker {
    width: 260px;
}

.loading-container {
    padding: 20px 0;
}

.empty-orders {
    padding: 40px 0;
    text-align: center;
}

.order-content {
    margin-top: 20px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

.price-tag {
    color: #f56c6c;
    font-weight: bold;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.user-avatar {
    background-color: #409eff;
    color: white;
    font-weight: bold;
}

.user-id-text {
    color: #909399;
    cursor: pointer;
}

.user-id-text:hover {
    color: #409eff;
    text-decoration: underline;
}

.operation-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
}

.view-btn {
    min-width: 70px;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .order-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .filter-container {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
    }

    .search-input,
    .status-select,
    .date-picker {
        width: 100%;
    }
}
</style>
