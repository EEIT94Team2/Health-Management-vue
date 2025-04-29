<template>
    <div class="product-list-container">
        <el-card class="product-list-card">
            <template #header>
                <div class="product-list-header">
                    <div class="header-left">
                        <h2>商品列表</h2>
                        <el-button-group class="view-mode-group">
                            <el-button
                                type="primary"
                                :plain="viewMode !== 'grid'"
                                icon="Grid"
                                @click="viewMode = 'grid'"
                            >
                                網格
                            </el-button>
                            <el-button
                                type="primary"
                                :plain="viewMode !== 'list'"
                                icon="List"
                                @click="viewMode = 'list'"
                            >
                                列表
                            </el-button>
                        </el-button-group>
                    </div>

                    <div class="filter-container">
                        <el-input
                            v-model="searchKeyword"
                            placeholder="搜索商品"
                            class="search-input"
                            clearable
                            @keyup.enter="handleSearch"
                        >
                            <template #prefix>
                                <el-icon class="search-icon"><Search /></el-icon>
                            </template>
                        </el-input>

                        <el-select
                            v-model="priceRange"
                            placeholder="價格範圍"
                            @change="handlePriceRangeChange"
                        >
                            <el-option
                                v-for="item in priceRangeOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            >
                            </el-option>
                        </el-select>
                    </div>
                </div>
            </template>

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-container">
                <el-skeleton :rows="5" animated />
            </div>

            <!-- 网格视图 -->
            <div v-else-if="viewMode === 'grid'" class="grid-view">
                <el-row :gutter="20">
                    <el-col
                        v-for="product in products"
                        :key="product.id"
                        :xs="24"
                        :sm="12"
                        :md="8"
                        :lg="6"
                        class="product-col"
                    >
                        <el-card class="product-card" @click="goToProductDetail(product.id)">
                            <div class="product-image-container">
                                <el-image
                                    :src="
                                        product.imageUrl ||
                                        'https://via.placeholder.com/300x300?text=No+Image'
                                    "
                                    fit="cover"
                                    class="product-image"
                                    :preview-src-list="product.imageUrl ? [product.imageUrl] : []"
                                    :initial-index="0"
                                    :z-index="9999"
                                    preview-teleported
                                    @click.stop
                                />
                            </div>
                            <div class="product-info">
                                <h3 class="product-name">{{ product.name }}</h3>
                                <div class="product-price">${{ Math.floor(product.price) }}</div>
                                <div class="product-action">
                                    <el-button
                                        type="primary"
                                        size="large"
                                        @click.stop="quickAddToCart(product)"
                                        class="cart-button"
                                    >
                                        <el-icon class="cart-icon"><ShoppingCart /></el-icon>
                                        加入購物車
                                    </el-button>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <!-- 列表视图 -->
            <div v-else class="list-view">
                <el-table
                    :data="products"
                    style="width: 100%"
                    @row-click="(row) => goToProductDetail(row.id)"
                >
                    <el-table-column label="商品圖片" width="100">
                        <template #default="{ row }">
                            <el-image
                                :src="
                                    row.imageUrl ||
                                    'https://via.placeholder.com/80x80?text=No+Image'
                                "
                                fit="cover"
                                class="table-product-image"
                                :preview-src-list="row.imageUrl ? [row.imageUrl] : []"
                                :initial-index="0"
                                :z-index="9999"
                                preview-teleported
                                @click.stop
                            />
                        </template>
                    </el-table-column>

                    <el-table-column prop="name" label="商品名稱" min-width="180" align="center">
                        <template #default="{ row }">
                            <span class="bold-text">{{ row.name }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="price" label="價格" width="100" align="right">
                        <template #default="{ row }">
                            <span class="bold-text">${{ Math.floor(row.price) }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="stockQuantity" label="庫存" width="80">
                        <template #default="{ row }">
                            <span class="bold-text">{{ row.stockQuantity }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="description" label="描述" min-width="200">
                        <template #default="{ row }">
                            <el-tooltip
                                :content="row.description"
                                placement="top"
                                :show-after="500"
                            >
                                <div class="description-ellipsis">{{ row.description }}</div>
                            </el-tooltip>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="150" fixed="right" align="center">
                        <template #default="{ row }">
                            <el-button
                                type="primary"
                                size="large"
                                @click.stop="quickAddToCart(row)"
                                class="cart-button-list"
                            >
                                <el-icon class="cart-icon"><ShoppingCart /></el-icon>
                                加入購物車
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 空数据提示 -->
            <el-empty
                v-if="!loading && (!products || products.length === 0)"
                description="沒有找到符合條件的商品"
            />

            <!-- 分页 -->
            <div class="pagination-container" v-if="products.length > 0">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[12, 24, 36, 48]"
                    layout="total, sizes, prev, pager, next"
                    :total="total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Grid, List, Search, Plus, ShoppingCart } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { getProducts, searchProducts, getProductsByPriceRange, addItemToCart } from "@/api/shop";

const router = useRouter();
const authStore = useAuthStore();
const products = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const viewMode = ref("grid");
const searchKeyword = ref("");
const priceRange = ref("all");

// 检查是否为管理员
const isAdmin = computed(() => {
    return authStore.userRole === "admin";
});

const priceRangeOptions = [
    { label: "全部價格", value: "all" },
    { label: "低價 < $100", value: "low" },
    { label: "中價 $100-$500", value: "medium" },
    { label: "高價 > $500", value: "high" },
];

// 获取商品列表
const fetchProducts = async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            size: pageSize.value,
        };

        const response = await getProducts(params);

        // 假設API返回的是完整數據，前端根據分頁參數處理
        const allProducts = response.data || [];
        total.value = allProducts.length;

        // 手動實現分頁邏輯
        const startIndex = (currentPage.value - 1) * pageSize.value;
        const endIndex = startIndex + pageSize.value;
        products.value = allProducts.slice(startIndex, endIndex);
    } catch (error) {
        console.error("獲取商品列表失敗:", error);
        ElMessage.error("獲取商品列表失敗");
    } finally {
        loading.value = false;
    }
};

