<template>
    <div class="cart-management">
        <el-card class="cart-container">
            <template #header>
                <div class="cart-header">
                    <h2>我的購物車</h2>
                </div>
            </template>

            <div v-if="loading" class="loading-container">
                <el-skeleton :rows="5" animated />
            </div>

            <div v-else-if="!cartItems || cartItems.length === 0" class="empty-cart">
                <el-empty description="購物車是空的">
                    <el-button type="primary" @click="$router.push('/backpage/shop/products')"
                        >去購物</el-button
                    >
                </el-empty>
            </div>

            <div v-else class="cart-content">
                <el-alert
                    type="info"
                    :closable="false"
                    v-if="hasIncompleteProductData"
                    class="cart-alert"
                >
                    部分商品信息顯示不完整，但不影響下單與結算
                </el-alert>

                <el-table
                    :data="cartItems"
                    style="width: 100%"
                    v-loading="loading"
                    empty-text="購物車為空"
                >
                    <el-table-column label="商品圖片" width="120">
                        <template #default="scope">
                            <div v-if="scope.row.product" class="cart-product-image">
                                <el-image
                                    :src="
                                        getValidImageUrl(scope.row.product.image) ||
                                        defaultImageBase64
                                    "
                                    fit="cover"
                                    :preview-teleported="true"
                                    :preview-src-list="
                                        scope.row.product.image ? [scope.row.product.image] : []
                                    "
                                    :initial-index="0"
                                    :z-index="9999"
                                    @error="handleImageError"
                                    alt="商品圖片"
                                    :data-original-url="scope.row.product.image"
                                    lazy
                                    style="
                                        max-width: 100px;
                                        max-height: 100px;
                                        width: auto;
                                        height: auto;
                                    "
                                >
                                    <template #error>
                                        <div class="image-error">
                                            <i class="el-icon-picture"></i>
                                        </div>
                                    </template>
                                </el-image>
                            </div>
                            <div v-else class="cart-product-image-placeholder">無圖片</div>
                        </template>
                    </el-table-column>

                    <el-table-column label="商品名稱" min-width="200">
                        <template #default="scope">
                            <div class="product-info">
                                <router-link
                                    v-if="scope.row.product && scope.row.product.id"
                                    :to="`/backpage/shop/products/${scope.row.product.id}`"
                                    class="product-name"
                                >
                                    {{ scope.row.product.name }}
                                </router-link>
                                <span v-else class="product-name-placeholder">
                                    {{
                                        scope.row.product
                                            ? scope.row.product.name
                                            : "商品數據加載中..."
                                    }}
                                </span>
                                <div
                                    v-if="scope.row.product && scope.row.product.category"
                                    class="product-category"
                                >
                                    分類: {{ scope.row.product.category }}
                                </div>
                                <div
                                    v-if="scope.row.product && scope.row.product.description"
                                    class="product-description"
                                >
                                    {{
                                        scope.row.product.description.length > 50
                                            ? scope.row.product.description.substr(0, 50) + "..."
                                            : scope.row.product.description
                                    }}
                                </div>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column prop="product.price" label="單價" width="120">
                        <template #default="{ row }">
                            <span v-if="row && row.product" class="price-tag"
                                >${{ row.product.price }}</span
                            >
                            <span v-else>-</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="數量" width="150">
                        <template #default="{ row }">
                            <el-input-number
                                v-if="row && row.product"
                                v-model="row.quantity"
                                :min="1"
                                :max="row.product.stockQuantity || 99"
                                size="small"
                                @change="(value) => updateQuantity(row.id, value)"
                            />
                            <span v-else>-</span>
                            <div
                                v-if="row && row.product && row.product.stockQuantity"
                                class="stock-info"
                            >
                                庫存: {{ row.product.stockQuantity }}
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column label="小計" width="120">
                        <template #default="{ row }">
                            <span v-if="row && row.product" class="subtotal-price"
                                >${{ (row.product.price * row.quantity).toFixed(0) }}</span
                            >
                            <span v-else>-</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="80" fixed="right">
                        <template #default="{ row }">
                            <el-button
                                v-if="row && row.id"
                                type="danger"
                                icon="Delete"
                                circle
                                size="small"
                                @click="removeFromCart(row.id)"
                            />
                            <span v-else>-</span>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="cart-footer">
                    <div class="cart-actions">
                        <el-button type="danger" plain @click="clearCart">清空購物車</el-button>
                        <el-button
                            type="primary"
                            plain
                            @click="$router.push('/backpage/shop/products')"
                            >繼續購物</el-button
                        >
                    </div>

                    <div class="cart-summary">
                        <div class="cart-total">
                            <span>總計:</span>
                            <span class="total-price">${{ calculateTotal() }}</span>
                        </div>
                        <el-button
                            type="primary"
                            @click="checkout"
                            :disabled="cartItems.length === 0"
                        >
                            結算
                        </el-button>
                    </div>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import {
    getCartItems,
    updateCartItemQuantity,
    removeFromCart as apiRemoveFromCart,
    clearCart as apiClearCart,
    createOrderFromCart,
} from "@/api/shop";

