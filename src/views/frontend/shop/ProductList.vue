<template>
    <div class="product-list-page dark-theme">
        <!-- 頁面標題 -->
        <section class="title-section">
            <div>
                <h1 class="main-title">健康 <span class="text-highlight">精選商品</span></h1>
                <p class="subtitle">專業健身設備和營養品，助您達成健康目標</p>
            </div>
        </section>

        <!-- 篩選搜尋區 -->
        <section class="search-section">
            <div class="section-container">
                <div class="search-container">
                    <el-input
                        v-model="keyword"
                        placeholder="搜尋商品名稱"
                        clearable
                        @keyup.enter="searchProducts"
                    >
                        <template #prefix>
                            <el-icon><Search /></el-icon>
                        </template>
                        <template #append>
                            <el-button @click="searchProducts">
                                <el-icon><Search /></el-icon>
                            </el-button>
                        </template>
                    </el-input>
                    <el-button type="primary" @click="goToCart">
                        <el-icon><ShoppingCart /></el-icon> 購物車
                    </el-button>
                </div>
            </div>
        </section>

        <!-- 商品展示區域 -->
        <section class="products-section">
            <div class="section-container">
                <!-- 加載中狀態 -->
                <div v-if="loading" class="loading-container">
                    <el-skeleton animated>
                        <template #template>
                            <div style="display: flex; justify-content: space-between; gap: 20px">
                                <el-skeleton-item
                                    v-for="i in 4"
                                    :key="i"
                                    variant="image"
                                    style="width: 240px; height: 240px"
                                />
                            </div>
                        </template>
                    </el-skeleton>
                </div>

                <!-- 無商品狀態 -->
                <div v-else-if="displayProducts.length === 0" class="empty-products">
                    <el-empty description="暫無商品" />
                </div>

                <!-- 商品列表 -->
                <div v-else>
                    <el-row :gutter="20" class="product-grid">
                        <el-col
                            :xs="24"
                            :sm="12"
                            :md="6"
                            v-for="product in displayProducts"
                            :key="product.id"
                            class="product-col"
                        >
                            <div class="product-card" @click="goToProductDetail(product.id)">
                                <div class="product-image">
                                    <img
                                        :src="getProductImageUrl(product)"
                                        :alt="product.name"
                                        onerror="this.onerror=null; this.src='https://placehold.co/300x300/cccccc/ffffff?text=Image+Not+Found'"
                                    />
                                </div>
                                <div class="product-info">
                                    <h3 class="product-name">{{ product.name }}</h3>
                                    <p class="product-description">
                                        {{ truncateText(product.description, 60) }}
                                    </p>
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
                        </el-col>
                    </el-row>

                    <!-- 分頁控制 -->
                    <div class="pagination-container">
                        <el-pagination
                            v-model:current-page="currentPage"
                            v-model:page-size="pageSize"
                            :page-sizes="[8, 12, 16, 24]"
                            :layout="'total, sizes, prev, pager, next, jumper'"
                            :total="totalProducts"
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                        />
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { ref, onMounted, reactive, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getProducts, addItemToCart } from "@/api/shop";
import { Search, ShoppingCart, ArrowRight } from "@element-plus/icons-vue";

