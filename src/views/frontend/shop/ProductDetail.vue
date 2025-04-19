<template>
    <div class="product-detail-page dark-theme">
        <!-- 返回按鈕 -->
        <div class="back-navigation">
            <div class="section-container">
                <el-button @click="$router.push('/shop/products')" plain>
                    <el-icon><ArrowLeft /></el-icon> 返回商品列表
                </el-button>
            </div>
        </div>

        <!-- 商品詳情 -->
        <section class="product-detail-section">
            <div class="section-container" v-if="product">
                <div class="product-wrapper">
                    <!-- 商品圖片 -->
                    <div class="product-gallery">
                        <div class="main-image">
                            <img
                                :src="getProductImageUrl(product)"
                                :alt="product.name"
                                onerror="this.src='https://placehold.co/600x600/cccccc/ffffff?text=Image+Not+Found'"
                            />
                        </div>
                    </div>

                    <!-- 商品資訊 -->
                    <div class="product-info">
                        <h1 class="product-title">{{ product.name }}</h1>

                        <div class="product-category" v-if="product.category">
                            <el-tag>{{ product.category }}</el-tag>
                        </div>

                        <div class="product-price">NT$ {{ product.price }}</div>

                        <div class="product-description">
                            <h3>商品描述</h3>
                            <p>{{ product.description }}</p>
                        </div>

                        <div class="product-stock">
                            <span class="stock-label">庫存數量:</span>
                            <span
                                :class="[
                                    'stock-quantity',
                                    product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock',
                                ]"
                            >
                                {{
                                    product.stockQuantity > 0
                                        ? product.stockQuantity + " 件"
                                        : "售罄"
                                }}
                            </span>
                        </div>

                        <div class="product-actions">
                            <div class="quantity-control">
                                <span>數量:</span>
                                <el-input-number
                                    v-model="quantity"
                                    :min="1"
                                    :max="product.stockQuantity"
                                    :disabled="product.stockQuantity <= 0"
                                ></el-input-number>
                            </div>

                            <div class="action-buttons">
                                <el-button
                                    type="success"
                                    :disabled="product.stockQuantity <= 0"
                                    @click="addProductToCart"
                                    :loading="isLoading"
                                >
                                    <el-icon><ShoppingCart /></el-icon> 加入購物車
                                </el-button>

                                <el-button
                                    type="primary"
                                    :disabled="product.stockQuantity <= 0"
                                    @click="buyNow"
                                    :loading="isLoading"
                                >
                                    立即購買
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 加載中狀態 -->
            <div class="loading-container section-container" v-if="isLoading">
                <el-skeleton style="width: 100%">
                    <template #template>
                        <div style="display: flex; gap: 20px">
                            <div style="width: 50%">
                                <el-skeleton-item
                                    variant="image"
                                    style="width: 100%; height: 400px"
                                />
                            </div>
                            <div style="width: 50%">
                                <el-skeleton-item
                                    variant="h1"
                                    style="width: 50%; height: 30px; margin-bottom: 20px"
                                />
                                <el-skeleton-item
                                    variant="text"
                                    style="width: 30%; margin-bottom: 20px"
                                />
                                <el-skeleton-item
                                    variant="text"
                                    style="width: 80%; margin-bottom: 10px"
                                />
                                <el-skeleton-item
                                    variant="text"
                                    style="width: 90%; margin-bottom: 10px"
                                />
                                <el-skeleton-item
                                    variant="text"
                                    style="width: 70%; margin-bottom: 10px"
                                />
                            </div>
                        </div>
                    </template>
                </el-skeleton>
            </div>

            <!-- 錯誤提示 -->
            <div class="error-container section-container" v-if="error">
                <el-empty
                    description="商品不存在或已下架"
                    image="https://placehold.co/300x300/FF5252/ffffff?text=找不到商品"
                >
                    <el-button type="primary" @click="$router.push('/shop/products')">
                        返回商品列表
                    </el-button>
                </el-empty>
            </div>
        </section>

        <!-- 推薦商品 -->
        <section class="related-products-section" v-if="relatedProducts.length > 0">
            <div class="section-container">
                <h2 class="section-title">相關 <span class="text-highlight">推薦商品</span></h2>

                <el-row :gutter="20" class="product-list">
                    <el-col
                        :xs="24"
                        :sm="12"
                        :md="6"
                        v-for="item in relatedProducts"
                        :key="item.id"
                    >
                        <div class="product-card">
                            <div class="product-image">
                                <img
                                    :src="getProductImageUrl(item)"
                                    :alt="item.name"
                                    onerror="this.src='https://placehold.co/300x300/cccccc/ffffff?text=Image+Not+Found'"
                                    @click="viewProductDetail(item.id)"
                                />
                            </div>
                            <div class="product-content">
                                <h3 @click="viewProductDetail(item.id)">{{ item.name }}</h3>
                                <p class="product-description">
                                    {{ truncateText(item.description, 50) }}
                                </p>
                                <div class="product-price">NT$ {{ item.price }}</div>
                                <div class="product-actions">
                                    <el-button type="success" @click="addRelatedToCart(item)"
                                        >加入購物車</el-button
                                    >
                                </div>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </section>
    </div>
