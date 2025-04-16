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
              <el-button type="primary" @click="fetchDietData">查詢</el-button>
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
      <el-table-column prop="mealType" label="餐別"></el-table-column>
      <el-table-column prop="foodItems" label="食物內容"></el-table-column>
      <el-table-column prop="calories" label="總熱量 (大卡)"></el-table-column>
      <el-table-column prop="protein" label="蛋白質 (克)"></el-table-column>
      <el-table-column prop="carbs" label="碳水化合物 (克)"></el-table-column>
      <el-table-column prop="fat" label="脂肪 (克)"></el-table-column>
      <el-table-column prop="dateLogged" label="記錄日期"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="openEditDialog(scope.row)"
            >編輯</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row.id)"
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
            :disabled="editForm.id"
          ></el-input>
        </el-form-item>
        <el-form-item label="餐別">
          <el-select v-model="editForm.mealType" placeholder="請選擇餐別">
            <el-option label="早餐" value="breakfast"></el-option>
            <el-option label="午餐" value="lunch"></el-option>
            <el-option label="晚餐" value="dinner"></el-option>
            <el-option label="點心" value="snack"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="食物內容">
          <el-input v-model="editForm.foodItems" type="textarea"></el-input>
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
          <el-input-number v-model="editForm.fat" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="記錄日期">
          <el-date-picker
            v-model="editForm.dateLogged"
            type="date"
            placeholder="選擇日期"
            value-format="YYYY-MM-DD"
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

const dietData = ref([]); // 將 bodyData 更名為 dietData
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = reactive({
  userId: "",
  name: "",
  dateRange: null,
});

const editDialogVisible = ref(false);
const editForm = reactive({
  id: null,
  userId: null,
  name: "",
  // 假設的飲食數據欄位，你需要根據實際情況修改
  mealType: "",
  foodItems: "",
  calories: null,
  protein: null,
  carbs: null,
  fat: null,
  dateLogged: null,
});

const fetchDietData = async () => {
  // 更名為 fetchDietData
  if (!searchForm.userId && !searchForm.name) {
    ElMessage.warning("請輸入用戶 ID 或姓名進行查詢");
    return;
  }

  try {
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      userId: searchForm.userId || undefined,
      name: searchForm.name || undefined,
      startDate: searchForm.dateRange ? searchForm.dateRange[0] : undefined,
      endDate: searchForm.dateRange ? searchForm.dateRange[1] : undefined,
    };
    // 將 API 路徑修改為飲食數據相關的端點
    const response = await axios.get("/api/admin/diet-data", { params });
    dietData.value = response.data.content;
    total.value = response.data.totalElements;

    if (dietData.value.length === 0 && (searchForm.userId || searchForm.name)) {
      ElMessage.warning("查無符合條件的飲食數據");
    }
  } catch (error) {
    console.error("獲取飲食數據失敗", error);
    ElMessage.error("獲取飲食數據失敗");
  }
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchDietData(); // 使用 fetchDietData
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchDietData(); // 使用 fetchDietData
};

const resetSearchForm = () => {
  searchForm.userId = "";
  searchForm.name = "";
  searchForm.dateRange = null;
  currentPage.value = 1;
  fetchDietData(); // 使用 fetchDietData
};

const openEditDialog = (row) => {
  if (row) {
    Object.keys(editForm).forEach((key) => {
      editForm[key] = row[key];
    });
  } else {
    // 新增時重置表單
    Object.keys(editForm).forEach((key) => (editForm[key] = null));
  }
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    // 創建符合你的後端 API 要求的 payload
    const payload = {
      userId: editForm.userId,
      mealType: editForm.mealType,
      foodItems: editForm.foodItems,
      calories: editForm.calories,
      protein: editForm.protein,
      carbs: editForm.carbs,
      fat: editForm.fat,
      dateLogged: editForm.dateLogged,
    };
    if (editForm.id) {
      // 編輯
      // 將 API 路徑修改為更新飲食數據的端點
      await axios.put(`/api/admin/diet-data/${editForm.id}`, payload);
      ElMessage.success("飲食數據更新成功");
    } else {
      // 新增
      // 將 API 路徑修改為新增飲食數據的端點
      await axios.post("/api/admin/diet-data", payload);
      ElMessage.success("飲食數據新增成功");
    }
    editDialogVisible.value = false;
    fetchDietData(); // 使用 fetchDietData
  } catch (error) {
    console.error(editForm.id ? "更新飲食數據失敗" : "新增飲食數據失敗", error);
    ElMessage.error(editForm.id ? "更新飲食數據失敗" : "新增飲食數據失敗");
  }
};

const handleDelete = async (id) => {
  try {
    // 將 API 路徑修改為刪除飲食數據的端點
    await axios.delete(`/api/admin/diet-data/${id}`);
    ElMessage.success("飲食數據刪除成功");
    fetchDietData(); // 使用 fetchDietData
  } catch (error) {
    console.error("刪除飲食數據失敗", error);
    ElMessage.error("刪除飲食數據失敗");
  }
};

onMounted(() => {
  fetchDietData(); // 使用 fetchDietData
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