export default {
    name: "ProductList",
    components: {
        Search,
        ShoppingCart,
        ArrowRight,
    },
    setup() {
        const router = useRouter();
        const products = ref([]);
        const loading = ref(false);
        const keyword = ref("");
        const currentPage = ref(1);
        const pageSize = ref(8);
        const totalProducts = ref(0);

        // 計算顯示的商品
        const displayProducts = computed(() => {
            const startIndex = (currentPage.value - 1) * pageSize.value;
            const endIndex = startIndex + pageSize.value;
            return products.value.slice(startIndex, endIndex);
        });

        // 當產品列表或分頁大小變更時，更新總產品數量
        watch([products, pageSize], () => {
            totalProducts.value = products.value.length;
        });

        // 計算折扣價格
        const calculateDiscountedPrice = (product) => {
            return product.price;
        };

        // 截斷文本
        const truncateText = (text, length) => {
            if (!text) return "";
            return text.length > length ? text.substring(0, length) + "..." : text;
        };

        // 獲取商品圖片URL的方法，處理各種可能的URL格式
        const getProductImageUrl = (product) => {
            if (!product) {
                return "https://placehold.co/400x300/cccccc/ffffff?text=No+Image";
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

            const color = colors[product.category] || "4CAF50";
            return `https://placehold.co/400x300/${color}/ffffff?text=${encodeURIComponent(
                product.name || "Unknown Product"
            )}`;
        };

        // 加載所有商品
        const loadAllProducts = async () => {
            try {
                loading.value = true;

                const res = await getProducts({
                    keyword: keyword.value,
                });

                if (res && res.data) {
                    if (Array.isArray(res.data)) {
                        products.value = res.data;
                    } else if (res.data.content && Array.isArray(res.data.content)) {
                        products.value = res.data.content;
                    } else {
                        // 使用示例數據
                        useExampleProducts();
                    }

                    // 設置總商品數量
                    totalProducts.value = products.value.length;
                } else {
                    useExampleProducts();
                }
            } catch (error) {
                console.error("Failed to load products:", error);
                ElMessage.error("載入商品列表失敗，使用示例數據");
                useExampleProducts();
            } finally {
                loading.value = false;
            }
        };

        // 使用示例數據
        const useExampleProducts = () => {
            products.value = [
                {
                    id: 1,
                    name: "蛋白粉",
                    description: "乳清蛋白粉，巧克力口味",
                    price: 1200,
                    category: "protein",
                    stockQuantity: 20,
                    imageUrl: null,
                },
                {
                    id: 2,
                    name: "健身手套",
                    description: "防滑透氣健身手套",
                    price: 450,
                    category: "accessories",
                    stockQuantity: 30,
                    imageUrl: null,
                },
                {
                    id: 3,
                    name: "瑜伽墊",
                    description: "加厚防滑瑜伽墊",
                    price: 800,
                    category: "yoga",
                    stockQuantity: 15,
                    imageUrl: null,
                },
                {
                    id: 4,
                    name: "啞鈴組",
                    description: "可調節重量啞鈴組",
                    price: 2500,
                    category: "equipment",
                    stockQuantity: 10,
                    imageUrl: null,
                },
                {
                    id: 5,
                    name: "彈力帶",
                    description: "5種阻力強力彈帶組",
                    price: 600,
                    category: "accessories",
                    stockQuantity: 25,
                    imageUrl: null,
                },
                {
                    id: 6,
                    name: "跳繩",
                    description: "競速跳繩",
                    price: 300,
                    category: "accessories",
                    stockQuantity: 0,
                    imageUrl: null,
                },
                {
                    id: 7,
                    name: "增肌粉",
                    description: "高熱量增肌粉，香草口味",
                    price: 1400,
                    category: "preworkout",
                    stockQuantity: 18,
                    imageUrl: null,
                },
                {
                    id: 8,
                    name: "肌酸粉",
                    description: "純肌酸粉，增加爆發力",
                    price: 900,
                    category: "creatine",
                    stockQuantity: 22,
                    imageUrl: null,
                },
                {
                    id: 9,
                    name: "健身背心",
                    description: "透氣排汗運動背心",
                    price: 450,
                    category: "accessories",
                    stockQuantity: 30,
                    imageUrl: null,
                },
                {
                    id: 10,
                    name: "運動水壺",
                    description: "大容量運動水壺",
                    price: 350,
                    category: "accessories",
                    stockQuantity: 40,
                    imageUrl: null,
                },
                {
                    id: 11,
                    name: "深蹲架",
                    description: "多功能深蹲架",
                    price: 4500,
                    category: "equipment",
                    stockQuantity: 5,
                    imageUrl: null,
                },
                {
                    id: 12,
                    name: "拉力器",
                    description: "多功能家用拉力器",
                    price: 1200,
                    category: "equipment",
                    stockQuantity: 15,
                    imageUrl: null,
                },
            ];
            totalProducts.value = products.value.length;
        };

        // 處理分頁大小變化
        const handleSizeChange = (val) => {
            pageSize.value = val;
            currentPage.value = 1; // 重置為第一頁
        };

        // 處理頁碼變化
        const handleCurrentChange = (val) => {
            currentPage.value = val;
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        // 搜索商品
        const searchProducts = () => {
            currentPage.value = 1; // 重置為第一頁
            loadAllProducts();
        };

        // 前往商品詳情頁
        const goToProductDetail = (productId) => {
            router.push(`/shop/products/${productId}`);
        };

        // 前往購物車頁面
        const goToCart = () => {
            router.push("/shop/cart");
        };

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
            } catch (error) {
                console.error("Failed to add to cart:", error);
                if (error.response && error.response.status === 401) {
                    ElMessage.warning("請先登入後再加入購物車");
                    router.push("/backpage/member/login");
                } else {
                    ElMessage.error(error.displayMessage || "加入購物車失敗");
                }
            }
        };

        // 初始化
        onMounted(() => {
            window.scrollTo(0, 0);
            loadAllProducts();
        });

        return {
            products,
            displayProducts,
            loading,
            keyword,
            currentPage,
            pageSize,
            totalProducts,
            calculateDiscountedPrice,
            truncateText,
            getProductImageUrl,
            searchProducts,
            goToProductDetail,
            goToCart,
            addItemToCartHandler,
            handleSizeChange,
            handleCurrentChange,
        };
    },
};
</script>

<style lang="scss" scoped>
.product-list-page {
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

// 搜尋區域
.search-section {
    padding-bottom: 2rem;

    .search-container {
        display: flex;
        gap: 1rem;
        max-width: 800px;
        margin: 0 auto;

        .el-input {
            flex: 1;
        }
    }
}

// 商品展示區域
.products-section {
    padding: 2rem 0 4rem;
}

// 商品網格
.product-grid {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 2rem;
}

.product-col {
    margin-bottom: 2rem;
}

// 商品卡片
.product-card {
    background-color: #1e293b;
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    }

    .product-image {
        height: 220px;
        position: relative;
        overflow: hidden;
        background-color: #111827;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        width: 100%;

        img {
            width: 100%;
            height: 180px;
            object-fit: cover;
            transition: transform 0.5s;
            border-radius: 0;
        }
    }

    .product-info {
        padding: 1.2rem;
        flex: 1;
        display: flex;
        flex-direction: column;

        .product-name {
            font-size: 1.2rem;
            margin-top: 0;
            margin-bottom: 0.5rem;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .product-description {
            color: #9ca3af;
            margin-bottom: 1rem;
            height: 40px;
            overflow: hidden;
            line-height: 1.4;
        }

        .product-price {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;

            .current-price {
                color: #10b981;
                font-size: 1.3rem;
                font-weight: bold;
            }
        }

        .add-to-cart-btn {
            width: 100%;
            margin-top: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;

            &:hover {
                transform: scale(1.02);
            }
        }
    }
}

// 加載和空狀態
.loading-container,
.empty-products {
    padding: 2rem 0;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
}

// 分頁控制
.pagination-container {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
}

// 響應式設計
@media (max-width: 768px) {
    .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
    }

    .section-container {
        padding: 0 20px;
    }

    .search-container {
        flex-direction: column;
    }
}
</style>
