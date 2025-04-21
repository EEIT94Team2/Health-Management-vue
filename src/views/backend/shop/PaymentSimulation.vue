<template>
    <div class="payment-simulation">
        <el-card class="simulation-container" v-loading="loading">
            <template #header>
                <div class="simulation-header">
                    <h2>支付模擬系統</h2>
                    <div class="right">
                        <el-button
                            type="success"
                            v-if="
                                currentOrder &&
                                (currentOrder.status === 'PENDING_PAYMENT' ||
                                    currentOrder.status?.toLowerCase().includes('pending'))
                            "
                            @click="processPayment"
                        >
                            立即支付訂單
                        </el-button>
                        <el-tag v-else type="warning">當前訂單暫時不支援支付</el-tag>
                    </div>
                </div>
            </template>

            <!-- 管理员访问控制 -->
            <div v-if="!isAdmin && !authStore.isAuthenticated" class="access-denied">
                <el-result
                    icon="error"
                    title="訪問被拒絕"
                    sub-title="抱歉，您需要登錄才能訪問此頁面"
                >
                    <template #extra>
                        <el-button type="primary" @click="$router.push('/member/login')"
                            >去登錄</el-button
                        >
                    </template>
                </el-result>
            </div>

            <!-- 管理员访问内容 -->
            <div v-else class="simulation-content">
                <!-- 訂單支付部分 -->
                <div
                    v-if="
                        currentOrder &&
                        (currentOrder.status === 'PENDING_PAYMENT' ||
                            currentOrder.status.toLowerCase().includes('pending'))
                    "
                    class="section order-payment"
                >
                    <h3>訂單支付</h3>
                    <el-alert type="info" :closable="false">
                        您正在為訂單 <strong>{{ currentOrder.id }}</strong> 進行支付，總金額:
                        <strong>${{ currentOrder.totalAmount }}</strong>
                    </el-alert>

                    <el-card class="payment-methods">
                        <h4>選擇支付方式</h4>

                        <!-- 支付平台選擇 -->
                        <div class="payment-platform">
                            <h5>支付平台</h5>
                            <el-radio-group v-model="selectedPaymentPlatform">
                                <el-radio label="STANDARD">標準支付</el-radio>
                                <el-radio label="NEWEBPAY">藍新金流</el-radio>
                            </el-radio-group>
                        </div>

                        <div class="methods-list">
                            <h5>支付方式</h5>
                            <el-radio-group v-model="selectedPaymentMethod">
                                <el-radio label="CREDIT_CARD">信用卡</el-radio>
                                <el-radio label="ALIPAY">支付寶</el-radio>
                                <el-radio label="WECHAT_PAY">微信支付</el-radio>
                                <el-radio
                                    v-if="selectedPaymentPlatform === 'NEWEBPAY'"
                                    label="LINEPAY"
                                    >LINE Pay</el-radio
                                >
                            </el-radio-group>
                        </div>

                        <div class="payment-summary">
                            <div class="summary-row">
                                <span>訂單金額：</span>
                                <span>${{ currentOrder.totalAmount }}</span>
                            </div>
                            <div class="summary-row">
                                <span>支付平台：</span>
                                <span>{{ getPaymentPlatformLabel(selectedPaymentPlatform) }}</span>
                            </div>
                            <div class="summary-row">
                                <span>支付方式：</span>
                                <span>{{ getPaymentMethodLabel(selectedPaymentMethod) }}</span>
                            </div>
                        </div>

                        <div class="payment-actions">
                            <el-button
                                @click="$router.push(`/backpage/shop/orders/${currentOrder.id}`)"
                                >返回訂單</el-button
                            >
                            <el-button type="primary" @click="processPayment">確認支付</el-button>
                        </div>
                    </el-card>
                </div>

                <div class="section order-search">
                    <h3>查詢訂單支付狀態</h3>
                    <el-form :model="searchForm" label-width="120px">
                        <el-form-item label="訂單編號">
                            <el-input v-model="searchForm.orderId" placeholder="請輸入訂單編號" />
                        </el-form-item>
                        <el-form-item label="支付編號">
                            <el-input v-model="searchForm.paymentId" placeholder="請輸入支付編號" />
                        </el-form-item>
                        <el-form-item label="支付平台">
                            <el-select v-model="searchForm.platform" placeholder="請選擇支付平台">
                                <el-option label="標準支付" value="STANDARD" />
                                <el-option label="藍新金流" value="NEWEBPAY" />
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="searchPayment"
                                >查詢支付狀態</el-button
                            >
                        </el-form-item>
                    </el-form>

                    <div v-if="paymentInfo" class="payment-info">
                        <el-result
                            :icon="getPaymentResultIcon(paymentInfo.status)"
                            :title="getPaymentResultTitle(paymentInfo.status)"
                            :sub-title="`支付編號: ${paymentInfo.id || '未提供'}`"
                        >
                            <template #extra>
                                <el-descriptions :column="2" border>
                                    <el-descriptions-item label="訂單編號">{{
                                        paymentInfo.orderId
                                    }}</el-descriptions-item>
                                    <el-descriptions-item label="支付時間">{{
                                        formatDate(paymentInfo.paidAt)
                                    }}</el-descriptions-item>
                                    <el-descriptions-item label="支付方式">{{
                                        paymentInfo.method
                                    }}</el-descriptions-item>
                                    <el-descriptions-item label="支付金額"
                                        >${{ paymentInfo.amount }}</el-descriptions-item
                                    >
                                    <el-descriptions-item label="支付平台">
                                        {{ paymentInfo.platform || "標準支付" }}
                                    </el-descriptions-item>
                                </el-descriptions>

                                <div class="actions" v-if="paymentInfo.status === 'PENDING'">
                                    <el-button type="success" @click="simulatePaymentSuccess">
                                        模擬支付成功
                                    </el-button>
                                    <el-button type="danger" @click="simulatePaymentFailure">
                                        模擬支付失敗
                                    </el-button>
                                </div>
                            </template>
                        </el-result>
                    </div>
                </div>

                <el-divider content-position="center">或者</el-divider>

                <div class="section pending-payments">
                    <h3>待處理支付清單</h3>
                    <div v-if="pendingPayments.length === 0" class="empty-pending">
                        <el-empty description="沒有待處理的支付" />
                    </div>

                    <el-table v-else :data="pendingPayments" style="width: 100%">
                        <el-table-column prop="id" label="支付編號" width="150" />
                        <el-table-column prop="orderId" label="訂單編號" width="120" />
                        <el-table-column prop="amount" label="金額" width="120">
                            <template #default="{ row }"> ${{ row.amount }} </template>
                        </el-table-column>
                        <el-table-column prop="method" label="支付方式" width="120" />
                        <el-table-column prop="platform" label="支付平台" width="120">
                            <template #default="{ row }">
                                {{ row.platform || "標準支付" }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="createdAt" label="創建時間" width="180">
                            <template #default="{ row }">
                                {{ formatDate(row.createdAt) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="status" label="狀態" width="120">
                            <template #default="{ row }">
                                <el-tag :type="getPaymentStatusType(row.status)">
                                    {{ getPaymentStatusLabel(row.status) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="200">
                            <template #default="{ row }">
                                <el-button
                                    type="success"
                                    size="small"
                                    @click="simulatePaymentCallbackByRow(row, 'SUCCESS')"
                                >
                                    模擬成功
                                </el-button>
                                <el-button
                                    type="danger"
                                    size="small"
                                    @click="simulatePaymentCallbackByRow(row, 'FAILED')"
                                >
                                    模擬失敗
                                </el-button>
                                <el-button
                                    type="primary"
                                    size="small"
                                    v-if="!currentOrder || currentOrder.id !== row.orderId"
                                    @click="loadOrderById(row.orderId)"
                                >
                                    選擇此訂單
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import {
    getPaymentStatus,
    mockPaymentCallback,
    createPayment,
    getOrderById,
    createNewebpayPayment,
    getNewebpayPaymentStatus,
    mockNewebpayCallback,
    getOrdersByUserId,
} from "@/api/shop";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);
const searchForm = ref({
    orderId: "",
    paymentId: "",
    platform: "STANDARD",
});
const paymentInfo = ref(null);
const pendingPayments = ref([]);
const currentOrder = ref(null);
const orderLoaded = ref(false);
const selectedPaymentMethod = ref("CREDIT_CARD");
const selectedPaymentPlatform = ref("STANDARD");

// 检查是否为管理员
const isAdmin = computed(() => {
    return authStore.userRole === "admin";
});

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

// 获取支付结果图标
const getPaymentResultIcon = (status) => {
    switch (status) {
        case "PENDING":
            return "warning";
        case "SUCCESS":
            return "success";
        case "FAILED":
            return "error";
        default:
            return "info";
    }
};

// 获取支付结果标题
const getPaymentResultTitle = (status) => {
    switch (status) {
        case "PENDING":
            return "支付處理中";
        case "SUCCESS":
            return "支付成功";
        case "FAILED":
            return "支付失敗";
        default:
            return "支付狀態未知";
    }
};

// 获取支付方式标签
const getPaymentMethodLabel = (method) => {
    switch (method) {
        case "CREDIT_CARD":
            return "信用卡";
        case "ALIPAY":
            return "支付寶";
        case "WECHAT_PAY":
            return "微信支付";
        case "LINEPAY":
            return "LINE Pay";
        default:
            return method;
    }
};

// 获取支付平台标签
const getPaymentPlatformLabel = (platform) => {
    switch (platform) {
        case "STANDARD":
            return "標準支付";
        case "NEWEBPAY":
            return "藍新金流";
        default:
            return platform;
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

// 查询支付状态
const searchPayment = async () => {
    if (!searchForm.value.paymentId && !searchForm.value.orderId) {
        ElMessage.warning("請輸入訂單編號或支付編號");
        return;
    }

    loading.value = true;
    try {
        // 無論選擇哪種支付平台，如果有訂單ID，都先嘗試加載訂單
        if (searchForm.value.orderId) {
            try {
                const orderResponse = await getOrderById(parseInt(searchForm.value.orderId.trim()));
                if (orderResponse.data) {
                    currentOrder.value = orderResponse.data;
                }
            } catch (error) {
                console.error("加載訂單失敗:", error);
            }
        }

        let response;
        if (searchForm.value.platform === "NEWEBPAY") {
            // 藍新金流查詢
            if (!searchForm.value.orderId) {
                ElMessage.warning("使用藍新金流查詢時，訂單編號不能為空");
                loading.value = false;
                return;
            }

            const orderId = searchForm.value.orderId.trim();
            try {
                response = await getNewebpayPaymentStatus(orderId);
            } catch (error) {
                console.error("藍新金流查詢失敗:", error);
                // 即使API失敗，也創建一個模擬數據顯示
                if (currentOrder.value && currentOrder.value.id == orderId) {
                    paymentInfo.value = {
                        id: `NEWEBPAY-${orderId}`,
                        orderId: parseInt(orderId),
                        amount: currentOrder.value.totalAmount,
                        method: "CREDIT_CARD",
                        status:
                            currentOrder.value.status === "PENDING_PAYMENT" ? "PENDING" : "SUCCESS",
                        createdAt: currentOrder.value.createdAt || new Date().toISOString(),
                        paidAt:
                            currentOrder.value.status !== "PENDING_PAYMENT"
                                ? new Date().toISOString()
                                : null,
                        platform: "NEWEBPAY",
                    };
                    loading.value = false;
                    return;
                } else {
                    throw error; // 重新拋出錯誤
                }
            }

            // 處理藍新金流返回的數據格式，確保與前端顯示兼容
            if (response.data) {
                paymentInfo.value = {
                    id: response.data.id || `NEWEBPAY-${orderId}`,
                    orderId: parseInt(orderId),
                    amount:
                        response.data.amount ||
                        (currentOrder.value ? currentOrder.value.totalAmount : 0),
                    method: response.data.method || "CREDIT_CARD",
                    status:
                        response.data.status ||
                        (currentOrder.value && currentOrder.value.status !== "PENDING_PAYMENT"
                            ? "SUCCESS"
                            : "PENDING"),
                    createdAt:
                        response.data.createdAt ||
                        currentOrder.value?.createdAt ||
                        new Date().toISOString(),
                    paidAt:
                        response.data.paidAt ||
                        (currentOrder.value && currentOrder.value.status !== "PENDING_PAYMENT"
                            ? new Date().toISOString()
                            : null),
                    platform: "NEWEBPAY",
                };
            } else if (currentOrder.value && currentOrder.value.id == orderId) {
                // 如果API沒有返回數據但有訂單信息，創建一個模擬數據
                paymentInfo.value = {
                    id: `NEWEBPAY-${orderId}`,
                    orderId: parseInt(orderId),
                    amount: currentOrder.value.totalAmount,
                    method: "CREDIT_CARD",
                    status: currentOrder.value.status === "PENDING_PAYMENT" ? "PENDING" : "SUCCESS",
                    createdAt: currentOrder.value.createdAt || new Date().toISOString(),
                    paidAt:
                        currentOrder.value.status !== "PENDING_PAYMENT"
                            ? new Date().toISOString()
                            : null,
                    platform: "NEWEBPAY",
                };
            } else {
                paymentInfo.value = null;
            }
        } else {
            // 標準支付查詢
            if (!searchForm.value.paymentId) {
                ElMessage.warning("使用標準支付查詢時，支付編號不能為空");
                loading.value = false;
                return;
            }
            response = await getPaymentStatus(searchForm.value.paymentId.trim());
            paymentInfo.value = response.data;

            // 添加平台信息
            if (paymentInfo.value) {
                paymentInfo.value.platform = "STANDARD";
            }
        }

        if (!paymentInfo.value) {
            ElMessage.warning("未找到支付信息");
        }
    } catch (error) {
        console.error("查詢支付狀態失敗:", error);
        ElMessage.error("查詢支付狀態失敗: " + (error.response?.data?.message || error.message));
    } finally {
        loading.value = false;
    }
};

// 从URL参数中获取订单ID并加载订单
const loadOrderFromParams = async () => {
    const orderId = route.query.orderId;
    if (orderId && !isNaN(parseInt(orderId))) {
        loading.value = true;
        try {
            const response = await getOrderById(parseInt(orderId));
            currentOrder.value = response.data;

            // 檢查訂單狀態
            if (currentOrder.value && currentOrder.value.status) {
                const statusLower = currentOrder.value.status.toLowerCase();
                // 如果訂單狀態不是待支付但包含特定關鍵字，嘗試標準化為待支付狀態
                if (
                    statusLower.includes("unpaid") ||
                    statusLower.includes("wait") ||
                    statusLower === "待支付" ||
                    statusLower.includes("pend")
                ) {
                    console.log(`將訂單狀態 ${currentOrder.value.status} 標準化為 PENDING_PAYMENT`);
                    currentOrder.value.originalStatus = currentOrder.value.status;
                    currentOrder.value.status = "PENDING_PAYMENT";
                }
            }

            orderLoaded.value = true;
            searchForm.value.orderId = orderId.toString();

            // 如果訂單尚未支付，顯示支付表單
            if (
                currentOrder.value &&
                (currentOrder.value.status === "PENDING_PAYMENT" ||
                    (currentOrder.value.status &&
                        currentOrder.value.status.toLowerCase().includes("pending")))
            ) {
                ElMessage.info("請為訂單進行支付");
            } else if (currentOrder.value) {
                console.log("訂單狀態不支持支付:", currentOrder.value.status);
                ElMessage.warning("當前訂單狀態不支持支付");
            }
        } catch (error) {
            console.error("加載訂單失敗:", error);
            ElMessage.error("加載訂單失敗: " + (error.response?.data?.message || error.message));
        } finally {
            loading.value = false;
        }
    }
};

// 處理支付流程
const processPayment = async () => {
    if (!currentOrder.value || currentOrder.value.status !== "PENDING_PAYMENT") {
        ElMessage.warning("當前訂單狀態不支持支付");
        return;
    }

    // 檢查訂單ID是否是數字
    const orderIdNum = parseInt(currentOrder.value.id);
    if (isNaN(orderIdNum)) {
        ElMessage.warning("訂單ID格式不正確");
        return;
    }

    loading.value = true;
    try {
        const paymentRequest = {
            method: selectedPaymentMethod.value,
            amount: currentOrder.value.totalAmount,
        };

        let response;
        if (selectedPaymentPlatform.value === "NEWEBPAY") {
            // 使用藍新金流支付
            try {
                response = await createNewebpayPayment(orderIdNum, paymentRequest);
                ElMessage.success("藍新金流支付請求已創建，請確認支付");

                // 處理藍新金流返回的數據，確保與前端顯示兼容
                if (response.data) {
                    paymentInfo.value = {
                        id: response.data.id || `NEWEBPAY-${orderIdNum}`,
                        orderId: orderIdNum,
                        amount: currentOrder.value.totalAmount,
                        method: selectedPaymentMethod.value,
                        status: response.data.status || "PENDING",
                        createdAt: response.data.createdAt || new Date().toISOString(),
                        paidAt: null,
                        platform: "NEWEBPAY",
                    };
                } else {
                    // 即使返回數據為空也創建一個支付記錄
                    paymentInfo.value = {
                        id: `NEWEBPAY-${orderIdNum}-${Date.now()}`,
                        orderId: orderIdNum,
                        amount: currentOrder.value.totalAmount,
                        method: selectedPaymentMethod.value,
                        status: "PENDING",
                        createdAt: new Date().toISOString(),
                        paidAt: null,
                        platform: "NEWEBPAY",
                    };
                }
            } catch (error) {
                console.error("創建藍新金流支付失敗:", error);
                // 即使請求失敗也創建一個臨時支付記錄，便於後續操作
                paymentInfo.value = {
                    id: `NEWEBPAY-${orderIdNum}-${Date.now()}`,
                    orderId: orderIdNum,
                    amount: currentOrder.value.totalAmount,
                    method: selectedPaymentMethod.value,
                    status: "PENDING",
                    createdAt: new Date().toISOString(),
                    paidAt: null,
                    platform: "NEWEBPAY",
                };
                ElMessage.warning("創建支付請求失敗，但您仍可以繼續模擬支付流程");
            }
        } else {
            // 使用標準支付
            try {
                response = await createPayment(orderIdNum, paymentRequest);
                ElMessage.success("支付請求已創建，請確認支付");

                paymentInfo.value = response.data;
                // 添加平台信息
                if (paymentInfo.value) {
                    paymentInfo.value.platform = "STANDARD";
                } else {
                    // 即使返回數據為空也創建一個支付記錄
                    paymentInfo.value = {
                        id: `STANDARD-${orderIdNum}-${Date.now()}`,
                        orderId: orderIdNum,
                        amount: currentOrder.value.totalAmount,
                        method: selectedPaymentMethod.value,
                        status: "PENDING",
                        createdAt: new Date().toISOString(),
                        paidAt: null,
                        platform: "STANDARD",
                    };
                }
            } catch (error) {
                console.error("創建標準支付失敗:", error);
                // 即使請求失敗也創建一個臨時支付記錄，便於後續操作
                paymentInfo.value = {
                    id: `STANDARD-${orderIdNum}-${Date.now()}`,
                    orderId: orderIdNum,
                    amount: currentOrder.value.totalAmount,
                    method: selectedPaymentMethod.value,
                    status: "PENDING",
                    createdAt: new Date().toISOString(),
                    paidAt: null,
                    platform: "STANDARD",
                };
                ElMessage.warning("創建支付請求失敗，但您仍可以繼續模擬支付流程");
            }
        }

        // 刷新待處理支付列表
        const userId = authStore.userId || (authStore.userInfo ? authStore.userInfo.id : null);
        if (userId) {
            fetchPendingPayments();
        }
    } catch (error) {
        console.error("創建支付失敗:", error);
        ElMessage.error("創建支付失敗: " + (error.response?.data?.message || error.message));
    } finally {
        loading.value = false;
    }
};

// 模擬支付成功
const simulatePaymentSuccess = async () => {
    if (!paymentInfo.value) {
        ElMessage.warning("沒有待處理的支付信息");
        return;
    }

    if (paymentInfo.value.platform === "NEWEBPAY") {
        await simulateNewebpayCallback(paymentInfo.value.orderId, "SUCCESS");
    } else {
        await simulatePaymentCallback(paymentInfo.value.id, "SUCCESS");
    }
};

// 模擬支付失敗
const simulatePaymentFailure = async () => {
    if (!paymentInfo.value) {
        ElMessage.warning("沒有待處理的支付信息");
        return;
    }

    if (paymentInfo.value.platform === "NEWEBPAY") {
        await simulateNewebpayCallback(paymentInfo.value.orderId, "FAILED");
    } else {
        await simulatePaymentCallback(paymentInfo.value.id, "FAILED");
    }
};

// 标准支付模拟回调
const simulatePaymentCallback = async (paymentId, status) => {
    if (!paymentId) {
        ElMessage.warning("支付編號不能為空");
        return;
    }

    loading.value = true;
    try {
        await mockPaymentCallback(paymentId.trim(), status);
        ElMessage.success("模擬支付回調處理成功");

        // 更新支付狀態
        const response = await getPaymentStatus(paymentId.trim());
        paymentInfo.value = response.data;
        // 添加平台信息
        if (paymentInfo.value) {
            paymentInfo.value.platform = "STANDARD";
        }

        // 重新获取待处理支付列表
        fetchPendingPayments();
    } catch (error) {
        console.error("模擬支付回調失敗:", error);
        ElMessage.error("模擬支付回調失敗: " + (error.response?.data?.message || error.message));
    } finally {
        loading.value = false;
    }
};

// 藍新金流模拟回调
const simulateNewebpayCallback = async (orderId, status) => {
    if (!orderId) {
        ElMessage.warning("訂單編號不能為空");
        return;
    }

    // 確保orderId是數字類型
    const orderIdNum = parseInt(orderId);
    if (isNaN(orderIdNum)) {
        ElMessage.warning("訂單編號格式不正確，必須是數字");
        return;
    }

    // 先獲取訂單信息
    if (!currentOrder.value || currentOrder.value.id != orderIdNum) {
        try {
            const orderResponse = await getOrderById(orderIdNum);
            if (orderResponse.data) {
                currentOrder.value = orderResponse.data;
            }
        } catch (error) {
            console.error("獲取訂單信息失敗:", error);
            ElMessage.warning("獲取訂單信息失敗，但仍將嘗試模擬支付");
        }
    }

    loading.value = true;
    try {
        await mockNewebpayCallback(orderIdNum, status);
        ElMessage.success("藍新金流模擬支付回調處理成功");

        // 更新支付狀態
        let response;
        try {
            response = await getNewebpayPaymentStatus(orderIdNum);
        } catch (error) {
            console.error("獲取藍新金流支付狀態失敗:", error);
            // 即使獲取狀態失敗，也創建一個模擬數據
            response = {
                data: null,
            };
        }

        // 處理藍新金流返回的數據，確保數據格式與前端顯示兼容
        if (response.data) {
            paymentInfo.value = {
                id: response.data.id || `NEWEBPAY-${orderIdNum}`,
                orderId: orderIdNum,
                amount:
                    response.data.amount ||
                    (currentOrder.value ? currentOrder.value.totalAmount : 0),
                method: response.data.method || selectedPaymentMethod.value || "CREDIT_CARD",
                status: response.data.status || status,
                createdAt: response.data.createdAt || new Date().toISOString(),
                paidAt: status === "SUCCESS" ? new Date().toISOString() : null,
                platform: "NEWEBPAY",
            };
        } else {
            // 如果API沒有返回數據，創建一個模擬數據
            paymentInfo.value = {
                id: `NEWEBPAY-${orderIdNum}`,
                orderId: orderIdNum,
                amount: currentOrder.value?.totalAmount || 0,
                method: selectedPaymentMethod.value || "CREDIT_CARD",
                status: status,
                createdAt: new Date().toISOString(),
                paidAt: status === "SUCCESS" ? new Date().toISOString() : null,
                platform: "NEWEBPAY",
            };
        }

        // 刷新訂單狀態
        if (status === "SUCCESS") {
            try {
                // 延遲1秒再獲取訂單信息，確保後端有時間更新訂單狀態
                setTimeout(async () => {
                    try {
                        const refreshResponse = await getOrderById(orderIdNum);
                        currentOrder.value = refreshResponse.data;
                        if (currentOrder.value.status === "PENDING_PAYMENT") {
                            ElMessage.warning("訂單支付成功，但訂單狀態尚未更新，可能需要刷新頁面");
                        } else {
                            ElMessage.success(
                                `訂單支付成功，訂單狀態已更新為${getStatusLabel(
                                    currentOrder.value.status
                                )}`
                            );
                        }
                    } catch (error) {
                        console.error("延遲獲取訂單狀態失敗:", error);
                    }
                }, 1000);
            } catch (error) {
                console.error("更新訂單狀態失敗:", error);
            }
        }

        // 重新获取待处理支付列表
        const userId = authStore.userId || (authStore.userInfo ? authStore.userInfo.id : null);
        if (userId) {
            fetchPendingPayments();
        }
    } catch (error) {
        console.error("藍新金流模擬支付回調失敗:", error);
        ElMessage.error(
            "藍新金流模擬支付回調失敗: " + (error.response?.data?.message || error.message)
        );
    } finally {
        loading.value = false;
    }
};

// 獲取訂單狀態顯示文本
const getStatusLabel = (status) => {
    switch (status) {
        case "PENDING_PAYMENT":
            return "待支付";
        case "PROCESSING":
            return "處理中";
        case "PAID":
            return "已支付";
        case "COMPLETED":
            return "已完成";
        case "CANCELLED":
            return "已取消";
        default:
            return status;
    }
};

// 根据表格行处理回调
const simulatePaymentCallbackByRow = async (row, status) => {
    if (row.platform === "NEWEBPAY") {
        await simulateNewebpayCallback(row.orderId, status);
    } else {
        await simulatePaymentCallback(row.id, status);
    }
};

// 获取所有待处理的支付
const fetchPendingPayments = async () => {
    // 重置待處理支付列表
    pendingPayments.value = [];

    loading.value = true;
    try {
        // 檢查用戶ID是否存在
        const userId = authStore.userId || (authStore.userInfo ? authStore.userInfo.id : null);

        if (!userId) {
            console.warn("獲取用戶ID失敗，無法加載待處理支付列表");
            loading.value = false;
            return;
        }

        // 獲取當前用戶的所有訂單
        const response = await getOrdersByUserId(userId);
        if (response.data && response.data.content) {
            // 篩選出待支付的訂單
            const pendingOrders = response.data.content.filter(
                (order) => order.status === "PENDING_PAYMENT"
            );

            // 將每個待支付訂單轉換為待處理支付
            pendingOrders.forEach((order) => {
                pendingPayments.value.push({
                    id: `PENDING-${order.id}`,
                    orderId: order.id,
                    amount: order.totalAmount,
                    method: "CREDIT_CARD", // 預設支付方式
                    status: "PENDING",
                    platform: "NEWEBPAY", // 預設使用藍新金流
                    createdAt: order.createdAt || new Date().toISOString(),
                });
            });
        }
    } catch (error) {
        console.error("獲取待支付訂單失敗:", error);
        // 錯誤時不要顯示錯誤提示，以免影響用戶體驗
    } finally {
        loading.value = false;
    }

    // 如果有當前正在處理的支付，也添加到列表中
    if (paymentInfo.value && paymentInfo.value.status === "PENDING") {
        // 確保不重複添加
        const existingOrderId = paymentInfo.value.orderId;
        const alreadyExists = pendingPayments.value.some((p) => p.orderId == existingOrderId);

        if (!alreadyExists) {
            // 確保數據結構完整性
            const payment = { ...paymentInfo.value };

            // 確保所有必要字段都存在
            if (!payment.id && payment.orderId) {
                payment.id = `PAYMENT-${payment.orderId}`;
            }

            if (!payment.method) {
                payment.method = selectedPaymentMethod.value || "CREDIT_CARD";
            }

            if (!payment.createdAt) {
                payment.createdAt = new Date().toISOString();
            }

            pendingPayments.value.push(payment);
        }
    }
};

// 加載訂單詳情
const loadOrderById = async (id) => {
    if (!id) return;

    loading.value = true;
    try {
        const orderResponse = await getOrderById(parseInt(id));
        if (orderResponse.data) {
            currentOrder.value = orderResponse.data;
            ElMessage.success("訂單加載成功，請確認訂單信息後點擊支付按鈕");
            // 自動滾動到頁面頂部的訂單支付區域
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    } catch (error) {
        console.error("訂單加載失敗:", error);
        ElMessage.error("訂單加載失敗: " + (error.response?.data?.message || error.message));
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    if (!authStore.isAuthenticated) {
        ElMessage.warning("請先登入");
        router.push("/member/login");
        return;
    }

    // 確保用戶ID存在
    const userId = authStore.userId || (authStore.userInfo ? authStore.userInfo.id : null);
    if (!userId) {
        ElMessage.warning("無法獲取用戶信息，請重新登錄後嘗試");
        console.warn("用戶ID為空，無法執行支付相關操作");
    }

    // 設置藍新金流為默認支付平台
    selectedPaymentPlatform.value = "NEWEBPAY";

    // 設置表單默認值
    searchForm.value.platform = "NEWEBPAY";

    // 加載URL中可能帶的訂單ID
    await loadOrderFromParams();

    // 嘗試獲取待處理支付列表
    try {
        if (userId) {
            await fetchPendingPayments();
        }
    } catch (error) {
        console.error("獲取待處理支付列表失敗:", error);
        // 錯誤時不阻止頁面其他功能
    }

    // 如果是從訂單頁面跳轉過來的，直接處理支付流程
    const orderId = route.query.orderId;
    if (
        orderId &&
        currentOrder.value &&
        currentOrder.value.id == orderId &&
        currentOrder.value.status === "PENDING_PAYMENT"
    ) {
        setTimeout(() => {
            ElMessage.info("請確認支付信息後點擊「確認支付」按鈕");
        }, 1000);
    }
});
</script>

<style scoped>
.payment-simulation {
    padding: 20px;
}

.simulation-container {
    max-width: 1000px;
    margin: 0 auto;
}

.simulation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.access-denied {
    padding: 20px;
    text-align: center;
}

.simulation-content {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.section {
    padding: 20px;
    background-color: #f8f8f8;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.payment-methods {
    margin-top: 20px;
}

.payment-platform {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px dashed #ddd;
}

.payment-platform h5,
.methods-list h5 {
    margin-bottom: 12px;
    font-size: 16px;
    color: #606266;
}

.methods-list {
    margin-bottom: 20px;
}

.payment-summary {
    margin: 20px 0;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.summary-row:last-child {
    margin-bottom: 0;
}

.payment-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.empty-pending {
    padding: 30px;
    text-align: center;
}

.payment-info {
    margin-top: 20px;
}

.payment-info .actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 10px;
}

@media (max-width: 768px) {
    .payment-simulation {
        padding: 10px;
    }

    .section {
        padding: 15px;
    }

    .payment-actions {
        flex-direction: column;
    }
}
</style>
