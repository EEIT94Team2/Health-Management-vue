<template>
    <div class="cart-page dark-theme">
        <!-- 頁面標題 -->
        <section class="title-section">
            <div>
                <h1 class="main-title">購物 <span class="text-highlight">購物車</span></h1>
                <p class="subtitle">查看已選商品，調整數量或移除，並完成結帳</p>
            </div>
        </section>

        <!-- 購物車內容 -->
        <section class="cart-section">
            <div class="section-container">
                <div v-if="loading" class="loading-container">
                    <el-skeleton :rows="3" animated style="width: 100%" />
                </div>

                <div v-else-if="cartItems.length === 0" class="empty-cart">
                    <el-empty description="購物車是空的">
                        <el-button type="primary" @click="goToProducts">去選購商品</el-button>
                    </el-empty>
                </div>

                <div v-else class="cart-content">
                    <div class="cart-items">
                        <div class="cart-header">
                            <h3 class="header-title">您的購物清單</h3>
                            <el-button type="danger" plain @click="confirmClearCart">
                                清空購物車
                            </el-button>
                        </div>

                        <el-table
                            :data="cartItems"
                            style="width: 100%"
                            class="cart-table"
                            row-key="id"
                        >
                            <el-table-column label="商品" min-width="300">
                                <template #default="scope">
                                    <div class="cart-item">
                                        <div class="item-image">
                                            <img
                                                :src="getProductImageUrl(scope.row.product)"
                                                :alt="
                                                    scope.row.product
                                                        ? scope.row.product.name
                                                        : 'Product'
                                                "
                                                onerror="this.onerror=null; this.src='https://placehold.co/120x120/1e293b/ffffff?text=Image+Not+Found'"
                                            />
                                        </div>
                                        <div class="item-details">
                                            <h4 class="item-name">
                                                {{
                                                    scope.row.product
                                                        ? scope.row.product.name
                                                        : "未知商品"
                                                }}
                                            </h4>
                                            <p class="item-category">
                                                分類:
                                                {{
                                                    scope.row.product
                                                        ? formatCategory(scope.row.product.category)
                                                        : "其他"
                                                }}
                                            </p>
                                            <p
                                                v-if="
                                                    scope.row.product &&
                                                    scope.row.product.stockQuantity <= 5
                                                "
                                                class="low-stock"
                                            >
                                                僅剩 {{ scope.row.product.stockQuantity }} 件
                                            </p>
                                            <p v-if="!scope.row.product" class="error-message">
                                                商品信息不可用
                                            </p>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column label="單價" width="150">
                                <template #default="scope">
                                    <div class="price-container">
                                        <span class="price">
                                            NT$
                                            {{ scope.row.product ? scope.row.product.price : "0" }}
                                        </span>
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column label="數量" width="180">
                                <template #default="scope">
                                    <div class="quantity-control">
                                        <el-input-number
                                            v-model="scope.row.quantity"
                                            :min="1"
                                            :max="
                                                scope.row.product
                                                    ? scope.row.product.stockQuantity
                                                    : 1
                                            "
                                            size="small"
                                            @change="
                                                (value) => handleQuantityChange(scope.row.id, value)
                                            "
                                        />
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column label="小計" width="150">
                                <template #default="scope">
                                    <span class="subtotal">
                                        NT$ {{ calculateSubtotal(scope.row) }}
                                    </span>
                                </template>
                            </el-table-column>

                            <el-table-column width="80">
                                <template #default="scope">
                                    <el-button
                                        type="danger"
                                        size="small"
                                        circle
                                        @click="confirmRemoveItem(scope.row)"
                                    >
                                        <el-icon><Delete /></el-icon>
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <!-- 購物車總結 -->
                        <div class="cart-summary">
                            <div class="summary-row">
                                <span class="summary-label">商品小計:</span>
                                <span class="summary-value">NT$ {{ totalAmount }}</span>
                            </div>
                            <div class="summary-row">
                                <span>運費:</span>
                                <span class="summary-value">NT$ {{ shipping }}</span>
                            </div>
                            <div v-if="freeShipping" class="summary-row free-shipping">
                                <span></span>
                                <span class="free-shipping-tag">🎉 購物滿NT$1000免運費</span>
                            </div>
                            <div class="summary-row total">
                                <span class="summary-label">訂單總額:</span>
                                <span class="summary-value highlight">NT$ {{ grandTotal }}</span>
                            </div>
                            <div class="action-buttons">
                                <el-button @click="goToProducts">繼續購物</el-button>
                                <el-button type="primary" @click="checkoutHandler">
                                    結帳
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 推薦商品 -->
        <section v-if="recommendedProducts.length > 0" class="recommended-section">
            <div class="section-container">
                <h2 class="section-title">推薦商品</h2>
                <div class="recommended-products">
                    <div
                        v-for="product in recommendedProducts"
                        :key="product.id"
                        class="recommended-product"
                        @click="goToProductDetail(product.id)"
                    >
                        <div class="product-image">
                            <img
                                :src="getProductImageUrl(product)"
                                :alt="product.name"
                                onerror="this.onerror=null; this.src='https://placehold.co/200x200/cccccc/ffffff?text=Image+Not+Found'"
                            />
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">{{ product.name }}</h3>
                            <div class="product-price">
                                <span class="current-price">NT$ {{ product.price }}</span>
                            </div>
                            <el-button
                                type="success"
                                class="add-to-cart-btn"
                                @click.stop="addItemToCartHandler(product)"
                                :disabled="product.stockQuantity <= 0"
                            >
                                <el-icon><ShoppingCart /></el-icon> 加入購物車
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, ShoppingCart } from "@element-plus/icons-vue";
import {
    getCartItems,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    addItemToCart,
    getProducts,
    fetchProductForCartItem,
    createOrderFromCart,
} from "@/api/shop";

