<template>
  <el-card class="diet-data-management-container">
    <template #header>
      <div class="diet-data-management-header">
        <div class="search-and-add">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="餐別">
              <el-select v-model="searchForm.mealtime" placeholder="選擇餐別">
                <el-option label="全部" value=""></el-option>
                <el-option label="早餐" value="早餐"></el-option>
                <el-option label="午餐" value="午餐"></el-option>
                <el-option label="晚餐" value="晚餐"></el-option>
                <el-option label="點心" value="點心"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="日期範圍">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                value-format="YYYY-MM-DD"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查詢</el-button>
              <el-button @click="resetSearchForm">重置</el-button>
            </el-form-item>
          </el-form>
          <el-button type="info" @click="openEditDialog(null)"
            >新增資料</el-button
          >
        </div>
      </div>
    </template>

    <el-table :data="dietData" border style="width: 100%">
      <el-table-column prop="mealtime" label="餐別"></el-table-column>
      <el-table-column prop="foodName" label="食物內容"></el-table-column>
      <el-table-column prop="calories" label="總熱量 (大卡)"></el-table-column>
      <el-table-column prop="protein" label="蛋白質 (克)"></el-table-column>
      <el-table-column prop="carbs" label="碳水化合物 (克)"></el-table-column>
      <el-table-column prop="fats" label="脂肪 (克)"></el-table-column>
      <el-table-column prop="recordDate" label="記錄時間">
        <template #default="scope">
          {{ formatDate(scope.row.recordDate) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="openEditDialog(scope.row)"
            >編輯</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="confirmDelete(scope.row.recordId)"
            >刪除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.recordId ? '編輯飲食記錄' : '新增飲食記錄'"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="食物名稱">
          <el-input v-model="editForm.foodName"></el-input>
        </el-form-item>
        <el-form-item label="餐別">
          <el-select v-model="editForm.mealtime" placeholder="選擇餐別">
            <el-option label="早餐" value="早餐"></el-option>
            <el-option label="午餐" value="午餐"></el-option>
            <el-option label="晚餐" value="晚餐"></el-option>
            <el-option label="點心" value="點心"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="總熱量 (大卡)">
          <el-input-number
            v-model="editForm.calories"
            :min="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="蛋白質 (克)">
          <el-input-number
            v-model="editForm.protein"
            :min="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="碳水化合物 (克)">
          <el-input-number v-model="editForm.carbs" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="脂肪 (克)">
          <el-input-number v-model="editForm.fats" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="記錄時間">
          <el-date-picker
            v-model="editForm.recordDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit" :loading="isSaving"
            >儲存</el-button
          >
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="confirmDeleteVisible" title="確認刪除">
      <span>您確定要刪除此飲食記錄嗎？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmDeleteVisible = false">取消</el-button>
          <el-button
            type="danger"
            @click="handleDeleteConfirmed"
            :loading="isDeleting"
            >確認</el-button
          >
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { ElMessage } from "element-plus";

const authStore = useAuthStore();

const dietData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = reactive({
  dateRange: null,
  mealtime: "",
});

const editDialogVisible = ref(false);
const editForm = reactive({
  recordId: null,
  foodName: "",
  mealtime: "",
  calories: null,
  protein: null,
  carbs: null,
  fats: null,
  recordDate: new Date().toISOString().slice(0, 16).replace("T", " ") + ":00",
});
const isSaving = ref(false);

const confirmDeleteVisible = ref(false);
const deletingRecordId = ref(null);
const isDeleting = ref(false);

const fetchDietData = async (searchParams = {}) => {
  const token = authStore.getToken;
  const userId = authStore.userInfo?.id;
  if (!userId) {
    console.error("用戶 ID 未提供，無法獲取飲食記錄");
    return;
  }
  try {
    const response = await axios.get(`/api/tracking/nutrition/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: searchParams.page ? searchParams.page - 1 : currentPage.value - 1,
        size: searchParams.size || pageSize.value,
        mealtime: searchParams.mealtime || undefined,
        startDate: searchParams.dateRange
          ? searchParams.dateRange[0]
          : undefined,
        endDate: searchParams.dateRange ? searchParams.dateRange[1] : undefined,
      },
    });
    dietData.value = response.data;
    total.value = parseInt(response.headers["X-Total-Count"] || "0", 10);
  } catch (error) {
    console.error("獲取飲食記錄失敗", error);
    ElMessage.error("獲取飲食記錄失敗");
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    }
  }
};

const handleSearch = () => {
  fetchDietData({ ...searchForm, page: 1 });
  currentPage.value = 1;
};

const resetSearchForm = () => {
  searchForm.dateRange = null;
  searchForm.mealtime = "";
  fetchDietData({ page: 1 });
  currentPage.value = 1;
};

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  fetchDietData({ size: newSize, page: currentPage.value });
};

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  fetchDietData({ page: newPage, size: pageSize.value });
};

const openEditDialog = (row) => {
  if (row) {
    Object.assign(editForm, row);
  } else {
    Object.assign(editForm, {
      recordId: null,
      foodName: "",
      mealtime: "",
      calories: null,
      protein: null,
      carbs: null,
      fats: null,
      recordDate:
        new Date().toISOString().slice(0, 16).replace("T", " ") + ":00",
    });
  }
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  isSaving.value = true;
  try {
    const token = authStore.getToken;
    const userId = authStore.userInfo?.id;
    if (!userId) {
      console.error("用戶 ID 未提供，無法保存飲食記錄");
      return;
    }
    const payload = { ...editForm, userId };
    const apiEndpoint = editForm.recordId
      ? `/api/tracking/nutrition/${editForm.recordId}`
      : "/api/tracking/nutrition";
    const httpMethod = editForm.recordId ? "put" : "post";

    await axios[httpMethod](apiEndpoint, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    ElMessage.success(`飲食記錄${editForm.recordId ? "更新" : "新增"}成功`);
    editDialogVisible.value = false;
    fetchDietData();
  } catch (error) {
    console.error(`飲食記錄${editForm.recordId ? "更新" : "新增"}失敗`, error);
    ElMessage.error(`飲食記錄${editForm.recordId ? "更新" : "新增"}失敗`);
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    }
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = (id) => {
  deletingRecordId.value = id;
  confirmDeleteVisible.value = true;
};

const handleDeleteConfirmed = async () => {
  isDeleting.value = true;
  try {
    const token = authStore.getToken;
    await axios.delete(`/api/tracking/nutrition/${deletingRecordId.value}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    ElMessage.success("飲食記錄已刪除");
    confirmDeleteVisible.value = false;
    fetchDietData();
  } catch (error) {
    console.error("刪除飲食記錄失敗", error);
    ElMessage.error("刪除飲食記錄失敗");
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    }
  } finally {
    isDeleting.value = false;
    deletingRecordId.value = null;
  }
};

const formatDate = (dateTimeString) => {
  if (!dateTimeString) {
    return "";
  }
  const date = new Date(dateTimeString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

onMounted(() => {
  fetchDietData();
});

watch(
  () => authStore.userInfo?.id,
  (newUserId) => {
    if (newUserId) {
      fetchDietData();
    }
  }
);
</script>

<style scoped>
.diet-data-management-container {
  max-width: 1200px;
  margin: 20px auto;
}

.diet-data-management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.search-and-add {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-form {
  margin-right: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-button {
  margin-left: 5px;
}
</style>