// 处理搜索
const handleSearch = async () => {
    loading.value = true;
    currentPage.value = 1; // 重置為第一頁

    try {
        if (searchKeyword.value.trim() === "") {
            // 如果搜索關鍵詞為空，則獲取所有商品
            await fetchProducts();
            return;
        }

        // 先獲取符合搜索條件的所有商品
        const response = await searchProducts(searchKeyword.value);
        const searchResults = response.data || [];

        // 根據當前價格範圍篩選
        let filteredResults = filterByPrice(searchResults);

        total.value = filteredResults.length;

        // 手動實現分頁邏輯
        const startIndex = (currentPage.value - 1) * pageSize.value;
        const endIndex = startIndex + pageSize.value;
        products.value = filteredResults.slice(startIndex, endIndex);
    } catch (error) {
        console.error("搜索商品失敗:", error);
        ElMessage.error("搜索商品失敗");
    } finally {
        loading.value = false;
    }
};

// 根据价格范围筛选商品
const filterByPrice = (items) => {
    if (priceRange.value === "all") {
        return items;
    }

    return items.filter((item) => {
        const price = parseFloat(item.price);
        switch (priceRange.value) {
            case "low":
                return price < 100;
            case "medium":
                return price >= 100 && price <= 500;
            case "high":
                return price > 500;
            default:
                return true;
        }
    });
};

// 处理价格范围变化
const handlePriceRangeChange = async () => {
    loading.value = true;
    currentPage.value = 1; // 重置為第一頁

    try {
        let allProducts = [];

        if (searchKeyword.value.trim() !== "") {
            // 如果有搜索關鍵詞，則從搜索結果中篩選
            const response = await searchProducts(searchKeyword.value);
            allProducts = response.data || [];
        } else {
            // 否則獲取所有商品
            const response = await getProducts();
            allProducts = response.data || [];
        }

        // 根據價格範圍篩選商品
        const filteredProducts = filterByPrice(allProducts);
        total.value = filteredProducts.length;

        // 手動實現分頁邏輯
        const startIndex = (currentPage.value - 1) * pageSize.value;
        const endIndex = startIndex + pageSize.value;
        products.value = filteredProducts.slice(startIndex, endIndex);
    } catch (error) {
        console.error("按價格範圍篩選失敗:", error);
        ElMessage.error("按價格範圍篩選失敗");
    } finally {
        loading.value = false;
    }
};