const router = useRouter();
const authStore = useAuthStore();
const cartItems = ref([]);
const loading = ref(false);
const isComponentMounted = ref(true);

// 默認的Base64圖片 (1x1 像素透明圖片，極小尺寸)
const defaultImageBase64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

// 检查用户是否已登录
const checkLogin = () => {
    if (!authStore.isAuthenticated) {
        ElMessage.warning("請先登入");
        router.push("/member/login");
        return false;
    }
    return true;
};

// 驗證圖片URL
const getValidImageUrl = (url) => {
    // 如果url為空，返回空白圖片
    if (!url) {
        return "";
    }

    // 增強咖啡圖片檢測，添加更多可能的關鍵詞和模式
    const coffeeKeywords = [
        "coffee",
        "咖啡",
        "café",
        "kaffee",
        "espresso",
        "latte",
        "cappuccino",
        "mocha",
    ];

    // 檢查URL或文件名中是否包含咖啡相關關鍵詞
    const isCoffeeImage = coffeeKeywords.some((keyword) =>
        url.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isCoffeeImage) {
        console.log("檢測到咖啡相關圖片URL:", url);
        // 優先使用咖啡專用圖片
        const coffeeImageBase64 =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAABOUlEQVR4nO2UMUvDQBTHf1dFBwcXRQfpVMXFQYiDOHWrg6ODH8JZcHfxK+jkbKGjq4MLDg4qKEJdHQQHle7Z5AIxNDQx0YL4h+PuffeO/717eXCnCGgCPWAEjIEQeAPegDdpj+QdSDsS787Aq0APKOcJlZScXTx/Al5k7YHAUw3SXEgBXhA/0zCAdWXfpnNIq1FlcZJFy6YSW8KBLNKXjFc1kVZsxrTkQlqykYvLhYqaZiw7MbDI+a5KrlGVTXTGKMQXXCeunJPYwI6h/QA+ZRxI/S72twgcZxGJIgz8z5fqKKFt2ALujddZi60CcG+c+ylbq4puoQq4BiLDRF9EDfCkvM9i/nYxasCr0hYlqwNdpZ+7yFRYBVpm5T6Bkdg4lPWXBdtYz3SvAswi9eVVfgHxOHCcF1G7iwAAAABJRU5ErkJggg==";
        return coffeeImageBase64;
    }

    // 檢查是否為Base64格式
    if (url.startsWith("data:image")) {
        // 如果Base64串太長(大於5000)，可能導致請求頭過大，返回空白圖片
        if (url.length > 5000) {
            console.log("Base64圖片太大，使用替代圖片");
            return "";
        }
        return url;
    }

    // 處理以//開頭的URL（協議相對URL）
    if (url.startsWith("//")) {
        return "https:" + url;
    }

    // 處理絕對URL（以http或https開頭）
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    // 處理相對路徑
    // 根據環境變量確定基礎URL
    const baseUrl =
        process.env.NODE_ENV === "production"
            ? "https://your-production-domain.com" // 替換為實際生產環境域名
            : "http://localhost:8080"; // 開發環境域名

    // 刪除開頭的斜槓，避免雙重斜槓
    const cleanUrl = url.startsWith("/") ? url.substring(1) : url;

    return `${baseUrl}/${cleanUrl}`;
};

