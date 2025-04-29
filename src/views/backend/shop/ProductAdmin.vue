<template>
    <div class="product-admin">
        <el-card class="admin-container">
            <template #header>
                <div class="admin-header">
                    <h2>商品管理後台</h2>
                    <div class="search-actions">
                        <el-input
                            v-model="searchKeyword"
                            placeholder="搜索商品"
                            class="search-input"
                            clearable
                            @keyup.enter="handleSearch"
                        >
                            <template #append>
                                <el-button icon="Search" @click="handleSearch"></el-button>
                            </template>
                        </el-input>

                        <el-dropdown @command="handleFilterCommand" class="price-filter">
                            <el-button>
                                價格篩選 <el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="all">全部商品</el-dropdown-item>
                                    <el-dropdown-item command="low">低價 (< $100)</el-dropdown-item>
                                    <el-dropdown-item command="medium"
                                        >中價 ($100 - $500)</el-dropdown-item
                                    >
                                    <el-dropdown-item command="high"
                                        >高價 (> $500)</el-dropdown-item
                                    >
                                    <el-dropdown-item command="custom">自定義價格</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>

                        <el-button
                            type="success"
                            size="large"
                            @click="showAddDialog"
                            class="add-product-btn"
                        >
                            <el-icon class="add-icon"><Plus /></el-icon>
                            <span class="bold-text">新增商品</span>
                        </el-button>
                    </div>
                </div>
            </template>

            <!-- 管理员访问控制 -->
            <div v-if="!isAdmin" class="access-denied">
                <el-result
                    icon="error"
                    title="訪問被拒絕"
                    sub-title="抱歉，只有管理員才能訪問此頁面"
                >
                    <template #extra>
                        <el-button type="primary" @click="$router.push('/shop/products')"
                            >返回商品列表</el-button
                        >
                    </template>
                </el-result>
            </div>

            <div v-else>
                <el-table v-loading="loading" :data="products" style="width: 100%">
                    <el-table-column prop="id" label="商品ID" width="80" align="center">
                        <template #default="{ row }">
                            <span class="id-tag">{{ row.id }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="商品圖片" width="120">
                        <template #default="{ row }">
                            <el-image
                                :src="
                                    row.imageUrl ||
                                    'https://via.placeholder.com/100x100?text=No+Image'
                                "
                                fit="cover"
                                class="product-image"
                                :preview-src-list="row.imageUrl ? [row.imageUrl] : []"
                                :initial-index="0"
                                :z-index="9999"
                                preview-teleported
                            />
                        </template>
                    </el-table-column>

                    <el-table-column prop="name" label="商品名稱" min-width="180" />

                    <el-table-column prop="price" label="價格" width="120">
                        <template #default="{ row }"> ${{ Math.floor(row.price) }} </template>
                    </el-table-column>

                    <el-table-column prop="stockQuantity" label="庫存" width="120">
                        <template #default="{ row }">
                            <el-tooltip
                                :content="
                                    row.stockQuantity < 50 ? '庫存不足，請及時補貨' : '庫存充足'
                                "
                                placement="top"
                            >
                                <span :class="{ 'low-stock': row.stockQuantity < 50 }">{{
                                    row.stockQuantity
                                }}</span>
                            </el-tooltip>
                        </template>
                        <template #header>
                            <span>庫存</span>
                            <el-tooltip content="庫存少於50時會顯示紅色提示" placement="top">
                                <el-icon><InfoFilled /></el-icon>
                            </el-tooltip>
                        </template>
                    </el-table-column>

                    <el-table-column label="描述" min-width="220">
                        <template #default="{ row }">
                            <el-tooltip
                                :content="row.description"
                                placement="top"
                                :show-after="500"
                                effect="light"
                                max-width="300"
                            >
                                <div class="description-text">{{ row.description }}</div>
                            </el-tooltip>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="220" fixed="right">
                        <template #default="{ row }">
                            <div class="table-actions">
                                <el-tooltip content="編輯" placement="top">
                                    <el-button
                                        type="warning"
                                        circle
                                        size="large"
                                        @click="showEditDialog(row)"
                                    >
                                        <el-icon class="action-icon"><Tools /></el-icon>
                                    </el-button>
                                </el-tooltip>

                                <el-tooltip content="查看" placement="top">
                                    <el-button
                                        type="primary"
                                        circle
                                        size="large"
                                        @click="viewProductDetail(row.id)"
                                    >
                                        <el-icon class="action-icon"><View /></el-icon>
                                    </el-button>
                                </el-tooltip>

                                <el-tooltip content="刪除" placement="top">
                                    <el-button
                                        type="danger"
                                        circle
                                        size="large"
                                        @click="handleDelete(row)"
                                    >
                                        <el-icon class="action-icon"><CircleClose /></el-icon>
                                    </el-button>
                                </el-tooltip>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="pagination">
                    <el-pagination
                        v-model:current-page="currentPage"
                        v-model:page-size="pageSize"
                        :total="total"
                        :page-sizes="[10, 20, 50, 100]"
                        layout="total, sizes, prev, pager, next"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                    />
                </div>
            </div>
        </el-card>

        <!-- 新增/編輯商品對話框 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '編輯商品' : '新增商品'" width="500px">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="商品名稱" prop="name">
                    <el-input v-model="form.name" />
                </el-form-item>

                <el-form-item label="商品價格" prop="price">
                    <el-input-number
                        v-model="form.price"
                        :min="0"
                        :precision="2"
                        style="width: 100%"
                    />
                </el-form-item>

                <el-form-item label="商品庫存" prop="stockQuantity">
                    <el-input-number v-model="form.stockQuantity" :min="0" style="width: 100%" />
                </el-form-item>

                <el-form-item label="商品描述" prop="description">
                    <el-input v-model="form.description" type="textarea" :rows="4" />
                </el-form-item>

                <el-form-item label="商品圖片" prop="imageUrl">
                    <el-upload
                        class="image-upload"
                        action="#"
                        :auto-upload="false"
                        :show-file-list="false"
                        :on-change="(file) => beforeUpload(file.raw)"
                    >
                        <img v-if="form.imageUrl" :src="form.imageUrl" class="preview-image" />
                        <div v-else>
                            <el-icon class="upload-icon"><Upload /></el-icon>
                            <div class="el-upload__text">點擊上傳圖片或輸入URL</div>
                        </div>
                    </el-upload>
                    <div class="upload-info">
                        <el-input
                            v-model="form.imageUrl"
                            placeholder="或直接輸入圖片URL"
                            class="mt-10"
                        />
                        <div class="el-upload__tip">支持上傳本地圖片或輸入圖片URL</div>
                    </div>
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleSubmit">確定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 自定義價格範圍對話框 -->
        <el-dialog v-model="priceRangeDialogVisible" title="自定義價格範圍" width="400px">
            <el-form :model="priceRangeForm">
                <el-form-item label="最低價格">
                    <el-input-number
                        v-model="priceRangeForm.minPrice"
                        :min="0"
                        :precision="2"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="最高價格">
                    <el-input-number
                        v-model="priceRangeForm.maxPrice"
                        :min="0"
                        :precision="2"
                        style="width: 100%"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="priceRangeDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handlePriceRangeFilter">篩選</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
    Edit,
    Delete,
    Plus,
    ArrowDown,
    Search,
    Upload,
    View,
    Tools,
    CircleClose,
    InfoFilled,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductsByPriceRange,
} from "@/api/shop";
import { uploadLocalImage } from "@/utils/imageUpload";

