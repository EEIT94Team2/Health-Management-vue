<template>
    <div class="product-management">
        <el-card class="management-container">
            <template #header>
                <div class="management-header">
                    <h2>商品管理</h2>
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
                                    <el-dropdown-item command="medium">中價 ($100 - $500)</el-dropdown-item>
                                    <el-dropdown-item command="high">高價 (> $500)</el-dropdown-item>
                                    <el-dropdown-item command="custom">自定義價格</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        
                        <el-button type="success" size="large" @click="showAddDialog" class="add-product-btn">
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
                        <el-button type="primary" @click="$router.push('/shop/products')">返回商品列表</el-button>
                    </template>
                </el-result>
            </div>

            <div v-else>
                <el-table v-loading="loading" :data="products" style="width: 100%">
                    <el-table-column label="商品圖片" width="120">
                        <template #default="{ row }">
                            <el-image 
                                :src="row.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'" 
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
                        <template #default="{ row }"> ${{ row.price }} </template>
                    </el-table-column>

                    <el-table-column prop="stockQuantity" label="庫存" width="120">
                        <template #default="{ row }">
                            <el-tooltip
                                :content="row.stockQuantity < 50 ? '庫存不足，請及時補貨' : '庫存充足'"
                                placement="top"
                            >
                                <span :class="{'low-stock': row.stockQuantity < 50}">{{ row.stockQuantity }}</span>
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
                                <el-tooltip content="查看" placement="top">
                                    <el-button 
                                        type="primary" 
                                        circle 
                                        size="large"
                                        @click="$router.push(`/shop/products/${row.id}`)"
                                    >
                                        <el-icon class="action-icon"><View /></el-icon>
                                    </el-button>
                                </el-tooltip>
                                
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
        <el-dialog v-model="dialogVisible" :title="isEdit ? '編輯商品' : '添加商品'" width="600px">
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
                        class="avatar-uploader"
                        action="#"
                        :http-request="uploadImage"
                        :show-file-list="false"
                        :on-success="handleUploadSuccess"
                        :before-upload="beforeUpload"
                    >
                        <img v-if="form.imageUrl" :src="form.imageUrl" class="preview-image" />
                        <div v-else class="image-upload">
                            <el-icon class="upload-icon"><Plus /></el-icon>
                            <div>點擊上傳</div>
                        </div>
                    </el-upload>
                    <el-input
                        v-model="form.imageUrl"
                        placeholder="或直接輸入圖片URL"
                        class="mt-10"
                    />
                    <div class="el-upload__tip">支持點擊上傳圖片或直接輸入圖片URL</div>
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleSubmit"> 確定 </el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 自定義價格範圍對話框 -->
        <el-dialog v-model="priceRangeDialogVisible" title="自定義價格範圍" width="400px">
            <el-form :model="priceRangeForm">
                <el-form-item label="最低價格">
                    <el-input-number v-model="priceRangeForm.minPrice" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
                <el-form-item label="最高價格">
                    <el-input-number v-model="priceRangeForm.maxPrice" :min="0" :precision="2" style="width: 100%" />
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
import { useRouter } from 'vue-router';
import { Edit, Delete, Plus, ArrowDown, Search, View, Tools, CircleClose, InfoFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { 
    getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    searchProducts,
    getProductsByPriceRange,
    uploadImage as uploadImageApi
} from "@/api/shop";

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
    maxPrice: 1000
});

// 在 script setup 中添加當前篩選條件的狀態
const currentPriceFilter = ref({
    active: false,
    minPrice: 0,
    maxPrice: 100000
});

// 检查是否为管理员
const isAdmin = computed(() => {
  return authStore.userRole === 'admin';
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
        const response = await getProducts();
        products.value = response.data;
        total.value = response.data.length;
    } catch (error) {
        console.error("獲取商品列表失敗:", error);
        ElMessage.error("獲取商品列表失敗");
    } finally {
        loading.value = false;
    }
};