export default {
    name: "CartPage",
    components: {
        Delete,
        ShoppingCart,
    },
    setup() {
        const router = useRouter();
        const cartItems = ref([]);
        const loading = ref(false);
        const recommendedProducts = ref([]);
        const freeShipping = ref(false);

        // 輔助函數：獲取當前用戶ID
        const getUserId = () => {
            let userId = null;

            // 嘗試多種可能的存儲位置
            // 1. localStorage中的userInfo
            try {
                const userInfo = localStorage.getItem("userInfo");
                if (userInfo) {
                    const parsedInfo = JSON.parse(userInfo);
                    userId = parsedInfo?.id || parsedInfo?.userId;
                    if (userId) return userId;
                }
            } catch (e) {
                console.error("從userInfo獲取userId失敗:", e);
            }

            // 2. localStorage中的authStore
            try {
                const authStore = localStorage.getItem("authStore");
                if (authStore) {
                    const parsedStore = JSON.parse(authStore);
                    userId = parsedStore?.userInfo?.id || parsedStore?.userId;
                    if (userId) return userId;
                }
            } catch (e) {
                console.error("從authStore獲取userId失敗:", e);
            }

            // 3. 直接從localStorage中的userId
            try {
                userId = localStorage.getItem("userId");
                if (userId) return userId;
            } catch (e) {
                console.error("從userId獲取失敗:", e);
            }

            return null;
        };

        // 檢查當前用戶是否已登入
        const isUserLoggedIn = () => {
            return !!localStorage.getItem("authToken");
        };

        // 獲取購物車項目
        const fetchCartItems = async () => {
            try {
                loading.value = true;
                const response = await getCartItems();
                console.log("購物車API響應:", response);

                if (response && response.data) {
                    // 處理後端返回的數據
                    let items = [];
                    if (Array.isArray(response.data)) {
                        items = response.data;
                    } else if (response.data.content && Array.isArray(response.data.content)) {
                        items = response.data.content;
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        // 處理{success: true, data: [...]}格式的回應
                        items = response.data.data;
                    }

                    console.log("原始購物車項目:", items);

                    // 簡化過濾邏輯 - 只要有id就視為有效項目
                    cartItems.value = items.filter((item) => item && (item.id || item.cartItemId));
                    console.log("過濾後的購物車項目:", cartItems.value);

                    // 如果購物車有項目，但缺少商品信息，試著獲取
                    if (cartItems.value.length > 0) {
                        const missingProductItems = cartItems.value.filter(
                            (item) => !item.product || !item.product.name
                        );

                        if (missingProductItems.length > 0) {
                            console.log(
                                `有${missingProductItems.length}個項目缺少商品信息，嘗試獲取`
                            );
                            const promises = missingProductItems.map((item) =>
                                fetchProductForCartItem(item)
                            );
                            await Promise.allSettled(promises);
                            cartItems.value = [...cartItems.value]; // 強制更新引用
                        }

                        // 無論是否有完整信息，都將購物車項目保存到localStorage
                        localStorage.setItem("cart", JSON.stringify(cartItems.value));
                    }
                } else {
                    // 嘗試從localStorage讀取購物車
                    const localCart = localStorage.getItem("cart");
                    if (localCart) {
                        try {
                            const parsedCart = JSON.parse(localCart);
                            if (Array.isArray(parsedCart) && parsedCart.length > 0) {
                                cartItems.value = parsedCart;
                                console.log("從localStorage載入購物車:", cartItems.value);
                            } else {
                                cartItems.value = [];
                            }
                        } catch (e) {
                            console.error("解析localStorage購物車數據錯誤:", e);
                            cartItems.value = [];
                        }
                    } else {
                        cartItems.value = [];
                    }
                }

                // 如果購物車有項目，獲取推薦商品
                if (cartItems.value.length > 0) {
                    fetchRecommendedProducts();
                }
            } catch (error) {
                console.error("Failed to fetch cart items:", error);
                if (error.response && error.response.status === 401) {
                    ElMessage.warning("請先登入後查看購物車");
                    router.push("/user/login");
                } else {
                    ElMessage.error(error.displayMessage || "獲取購物車失敗");

                    // 嘗試從本地存儲加載
                    const localCart = localStorage.getItem("cart");
                    if (localCart) {
                        try {
                            const parsedCart = JSON.parse(localCart);
                            if (Array.isArray(parsedCart)) {
                                cartItems.value = parsedCart;
                                console.log("API錯誤，從localStorage載入購物車:", cartItems.value);
                            }
                        } catch (e) {
                            cartItems.value = [];
                        }
                    }
                }
            } finally {
                loading.value = false;
            }
        };

        // 獲取推薦商品
        const fetchRecommendedProducts = async () => {
            try {
                // 從已有商品的類別中獲取相似商品
                const categories = cartItems.value
                    .filter((item) => item && item.product) // 確保只處理有效的購物車項目
                    .map((item) => item.product?.category)
                    .filter((value) => value !== undefined && value !== null)
                    .filter((value, index, self) => self.indexOf(value) === index);

                // 如果沒有有效的類別，不進行請求
                if (categories.length === 0) {
                    console.log("無法找到有效的商品類別，無法獲取推薦商品");
                    recommendedProducts.value = [];
                    return;
                }

                const response = await getProducts({
                    limit: 4,
                    categories: categories.join(","),
                });

                if (response && response.data) {
                    let products = [];

                    if (Array.isArray(response.data)) {
                        products = response.data;
                    } else if (response.data.content && Array.isArray(response.data.content)) {
                        products = response.data.content;
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        products = response.data.data;
                    }

                    // 確保只處理有效的產品
                    products = products.filter((product) => product && product.id);

                    // 過濾掉已經在購物車中的商品，使用安全的方式
                    const cartProductIds = cartItems.value
                        .filter((item) => item && item.product)
                        .map((item) => item.product.id);

                    recommendedProducts.value = products
                        .filter((product) => !cartProductIds.includes(product.id))
                        .slice(0, 4);

                    console.log(`獲取了${recommendedProducts.value.length}個推薦商品`);
                }
            } catch (error) {
                console.error("Failed to fetch recommended products:", error);
                recommendedProducts.value = [];
            }
        };

        // 更新購物車項目數量
        const handleQuantityChange = async (itemId, quantity) => {
            try {
                await updateCartItemQuantity({
                    cartItemId: itemId,
                    quantity,
                });
                // API成功后更新本地
                const item = cartItems.value.find((i) => i.id === itemId);
                if (item) {
                    item.quantity = quantity;
                }
                ElMessage.success("購物車數量已更新");
            } catch (error) {
                console.error("Failed to update quantity:", error);
                // 重新加載購物車以恢復正確數量
                fetchCartItems();
                ElMessage.error(error.displayMessage || "更新數量失敗");
            }
        };

        // 確認刪除商品
        const confirmRemoveItem = (item) => {
            ElMessageBox.confirm(
                `確定要從購物車中移除 ${item.product ? item.product.name : "此商品"} 嗎?`,
                "確認移除",
                {
                    confirmButtonText: "確定",
                    cancelButtonText: "取消",
                    type: "warning",
                }
            )
                .then(() => {
                    removeCartItem(item.id);
                })
                .catch(() => {
                    // 用戶取消
                });
        };

        // 從購物車中移除商品
        const removeCartItem = async (itemId) => {
            try {
                await removeFromCart({
                    cartItemId: itemId,
                });
                // API成功后更新本地
                cartItems.value = cartItems.value.filter((item) => item.id !== itemId);
                ElMessage.success("商品已從購物車移除");

                // 如果購物車為空，清空推薦商品
                if (cartItems.value.length === 0) {
                    recommendedProducts.value = [];
                }
            } catch (error) {
                console.error("Failed to remove item from cart:", error);
                ElMessage.error(error.displayMessage || "移除商品失敗");
            }
        };

        // 確認清空購物車
        const confirmClearCart = () => {
            ElMessageBox.confirm("確定要清空購物車嗎?", "確認清空", {
                confirmButtonText: "確定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    clearCartHandler();
                })
                .catch(() => {
                    // 用戶取消
                });
        };

        // 清空購物車
        const clearCartHandler = async () => {
            try {
                await clearCart();
                cartItems.value = [];
                recommendedProducts.value = [];
                ElMessage.success("購物車已清空");
            } catch (error) {
                console.error("Failed to clear cart:", error);
                ElMessage.error(error.displayMessage || "清空購物車失敗");
            }
        };

        // 獲取商品圖片URL的方法，處理各種可能的URL格式
        const getProductImageUrl = (product) => {
            // 檢查 product 是否存在
            if (!product) {
                return "https://placehold.co/400x300/cccccc/ffffff?text=No+Product";
            }

            // 檢查各種可能的圖片URL屬性
            if (product.imageUrl) {
                // 檢查是否為完整URL還是相對路徑
                if (product.imageUrl.startsWith("http") || product.imageUrl.startsWith("https")) {
                    return product.imageUrl;
                } else {
                    // 假設是相對路徑，添加後端基礎URL
                    return `http://localhost:8080${product.imageUrl}`;
                }
            }

            if (product.image) {
                if (product.image.startsWith("http") || product.image.startsWith("https")) {
                    return product.image;
                } else {
                    return `http://localhost:8080${product.image}`;
                }
            }

            if (product.img || product.imgUrl) {
                const imgPath = product.img || product.imgUrl;
                if (imgPath.startsWith("http") || imgPath.startsWith("https")) {
                    return imgPath;
                } else {
                    return `http://localhost:8080${imgPath}`;
                }
            }

            // 如果所有嘗試都失敗，使用默認顏色佔位圖
            const colors = {
                protein: "4CAF50",
                preworkout: "FF9800",
                creatine: "2196F3",
                equipment: "FF5722",
                accessories: "9C27B0",
                yoga: "3F51B5",
            };

            const color = product.category ? colors[product.category] || "4CAF50" : "cccccc";
            const productName = product.name || "Unknown Product";
            return `https://placehold.co/400x300/${color}/ffffff?text=${encodeURIComponent(
                productName
            )}`;
        };

        // 計算折扣價格
        const calculateDiscountedPrice = (product) => {
            return product.price;
        };

        // 計算商品小計
        const calculateSubtotal = (item) => {
            if (!item) return "0";

            // 處理產品信息不完整的情況
            let price = 0;
            if (item.product && item.product.price) {
                price = Number(item.product.price);
            } else if (item.price) {
                // 直接從項目獲取價格
                price = Number(item.price);
            } else if (item.unitPrice) {
                price = Number(item.unitPrice);
            }

            // 確保數量是有效數字
            const quantity = item.quantity ? Number(item.quantity) : 1;

            return (price * quantity).toFixed(0);
        };

        // 計算總額
        const totalAmount = computed(() => {
            return cartItems.value
                .reduce((total, item) => {
                    // 使用calculateSubtotal來獲取每個項目的小計
                    const subtotal = parseFloat(calculateSubtotal(item)) || 0;
                    return total + subtotal;
                }, 0)
                .toFixed(0);
        });

        // 運費計算
        const shipping = computed(() => {
            // 簡單的運費計算邏輯，購物滿1000免運費
            let shippingValue = Number(totalAmount.value) >= 1000 ? 0 : 60;

            // 記錄免運費狀態供模板使用
            freeShipping.value = shippingValue === 0;

            return shippingValue;
        });

        // 訂單總額
        const grandTotal = computed(() => {
            return (Number(totalAmount.value) + shipping.value).toFixed(0);
        });

        // 添加到購物車
        const addItemToCartHandler = async (product) => {
            try {
                if (product.stockQuantity <= 0) {
                    ElMessage.warning("該商品目前無庫存");
                    return;
                }

                await addItemToCart({
                    productId: product.id,
                    quantity: 1,
                });

                ElMessage.success("成功加入購物車");
                // 重新加載購物車
                fetchCartItems();
            } catch (error) {
                console.error("Failed to add to cart:", error);
                if (error.response && error.response.status === 401) {
                    ElMessage.warning("請先登入後再加入購物車");
                    router.push("/user/login");
                } else {
                    ElMessage.error(error.displayMessage || "加入購物車失敗");
                }
            }
        };

        // 格式化類別名稱
        const formatCategory = (category) => {
            if (!category) return "其他";

            const categoryMap = {
                protein: "蛋白質",
                preworkout: "訓練前",
                creatine: "肌酸",
                equipment: "健身器材",
                accessories: "健身配件",
                yoga: "瑜伽用品",
            };

            return categoryMap[category.toLowerCase()] || category;
        };

        // 前往商品頁面
        const goToProducts = () => {
            router.push("/shop/products");
        };

        // 前往商品詳情頁
        const goToProductDetail = (productId) => {
            router.push(`/shop/products/${productId}`);
        };

        // 結帳處理
        const checkoutHandler = async () => {
            // 調試購物車狀態
            console.log("購物車內容：", cartItems.value);
            console.log("購物車物品數量：", cartItems.value.length);

            if (!cartItems.value || cartItems.value.length === 0) {
                ElMessage.warning("購物車是空的，請先加入商品");
                return;
            }

            try {
                // 確保用戶已登入
                if (!isUserLoggedIn()) {
                    ElMessage.warning("請先登入後再進行結帳");
                    router.push("/user/login");
                    return;
                }

                // 保存購物車數據到localStorage作為備份
                localStorage.setItem("checkoutCart", JSON.stringify(cartItems.value));
                localStorage.setItem("cartTotal", totalAmount.value);
                localStorage.setItem("cartGrandTotal", grandTotal.value);
                localStorage.setItem("cartShipping", shipping.value.toString());

                console.log(`結帳流程開始，購物車共有 ${cartItems.value.length} 件商品`);
                console.log(`總金額: ${totalAmount.value}`);

                // 顯示加載消息
                loading.value = true;
                ElMessage.info("正在準備訂單...");

                try {
                    // 獲取用戶ID
                    const userId = getUserId();

                    // 如果無法獲取用戶ID，請求登入
                    if (!userId) {
                        ElMessage.warning("無法獲取用戶信息，請重新登入");
                        router.push("/user/login");
                        loading.value = false;
                        return;
                    }

                    console.log(`嘗試創建訂單，用戶ID: ${userId}`);

                    // 創建訂單
                    const response = await createOrderFromCart(userId);
                    console.log("創建訂單響應:", response);

                    // 處理API成功響應
                    if (response && response.data) {
                        let orderId = null;

                        // 處理不同格式的響應
                        if (response.data.success && response.data.data && response.data.data.id) {
                            orderId = response.data.data.id;
                        } else if (response.data.id) {
                            orderId = response.data.id;
                        } else if (response.data.orderId) {
                            orderId = response.data.orderId;
                        }

                        if (orderId) {
                            // 訂單創建成功
                            ElMessage.success("訂單創建成功，即將跳轉到訂單詳情");

                            // 清空購物車
                            cartItems.value = [];
                            localStorage.removeItem("cart"); // 清除localStorage中的購物車

                            // 延遲一下再跳轉
                            setTimeout(() => {
                                // 跳轉到訂單詳情頁
                                router.push(`/shop/orders/${orderId}`);
                            }, 1000);
                            return;
                        }
                    }

                    // 如果上面的代碼沒有成功處理訂單創建，則回退到舊的結帳行為
                    console.log("使用備選結帳邏輯 - 嘗試跳轉到結帳頁面");

                    // 檢查是否有/shop/checkout路由
                    router.push("/shop/checkout").catch((error) => {
                        console.error("導航到結帳頁面失敗:", error);
                        // 如果沒有checkout頁面，顯示提示
                        ElMessage.error("結帳頁面不存在，請聯繫管理員");
                    });
                } catch (error) {
                    console.error("創建訂單失敗:", error);

                    // 判斷錯誤類型
                    if (error.response && error.response.status === 401) {
                        ElMessage.warning("登入狀態已過期，請重新登入");
                        router.push("/user/login");
                        return;
                    }

                    ElMessage.error("訂單創建失敗，正在嘗試備選結帳流程");

                    // 因訂單創建失敗，仍嘗試跳轉到結帳頁面
                    router.push("/shop/checkout").catch((error) => {
                        console.error("導航到結帳頁面失敗:", error);
                        ElMessage.error("無法完成結帳，請稍後再試");
                    });
                } finally {
                    loading.value = false;
                }
            } catch (error) {
                console.error("結帳過程發生錯誤:", error);
                ElMessage.error("結帳過程發生錯誤，請稍後再試");
                loading.value = false;
            }
        };

        // 初始化
        onMounted(() => {
            window.scrollTo(0, 0);
            fetchCartItems();
        });

        return {
            cartItems,
            loading,
            recommendedProducts,
            totalAmount,
            shipping,
            grandTotal,
            freeShipping,
            getProductImageUrl,
            calculateDiscountedPrice,
            calculateSubtotal,
            handleQuantityChange,
            confirmRemoveItem,
            confirmClearCart,
            formatCategory,
            goToProducts,
            goToProductDetail,
            checkoutHandler,
            addItemToCartHandler,
        };
    },
};
</script>