const router = useRouter();
const authStore = useAuthStore();
const products = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const loading = ref(false);
const searchKeyword = ref("");
const priceRangeDialogVisible = ref(false);
const priceRangeForm = ref({
    minPrice: 0,
    maxPrice: 1000,
});

// 當前篩選條件
const currentPriceFilter = ref({
    active: false,
    minPrice: 0,
    maxPrice: 100000,
});

// 检查是否为管理员
const isAdmin = computed(() => {
    return authStore.userRole === "admin";
});

const form = ref({
    name: "",
    price: 0,
    stockQuantity: 0,
    description: "",
    imageUrl: "",
});

const rules = {
    name: [{ required: true, message: "請輸入商品名稱", trigger: "blur" }],
    price: [{ required: true, message: "請輸入商品價格", trigger: "blur" }],
    stockQuantity: [{ required: true, message: "請輸入商品庫存", trigger: "blur" }],
    description: [{ required: true, message: "請輸入商品描述", trigger: "blur" }],
    imageUrl: [{ required: true, message: "請輸入商品圖片URL", trigger: "blur" }],
};

// 獲取商品列表
const fetchProducts = async () => {
    if (!isAdmin.value) return;

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

// 處理搜索
const handleSearch = async () => {
    if (!isAdmin.value) return;

    loading.value = true;
    try {
        let filteredProducts = [];

        // 根據搜索關鍵詞獲取商品
        if (searchKeyword.value.trim()) {
            const response = await searchProducts(searchKeyword.value);
            filteredProducts = response.data;
        } else {
            const response = await getProducts();
            filteredProducts = response.data;
        }

        // 如果有價格篩選條件，再按價格篩選
        if (currentPriceFilter.value.active) {
            filteredProducts = filteredProducts.filter(
                (product) =>
                    product.price >= currentPriceFilter.value.minPrice &&
                    product.price <= currentPriceFilter.value.maxPrice
            );
        }

        products.value = filteredProducts;
        total.value = filteredProducts.length;
    } catch (error) {
        console.error("搜索商品失敗:", error);
        ElMessage.error("搜索商品失敗");
    } finally {
        loading.value = false;
    }
};

// 處理價格篩選
const handleFilterCommand = (command) => {
    if (command === "custom") {
        priceRangeDialogVisible.value = true;
        return;
    }

    switch (command) {
        case "all":
            currentPriceFilter.value.active = false;
            break;
        case "low":
            currentPriceFilter.value = {
                active: true,
                minPrice: 0,
                maxPrice: 100,
            };
            break;
        case "medium":
            currentPriceFilter.value = {
                active: true,
                minPrice: 100,
                maxPrice: 500,
            };
            break;
        case "high":
            currentPriceFilter.value = {
                active: true,
                minPrice: 500,
                maxPrice: 100000,
            };
            break;
    }

    // 應用搜索和價格篩選
    handleSearch();
};

// 自定義價格範圍篩選
const handlePriceRangeFilter = () => {
    currentPriceFilter.value = {
        active: true,
        minPrice: priceRangeForm.value.minPrice,
        maxPrice: priceRangeForm.value.maxPrice,
    };

    priceRangeDialogVisible.value = false;

    // 應用搜索和價格篩選
    handleSearch();
};

// 處理分頁
const handleSizeChange = (val) => {
    pageSize.value = val;
    fetchProducts();
};

const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchProducts();
};

