<template>
    <div class="payment-page dark-theme">
        <div class="payment-container">
            <div class="payment-header">
                <h1>訂單支付</h1>
                <p>完成您的訂單支付流程</p>
            </div>

            <div v-if="loading" class="loading-container">
                <el-skeleton :rows="5" animated />
            </div>

            <el-alert
                v-if="errorMessage"
                :title="errorMessage"
                type="error"
                show-icon
                :closable="false"
                class="error-alert"
            />

            <div v-if="!loading && !errorMessage" class="payment-content">
                <div class="order-info">
                    <h2>訂單詳情</h2>
                    <div class="info-row">
                        <span class="label">訂單編號:</span>
                        <span class="value">{{ order.id || orderId }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">訂單金額:</span>
                        <span class="value highlight">NT$ {{ order.totalAmount || "0.00" }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">訂單狀態:</span>
                        <span class="value">
                            <el-tag :type="getOrderStatusType(order.status)">
                                {{ getOrderStatusText(order.status) }}
                            </el-tag>
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="label">建立時間:</span>
                        <span class="value">{{ formatDate(order.createdAt) }}</span>
                    </div>
                </div>

                <div class="payment-methods">
                    <h2>選擇支付方式</h2>
                    <el-radio-group v-model="selectedPaymentMethod" class="payment-method-group">
                        <el-radio-button label="credit_card">信用卡</el-radio-button>
                        <el-radio-button label="bank_transfer">銀行轉帳</el-radio-button>
                        <el-radio-button label="line_pay">Line Pay</el-radio-button>
                    </el-radio-group>

                    <!-- 信用卡表單 -->
                    <div v-if="selectedPaymentMethod === 'credit_card'" class="payment-form">
                        <h3>信用卡資訊</h3>
                        <el-form
                            label-position="top"
                            :model="creditCardForm"
                            :rules="creditCardRules"
                            ref="creditCardFormRef"
                        >
                            <el-form-item label="卡號" prop="cardNumber">
                                <el-input
                                    v-model="creditCardForm.cardNumber"
                                    placeholder="1234 5678 9012 3456"
                                    maxlength="19"
                                />
                            </el-form-item>
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <el-form-item label="有效期限" prop="expiry">
                                        <el-input
                                            v-model="creditCardForm.expiry"
                                            placeholder="MM/YY"
                                            maxlength="5"
                                        />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="安全碼" prop="cvv">
                                        <el-input
                                            v-model="creditCardForm.cvv"
                                            placeholder="123"
                                            maxlength="3"
                                            type="password"
                                        />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-form-item label="持卡人姓名" prop="cardholderName">
                                <el-input
                                    v-model="creditCardForm.cardholderName"
                                    placeholder="持卡人姓名"
                                />
                            </el-form-item>
                        </el-form>
                    </div>

                    <!-- 銀行轉帳表單 -->
                    <div v-if="selectedPaymentMethod === 'bank_transfer'" class="payment-form">
                        <h3>銀行轉帳資訊</h3>
                        <div class="bank-info">
                            <p><strong>銀行名稱:</strong> 健康管理銀行</p>
                            <p><strong>帳號:</strong> 1234-5678-9012-3456</p>
                            <p><strong>戶名:</strong> 健康管理股份有限公司</p>
                            <p><strong>轉帳金額:</strong> NT$ {{ order.totalAmount || "0.00" }}</p>
                            <p>
                                <strong>轉帳備註:</strong> 請填寫訂單編號 {{ order.id || orderId }}
                            </p>
                        </div>
                        <el-alert
                            title="完成轉帳後，請上傳轉帳收據或點擊模擬付款按鈕"
                            type="info"
                            :closable="false"
                            class="bank-alert"
                        />
                        <el-upload
                            class="receipt-upload"
                            action="/api/mock/upload"
                            :auto-upload="false"
                            :on-change="handleFileChange"
                            :limit="1"
                        >
                            <el-button type="primary" plain>上傳轉帳收據</el-button>
                            <template #tip>
                                <div class="el-upload__tip">支援 jpg/png 檔案，不超過 2MB</div>
                            </template>
                        </el-upload>
                    </div>

                    <!-- Line Pay表單 -->
                    <div v-if="selectedPaymentMethod === 'line_pay'" class="payment-form">
                        <h3>Line Pay</h3>
                        <div class="line-pay-info">
                            <el-image
                                class="qr-code"
                                src="https://placehold.co/200x200/10b981/ffffff?text=LinePayQR"
                                fit="contain"
                            />
                            <p>請使用Line掃描上方QR Code完成付款</p>
                            <p>或點擊下方按鈕模擬付款</p>
                        </div>
                    </div>
                </div>

                <div class="payment-actions">
                    <el-button @click="cancel">取消</el-button>
                    <el-button type="primary" @click="simulatePayment" :loading="processingPayment">
                        {{ getPaymentButtonText() }}
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { getOrderById, mockPaymentCallback, createPayment } from "@/api/shop";

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const errorMessage = ref("");
const processingPayment = ref(false);

const orderId = ref(route.query.orderId || "");
const redirectUrl = ref(route.query.redirect || "/shop/orders");
const order = ref({});
const selectedPaymentMethod = ref("credit_card");
const uploadedFile = ref(null);

// 信用卡表單
const creditCardFormRef = ref(null);
const creditCardForm = reactive({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardholderName: "",
});

// 表單驗證規則
const creditCardRules = {
    cardNumber: [
        { required: true, message: "請輸入卡號", trigger: "blur" },
        { pattern: /^[0-9\s]{13,19}$/, message: "請輸入有效的卡號", trigger: "blur" },
    ],
    expiry: [
        { required: true, message: "請輸入有效期限", trigger: "blur" },
        { pattern: /^(0[1-9]|1[0-2])\/([0-9]{2})$/, message: "格式：MM/YY", trigger: "blur" },
    ],
    cvv: [
        { required: true, message: "請輸入安全碼", trigger: "blur" },
        { pattern: /^[0-9]{3,4}$/, message: "請輸入3-4位數字", trigger: "blur" },
    ],
    cardholderName: [{ required: true, message: "請輸入持卡人姓名", trigger: "blur" }],
};

// 獲取訂單詳情
const fetchOrderDetails = async () => {
    if (!orderId.value) {
        errorMessage.value = "未提供訂單ID，無法進行支付";
        loading.value = false;
        return;
    }

    try {
        loading.value = true;
        const response = await getOrderById(orderId.value);

        if (response && response.data) {
            // 處理不同格式的響應
            if (response.data.data) {
                order.value = response.data.data;
            } else {
                order.value = response.data;
            }

            // 檢查訂單狀態
            if (order.value.status === "PAID") {
                errorMessage.value = "此訂單已支付，無需重複支付";
            } else if (order.value.status === "CANCELLED") {
                errorMessage.value = "此訂單已取消，無法進行支付";
            }
        } else {
            errorMessage.value = "無法獲取訂單詳情";
        }
    } catch (error) {
        console.error("獲取訂單詳情失敗:", error);
        errorMessage.value = error.displayMessage || "獲取訂單詳情失敗，請稍後再試";
    } finally {
        loading.value = false;
    }
};

// 處理檔案上傳
const handleFileChange = (file) => {
    uploadedFile.value = file;
};

// 獲取訂單狀態顯示文字
const getOrderStatusText = (status) => {
    const statusMap = {
        PENDING: "待付款",
        PROCESSING: "處理中",
        PAID: "已付款",
        SHIPPED: "已出貨",
        DELIVERED: "已送達",
        CANCELLED: "已取消",
        COMPLETED: "已完成",
    };
    return statusMap[status] || status || "未知狀態";
};

// 獲取訂單狀態標籤類型
const getOrderStatusType = (status) => {
    const typeMap = {
        PENDING: "warning",
        PROCESSING: "info",
        PAID: "success",
        SHIPPED: "success",
        DELIVERED: "success",
        CANCELLED: "danger",
        COMPLETED: "success",
    };
    return typeMap[status] || "info";
};

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return "無日期資訊";

    try {
        const date = new Date(dateString);
        return date.toLocaleString("zh-TW", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (e) {
        return dateString;
    }
};

// 獲取支付按鈕文字
const getPaymentButtonText = () => {
    const textMap = {
        credit_card: "確認付款",
        bank_transfer: "確認已轉帳",
        line_pay: "模擬Line Pay支付",
    };
    return textMap[selectedPaymentMethod.value] || "確認付款";
};

// 模擬支付
const simulatePayment = async () => {
    // 信用卡支付需驗證表單
    if (selectedPaymentMethod.value === "credit_card" && creditCardFormRef.value) {
        const valid = await creditCardFormRef.value.validate().catch(() => false);
        if (!valid) {
            ElMessage.error("請正確填寫信用卡資訊");
            return;
        }
    }

    // 銀行轉帳需有收據或確認轉帳
    if (selectedPaymentMethod.value === "bank_transfer" && !uploadedFile.value) {
        // 讓用戶確認是否已轉帳
        try {
            await ElMessageBox.confirm("您尚未上傳轉帳收據，是否已完成轉帳？", "確認轉帳", {
                confirmButtonText: "已完成轉帳",
                cancelButtonText: "取消",
                type: "warning",
            });
        } catch (e) {
            return; // 用戶取消
        }
    }

    processingPayment.value = true;

    try {
        // 創建支付紀錄
        await createPayment(orderId.value, {
            paymentMethod: selectedPaymentMethod.value,
            amount: order.value.totalAmount,
            currency: "TWD",
        });

        // 模擬支付回調
        await mockPaymentCallback(orderId.value, "SUCCESS");

        // 顯示支付成功訊息
        ElMessage.success("支付成功！");

        // 延遲後導航到訂單頁面
        setTimeout(() => {
            router.push(redirectUrl.value);
        }, 1500);
    } catch (error) {
        console.error("支付失敗:", error);
        ElMessage.error(error.displayMessage || "支付處理失敗，請稍後再試");
    } finally {
        processingPayment.value = false;
    }
};

// 取消支付
const cancel = () => {
    router.push(redirectUrl.value);
};

onMounted(() => {
    fetchOrderDetails();
});
</script>

<style lang="scss" scoped>
.payment-page {
    min-height: 100vh;
    background-color: #111827;
    color: #f5f5f5;
    padding: 80px 20px 40px;
    display: flex;
    justify-content: center;
}

.payment-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}

.payment-header {
    text-align: center;
    margin-bottom: 2rem;

    h1 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
    }

    p {
        color: #9ca3af;
    }
}

.loading-container,
.error-alert {
    margin-bottom: 2rem;
}

.payment-content {
    background-color: #1e293b;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
}

.order-info,
.payment-methods {
    margin-bottom: 2rem;

    h2 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #2d3748;
    }
}