</template>

<script>
import { ref, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getProductById, addItemToCart, getProducts } from "@/api/shop";
import { ArrowLeft, ShoppingCart } from "@element-plus/icons-vue";

export default {
    name: "ProductDetail",
    components: {
        ArrowLeft,
        ShoppingCart,
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const product = ref(null);
        const isLoading = ref(true);
        const error = ref(false);
        const quantity = ref(1);
        const relatedProducts = ref([]);

        // 獲取商品圖片URL的方法
        const getProductImageUrl = (product) => {
            if (!product) return "https://placehold.co/600x600/cccccc/ffffff?text=No+Image";

            // 檢查各種可能的圖片URL屬性
            if (product.imageUrl) {
                if (product.imageUrl.startsWith("http") || product.imageUrl.startsWith("https")) {
                    return product.imageUrl;
                } else {
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

            // 如果沒有圖片URL，使用預設顏色佔位圖
            const colors = {
                protein: "4CAF50",
                equipment: "FF5722",
                nutrition: "FFC107",
                yoga: "3F51B5",
                creatine: "2196F3",
                accessories: "9C27B0",
                preworkout: "FF9800",
            };

            const color = colors[product.category] || "4CAF50";
            return `https://placehold.co/600x600/${color}/ffffff?text=${encodeURIComponent(
                product.name || "Unknown Product"
            )}`;
        };

        // 獲取商品詳情
        const fetchProductDetail = async () => {
            try {
                isLoading.value = true;
                error.value = false;

                const productId = route.params.id;
                if (!productId) {
                    throw new Error("Missing product ID");
                }

                const response = await getProductById(productId);
                if (response && response.data) {
                    let productData;

                    // 处理不同的响应格式
                    if (response.data.data) {
                        productData = response.data.data;
                    } else {
                        productData = response.data;
                    }

                    if (productData) {
                        product.value = productData;
                        quantity.value = 1;

                        // 获取相关商品
                        fetchRelatedProducts(productData.category);
                    } else {
                        error.value = true;
                    }
                } else {
                    error.value = true;
                }
            } catch (error) {
                console.error("Failed to load product:", error);
                error.value = true;

                // 如果API调用失败，使用示例数据（开发环境）
                if (process.env.NODE_ENV === "development") {
                    useExampleProduct();
                }
            } finally {
                isLoading.value = false;
            }
        };

        // 獲取相關商品
        const fetchRelatedProducts = async (category) => {
            if (!category || !product.value) return;

            try {
                const response = await getProducts();
                if (response.data && Array.isArray(response.data)) {
                    // 篩選同類別但不是當前商品的其他產品
                    const filtered = response.data
                        .filter(
                            (item) => item.category === category && item.id !== product.value.id
                        )
                        .map((item) => ({
                            ...item,
                            image:
                                item.imageUrl ||
                                "https://placehold.co/300x300/4CAF50/ffffff?text=Product",
                        }))
                        .slice(0, 4); // 最多顯示4個相關商品

                    relatedProducts.value = filtered;
                }
            } catch (err) {
                console.error("獲取相關商品失敗:", err);
            }
        };

        // 防抖函數
        const debounce = (fn, delay) => {
            let timer = null;
            return function (...args) {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    fn.apply(this, args);
                    timer = null;
                }, delay);
            };
        };

        // 加入購物車(原始函數，不直接暴露)
        const _addProductToCart = async () => {
            if (!product.value) return;

            try {
                isLoading.value = true;

                if (product.value.stockQuantity <= 0) {
                    ElMessage.warning("商品庫存不足");
                    return;
                }

                const cartItem = {
                    productId: product.value.id,
                    quantity: quantity.value,
                };

                // 檢查是否選擇了有效數量
                if (!cartItem.quantity || cartItem.quantity <= 0) {
                    ElMessage.warning("請選擇有效的商品數量");
                    return;
                }

                const response = await addItemToCart(cartItem);
                if (response && response.data) {
                    ElMessage.success("已加入購物車");
                } else {
                    throw new Error("伺服器返回了無效的數據");
                }
            } catch (error) {
                console.error("Failed to add to cart:", error);
                let errorMessage = "加入購物車失敗，請稍後再試";

                if (error.response) {
                    if (error.response.status === 401) {
                        errorMessage = "請先登入再添加商品到購物車";
                        router.push("/user/login");
                    } else if (error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }

                ElMessage.error(errorMessage);
            } finally {
                isLoading.value = false;
            }
        };

        // 使用防抖包裝的加入購物車函數
        const addProductToCart = debounce(_addProductToCart, 300);

        // 立即購買(原始函數，不直接暴露)
        const _buyNow = async () => {
            try {
                isLoading.value = true;

                if (!product.value) {
                    ElMessage.error("商品信息不完整");
                    return;
                }

                if (product.value.stockQuantity <= 0) {
                    ElMessage.warning("商品庫存不足");
                    return;
                }

                const cartItem = {
                    productId: product.value.id,
                    quantity: quantity.value,
                };

                // 檢查是否選擇了有效數量
                if (!cartItem.quantity || cartItem.quantity <= 0) {
                    ElMessage.warning("請選擇有效的商品數量");
                    return;
                }

                const response = await addItemToCart(cartItem);
                if (response && response.data) {
                    router.push("/shop/cart");
                } else {
                    throw new Error("添加購物車失敗，伺服器沒有返回預期的數據");
                }
            } catch (error) {
                console.error("立即購買失敗:", error);
                let errorMessage = "立即購買失敗，請稍後再試";

                if (error.response) {
                    if (error.response.status === 401) {
                        errorMessage = "請先登入再進行購買";
                        router.push("/user/login");
                    } else if (error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }

                ElMessage.error(errorMessage);
            } finally {
                isLoading.value = false;
            }
        };

        // 使用防抖包裝的立即購買函數
        const buyNow = debounce(_buyNow, 300);

        // 查看其他商品詳情
        const viewProductDetail = (id) => {
            if (id === product.value.id) return;
            router.push(`/shop/products/${id}`);
        };

        // 截斷文字
        const truncateText = (text, length) => {
            if (!text) return "";
            return text.length > length ? text.substring(0, length) + "..." : text;
        };

        // 添加相关商品到购物车(原始函數，不直接暴露)
        const _addRelatedToCart = async (relatedProduct) => {
            try {
                if (!relatedProduct || !relatedProduct.id) {
                    ElMessage.error("商品信息不完整，無法添加到購物車");
                    return;
                }

                if (relatedProduct.stockQuantity <= 0) {
                    ElMessage.warning("商品庫存不足，無法添加到購物車");
                    return;
                }

                const cartItem = {
                    productId: relatedProduct.id,
                    quantity: 1,
                };

                const response = await addItemToCart(cartItem);
                if (response && response.data) {
                    ElMessage.success("已加入購物車");
                } else {
                    throw new Error("添加購物車失敗，伺服器沒有返回預期的數據");
                }
            } catch (error) {
                console.error("Failed to add related product to cart:", error);
                let errorMessage = "加入購物車失敗，請稍後再試";

                if (error.response) {
                    if (error.response.status === 401) {
                        errorMessage = "請先登入再添加商品到購物車";
                        router.push("/user/login");
                    } else if (error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }

                ElMessage.error(errorMessage);
            }
        };

        // 使用防抖包裝的相關商品購物車函數
        const addRelatedToCart = debounce(_addRelatedToCart, 300);

        onMounted(() => {
            window.scrollTo(0, 0);
            fetchProductDetail();
        });

        return {
            product,
            isLoading,
            error,
            quantity,
            relatedProducts,
            addProductToCart,
            buyNow,
            viewProductDetail,
            truncateText,
            getProductImageUrl,
            addRelatedToCart,
        };
    },
};
</script>

<style lang="scss" scoped>
.product-detail-page {
    // 深色主題變數
    --bg-primary: #111827;
    --bg-secondary: #1f2937;
    --text-primary: #f9fafb;
    --text-secondary: #9ca3af;
    --highlight-color: #10b981;
    --highlight-hover: #059669;
    --border-color: #374151;
    --card-bg: #1e293b;

    background-color: #111827;
    color: #f5f5f5;
    min-height: 100vh;
    width: 100vw;
    margin: 0;
    padding-top: 80px;
    overflow-x: hidden;
}

.text-highlight {
    color: var(--highlight-color);
    font-weight: 600;
}

.container {
    width: 100%;
    margin: 0;
    padding: 0;
}

.section-container {
    width: 100%;
    margin: 0 auto;
    padding: 0 40px;
}

// 返回導航
.back-navigation {
    padding: 2rem 0 1rem;

    .el-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
}

// 商品詳情
.product-detail-section {
    padding: 1rem 0 3rem;
}

.product-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
}

// 商品圖片
.product-gallery {
    flex: 1;
    min-width: 300px;

    .main-image {
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
        height: 600px;

        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
    }
}

// 商品資訊
.product-info {
    flex: 1;
    min-width: 300px;

    .product-title {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    .product-category {
        margin-bottom: 1.5rem;
    }

    .product-price {
        font-size: 2rem;
        font-weight: 700;
        color: var(--highlight-color);
        margin-bottom: 1.5rem;
    }

    .product-description {
        margin-bottom: 2rem;

        h3 {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
        }

        p {
            color: var(--text-secondary);
            line-height: 1.6;
        }
    }

    .product-stock {
        margin-bottom: 1.5rem;

        .stock-label {
            margin-right: 0.5rem;
        }

        .stock-quantity {
            &.in-stock {
                color: var(--highlight-color);
            }

            &.out-of-stock {
                color: #ef4444;
            }
        }
    }

    .product-actions {
        .quantity-control {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .action-buttons {
            display: flex;
            gap: 1rem;
            justify-content: flex-start;

            .el-button {
                min-width: 120px;
                width: auto;
                padding-left: 20px;
                padding-right: 20px;
            }
        }
    }
}

// 相關商品
.related-products-section {
    padding: 3rem 0;
}

.section-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 2rem;
    text-align: center;
}

.product-list {
    margin-top: 2rem;
}

.product-card {
    background-color: var(--card-bg);
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
    margin-bottom: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    }

    .product-image {
        height: 200px;
        overflow: hidden;
        cursor: pointer;

        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            transition: transform 0.5s;

            &:hover {
                transform: scale(1.05);
            }
        }
    }

    .product-content {
        padding: 1.2rem;
        flex: 1;
        display: flex;
        flex-direction: column;

        h3 {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
            cursor: pointer;

            &:hover {
                color: var(--highlight-color);
            }
        }

        .product-description {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-bottom: 1rem;
            flex: 1;
        }

        .product-price {
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--highlight-color);
        }
    }
}

// 加載和錯誤
.loading-container,
.error-container {
    padding: 4rem 0;
    text-align: center;
}

@media (max-width: 768px) {
    .product-wrapper {
        flex-direction: column;
    }

    .product-info .product-actions .action-buttons {
        flex-direction: column;
    }
}
</style>