<style lang="scss" scoped>
.cart-page {
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

// 頁面標題
.title-section {
    padding: 3rem 0;
    text-align: center;

    .main-title {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        display: inline-block;
    }

    .subtitle {
        font-size: 1.2rem;
        color: #9ca3af;
        max-width: 800px;
        margin: 0 auto;
    }
}

// 購物車區域
.cart-section {
    padding-bottom: 3rem;
    background-color: #111827;

    .section-container {
        background-color: #111827;
    }
}

// 購物車內容
.cart-content {
    background-color: #1e293b;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

// 購物車頭部
.cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #2d3748;

    .header-title {
        font-size: 1.4rem;
        margin: 0;
    }
}

// 購物車表格
.cart-table {
    width: 100%;
    border-collapse: collapse;
    background-color: #1e293b;
    border-bottom: 1px solid #2d3748;
}

.cart-item {
    display: flex;
    align-items: center;
    gap: 1rem;

    .item-image {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        overflow: hidden;
        background-color: #111827;

        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }

    .item-details {
        .item-name {
            margin: 0 0 0.5rem;
            font-size: 1.1rem;
        }

        .item-category {
            color: #9ca3af;
            margin: 0 0 0.3rem;
        }

        .low-stock {
            color: #ff9800;
            font-size: 0.85rem;
            margin-top: 0.5rem;
        }

        .error-message {
            color: #ff4757;
            font-size: 0.85rem;
            margin-top: 0.5rem;
        }
    }
}

// 價格顯示
.price-container {
    display: flex;
    flex-direction: column;

    .price {
        color: #f5f5f5;
        font-weight: bold;
    }
}

// 數量控制
.quantity-control {
    display: flex;
    align-items: center;
}

// 小計
.subtotal {
    font-weight: bold;
    color: #10b981;
}

// 購物車總結
.cart-summary {
    background-color: #2d3748;
    padding: 1.5rem;
    border-radius: 0 0 12px 12px;

    .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.8rem;

        &.total {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #4b5563;
            font-weight: bold;
        }
    }

    .summary-label {
        color: #d1d5db;
    }

    .summary-value {
        font-weight: 500;

        &.highlight {
            color: #10b981;
            font-size: 1.3rem;
        }
    }

    .action-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
    }
}

