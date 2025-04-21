<template>
  <el-card class="goals-progress-management-container">
    <template #header>
      <div class="goals-progress-management-header">
        <div class="search-and-add">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="日期範圍">
              <el-date-picker
                v-model="searchForm.startDateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                value-format="YYYY-MM-DD"
              ></el-date-picker>
            </el-form-item>

            <el-form-item label="目標類型">
              <el-select
                v-model="searchForm.goalType"
                placeholder="選擇目標類型"
                style="width: 180px"
              >
                <el-option label="全部" value=""></el-option>

                <el-option label="減重" value="減重"></el-option>

                <el-option label="減脂" value="減脂"></el-option>

                <el-option label="增肌" value="增肌"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="狀態" style="width: 150px">
              <el-select v-model="searchForm.status" placeholder="選擇狀態">
                <el-option label="全部" value=""></el-option>

                <el-option label="進行中" value="進行中"></el-option>

                <el-option label="已完成" value="已完成"></el-option>

                <el-option label="未達成" value="未達成"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="fetchGoalsProgress"
                >查詢</el-button
              >

              <el-button @click="resetSearchForm">重置</el-button>
            </el-form-item>
          </el-form>

          <el-button type="info" @click="openEditDialog(null)"
            >新增目標</el-button
          >
        </div>
      </div>
    </template>

    <el-table :data="goalsProgress" border style="width: 100%">
      <el-table-column prop="goalType" label="目標類型"></el-table-column>

      <el-table-column prop="targetValue" label="目標值"></el-table-column>

      <el-table-column prop="unit" label="單位"></el-table-column>

      <el-table-column prop="currentProgress" label="目前進度">
        <template #default="{ row }">
          {{ formatProgress(row.currentProgress) }}%
        </template></el-table-column
      >

      <el-table-column prop="startDate" label="開始日期"></el-table-column>

      <el-table-column prop="endDate" label="結束日期"></el-table-column>

      <el-table-column prop="status" label="狀態"></el-table-column>

      <el-table-column label="操作" width="150">
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

    <div class="pagination">
      <el-pagination
        v-model:currentPage="currentPage"
        v-model:pageSize="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
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
import { useAuthStore } from "@/stores/auth"; // 確保您已導入 useAuthStore

const authStore = useAuthStore(); // 取得 authStore 實例

const goalsProgress = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = reactive({
  name: "",
  startDateRange: null,
  goalType: "",
  status: "",
});
const editDialogVisible = ref(false);
const editForm = reactive({
  goalId: null,
  userId: null,
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
  () => authStore.userInfo?.id,
  (newUserId) => {
    console.log("watch - authStore.user?.id changed to:", newUserId);
    if (newUserId) {
      fetchGoalsProgress();
    }
  }
);
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
    editForm.startWeight = null;
    editForm.startBodyFat = null;
    editForm.startMuscleMass = null;
  }
);
const fetchGoalsProgress = async () => {
  const token = localStorage.getItem("authToken");
  const currentUserId = authStore.userInfo?.id;
  const params = {
    page: currentPage.value - 1,
    size: pageSize.value,
    startDate: searchForm.startDateRange ? searchForm.startDateRange[0] : null,
    endDate: searchForm.startDateRange ? searchForm.startDateRange[1] : null,
    goalType: searchForm.goalType || null,
    status: searchForm.status || null,
  };
  try {
    const response = await axios.get(
      `/api/tracking/fitnessgoals/user/${currentUserId}`,
      {
        // 使用正確的 API 端點
        params,
        headers: { Authorization: `Bearer ${authStore.getToken}` },
      }
    );
    goalsProgress.value = response.data.content;
    total.value = response.data.totalElements;
  } catch (error) {
    console.error("獲取健身目標失敗", error);
    ElMessage.error("獲取健身目標失敗");
  }
};
const resetSearchForm = () => {
  searchForm.startDateRange = null;
  searchForm.goalType = "";
  searchForm.status = "";
  currentPage.value = 1;
  fetchGoalsProgress(); // 重置後重新獲取資料，會使用當前用戶 ID
};
onMounted(() => {
  console.log("onMounted - authStore.userInfo?.id:", authStore.userInfo?.id);
  if (authStore.userInfo?.id) {
    fetchGoalsProgress();
  }
});
const openEditDialog = (row) => {
  if (row) {
    Object.assign(editForm, row);
    editForm.useLatestData = !(
      row.startWeight !== null &&
      row.startWeight !== undefined &&
      row.startBodyFat !== null &&
      row.startBodyFat !== undefined &&
      row.startMuscleMass !== null &&
      row.startMuscleMass !== undefined
    );
  } else {
    Object.assign(editForm, {
      goalId: null,
      userId: authStore.userInfo?.id,
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
  }
  editDialogVisible.value = true;
};
const saveEdit = async () => {
  isSaving.value = true;
  try {
    const payload = {
      userId: editForm.userId,
      goalType: editForm.goalType,
      targetValue: editForm.targetValue,
      unit: editForm.unit,
      currentProgress: editForm.currentProgress,
      startDate: editForm.startDate,
      endDate: editForm.endDate,
      status: editForm.status,
    };

    if (!editForm.useLatestData) {
      payload.startWeight = editForm.startWeight;
      payload.startBodyFat = editForm.startBodyFat;
      payload.startMuscleMass = editForm.startMuscleMass;
    }

    const apiEndpoint = editForm.goalId
      ? `/api/tracking/fitnessgoals/${editForm.goalId}`
      : "/api/tracking/fitnessgoals";
    const httpMethod = editForm.goalId ? "put" : "post";

    await axios[httpMethod](apiEndpoint, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    ElMessage.success(`健身目標${editForm.goalId ? "更新" : "新增"}成功`);
    editDialogVisible.value = false;
    fetchGoalsProgress();
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
    await axios.delete(`/api/tracking/fitnessgoals/${deletingGoalId.value}`);
    ElMessage.success("健身目標已刪除");
    confirmDeleteVisible.value = false;
    fetchGoalsProgress();
  } catch (error) {
    console.error("刪除健身目標失敗", error);
    ElMessage.error("刪除健身目標失敗");
  } finally {
    isDeleting.value = false;
    deletingGoalId.value = null;
  }
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchGoalsProgress();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchGoalsProgress();
};

onMounted(() => {
  fetchGoalsProgress();
});
</script>

<style scoped>
.goals-progress-management-container {
  max-width: 1200px;
  margin: 20px auto;
}

.goals-progress-management-header {
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
</style>
