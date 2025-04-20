<template>
  <el-card class="user-workout-records-container">
    <template #header>
      <div class="user-workout-records-header">
        <span>我的運動記錄</span>
        <el-button type="info" size="small" @click="openAddDialog"
          >新增記錄</el-button
        >
      </div>
    </template>

    <el-table
      :data="workoutRecords"
      border
      style="width: 100%"
      sort-by="exerciseDate"
      sort-order="descending"
    >
      <el-table-column prop="exerciseType" label="運動類型"></el-table-column>
      <el-table-column
        prop="exerciseDuration"
        label="運動時間 (分鐘)"
      ></el-table-column>
      <el-table-column
        prop="caloriesBurned"
        label="消耗卡路里"
        :formatter="formatCalories"
      ></el-table-column>
      <el-table-column prop="exerciseDate" label="日期"></el-table-column>
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

    <div class="no-data" v-if="workoutRecords.length === 0">
      <el-empty description="暫無運動記錄，請新增"></el-empty>
    </div>

    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.recordId ? '編輯運動紀錄' : '新增運動紀錄'"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="運動類型">
          <el-select
            v-model="editForm.exerciseType"
            placeholder="請選擇運動類型"
          >
            <el-option
              v-for="type in exerciseTypes"
              :key="type"
              :label="type"
              :value="type"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="運動時間 (分鐘)">
          <el-input-number
            v-model="editForm.exerciseDuration"
            :min="1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="editForm.exerciseDate"
            type="date"
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

const workoutRecords = ref([]);
const editDialogVisible = ref(false);
const editForm = reactive({
  recordId: null,
  exerciseType: "",
  exerciseDuration: null,
  caloriesBurned: null,
  exerciseDate: null,
});

const exerciseTypes = ref([
  "跑步",
  "游泳",
  "騎自行車",
  "跳繩",
  "瑜珈",
  "健身房器械",
  "徒手健身",
  "高強度間歇訓練 (HIIT)",
  "快走",
  "爬山",
  "滑雪",
  "舞蹈",
  "划船機",
  "重訓",
  "橢圓機",
  "腳踏車競賽",
  "打籃球",
  "踢足球",
  "攀岩",
  "健走",
]);

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
});

const formatCalories = (row, column, cellValue) => {
  if (cellValue !== null && cellValue !== undefined) {
    return parseFloat(cellValue).toFixed(1);
  }
  return "";
};

const fetchMyWorkoutRecords = async () => {
  try {
    const response = await axios.get(
      "/api/tracking/exercise-records/me",
      getAuthHeaders()
    );
    workoutRecords.value = response.data;
  } catch (error) {
    console.error("獲取我的健身紀錄失敗", error);
    ElMessage.error("獲取我的健身紀錄失敗");
  }
};

const openAddDialog = () => {
  Object.keys(editForm).forEach((key) => (editForm[key] = null));
  editForm.exerciseDate = new Date().toISOString().slice(0, 10);
  editDialogVisible.value = true;
};

const openEditDialog = (row) => {
  Object.assign(editForm, row);
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    if (editForm.recordId) {
      await axios.put(
        `/api/tracking/exercise-records/${editForm.recordId}`,
        editForm,
        getAuthHeaders()
      );
      ElMessage.success("健身紀錄更新成功");
    } else {
      await axios.post(
        "/api/tracking/exercise-records",
        editForm,
        getAuthHeaders()
      );
      ElMessage.success("健身紀錄新增成功");
    }
    editDialogVisible.value = false;
    fetchMyWorkoutRecords();
  } catch (error) {
    console.error(
      editForm.recordId ? "更新健身紀錄失敗" : "新增健身紀錄失敗",
      error
    );
    ElMessage.error(
      editForm.recordId ? "更新健身紀錄失敗" : "新增健身紀錄失敗"
    );
  }
};

const handleDelete = async (id) => {
  try {
    await axios.delete(
      `/api/tracking/exercise-records/${id}`,
      getAuthHeaders()
    );
    ElMessage.success("健身紀錄刪除成功");
    fetchMyWorkoutRecords();
  } catch (error) {
    console.error("刪除健身紀錄失敗", error);
    ElMessage.error("刪除健身紀錄失敗");
  }
};

onMounted(() => {
  fetchMyWorkoutRecords();
});
</script>

<style scoped>
.user-workout-records-container {
  max-width: 800px;
  margin: 20px auto;
}

.user-workout-records-header {
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
