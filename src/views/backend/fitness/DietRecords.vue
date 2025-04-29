<template>
  <el-card class="diet-data-management-container">
    <template #header>
      <div class="diet-data-management-header">
        <div class="search-and-add">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="用戶 ID">
              <el-input
                v-model="searchForm.userId"
                placeholder="輸入用戶 ID"
              ></el-input>
            </el-form-item>
            <el-form-item label="姓名">
              <el-input
                v-model="searchForm.name"
                placeholder="輸入姓名"
              ></el-input>
            </el-form-item>
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
              <el-button type="primary" @click="fetchDietData" :icon="Search"
                >查詢</el-button
              >
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
      <el-table-column prop="userId" label="用戶 ID"></el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>
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
      <el-table-column label="操作" width="205">
        <template #default="scope">
          <el-button @click="openEditDialog(scope.row)" :icon="Edit"
            >編輯</el-button
          >
          <el-button
            :icon="Delete"
            type="danger"
            @click="handleDelete(scope.row.recordId)"
            >刪除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:currentPage="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
      :title="editDialogVisible ? '編輯飲食數據' : '新增飲食數據'"
      v-model="editDialogVisible"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="用戶 ID">
          <el-input
            v-model="editForm.userId"
            :disabled="editForm.recordId"
          ></el-input>
        </el-form-item>
        <el-form-item label="餐別">
          <el-select v-model="editForm.mealtime" placeholder="請選擇餐別">
            <el-option label="早餐" value="早餐"></el-option>
            <el-option label="午餐" value="午餐"></el-option>
            <el-option label="晚餐" value="晚餐"></el-option>
            <el-option label="點心" value="點心"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="食物內容">
          <el-input v-model="editForm.foodName" type="textarea"></el-input>
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
        <el-form-item label="記錄日期時間">
          <el-date-picker
            v-model="editForm.recordDate"
            type="datetime"
            placeholder="選擇日期時間"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">儲存</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { Edit, Delete, Search } from "@element-plus/icons-vue";

const dietData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = reactive({
  userId: "",
  name: "", // 後端沒有直接按姓名查詢的端點
  dateRange: null,
});

const editDialogVisible = ref(false);
const editForm = reactive({
  recordId: null,
  userId: null,
  name: "",
  mealType: "",
  foodItems: "",
  calories: null,
  protein: null,
  carbs: null,
  fats: null,
  recordDate: null, // 使用日期時間選擇器
});

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

const fetchDietData = async () => {
  try {
    const params = {
      page: currentPage.value - 1, // Spring Data JPA 的分頁從 0 開始
      size: pageSize.value,
      userId: searchForm.userId || null,
      name: searchForm.name || null, // 傳遞姓名查詢條件
      startDate: searchForm.dateRange
        ? searchForm.dateRange[0] + "T00:00:00"
        : null,
      endDate: searchForm.dateRange
        ? searchForm.dateRange[1] + "T23:59:59"
        : null,
      mealtime: searchForm.mealtime || null,
    };

    const response = await axios.get(`/api/tracking/nutrition/search`, {
      params,
    });
    dietData.value = response.data.content; // 後端返回分頁數據通常在 content 屬性中
    total.value = response.data.totalElements; // 後端返回總記錄數通常在 totalElements 屬性中
  } catch (error) {
    console.error("獲取飲食數據失敗", error);
    ElMessage.error("獲取飲食數據失敗");
  }
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchDietData();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchDietData();
};

const resetSearchForm = () => {
  searchForm.userId = "";
  searchForm.name = "";
  searchForm.dateRange = null;
  searchForm.mealtime = "";
  currentPage.value = 1;
  fetchDietData();
};

const openEditDialog = (row) => {
  if (row) {
    editForm.recordId = row.recordId;
    editForm.userId = row.userId;
    editForm.name = row.name;
    editForm.mealtime = row.mealtime;
    editForm.foodName = row.foodName;
    editForm.calories = row.calories;
    editForm.protein = row.protein;
    editForm.carbs = row.carbs;
    editForm.fats = row.fats;
    editForm.recordDate = row.recordDate
      ? row.recordDate.replace(" ", "T")
      : null; // 轉換格式
  } else {
    editForm.recordId = null;
    editForm.userId = null;
    editForm.name = "";
    editForm.mealtime = "";
    editForm.foodName = "";
    editForm.calories = null;
    editForm.protein = null;
    editForm.carbs = null;
    editForm.fats = null;
    editForm.recordDate =
      new Date().toISOString().slice(0, 16).replace("T", " ") + ":00"; // 格式化為後端可能接受的格式
  }
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    const payload = {
      userId: editForm.userId,
      mealtime: editForm.mealtime,
      foodName: editForm.foodName,
      calories: editForm.calories,
      protein: editForm.protein,
      carbs: editForm.carbs,
      fats: editForm.fats,
      recordDate: editForm.recordDate
        ? editForm.recordDate.replace(" ", "T")
        : null, // 移除秒後面的 ":00"
    };
    const headers = {
      // 添加 headers
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    };
    if (editForm.recordId) {
      await axios.put(`/api/tracking/nutrition/${editForm.recordId}`, payload);
      ElMessage.success("飲食數據更新成功");
    } else {
      await axios.post("/api/tracking/nutrition/add", payload);
      ElMessage.success("飲食數據新增成功");
    }
    editDialogVisible.value = false;
    fetchDietData();
  } catch (error) {
    console.error(
      editForm.recordId ? "更新飲食數據失敗" : "新增飲食數據失敗",
      error
    );
    ElMessage.error(
      editForm.recordId ? "更新飲食數據失敗" : "新增飲食數據失敗"
    );
  }
};

const handleDelete = async (recordId) => {
  try {
    await axios.delete(`/api/tracking/nutrition/${recordId}`);
    ElMessage.success("飲食數據刪除成功");
    fetchDietData();
  } catch (error) {
    console.error("刪除飲食數據失敗", error);
    ElMessage.error("刪除飲食數據失敗");
  }
};

onMounted(() => {
  fetchDietData();
});
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

.title {
  font-size: 1.5rem;
  font-weight: bold;
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

.title {
  font-size: 1.5rem;
  font-weight: bold;
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
