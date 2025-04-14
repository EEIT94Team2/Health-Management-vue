<template>
    <div class="product-detail-container">
        <el-card class="detail-card" v-loading="loading">
            <template #header>
                <div class="detail-header">
                    <h2>商品詳情</h2>
                    <div class="header-actions">
                        <el-button @click="$router.push('/backpage/shop/products')"
                            >返回商品列表</el-button
                        >
                        <el-button
                            v-if="isAdmin"
                            type="primary"
                            @click="$router.push('/backpage/shop/product-admin')"
                            class="admin-button"
                        >
                            <i class="bi bi-arrow-right-square"></i>
                            管理商品
                        </el-button>
                    </div>
                </div>
            </template>

            <el-row :gutter="20" v-if="product">
                <el-col :span="10">
                    <div class="product-image-container">
                        <el-image
                            :src="
                                product.imageUrl ||
                                'https://via.placeholder.com/400x400?text=No+Image'
                            "
                            fit="cover"
                            class="product-image"
                            :preview-src-list="product.imageUrl ? [product.imageUrl] : []"
                            :initial-index="0"
                            :z-index="9999"
                            preview-teleported
                        />
                    </div>
                </el-col>
                <el-col :span="14">
                    <div class="product-info">
                        <h1 class="product-name">{{ product.name }}</h1>
                        <div class="product-price">${{ product.price }}</div>
                        <div class="product-stock">庫存: {{ product.stockQuantity }} 件</div>
                        <div class="product-description">
                            <p>{{ product.description }}</p>
                        </div>

                        <div class="product-actions">
                            <el-input-number
                                v-model="quantity"
                                :min="1"
                                :max="product.stockQuantity"
                            />
                            <el-button
                                type="primary"
                                :disabled="product.stockQuantity < 1"
                                @click="addToCart"
                                class="cart-button"
                            >
                                <el-icon class="cart-icon"><ShoppingCart /></el-icon>
                                加入購物車
                            </el-button>
                        </div>
                    </div>
                </el-col>
            </el-row>

            <el-empty v-else description="商品不存在或已被刪除"></el-empty>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ShoppingCart } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { getProductById, addToCart as addProductToCart } from "@/api/shop";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const productId = ref(parseInt(route.params.id));
const product = ref(null);
const loading = ref(false);
const quantity = ref(1);

const isAdmin = computed(() => {
    return authStore.userRole === "admin";
});

// 獲取商品詳情
const fetchProductDetail = async () => {
    loading.value = true;
    try {
        const response = await getProductById(productId.value);
        product.value = response.data;

        // 默認數量為1，但不能超過庫存
        if (product.value.stockQuantity < 1) {
            quantity.value = 0;
        }
    } catch (error) {
        console.error("獲取商品詳情失敗:", error);
        ElMessage.error("獲取商品詳情失敗");
    } finally {
        loading.value = false;
    }
};

// 添加到購物車
const addToCart = async () => {
    if (!authStore.isAuthenticated) {
        ElMessage.warning("請先登入");
        router.push("/member/login");
        return;
    }

    if (quantity.value < 1) {
        ElMessage.warning("請選擇有效數量");
        return;
    }

    try {
        loading.value = true;
        const cartItem = {
            productId: product.value.id,
            quantity: quantity.value,
        };

        const userId = authStore.userInfo?.id;
        await addProductToCart(cartItem, userId);
        ElMessage.success("成功加入購物車");
    } catch (error) {
        console.error("加入購物車失敗:", error);
        ElMessage.error("加入購物車失敗");
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchProductDetail();
});
</script>

<style scoped>
.product-detail-container {
    padding: 20px;
}

.detail-card {
    max-width: 1200px;
    margin: 0 auto;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-actions {
    display: flex;
    gap: 10px;
}

.product-image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: 8px;
    border: 1px solid #eee;
    height: 400px;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.product-info {
    padding: 0 20px;
}

.product-name {
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
    font-weight: bold;
}

.product-price {
    font-size: 22px;
    color: #f56c6c;
    margin-bottom: 15px;
    font-weight: bold;
}

.product-stock {
    font-size: 16px;
    color: #606266;
    margin-bottom: 15px;
}

.product-description {
    margin: 20px 0;
    padding: 15px;
    background-color: #f7f7f7;
    border-radius: 8px;
}

.product-description h3 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #303133;
}

.product-description p {
    line-height: 1.6;
    color: #606266;
}

.product-actions {
    margin-top: 30px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.cart-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.cart-icon {
    font-size: 20px;
}

.admin-button {
    display: flex;
    align-items: center;
    gap: 5px;
}

.admin-button i {
    font-size: 16px;
    margin-right: 5px;
}
</style>