.info-row {
    display: flex;
    margin-bottom: 1rem;

    .label {
        width: 120px;
        color: #9ca3af;
    }

    .value {
        flex: 1;

        &.highlight {
            color: #10b981;
            font-size: 1.1rem;
            font-weight: 600;
        }
    }
}

.payment-method-group {
    margin-bottom: 2rem;
}

.payment-form {
    background-color: #111827;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;

    h3 {
        margin-bottom: 1.5rem;
        font-size: 1.2rem;
    }
}

.bank-info,
.line-pay-info {
    margin-bottom: 1.5rem;

    p {
        margin-bottom: 0.75rem;
    }
}

.bank-alert {
    margin-bottom: 1.5rem;
}

.qr-code {
    width: 200px;
    height: 200px;
    margin: 0 auto 1.5rem;
    display: block;
}

.payment-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

// Element Plus 覆蓋樣式
:deep(.el-input__wrapper) {
    background-color: #2d3748;
    box-shadow: 0 0 0 1px #4b5563 inset;

    .el-input__inner {
        color: #f5f5f5;
    }
}

:deep(.el-form-item__label) {
    color: #f5f5f5;
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

:deep(.el-upload) {
    width: 100%;

    .el-upload-dragger {
        background-color: #2d3748;
        border-color: #4b5563;
    }
}

:deep(.el-upload__tip) {
    color: #9ca3af;
}

:deep(.el-alert) {
    background-color: #2d3748;
    border-color: #4b5563;
    color: #f5f5f5;
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
}
</style>
