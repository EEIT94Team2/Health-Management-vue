<template>
  <el-card class="user-body-data-container">
    <template #header>
      <div class="user-body-data-header">
        <span>我的身體數據</span>
        <el-button type="info" size="small" @click="openAddDialog"
          >新增數據</el-button
        >
      </div>
    </template>

    <el-table
      :data="bodyData"
      border
      style="width: 100%"
      sort-by="dateRecorded"
      sort-order="descending"
    >
      <el-table-column prop="weight" label="體重 (公斤)"></el-table-column>
      <el-table-column prop="bodyFat" label="體脂率 (%)"></el-table-column>
      <el-table-column prop="height" label="身高 (公分)"></el-table-column>
      <el-table-column
        prop="waistCircumference"
        label="腰圍 (公分)"
      ></el-table-column>
      <el-table-column
        prop="hipCircumference"
        label="臀圍 (公分)"
      ></el-table-column>
      <el-table-column
        prop="muscleMass"
        label="肌肉量 (公斤)"
      ></el-table-column>
      <el-table-column prop="dateRecorded" label="測量日期"></el-table-column>
      <el-table-column label="操作" width="100">
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

    <div class="no-data" v-if="bodyData.length === 0">
      <el-empty description="暫無身體數據，請新增"></el-empty>
    </div>

    <el-dialog
      :title="editForm.id ? '編輯身體數據' : '新增身體數據'"
      v-model="editDialogVisible"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="體重 (公斤)">
          <el-input-number
            v-model="editForm.weight"
            :min="0"
            :step="0.1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="體脂率 (%)">
          <el-input-number
            v-model="editForm.bodyFat"
            :min="0"
            :max="100"
            :step="0.1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="身高 (公分)">
          <el-input-number
            v-model="editForm.height"
            :min="0"
            :step="1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="腰圍 (公分)">
          <el-input-number
            v-model="editForm.waistCircumference"
            :min="0"
            :step="0.1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="臀圍 (公分)">
          <el-input-number
            v-model="editForm.hipCircumference"
            :min="0"
            :step="0.1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="肌肉量 (公斤)">
          <el-input-number
            v-model="editForm.muscleMass"
            :min="0"
            :step="0.1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="測量日期">
          <el-date-picker
            v-model="editForm.dateRecorded"
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

const bodyData = ref([]);
const editDialogVisible = ref(false);
const editForm = reactive({
  id: null,
  weight: null,
  bodyFat: null,
  height: null,
  waistCircumference: null,
  hipCircumference: null,
  dateRecorded: null,
  muscleMass: null,
});

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
});

const fetchMyBodyData = async () => {
  try {
    const response = await axios.get(
      "/api/tracking/body-metrics/me",
      getAuthHeaders()
    );
    bodyData.value = response.data;
  } catch (error) {
    console.error("獲取我的身體數據失敗", error);
    ElMessage.error("獲取我的身體數據失敗");
  }
};

const openAddDialog = () => {
  Object.keys(editForm).forEach((key) => (editForm[key] = null));
  editForm.dateRecorded = new Date().toISOString().slice(0, 10);
  editDialogVisible.value = true;
};

const openEditDialog = (row) => {
  Object.assign(editForm, row);
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    const payload = { ...editForm };
    let response;
    if (editForm.id) {
      response = await axios.put(
        `/api/tracking/body-metrics/${editForm.id}`,
        payload,
        getAuthHeaders()
      );
      ElMessage.success("身體數據更新成功");
    } else {
      response = await axios.post(
        "/api/tracking/body-metrics",
        payload,
        getAuthHeaders()
      );
      ElMessage.success("身體數據新增成功");
    }
    editDialogVisible.value = false;
    fetchMyBodyData();
  } catch (error) {
    console.error(editForm.id ? "更新身體數據失敗" : "新增身體數據失敗", error);
    ElMessage.error(editForm.id ? "更新身體數據失敗" : "新增身體數據失敗");
  }
};

const handleDelete = async (id) => {
  try {
    await axios.delete(`/api/tracking/body-metrics/${id}`, getAuthHeaders());
    ElMessage.success("身體數據刪除成功");
    fetchMyBodyData();
  } catch (error) {
    console.error("刪除身體數據失敗", error);
    ElMessage.error("刪除身體數據失敗");
  }
};

onMounted(() => {
  fetchMyBodyData();
});
</script>

<style scoped>
.user-body-data-container {
  max-width: 800px;
  margin: 20px auto;
}

.user-body-data-header {
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
