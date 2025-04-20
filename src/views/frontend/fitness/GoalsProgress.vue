<template>
  <el-card class="user-goals-progress-container">
    <template #header>
      <div class="user-goals-progress-header">
        <span>我的健身目標</span>
        <el-button type="info" size="small" @click="openEditDialog(null)"
          >新增目標</el-button
        >
      </div>
    </template>

    <el-table :data="goalsProgress" border style="width: 100%">
      <el-table-column prop="goalType" label="目標類型"></el-table-column>
      <el-table-column prop="targetValue" label="目標值"></el-table-column>
      <el-table-column prop="unit" label="單位"></el-table-column>
      <el-table-column prop="currentProgress" label="目前進度">
        <template #default="{ row }">
          {{ formatProgress(row.currentProgress) }}%
        </template>
      </el-table-column>
      <el-table-column prop="startDate" label="開始日期"></el-table-column>
      <el-table-column prop="endDate" label="結束日期"></el-table-column>
      <el-table-column prop="status" label="狀態"></el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button size="small" @click="openEditDialog(scope.row)"
            >編輯</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="confirmDelete(scope.row.goalId)"
            >刪除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="no-data" v-if="goalsProgress.length === 0">
      <el-empty description="暫無健身目標，請新增"></el-empty>
    </div>

    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.goalId ? '編輯目標' : '新增目標'"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="目標類型">
          <el-select v-model="editForm.goalType" placeholder="選擇目標類型">
            <el-option label="減重" value="減重"></el-option>
            <el-option label="增肌" value="增肌"></el-option>
            <el-option label="減脂" value="減脂"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="目標值">
          <el-input-number
            v-model="editForm.targetValue"
            :min="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="單位">
          <el-select v-model="editForm.unit" placeholder="選擇單位">
            <el-option
              v-for="item in filteredUnitOptions"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="開始日期">
          <el-date-picker
            v-model="editForm.startDate"
            type="date"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="結束日期">
          <el-date-picker
            v-model="editForm.endDate"
            type="date"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="editForm.status">
            <el-option label="進行中" value="進行中"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
            <el-option label="已取消" value="已取消"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="使用最近數據">
          <el-checkbox v-model="editForm.useLatestData"></el-checkbox>
        </el-form-item>

        <el-form-item
          v-if="!editForm.useLatestData && editForm.goalType === '減重'"
          label="起始體重 (公斤)"
        >
          <el-input-number v-model="editForm.startWeight"></el-input-number>
        </el-form-item>
        <el-form-item
          v-if="!editForm.useLatestData && editForm.goalType === '減脂'"
          label="起始體脂率 (%)"
        >
          <el-input-number v-model="editForm.startBodyFat"></el-input-number>
        </el-form-item>
        <el-form-item
          v-if="!editForm.useLatestData && editForm.goalType === '增肌'"
          label="起始肌肉量 (公斤)"
        >
          <el-input-number v-model="editForm.startMuscleMass"></el-input-number>
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
      <span>您確定要刪除此目標嗎？</span>
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
import { ref, reactive, onMounted, watch, computed } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";

const goalsProgress = ref([]);
const editDialogVisible = ref(false);
const editForm = reactive({
  goalId: null,
  goalType: "",
  targetValue: null,
  unit: "",
  currentProgress: null,
  startDate: null,
  endDate: null,
  status: "進行中",
  useLatestData: true,
  startWeight: null,
  startBodyFat: null,
  startMuscleMass: null,
});
const isSaving = ref(false);
const confirmDeleteVisible = ref(false);
const deletingGoalId = ref(null);
const isDeleting = ref(false);
const unitOptions = ref(["公斤", "%"]);

const formatProgress = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return Math.floor(value);
};

const filteredUnitOptions = computed(() => {
  if (editForm.goalType === "增肌") {
    return ["公斤"];
  }
  return unitOptions.value;
});

watch(
  () => editForm.goalType,
  (newGoalType) => {
    if (newGoalType === "減重") {
      editForm.unit = "公斤";
    } else if (newGoalType === "減脂") {
      editForm.unit = "%";
    } else if (newGoalType === "增肌") {
      editForm.unit = "公斤";
    } else {
      editForm.unit = "";
    }
    // 重置起始數據，避免顯示不相關的欄位
    editForm.startWeight = null;
    editForm.startBodyFat = null;
    editForm.startMuscleMass = null;
  }
);

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
});

const fetchMyGoalsProgress = async () => {
  try {
    const response = await axios.get(
      "/api/tracking/fitnessgoals/me",
      getAuthHeaders()
    );
    goalsProgress.value = response.data;
  } catch (error) {
    console.error("獲取我的健身目標失敗", error);
    ElMessage.error("獲取我的健身目標失敗");
  }
};

const openEditDialog = (row) => {
  if (row) {
    Object.assign(editForm, row);
    editForm.useLatestData = !(
      row.startWeight !== null &&
      row.startBodyFat !== null &&
      row.startMuscleMass !== null
    );
  } else {
    Object.keys(editForm).forEach((key) => (editForm[key] = null));
    editForm.status = "進行中";
    editForm.useLatestData = true;
  }
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  isSaving.value = true;
  try {
    const payload = { ...editForm };
    delete payload.goalId; // 後端會在路徑中識別要更新的目標
    const apiEndpoint = editForm.goalId
      ? `/api/tracking/fitnessgoals/${editForm.goalId}`
      : "/api/tracking/fitnessgoals";
    const httpMethod = editForm.goalId ? "put" : "post";

    // 在發送更新目標的請求時，不要包含 currentProgress 欄位
    const requestPayload = { ...payload };
    delete requestPayload.currentProgress;

    if (!editForm.useLatestData) {
      requestPayload.startWeight = editForm.startWeight;
      requestPayload.startBodyFat = editForm.startBodyFat;
      requestPayload.startMuscleMass = editForm.startMuscleMass;
    }

    await axios[httpMethod](apiEndpoint, requestPayload, getAuthHeaders());
    ElMessage.success(`健身目標${editForm.goalId ? "更新" : "新增"}成功`);
    editDialogVisible.value = false;
    fetchMyGoalsProgress();
  } catch (error) {
    console.error(`健身目標${editForm.goalId ? "更新" : "新增"}失敗`, error);
    ElMessage.error(`健身目標${editForm.goalId ? "更新" : "新增"}失敗`);
    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error(error.response.data.message);
    }
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = (id) => {
  deletingGoalId.value = id;
  confirmDeleteVisible.value = true;
};

const handleDeleteConfirmed = async () => {
  isDeleting.value = true;
  try {
    await axios.delete(
      `/api/tracking/fitnessgoals/${deletingGoalId.value}`,
      getAuthHeaders()
    );
    ElMessage.success("健身目標已刪除");
    confirmDeleteVisible.value = false;
    fetchMyGoalsProgress();
  } catch (error) {
    console.error("刪除健身目標失敗", error);
    ElMessage.error("刪除健身目標失敗");
  } finally {
    isDeleting.value = false;
    deletingGoalId.value = null;
  }
};

onMounted(() => {
  fetchMyGoalsProgress();
});
</script>

<style scoped>
.user-goals-progress-container {
  max-width: 800px;
  margin: 20px auto;
}

.user-goals-progress-header {
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