// 顯示新增對話框
const showAddDialog = () => {
    if (!isAdmin.value) return;

    isEdit.value = false;
    form.value = {
        name: "",
        price: 0,
        stockQuantity: 0,
        description: "",
        imageUrl: "",
    };
    dialogVisible.value = true;
};

// 顯示編輯對話框
const showEditDialog = (row) => {
    if (!isAdmin.value) return;

    isEdit.value = true;
    form.value = { ...row };
    dialogVisible.value = true;
};

// 查看商品詳情
const viewProductDetail = (id) => {
    router.push(`/backpage/shop/products/${id}`);
};

// 處理刪除
const handleDelete = async (row) => {
    if (!isAdmin.value) return;

    try {
        await ElMessageBox.confirm("確定要刪除此商品嗎？", "提示", {
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            type: "warning",
        });

        loading.value = true;
        await deleteProduct(row.id);
        ElMessage.success("刪除成功");
        fetchProducts();
    } catch (error) {
        if (error !== "cancel") {
            console.error("刪除失敗:", error);
            ElMessage.error("刪除失敗");
        }
    } finally {
        loading.value = false;
    }
};

// 處理表單提交
const handleSubmit = async () => {
    if (!isAdmin.value) return;
    if (!formRef.value) return;

    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true;
                let response;
                if (isEdit.value) {
                    response = await updateProduct(form.value.id, form.value);
                    ElMessage.success("更新成功");
                } else {
                    response = await createProduct(form.value);
                    ElMessage.success("新增成功");
                }
                dialogVisible.value = false;
                fetchProducts();
            } catch (error) {
                console.error(isEdit.value ? "更新失敗" : "新增失敗", error);
                ElMessage.error(isEdit.value ? "更新失敗" : "新增失敗");
            } finally {
                loading.value = false;
            }
        }
    });
};