// 获取购物车内容
const fetchCartItems = async () => {
    if (!checkLogin() || !isComponentMounted.value) return;

    loading.value = true;
    try {
        const userId = authStore.userInfo?.id;
        const response = await getCartItems(userId);

        console.log("購物車原始數據:", response.data);

        // 確保數據是數組
        if (isComponentMounted.value && Array.isArray(response.data)) {
            // 處理每個購物車項目
            cartItems.value = response.data.map((item) => {
                // 處理圖片URL
                const imageUrl = item.productImageUrl || "";
                const validImageUrl = getValidImageUrl(imageUrl);

                return {
                    id: item.id,
                    quantity: item.quantity || 1,
                    productId: item.productId,
                    product: {
                        id: item.productId,
                        name: item.productName || `商品 #${item.productId}`,
                        price: parseFloat(item.productPrice) || 0,
                        stockQuantity: parseInt(item.productStockQuantity) || 99,
                        category: item.productCategory || "",
                        description: item.productDescription || "",
                        image: validImageUrl,
                    },
                    subtotal: item.subtotal,
                    addedAt: item.addedAt,
                };
            });

            console.log("處理後的購物車數據:", cartItems.value);
        } else {
            console.warn("購物車數據不是數組或為空");
            cartItems.value = [];
        }
    } catch (error) {
        console.error("獲取購物車失敗:", error);
        if (isComponentMounted.value) {
            ElMessage.error(`獲取購物車失敗: ${error.message || "未知錯誤"}`);
            cartItems.value = [];
        }
    } finally {
        if (isComponentMounted.value) {
            loading.value = false;
        }
    }
};

// 更新购物车商品数量
const updateQuantity = async (cartItemId, quantity) => {
    if (!isComponentMounted.value) return;

    try {
        loading.value = true;
        const userId = authStore.userInfo?.id;

        console.log(`更新購物車項目 ${cartItemId} 數量: ${quantity}`);
        await updateCartItemQuantity(cartItemId, quantity, userId);

        // 获取最新购物车内容
        if (isComponentMounted.value) {
            await fetchCartItems();
            ElMessage.success("已更新數量");
        }
    } catch (error) {
        console.error("更新數量失敗:", error);
        if (isComponentMounted.value) {
            ElMessage.error(`更新數量失敗: ${error.message || "未知錯誤"}`);
        }
    } finally {
        if (isComponentMounted.value) {
            loading.value = false;
        }
    }
};

// 从购物车移除商品
const removeFromCart = async (cartItemId) => {
    if (!isComponentMounted.value) return;

    try {
        await ElMessageBox.confirm("確定要從購物車移除此商品嗎？", "提示", {
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            type: "warning",
        });

        loading.value = true;
        const userId = authStore.userInfo?.id;

        if (!userId) {
            ElMessage.warning("無法獲取用戶ID，請重新登入");
            return;
        }

        console.log(`從購物車移除商品: itemId=${cartItemId}, userId=${userId}`);
        await apiRemoveFromCart({
            cartItemId: cartItemId,
        });

        await fetchCartItems();
        ElMessage.success("已從購物車移除");
    } catch (error) {
        if (error === "cancel") {
            // 用戶取消操作，不顯示錯誤
            return;
        }

        if (isComponentMounted.value) {
            console.error("移除失敗:", error);
            ElMessage.error(`移除失敗: ${error.message || "未知錯誤"}`);
        }
    } finally {
        if (isComponentMounted.value) {
            loading.value = false;
        }
    }
};