// 空購物車
.empty-cart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
    background-color: #1e293b;
    border-radius: 12px;
    min-height: 300px;
}

// 加載中
.loading-container {
    padding: 3rem;
    background-color: #1e293b;
    border-radius: 12px;
    min-height: 300px;
}

// 推薦商品區域
.recommended-section {
    padding: 3rem 0;

    .section-title {
        font-size: 1.8rem;
        margin-bottom: 2rem;
        text-align: center;
    }

    .recommended-products {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
    }

    .recommended-product {
        background-color: #1e293b;
        border-radius: 12px;
        overflow: hidden;
        transition: transform 0.3s, box-shadow 0.3s;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);

            .product-image img {
                transform: scale(1.05);
            }
        }

        .product-image {
            height: 180px;
            position: relative;
            overflow: hidden;
            background-color: transparent;

            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                transition: transform 0.3s ease;
            }
        }

        .product-info {
            padding: 1.2rem;

            .product-name {
                font-size: 1.1rem;
                margin-top: 0;
                margin-bottom: 1rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .product-price {
                display: flex;
                align-items: center;
                margin-bottom: 1rem;

                .current-price {
                    color: #10b981;
                    font-size: 1.2rem;
                    font-weight: bold;
                }
            }

            .add-to-cart-btn {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            }
        }
    }
}

