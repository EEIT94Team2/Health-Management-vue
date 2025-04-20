<template>
  <el-card class="user-diet-records-container">
    <template #header>
      <div class="user-diet-records-header">
        <span>我的飲食記錄</span>
        <el-button type="info" size="small" @click="openAddDialog"
          >新增記錄</el-button
        >
      </div>
    </template>

    <el-table
      :data="dietData"
      border
      style="width: 100%"
      sort-by="recordDate"
      sort-order="descending"
    >
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
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button size="small" @click="openEditDialog(scope.row)"
            >編輯</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row.recordId)"
            >刪除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="no-data" v-if="dietData.length === 0">
      <el-empty description="暫無飲食記錄，請新增"></el-empty>
    </div>

    <el-dialog
      :title="editForm.recordId ? '編輯飲食記錄' : '新增飲食記錄'"
      v-model="editDialogVisible"
    >
      <el-form :model="editForm" label-width="120px">
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
        <el-form-item label="記錄時間">
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

const dietData = ref([]);
const editDialogVisible = ref(false);
const editForm = reactive({
  recordId: null,
  mealtime: "",
  foodName: "",
  calories: null,
  protein: null,
  carbs: null,
  fats: null,
  recordDate: null,
});

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
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

const fetchMyDietData = async () => {
  try {
    const response = await axios.get(
      "/api/tracking/nutrition/me",
      getAuthHeaders()
    );
    dietData.value = response.data;
  } catch (error) {
    console.error("獲取我的飲食數據失敗", error);
    ElMessage.error("獲取我的飲食數據失敗");
  }
};

const openAddDialog = () => {
  Object.keys(editForm).forEach((key) => (editForm[key] = null));
  editForm.recordDate =
    new Date().toISOString().slice(0, 16).replace("T", " ") + ":00";
  editDialogVisible.value = true;
};

const openEditDialog = (row) => {
  Object.assign(editForm, {
    ...row,
    recordDate: row.recordDate
      ? row.recordDate.replace(" ", "T").slice(0, 16)
      : null,
  });
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    const payload = { ...editForm };
    payload.recordDate = payload.recordDate ? payload.recordDate + ":00" : null;
    let response;
    if (editForm.recordId) {
      response = await axios.put(
        `/api/tracking/nutrition/${editForm.recordId}`,
        payload,
        getAuthHeaders()
      );
      ElMessage.success("飲食數據更新成功");
    } else {
      response = await axios.post(
        "/api/tracking/nutrition/add",
        payload,
        getAuthHeaders()
      );
      ElMessage.success("飲食數據新增成功");
    }
    editDialogVisible.value = false;
    fetchMyDietData();
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
    await axios.delete(`/api/tracking/nutrition/${recordId}`, getAuthHeaders());
    ElMessage.success("飲食數據刪除成功");
    fetchMyDietData();
  } catch (error) {
    console.error("刪除飲食數據失敗", error);
    ElMessage.error("刪除飲食數據失敗");
  }
};

onMounted(() => {
  fetchMyDietData();
});
</script>

<style scoped>
.user-diet-records-container {
  max-width: 800px;
  margin: 20px auto;
}

.user-diet-records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.no-data {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer button {
  margin-left: 5px;
}
</style>