// 清空购物车
const clearCart = async () => {
    if (!isComponentMounted.value) return;

    if (cartItems.value.length === 0) {
        ElMessage.info("購物車已經是空的");
        return;
    }

    try {
        await ElMessageBox.confirm("確定要清空購物車嗎？", "提示", {
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            type: "warning",
        });

        loading.value = true;
        const userId = authStore.userInfo?.id;

        if (!userId) {
            ElMessage.warning("無法獲取用戶ID，請重新登入");
            return;
        }

        console.log(`清空購物車: userId=${userId}`);
        const response = await apiClearCart(userId);

        // 根據HTTP狀態碼判斷成功
        if (response && response.status === 200) {
            cartItems.value = [];
            ElMessage.success("購物車已清空");
            return;
        }

        // 檢查各種可能的成功響應數據結構
        if (response && response.data) {
            // 情況1: {success: true, ...}
            if (response.data.success === true) {
                cartItems.value = [];
                ElMessage.success("購物車已清空");
                return;
            }

            // 情況2: 直接返回的數據沒有明確的錯誤信息
            if (!response.data.message && !response.data.error) {
                cartItems.value = [];
                ElMessage.success("購物車已清空");
                return;
            }

            // 有明確的錯誤信息
            throw new Error(response.data.message || response.data.error || "清空購物車失敗");
        } else {
            // 無法解析響應
            throw new Error("無法處理服務器響應");
        }
    } catch (error) {
        if (error === "cancel") {
            // 用戶取消操作，不顯示錯誤
            return;
        }

        if (isComponentMounted.value) {
            console.error("清空購物車失敗:", error);
            ElMessage.error(`清空購物車失敗: ${error.message || "未知錯誤"}`);
        }
    } finally {
        if (isComponentMounted.value) {
            loading.value = false;
        }
    }
};