// 響應式設計
@media (max-width: 768px) {
    .section-container {
        padding: 0 20px;
    }

    .cart-item {
        flex-direction: column;
        align-items: flex-start;

        .item-image {
            width: 60px;
            height: 60px;
        }
    }

    .cart-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .cart-summary .action-buttons {
        flex-direction: column;
        width: 100%;
    }
}

:deep(.el-table) {
    background-color: #1e293b;
    color: #f5f5f5;

    .el-table__inner-wrapper::before {
        display: none;
    }
}

:deep(.el-table th),
:deep(.el-table td) {
    background-color: #1e293b;
    color: #f5f5f5;
    border-bottom-color: #2d3748;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
    background-color: #2d3748;
}

:deep(.el-input-number) {
    width: 120px;
}

// 整體頁面樣式覆蓋
:deep(.el-button--primary) {
    background-color: #10b981;
    border-color: #10b981;

    &:hover,
    &:focus {
        background-color: #059669;
        border-color: #059669;
    }
}

// 數量按鈕和結帳區域背景
.cart-section {
    .el-button {
        border-radius: 6px;
    }

    .el-input-number.is-controls-right .el-input__wrapper {
        background-color: #1e293b;
        box-shadow: 0 0 0 1px #4b5563 inset;
    }
}

// 頁面背景修正
.el-main {
    background-color: #111827;
}