// 上傳前驗證
const beforeUpload = (file) => {
    // 檢查文件類型
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
        ElMessage.error("只能上傳圖片文件!");
        return false;
    }

    // 檢查文件大小（最大5MB）
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
        ElMessage.error("圖片大小不能超過5MB!");
        return false;
    }

    // 處理上傳
    handleLocalImageUpload(file);
    return false; // 阻止默認上傳行為
};

// 處理本地圖片上傳
const handleLocalImageUpload = async (file) => {
    try {
        loading.value = true;
        const result = await uploadLocalImage(file);
        form.value.imageUrl = result.imageUrl;
        ElMessage.success("圖片上傳成功");
    } catch (error) {
        console.error("圖片上傳失敗:", error);
        ElMessage.error(`圖片上傳失敗: ${error.message}`);
    } finally {
        loading.value = false;
    }
};

// 上傳成功回調 (這個已不需要了，但保留以避免錯誤)
const handleUploadSuccess = (response) => {
    // 在實際項目中，這裡會使用後端返回的URL
    // 在我們的模擬情況下，不會用到這個函數
};

onMounted(() => {
    if (!authStore.isAuthenticated) {
        ElMessage.warning("請先登入");
        router.push("/member/login");
        return;
    }

    if (!isAdmin.value) {
        ElMessage.error("只有管理員才能訪問此頁面");
        return;
    }

    fetchProducts();
});
</script>

<style scoped>
.product-admin {
    padding: 20px;
}

.admin-container {
    max-width: 1200px;
    margin: 0 auto;
}

.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}

.search-input {
    width: 250px;
}

.price-filter {
    margin-right: 10px;
}

.add-product-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background-color: #67c23a;
    font-weight: bold;
}

.add-icon {
    font-size: 20px;
}

/* 添加描述和操作列之間的實線分隔 */
:deep(.el-table__row) {
    td:nth-last-child(2) {
        border-right: 1px solid #dcdfe6;
    }
}

:deep(.el-table__header) {
    th:nth-last-child(2) {
        border-right: 1px solid #dcdfe6;
    }
}

.table-actions {
    display: flex;
    justify-content: space-around;
    gap: 10px;
}

.action-icon {
    font-size: 18px;
}

.bold-text {
    font-weight: bold;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

.product-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
}

.description-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
}

.low-stock {
    color: #f56c6c;
    font-weight: bold;
}

.id-tag {
    background-color: #f0f0f0;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
}

.image-upload {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 150px;
    border: 1px dashed #dcdfe6;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    margin-bottom: 10px;
}

.upload-icon {
    font-size: 28px;
    color: #8c939d;
    width: 28px;
    height: 28px;
}

.preview-image {
    width: 100%;
    max-height: 148px;
    object-fit: contain;
    border-radius: 4px;
}

.el-upload__text {
    color: #606266;
    font-size: 14px;
    text-align: center;
    margin: 10px 0;
}

.el-upload__tip {
    font-size: 12px;
    color: #606266;
    margin-top: 5px;
}

.mt-10 {
    margin-top: 10px;
}

.access-denied {
    padding: 30px 0;
}

.upload-info {
    margin-top: 10px;
}
</style>