// 分页大小变化处理
const handleSizeChange = (val) => {
    pageSize.value = val;

    // 當前頁的數據數量可能會發生變化，需要重新計算
    const maxPage = Math.ceil(total.value / pageSize.value);
    if (currentPage.value > maxPage) {
        currentPage.value = maxPage || 1;
    }

    if (searchKeyword.value.trim() !== "") {
        handleSearch();
    } else if (priceRange.value !== "all") {
        handlePriceRangeChange();
    } else {
        fetchProducts();
    }
};

// 页码变化处理
const handleCurrentChange = (val) => {
    currentPage.value = val;

    if (searchKeyword.value.trim() !== "") {
        handleSearch();
    } else if (priceRange.value !== "all") {
        handlePriceRangeChange();
    } else {
        fetchProducts();
    }
};

// 跳转到商品详情页
const goToProductDetail = (productId) => {
    router.push(`/backpage/shop/products/${productId}`);
};

// 快速添加商品到购物车
const quickAddToCart = async (product) => {
    if (!authStore.isAuthenticated) {
        ElMessage.warning("請先登入");
        router.push("/member/login");
        return;
    }

    loading.value = true;
    try {
        const userId = authStore.userInfo?.id;
        if (!userId) {
            ElMessage.warning("無法獲取用戶ID，請重新登入");
            return;
        }

        // 只提交必要的信息
        const cartItem = {
            productId: product.id,
            quantity: 1,
            userId: userId,
        };

        console.log("添加到购物车:", cartItem);
        const response = await addItemToCart(cartItem);

        // 更全面地處理各種可能的成功響應格式
        if (response && response.status === 200) {
            // 狀態碼200就視為成功
            ElMessage.success("已添加到購物車");
            return;
        }

        // 檢查各種可能的成功響應數據結構
        if (response && response.data) {
            // 情況1: {success: true, ...}
            if (response.data.success === true) {
                ElMessage.success("已添加到購物車");
                return;
            }

            // 情況2: 直接返回的數據沒有明確的錯誤信息
            if (!response.data.message && !response.data.error) {
                ElMessage.success("已添加到購物車");
                return;
            }

            // 有明確的錯誤信息
            throw new Error(response.data.message || response.data.error || "添加失敗");
        }
    } catch (error) {
        console.error("添加到購物車失敗:", error);
        ElMessage.error(error.message || "添加到購物車失敗");
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchProducts();
});
</script>

<style scoped>
.product-list-container {
    padding: 20px;
}

.product-list-card {
    max-width: 1200px;
    margin: 0 auto;
}

.product-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.view-mode-group {
    margin-left: 10px;
}

.filter-container {
    display: flex;
    gap: 15px;
    align-items: center;
}

.search-input {
    width: 450px;
    font-size: 16px;
}

.search-icon {
    font-size: 18px;
    margin-right: 5px;
}

.admin-button {
    width: 50px;
    height: 50px;
}

.admin-icon {
    font-size: 24px;
}

.loading-container {
    padding: 20px;
}

.grid-view {
    margin-top: 20px;
}

.product-col {
    margin-bottom: 20px;
}

.product-card {
    cursor: pointer;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-image-container {
    height: 200px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-info {
    padding: 15px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.product-name {
    margin: 0 0 10px;
    font-size: 16px;
    height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-align: center;
    font-weight: bold;
}

.product-price {
    color: #f56c6c;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
    text-align: right;
}

.product-action {
    margin-top: auto;
    text-align: center;
}

.cart-button,
.cart-button-list {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 16px;
    margin: 0 auto;
}

.cart-icon {
    font-size: 20px;
}

.cart-button-list {
    width: 80%;
}

.table-product-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
}

.description-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

:deep(.el-table__row) {
    cursor: pointer;
}

.bold-text {
    font-weight: bold;
}
</style>
