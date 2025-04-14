@ -0,0 +1,323 @@
<template>
    <div class="member-management">
        <el-card class="management-container">
            <template #header>
                <div class="management-header">
                    <div class="title"></div>
                    <div class="search-and-add">
                        
                        <el-button type="primary" @click="showAddDialog">新增會員</el-button>
                    </div>
                </div>
            </template>

            <el-table :data="users" style="width: 100%">
                <el-table-column prop="userId" label="ID" width="80" />

                <el-table-column prop="name" label="姓名" min-width="120" />

                <el-table-column prop="email" label="電子郵件" min-width="180" />

                <el-table-column label="性別" width="80">
                    <template #default="{ row }">
                        {{ row.gender === 'M' ? '男' : row.gender === 'F' ? '女' : '其他' }}
                    </template>
                </el-table-column>

                <el-table-column prop="bio" label="個人簡介" min-width="180">
                    <template #default="{ row }">
                        <div class="bio-content">{{ row.bio || '無' }}</div>
                    </template>
                </el-table-column>

                <el-table-column prop="role" label="角色" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
                            {{ row.role === 'admin' ? '管理員' : '一般用戶' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="200">
                    <template #default="{ row }">
                        <el-button-group>
                            <el-button type="primary" :icon="Edit" @click="showEditDialog(row)">
                                編輯
                            </el-button>
                            <el-button type="danger" :icon="Delete" @click="handleDelete(row)">
                                刪除
                            </el-button>
                        </el-button-group>
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
        </el-card>

        <!-- 新增/編輯會員對話框 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '編輯會員' : '新增會員'" width="500px">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="form.name" />
                </el-form-item>

                <el-form-item label="電子郵件" prop="email">
                    <el-input v-model="form.email" />
                </el-form-item>

                <el-form-item label="密碼" prop="passwordHash">
                    <el-input v-model="form.passwordHash" type="password" />
                </el-form-item>

                <el-form-item label="性別" prop="gender">
                    <el-radio-group v-model="form.gender">
                        <el-radio label="M">男</el-radio>
                        <el-radio label="F">女</el-radio>
                        <el-radio label="O">其他</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="個人簡介" prop="bio">
                    <el-input v-model="form.bio" type="textarea" :rows="4" />
                </el-form-item>

                <el-form-item label="角色" prop="role" v-if="isAdmin">
                    <el-radio-group v-model="form.role">
                        <el-radio label="user">一般用戶</el-radio>
                        <el-radio label="admin">管理員</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>

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
import { ref, onMounted } from "vue";
import { Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";

const users = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const isAdmin = ref(true); // 假設當前用戶是管理員
const searchText = ref("");

const form = ref({
    name: "",
    email: "",
    passwordHash: "",
    gender: "M",
    bio: "",
    role: "user"
});

const rules = {
    name: [{ required: true, message: "請輸入姓名", trigger: "blur" }],
    email: [
        { required: true, message: "請輸入電子郵件", trigger: "blur" },
        { type: "email", message: "電子郵件格式不正確", trigger: "blur" }
    ],
    passwordHash: [
        { required: true, message: "請輸入密碼", trigger: "blur" },
        { min: 6, message: "密碼長度至少為6個字符", trigger: "blur" }
    ],
    gender: [{ required: true, message: "請選擇性別", trigger: "change" }]
};

// 獲取會員列表
const fetchUsers = async () => {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            ElMessage.error("請先登入");
            return;
        }

        const response = await axios.get("/api/users", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data.success) {
            users.value = response.data.data;
            total.value = response.data.data.length;
        } else {
            ElMessage.error(response.data.message || "獲取會員列表失敗");
        }
    } catch (error) {
        console.error("獲取會員列表失敗:", error);
        if (error.response && error.response.status === 401) {
            ElMessage.error("授權已過期，請重新登入");
        } else {
            ElMessage.error("獲取會員列表失敗");
        }
    }
};

// 處理分頁大小變化
const handleSizeChange = (val) => {
    pageSize.value = val;
    fetchUsers();
};

// 處理頁碼變化
const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchUsers();
};

// 顯示新增對話框
const showAddDialog = () => {
    isEdit.value = false;
    form.value = {
        name: "",
        email: "",
        passwordHash: "",
        gender: "M",
        bio: "",
        role: "user"
    };
    dialogVisible.value = true;
};

// 顯示編輯對話框
const showEditDialog = (row) => {
    isEdit.value = true;
    form.value = { ...row };
    // 清空密碼，避免顯示加密後的密碼
    form.value.passwordHash = "";
    dialogVisible.value = true;
};

// 處理刪除
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm("確定要刪除此會員嗎？", "提示", {
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            type: "warning"
        });

        const token = localStorage.getItem("authToken");
        await axios.delete(`/api/users/${row.userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        ElMessage.success("刪除成功");
        fetchUsers();
    } catch (error) {
        if (error !== "cancel") {
            console.error("刪除失敗:", error);
            ElMessage.error("刪除失敗");
        }
    }
};

// 處理表單提交
const handleSubmit = async () => {
    if (!formRef.value) return;

    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const token = localStorage.getItem("authToken");
                let response;

                if (isEdit.value) {
                    // 如果密碼為空，則不更新密碼
                    const userData = { ...form.value };
                    if (!userData.passwordHash) {
                        delete userData.passwordHash;
                    }
                    
                    response = await axios.put(`/api/users/${form.value.userId}`, userData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                } else {
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

                if (response.data.success) {
                    ElMessage.success(isEdit.value ? "更新成功" : "新增成功");
                    dialogVisible.value = false;
                    fetchUsers();
                } else {
                    ElMessage.error(response.data.message || (isEdit.value ? "更新失敗" : "新增失敗"));
                }
            } catch (error) {
                console.error(isEdit.value ? "更新失敗" : "新增失敗", error);
                ElMessage.error(error.response?.data?.message || (isEdit.value ? "更新失敗" : "新增失敗"));
            }
        }
    });
};

onMounted(fetchUsers);
</script>

<style scoped>
.member-management {
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

.title {
    font-size: 18px;
    font-weight: bold;
}

.search-and-add {
    display: flex;
    align-items: center;
    gap: 10px;
}

.search-input {
    width: 200px;
}

.bio-content {
    max-height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style> 