// 設置結帳和繼續購物按鈕顏色
.action-buttons {
    margin-top: 1.5rem;

    .el-button {
        padding: 12px 24px;
        font-size: 1rem;

        &.el-button--primary {
            background-color: #10b981;
            border-color: #10b981;

            &:hover {
                background-color: #059669;
                border-color: #059669;
            }
        }

        &.el-button--default {
            background-color: #1e293b;
            border-color: #4b5563;
            color: #f5f5f5;

            &:hover {
                background-color: #2d3748;
                border-color: #6b7280;
            }
        }
    }
}

:deep(.el-empty__description) {
    color: #d1d5db;
}

// 添加額外的深色主題樣式覆蓋
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

    &.el-button--danger {
        &.is-plain {
            background-color: transparent;
            color: #f56c6c;
        }
    }
}

:deep(.el-message-box) {
    background-color: #1e293b;
    border-color: #4b5563;

    .el-message-box__title,
    .el-message-box__message {
        color: #f5f5f5;
    }

    .el-message-box__headerbtn .el-message-box__close {
        color: #f5f5f5;
    }

    .el-button {
        &.el-button--default {
            background-color: #2d3748;
            border-color: #4b5563;
            color: #f5f5f5;
        }
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

// 新增免運費樣式
.free-shipping {
    margin: 0.5rem 0;
    border-bottom: none !important;

    .free-shipping-tag {
        color: #10b981;
        font-size: 0.9rem;
        font-weight: 500;
        padding: 2px 8px;
        background-color: rgba(16, 185, 129, 0.15);
        border-radius: 4px;
    }
}
</style>