// 處理圖片加載錯誤
const handleImageError = (e) => {
    console.log("圖片加載失敗，URL:", e.target.src);

    // 獲取原始圖片URL（從data屬性或當前src）
    const originalUrl =
        e.target.dataset.originalUrl || e.target.getAttribute("original-src") || e.target.src;
    console.log("原始圖片URL:", originalUrl);

    // 檢查是否為咖啡相關圖片
    const coffeeKeywords = [
        "coffee",
        "咖啡",
        "café",
        "kaffee",
        "espresso",
        "latte",
        "cappuccino",
        "mocha",
    ];
    const isCoffeeImage = coffeeKeywords.some((keyword) =>
        (originalUrl || "").toLowerCase().includes(keyword.toLowerCase())
    );

    // 保存原始圖片URL以便調試
    if (!e.target.hasAttribute("original-src")) {
        e.target.setAttribute("original-src", e.target.src);
    }

    // 優先處理咖啡圖片
    if (isCoffeeImage) {
        console.log("檢測到咖啡圖片，使用專用替代圖片");
        const coffeeImageBase64 =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAABOUlEQVR4nO2UMUvDQBTHf1dFBwcXRQfpVMXFQYiDOHWrg6ODH8JZcHfxK+jkbKGjq4MLDg4qKEJdHQQHle7Z5AIxNDQx0YL4h+PuffeO/717eXCnCGgCPWAEjIEQeAPegDdpj+QdSDsS787Aq0APKOcJlZScXTx/Al5k7YHAUw3SXEgBXhA/0zCAdWXfpnNIq1FlcZJFy6YSW8KBLNKXjFc1kVZsxrTkQlqykYvLhYqaZiw7MbDI+a5KrlGVTXTGKMQXXCeunJPYwI6h/QA+ZRxI/S72twgcZxGJIgz8z5fqKKFt2ALujddZi60CcG+c+ylbq4puoQq4BiLDRF9EDfCkvM9i/nYxasCr0hYlqwNdpZ+7yFRYBVpm5T6Bkdg4lPWXBdtYz3SvAswi9eVVfgHxOHCcF1G7iwAAAABJRU5ErkJggg==";
        e.target.src = coffeeImageBase64;
        e.target.dataset.retried = "true";
        e.target.onerror = null; // 防止再次觸發error事件
        return;
    }

    // 檢查是否已嘗試過替代圖片
    if (e.target.dataset.retried === "true") {
        // 已經嘗試過，使用最小備用圖片
        const grayImageBase64 =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
        e.target.src = grayImageBase64;
        console.log("切換到最小備用圖片");
    } else {
        // 首次嘗試，使用咖啡圖片作為通用備用圖
        const coffeeImageBase64 =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAABOUlEQVR4nO2UMUvDQBTHf1dFBwcXRQfpVMXFQYiDOHWrg6ODH8JZcHfxK+jkbKGjq4MLDg4qKEJdHQQHle7Z5AIxNDQx0YL4h+PuffeO/717eXCnCGgCPWAEjIEQeAPegDdpj+QdSDsS787Aq0APKOcJlZScXTx/Al5k7YHAUw3SXEgBXhA/0zCAdWXfpnNIq1FlcZJFy6YSW8KBLNKXjFc1kVZsxrTkQlqykYvLhYqaZiw7MbDI+a5KrlGVTXTGKMQXXCeunJPYwI6h/QA+ZRxI/S72twgcZxGJIgz8z5fqKKFt2ALujddZi60CcG+c+ylbq4puoQq4BiLDRF9EDfCkvM9i/nYxasCr0hYlqwNdpZ+7yFRYBVpm5T6Bkdg4lPWXBdtYz3SvAswi9eVVfgHxOHCcF1G7iwAAAABJRU5ErkJggg==";
        e.target.src = coffeeImageBase64;
        e.target.dataset.retried = "true";
        console.log("切換到咖啡備用圖片");
    }

    // 防止再次觸發error事件
    e.target.onerror = null;
};

