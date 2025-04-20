@ -0,0 +1,323 @@
<template>
    <div class="member-management">
        <el-card class="management-container">
            <template #header>
                <div class="management-header">
                    <div class="title"></div>
                    <div class="search-and-add">
                        <!-- 搜索輸入框 -->
                        <el-input
                            v-model="searchText"
                            placeholder="搜尋姓名、電子郵件或ID"
                            clearable
                            class="search-input"
                            @input="handleSearch"
                            prefix-icon="Search"
                        />
                        <!-- 新增會員按鈕 -->
                        <el-button type="primary" @click="showAddDialog">新增會員</el-button>
                    </div>
                </div>
            </template>

            <!-- 使用者資料表格 - :data綁定顯示的資料來源為計算屬性displayUsers而非全部users -->
            <el-table :data="displayUsers" style="width: 100%">
                <!-- 用戶ID欄位 - prop指定要顯示的資料屬性名稱 -->
                <el-table-column prop="userId" label="ID" width="80" />

                <!-- 姓名欄位 -->
                <el-table-column prop="name" label="姓名" min-width="120" />

                <!-- 電子郵件欄位 -->
                <el-table-column prop="email" label="電子郵件" min-width="180" />

                <!-- 性別欄位 - 使用自定義模板根據值顯示對應的文字 -->
                <el-table-column label="性別" width="80">
                    <template #default="{ row }">
                        <!-- 三元運算符: 條件 ? 為真執行 : 為假執行 -->
                        {{ row.gender === 'M' ? '男' : row.gender === 'F' ? '女' : '其他' }}
                    </template>
                </el-table-column>

                <!-- 個人簡介欄位 - 顯示用戶的自我介紹 -->
                <el-table-column prop="bio" label="個人簡介" min-width="180">
                    <template #default="{ row }">
                        <!-- bio-content 樣式控制簡介顯示樣式，避免太長 -->
                        <div class="bio-content">{{ row.bio || '無' }}</div>
                    </template>
                </el-table-column>

                <!-- 角色欄位 - 使用標籤區分不同角色 -->
                <el-table-column prop="role" label="角色" width="100">
                    <template #default="{ row }">
                        <!-- 使用不同顏色標籤區分管理員和一般用戶 -->
                        <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
                            {{ row.role === 'admin' ? '管理員' : '一般用戶' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <!-- 操作欄位 - 包含編輯和刪除按鈕 -->
                <el-table-column label="操作" width="200">
                    <template #default="{ row }">
                        <el-button-group>
                            <!-- 編輯按鈕 - 點擊時觸發showEditDialog方法並傳入當前行數據 -->
                            <el-button type="primary" :icon="Edit" @click="showEditDialog(row)">
                                編輯
                            </el-button>
                            <!-- 刪除按鈕 - 點擊時觸發handleDelete方法並傳入當前行數據 -->
                            <el-button type="danger" :icon="Delete" @click="handleDelete(row)">
                                刪除
                            </el-button>
                        </el-button-group>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分頁控制區 -->
            <div class="pagination">
                <!-- 
                  el-pagination 組件用於顯示分頁控制器
                  v-model:current-page - 雙向綁定當前頁碼
                  v-model:page-size - 雙向綁定每頁數量
                  :total - 總資料數量
                  :page-sizes - 可選的每頁顯示數量選項
                  layout - 分頁器佈局，顯示哪些控制元素
                  @size-change - 每頁數量變化時的處理函數
                  @current-change - 頁碼變化時的處理函數
                -->
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :total="total"
                    :page-sizes="[20, 50, 100]"
                    layout="total, sizes, prev, pager, next"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <!-- 新增/編輯會員對話框 - v-model控制對話框顯示狀態 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '編輯會員' : '新增會員'" width="500px">
            <!-- 表單 - ref用於獲取表單實例以進行驗證，:model綁定表單數據，:rules綁定驗證規則 -->
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <!-- 姓名輸入欄位 -->
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="form.name" />
                </el-form-item>

                <!-- 電子郵件輸入欄位 -->
                <el-form-item label="電子郵件" prop="email">
                    <el-input v-model="form.email" />
                </el-form-item>

                <!-- 密碼輸入欄位 - type="password"使其顯示為密碼格式 -->
                <el-form-item label="密碼" prop="passwordHash">
                    <el-input v-model="form.passwordHash" type="password" />
                </el-form-item>

                <!-- 性別選擇 - 使用單選按鈕組 -->
                <el-form-item label="性別" prop="gender">
                    <el-radio-group v-model="form.gender">
                        <el-radio label="M">男</el-radio>
                        <el-radio label="F">女</el-radio>
                        <el-radio label="O">其他</el-radio>
                    </el-radio-group>
                </el-form-item>

                <!-- 個人簡介輸入區 - type="textarea"為多行文本輸入框 -->
                <el-form-item label="個人簡介" prop="bio">
                    <el-input v-model="form.bio" type="textarea" :rows="4" />
                </el-form-item>

                <!-- 角色選擇 - 僅當當前用戶是管理員時才顯示 -->
                <el-form-item label="角色" prop="role" v-if="isAdmin">
                    <el-radio-group v-model="form.role">
                        <el-radio label="user">一般用戶</el-radio>
                        <el-radio label="admin">管理員</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>

            <!-- 對話框底部按鈕區 -->
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleSubmit">確定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
// 引入所需的Vue 3 Composition API功能
import { ref, onMounted, computed } from "vue";
// 引入Element Plus的圖標
import { Edit, Delete, Search } from "@element-plus/icons-vue";
// 引入Element Plus的消息和確認框組件
import { ElMessage, ElMessageBox } from "element-plus";
// 引入axios用於API請求
import axios from "axios";

// === 狀態定義區 (使用ref創建響應式變量) ===

// 用戶數據列表 - 存儲從API獲取的所有用戶數據
const users = ref([]);
// 當前頁碼 - 預設為第1頁
const currentPage = ref(1);
// 每頁顯示數量 - 預設為20條數據
const pageSize = ref(20);
// 總數據數量 - 用於分頁控制
const total = ref(0);
// 對話框顯示狀態 - 控制新增/編輯對話框的顯示與隱藏
const dialogVisible = ref(false);
// 是否為編輯模式 - 用於區分新增與編輯操作
const isEdit = ref(false);
// 表單引用 - 用於獲取表單實例以進行驗證
const formRef = ref(null);
// 是否為管理員 - 控制某些功能的顯示與隱藏
const isAdmin = ref(true); // 假設當前用戶是管理員
// 搜索文本 - 用於實現搜索功能(尚未實現完整功能)
const searchText = ref("");

// 表單數據對象 - 用於新增或編輯用戶
const form = ref({
    name: "",
    email: "",
    passwordHash: "",
    gender: "M",
    bio: "",
    role: "user"
});

// === 表單驗證規則 ===
// rules物件定義了每個表單字段的驗證規則
const rules = {
    // 姓名驗證規則: 必填
    name: [{ required: true, message: "請輸入姓名", trigger: "blur" }],
    // 電子郵件驗證規則: 必填且必須是有效的電子郵件格式
    email: [
        { required: true, message: "請輸入電子郵件", trigger: "blur" },
        { type: "email", message: "電子郵件格式不正確", trigger: "blur" }
    ],
    // 密碼驗證規則: 必填且至少6個字符
    passwordHash: [
        { required: true, message: "請輸入密碼", trigger: "blur" },
        { min: 6, message: "密碼長度至少為6個字符", trigger: "blur" }
    ],
    // 性別驗證規則: 必選
    gender: [{ required: true, message: "請選擇性別", trigger: "change" }]
};

// === 計算屬性區 ===

/**
 * 計算符合搜索條件的用戶數據
 * 根據搜索文本過濾用戶數據
 */
const filteredUsers = computed(() => {
    if (!searchText.value) return users.value;
    
    const search = searchText.value.toLowerCase();
    return users.value.filter(user => {
        // 檢查ID (轉為字符串進行比較)
        const userId = String(user.userId).toLowerCase();
        // 檢查姓名
        const name = (user.name || '').toLowerCase();
        // 檢查電子郵件
        const email = (user.email || '').toLowerCase();
        
        // 如果搜索文本出現在任一字段中，則返回true
        return userId.includes(search) || 
               name.includes(search) || 
               email.includes(search);
    });
});

/**
 * 計算當前頁面要顯示的用戶數據
 * computed() 創建一個計算屬性，當依賴的響應式數據變化時會自動重新計算
 * 依賴: filteredUsers, currentPage, pageSize
 * 返回: 當前頁應該顯示的用戶數據數組
 */
const displayUsers = computed(() => {
    // 更新總數據量為過濾後的數量
    total.value = filteredUsers.value.length;
    
    // 計算當前頁的起始索引 (從0開始)
    const startIndex = (currentPage.value - 1) * pageSize.value;
    
    // 計算當前頁的結束索引 (不包含)
    const endIndex = startIndex + pageSize.value;
    
    // 使用slice()方法從filteredUsers數組中提取對應範圍的數據
    return filteredUsers.value.slice(startIndex, endIndex);
});

// === 方法定義區 ===

/**
 * 獲取會員列表函數
 * 從API獲取所有用戶數據並更新本地狀態
 * async/await 語法用於處理異步操作
 */
const fetchUsers = async () => {
    try {
        // 從localStorage獲取認證token
        const token = localStorage.getItem("authToken");
        if (!token) {
            // 如果沒有token，顯示錯誤信息並退出函數
            ElMessage.error("請先登入");
            return;
        }

        // 使用axios發送GET請求獲取用戶列表
        // await表示等待異步操作完成
        const response = await axios.get("/api/users", {
            headers: {
                // 在請求頭中附加認證token
                Authorization: `Bearer ${token}`
            }
        });

        // 檢查API響應是否成功
        if (response.data.success) {
            // 更新用戶列表和總數
            users.value = response.data.data;
            total.value = response.data.data.length;
        } else {
            // 如果API返回失敗狀態，顯示錯誤消息
            ElMessage.error(response.data.message || "獲取會員列表失敗");
        }
    } catch (error) {
        // 捕獲並處理請求過程中的錯誤
        console.error("獲取會員列表失敗:", error);
        if (error.response && error.response.status === 401) {
            // 401錯誤表示認證失敗，可能是token過期
            ElMessage.error("授權已過期，請重新登入");
        } else {
            // 其他錯誤
            ElMessage.error("獲取會員列表失敗");
        }
    }
};

/**
 * 處理每頁數量變化的函數
 * 當用戶從分頁控件中選擇不同的每頁顯示數量時觸發
 * @param {number} val - 新的每頁顯示數量
 */
const handleSizeChange = (val) => {
    // 更新每頁顯示數量
    pageSize.value = val;
    
    // 確保當前頁碼在合理範圍內
    // 計算新的頁數上限
    const maxPage = Math.ceil(total.value / pageSize.value);
    // 如果當前頁碼超出了新的頁數上限，則調整為最大頁碼或1
    if (currentPage.value > maxPage) {
        currentPage.value = maxPage || 1;
    }
    // 注意: 不需要重新獲取數據，因為我們使用計算屬性顯示數據
};

/**
 * 處理頁碼變化的函數
 * 當用戶點擊不同的頁碼時觸發
 * @param {number} val - 新的頁碼
 */
const handleCurrentChange = (val) => {
    // 更新當前頁碼
    currentPage.value = val;
    // 不需要重新獲取數據，計算屬性會自動更新顯示內容
};

/**
 * 顯示新增用戶對話框
 * 重置表單並打開對話框
 */
const showAddDialog = () => {
    // 設置為非編輯模式
    isEdit.value = false;
    // 重置表單數據為初始值
    form.value = {
        name: "",
        email: "",
        passwordHash: "",
        gender: "M",
        bio: "",
        role: "user"
    };
    // 顯示對話框
    dialogVisible.value = true;
};

/**
 * 顯示編輯用戶對話框
 * @param {Object} row - 要編輯的用戶數據行
 */
const showEditDialog = (row) => {
    // 設置為編輯模式
    isEdit.value = true;
    // 使用展開運算符(...)創建row對象的副本賦值給form
    form.value = { ...row };
    // 清空密碼，避免顯示加密後的密碼
    form.value.passwordHash = "";
    // 顯示對話框
    dialogVisible.value = true;
};

/**
 * 處理刪除用戶
 * @param {Object} row - 要刪除的用戶數據行
 */
const handleDelete = async (row) => {
    try {
        // 顯示確認對話框，等待用戶確認
        await ElMessageBox.confirm("確定要刪除此會員嗎？", "提示", {
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            type: "warning"
        });

        // 用戶確認後，發送刪除請求
        const token = localStorage.getItem("authToken");
        await axios.delete(`/api/users/${row.userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // 刪除成功提示
        ElMessage.success("刪除成功");
        
        // 刷新用戶列表
        await fetchUsers();
        
        // 檢查刪除後是否需要調整當前頁碼
        // 例如: 如果刪除後當前頁已經沒有數據了，應該返回前一頁
        const maxPage = Math.ceil(total.value / pageSize.value);
        if (currentPage.value > maxPage && maxPage > 0) {
            currentPage.value = maxPage;
        }
    } catch (error) {
        // 處理錯誤，但忽略用戶取消操作
        if (error !== "cancel") {
            console.error("刪除失敗:", error);
            ElMessage.error("刪除失敗");
        }
    }
};

/**
 * 處理表單提交(新增或編輯用戶)
 */
const handleSubmit = async () => {
    // 檢查表單引用是否存在
    if (!formRef.value) return;

    // 驗證表單
    await formRef.value.validate(async (valid) => {
        // 只有表單驗證通過才繼續處理
        if (valid) {
            try {
                const token = localStorage.getItem("authToken");
                let response;

                // 根據是否是編輯模式選擇不同的API請求
                if (isEdit.value) {
                    // 編輯現有用戶
                    // 複製表單數據
                    const userData = { ...form.value };
                    // 如果密碼為空，則不更新密碼
                    if (!userData.passwordHash) {
                        delete userData.passwordHash;
                    }
                    
                    // 發送PUT請求更新用戶數據
                    response = await axios.put(`/api/users/${form.value.userId}`, userData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                } else {
                    // 新增用戶
                    // 發送POST請求創建新用戶
                    response = await axios.post("/api/auth/register", {
                        name: form.value.name,
                        email: form.value.email,
                        password: form.value.passwordHash,
                        gender: form.value.gender,
                        bio: form.value.bio
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }

                // 處理API響應
                if (response.data.success) {
                    // 顯示成功消息
                    ElMessage.success(isEdit.value ? "更新成功" : "新增成功");
                    // 關閉對話框
                    dialogVisible.value = false;
                    
                    // 刷新用戶列表
                    await fetchUsers();
                    
                    // 如果是新增用戶，跳到最後一頁查看
                    if (!isEdit.value) {
                        const maxPage = Math.ceil(total.value / pageSize.value);
                        currentPage.value = maxPage;
                    }
                } else {
                    // 如果API返回失敗狀態，顯示錯誤消息
                    ElMessage.error(response.data.message || (isEdit.value ? "更新失敗" : "新增失敗"));
                }
            } catch (error) {
                // 處理請求錯誤
                console.error(isEdit.value ? "更新失敗" : "新增失敗", error);
                ElMessage.error(error.response?.data?.message || (isEdit.value ? "更新失敗" : "新增失敗"));
            }
        }
    });
};

/**
 * 處理搜索
 * 當用戶輸入搜索文本時重置頁碼
 */
const handleSearch = () => {
    // 重置為第一頁，確保用戶看到搜索結果的第一頁
    currentPage.value = 1;
};

// 生命週期鉤子: 組件掛載時執行
// onMounted() 在組件被掛載到DOM後執行一次
// 這裡用於初始化數據，從API獲取用戶列表
onMounted(fetchUsers);
</script>

<style scoped>
/* scoped確保樣式只應用於當前組件，避免影響全局樣式 */

/* 會員管理頁面外層容器樣式 */
.member-management {
    padding: 20px;
}

/* 管理容器卡片樣式 */
.management-container {
    max-width: 1200px;
    margin: 0 auto;
}

/* 管理頁面頂部區域樣式，使用flexbox進行對齊 */
.management-header {
    display: flex;
    justify-content: space-between; /* 兩端對齊 */
    align-items: center; /* 垂直居中 */
}

/* 標題樣式 */
.title {
    font-size: 18px;
    font-weight: bold;
}

/* 搜索和添加按鈕區域樣式 */
.search-and-add {
    display: flex;
    align-items: center;
    gap: 10px; /* 元素之間的間距 */
}

/* 搜索輸入框樣式 */
.search-input {
    width: 200px;
}

/* 個人簡介內容樣式，限制高度和處理溢出 */
.bio-content {
    max-height: 60px;
    overflow: hidden; /* 隱藏溢出內容 */
    text-overflow: ellipsis; /* 文本溢出時顯示省略號 */
    display: -webkit-box;
    -webkit-line-clamp: 2; /* 限制顯示2行 */
    -webkit-box-orient: vertical;
}

/* 分頁區域樣式 */
.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end; /* 右對齊 */
}
</style> 