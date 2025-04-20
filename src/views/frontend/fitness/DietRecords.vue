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
          <el-button type="info" @click="$emit('open-edit-dialog', null)"
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
          <el-button size="small" @click="$emit('open-edit-dialog', scope.row)"
            >編輯</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="$emit('delete', scope.row.recordId)"
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
        @size-change="$emit('update:pageSize', $event)"
        @current-change="$emit('update:currentPage', $event)"
      />
    </div>
  </el-card>
</template>

<script setup>
import { reactive, defineProps, defineEmits } from "vue";
import { useAuthStore } from "@/stores/auth"; // 假設您使用 Pinia 進行狀態管理

const authStore = useAuthStore();

const props = defineProps({
  dietData: {
    type: Array,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits([
  "search",
  "reset-search",
  "open-edit-dialog",
  "delete",
  "update:currentPage",
  "update:pageSize",
]);

const searchForm = reactive({
  dateRange: null,
  mealtime: "",
});

const handleSearch = () => {
  const searchParams = {
    dateRange: searchForm.dateRange,
    mealtime: searchForm.mealtime,
    userId: authStore.user?.id, // 確保在搜尋時也帶上當前用戶的 ID
  };
  emit("search", searchParams);
};

const resetSearchForm = () => {
  searchForm.dateRange = null;
  searchForm.mealtime = "";
  // 重置搜尋時，通知父組件重新載入所有屬於當前使用者的資料
  emit("reset-search");
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