// 計算總金額
const calculateTotal = () => {
    if (!cartItems.value || !cartItems.value.length) {
        console.log("購物車為空，總金額為0");
        return 0;
    }

    let total = 0;

    cartItems.value.forEach((item) => {
        if (!item || !item.product) return;

        const price = parseFloat(item.product.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        const itemTotal = price * quantity;

        console.log(
            `計算商品: ${
                item.product.name || "未知商品"
            }, 價格: ${price}, 數量: ${quantity}, 小計: ${itemTotal}`
        );

        if (!isNaN(itemTotal)) {
            total += itemTotal;
        } else {
            console.warn("計算商品總價出錯，可能是價格或數量不是有效數字");
        }
    });

    console.log(`購物車總金額計算結果: ${total.toFixed(2)}`);
    return total.toFixed(0);
};

// 計算總金額的計算屬性
const totalAmount = computed(() => {
    const total = calculateTotal();
    console.log(`最終總金額: ${total}`);
    return total;
});

// 計算商品總數
const totalItems = computed(() => {
    return cartItems.value.reduce((total, item) => {
        return total + (item.quantity || 0);
    }, 0);
});

// 結算購物車
const checkout = async () => {
    if (cartItems.value.length === 0) {
        ElMessage.warning("購物車為空，無法結算");
        return;
    }

    try {
        // 檢查是否有庫存不足的商品
        const insufficientStockItems = cartItems.value.filter((item) => {
            return (item.product?.stockQuantity || 0) < (item.quantity || 0);
        });

        if (insufficientStockItems.length > 0) {
            const itemNames = insufficientStockItems
                .map((item) => item.product?.name || "未知商品")
                .join("、");
            ElMessage.error(`以下商品庫存不足: ${itemNames}`);
            return;
        }

        // 詢問用戶是否確認結算
        await ElMessageBox.confirm("確定要結算購物車並創建訂單嗎？", "結算確認", {
            confirmButtonText: "確定結算",
            cancelButtonText: "取消",
            type: "info",
        });

        loading.value = true;

        // 創建訂單
        const userId = authStore.userInfo?.id;
        console.log(`創建訂單，用戶ID: ${userId}`);

        const response = await createOrderFromCart(userId);

        if (response && response.data) {
            let orderId = null;

            // 處理不同格式的響應
            if (response.data.success && response.data.data && response.data.data.id) {
                orderId = response.data.data.id;
            } else if (response.data.id) {
                orderId = response.data.id;
            }

            if (orderId) {
                // 訂單創建成功
                ElMessage.success("訂單創建成功，即將跳轉到結算頁面");

                // 訂單創建成功後清空購物車 (這裡不再顯示確認對話框)
                try {
                    const userId = authStore.userInfo?.id;
                    await apiClearCart(userId);
                    cartItems.value = [];
                } catch (clearError) {
                    console.error("清空購物車時出錯:", clearError);
                    // 不影響結算流程，僅記錄錯誤
                }

                // 延遲一下再跳轉，讓用戶看到成功提示
                setTimeout(() => {
                    router.push(`/backpage/shop/orders/${orderId}`);
                }, 1500);
            } else {
                ElMessage.error("訂單創建失敗，請稍後重試");
                console.error("訂單創建失敗:", response);
            }
        } else {
            ElMessage.error("訂單創建失敗，請稍後重試");
            console.error("訂單創建失敗:", response);
        }
    } catch (error) {
        if (error === "cancel") {
            // 用戶取消操作，不顯示錯誤
            return;
        }

        console.error("結算時出錯:", error);
        ElMessage.error(`結算失敗: ${error.message || "未知錯誤"}`);
    } finally {
        loading.value = false;
    }
};

// 檢查是否有不完整的商品數據
const hasIncompleteProductData = computed(() => {
    if (!cartItems.value || cartItems.value.length === 0) return false;

    return cartItems.value.some(
        (item) => !item.product || !item.product.id || item.product.name.startsWith("商品 #")
    );
});

onMounted(() => {
    isComponentMounted.value = true;

    if (!authStore.isAuthenticated) {
        ElMessage.warning("請先登入");
        router.push("/member/login");
        return;
    }
    fetchCartItems();
});

onBeforeUnmount(() => {
    isComponentMounted.value = false;
});
</script>

<style scoped>
.cart-management {
    padding: 20px;
}

.cart-container {
    max-width: 1000px;
    margin: 0 auto;
}

.cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.loading-container {
    padding: 20px;
}

.empty-cart {
    padding: 40px 0;
    text-align: center;
}

.cart-alert {
    margin-bottom: 15px;
}

.image-error {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
    color: #909399;
    font-size: 24px;
}

.cart-product-image {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 4px;
    border: 1px solid #eee;
    background-color: #f5f7fa;
}

.cart-product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.cart-product-image-placeholder {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    color: #999;
    font-size: 14px;
    border-radius: 4px;
    border: 1px dashed #ddd;
}

.product-name {
    cursor: pointer;
    color: #409eff;
}

.product-name:hover {
    text-decoration: underline;
}

.product-name-placeholder {
    color: #909399;
    cursor: default;
    font-style: italic;
}

.cart-footer {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
}

.cart-actions {
    display: flex;
    gap: 10px;
}

.cart-summary {
    display: flex;
    align-items: center;
    gap: 20px;
}

.cart-total {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.total-price {
    font-size: 24px;
    color: #f56c6c;
    font-weight: bold;
}

.product-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.product-category {
    font-size: 12px;
    color: #909399;
}

.stock-info {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
}

.price-tag {
    color: #f56c6c;
    font-weight: bold;
}

.subtotal-price {
    color: #f56c6c;
    font-weight: bold;
}

.product-description {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
}
</style>