// 修改處理搜索函數
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
            filteredProducts = filteredProducts.filter(product => 
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

// 修改處理價格篩選命令函數
const handleFilterCommand = (command) => {
    if (command === 'custom') {
        priceRangeDialogVisible.value = true;
        return;
    }
    
    switch(command) {
        case 'all':
            currentPriceFilter.value.active = false;
            break;
        case 'low':
            currentPriceFilter.value = {
                active: true,
                minPrice: 0,
                maxPrice: 100
            };
            break;
        case 'medium':
            currentPriceFilter.value = {
                active: true,
                minPrice: 100,
                maxPrice: 500
            };
            break;
        case 'high':
            currentPriceFilter.value = {
                active: true,
                minPrice: 500,
                maxPrice: 100000
            };
            break;
    }
    
    // 應用搜索和價格篩選
    handleSearch();
};

// 修改自定義價格範圍篩選函數
const handlePriceRangeFilter = () => {
    currentPriceFilter.value = {
        active: true,
        minPrice: priceRangeForm.value.minPrice,
        maxPrice: priceRangeForm.value.maxPrice
    };
    
    priceRangeDialogVisible.value = false;
    
    // 應用搜索和價格篩選
    handleSearch();
};

// 處理分頁大小變化
const handleSizeChange = (val) => {
    pageSize.value = val;
    fetchProducts();
};

// 處理頁碼變化
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
    if (!formRef.value) return;
    
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true;
                
                // 表單資料準備好後再提交
                const submitForm = async () => {
                    const productData = { ...form.value };
                    
                    if (isEdit.value) {
                        await updateProduct(form.value.id, productData);
                        ElMessage.success("商品更新成功");
                    } else {
                        await createProduct(productData);
                        ElMessage.success("商品添加成功");
                    }
                    
                    dialogVisible.value = false;
                    resetForm();
                    fetchProducts();
                };
                
                // 如果圖片是 base64 格式且以 data:image 開頭，則先上傳圖片
                if (form.value.imageUrl && form.value.imageUrl.startsWith('data:image')) {
                    try {
                        // 將 base64 轉換為文件對象
                        const base64Data = form.value.imageUrl.split(',')[1];
                        const blob = base64ToBlob(base64Data, 'image/jpeg');
                        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
                        
                        // 創建 FormData 對象
                        const formData = new FormData();
                        formData.append('file', file);
                        
                        // 上傳圖片
                        const response = await uploadImageApi(formData);
                        
                        // 更新表單中的圖片 URL
                        form.value.imageUrl = response.data;
                        ElMessage.success('圖片上傳成功');
                    } catch (error) {
                        console.error('圖片上傳失敗:', error);
                        ElMessage.warning('圖片上傳失敗，將直接使用base64格式');
                    }
                }
                
                // 提交表單
                await submitForm();
            } catch (error) {
                console.error("提交失敗:", error);
                ElMessage.error("提交失敗: " + (error.response?.data?.message || '未知錯誤'));
            } finally {
                loading.value = false;
            }
        }
    });
};

// base64 轉 Blob 工具函數
const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: mimeType });
};

// 圖片上傳前的驗證
const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isSizeValid = file.size / 1024 / 1024 < 5;

    if (!isImage) {
        ElMessage.error('只能上傳圖片文件!');
        return false;
    }
    if (!isSizeValid) {
        ElMessage.error('圖片大小不能超過5MB!');
        return false;
    }
    return true;
};

// 處理圖片上傳
const uploadImage = async (options) => {
    try {
        const formData = new FormData();
        formData.append('file', options.file);
        
        const response = await uploadImageApi(formData);
        form.value.imageUrl = response.data;
        
        options.onSuccess(response.data);
        ElMessage.success('圖片上傳成功');
    } catch (error) {
        options.onError(error);
        ElMessage.error('圖片上傳失敗');
    }
};

// 上傳成功處理
const handleUploadSuccess = (response) => {
    // 直接使用response作為URL
    form.value.imageUrl = response;
};

// 重置表單
const resetForm = () => {
    form.value = {
        name: "",
        price: 0,
        stockQuantity: 0,
        description: "",
        imageUrl: "",
    };
    if (formRef.value) {
        formRef.value.resetFields();
    }
};

onMounted(() => {
    if (!authStore.isLoggedIn) {
        ElMessage.warning('請先登入');
        router.push('/member/login');
        return;
    }
    
    if (!isAdmin.value) {
        ElMessage.error('只有管理員才能訪問此頁面');
        return;
    }
    
    fetchProducts();
});
</script>

<style scoped>
.product-management {
    padding: 20px;
}

.management-container {
    max-width: 1200px;
    margin: 0 auto;
}

.management-header {
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

.table-actions {
    display: flex;
    justify-content: space-around;
    gap: 10px;
}

.action-icon {
    font-size: 18px;
}

.product-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    object-fit: cover;
}

.description-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 220px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.image-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 148px;
    height: 148px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.image-upload:hover {
    border-color: #409eff;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.upload-icon {
    font-size: 28px;
    color: #8c939d;
}

:deep(.el-upload) {
    width: 100%;
    height: 100%;
}

.mt-10 {
    margin-top: 10px;
}

.access-denied {
    padding: 40px 20px;
    text-align: center;
}

.low-stock {
    color: #f56c6c;
    font-weight: bold;
}

.bold-text {
    font-weight: bold;
}
</style>
