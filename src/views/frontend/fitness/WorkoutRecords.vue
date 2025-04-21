<template>
  <div class="workouts-management">
    <div class="search-and-add">
      <el-form :inline="true" :model="workoutSearchForm" class="search-form">
        <el-form-item label="運動類型">
          <el-select
            v-model="workoutSearchForm.type"
            placeholder="請選擇運動類型"
            style="width: 200px"
          >
            <el-option
              v-for="type in exerciseTypes"
              :key="type"
              :label="type"
              :value="type"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期範圍">
          <el-date-picker
            v-model="workoutSearchForm.dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查詢</el-button>
          <el-button @click="resetSearchForm">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="info" @click="openAddDialog">新增運動記錄</el-button>
    </div>

    <el-table :data="workouts" border style="width: 100%">
      <el-table-column prop="exerciseType" label="運動類型" />
      <el-table-column prop="exerciseDuration" label="持續時間 (分鐘)" />
      <el-table-column prop="caloriesBurned" label="燃燒卡路里" />
      <el-table-column prop="exerciseDate" label="日期" />
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
      :title="editForm.recordId ? '編輯運動記錄' : '新增運動記錄'"
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
        <el-form-item label="持續時間 (分鐘)">
          <el-input-number v-model="editForm.exerciseDuration" :min="1" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="editForm.exerciseDate"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
          />
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
      <span>您確定要刪除此運動記錄嗎？</span>
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
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { ElMessage } from "element-plus";

const authStore = useAuthStore();

const workouts = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const workoutSearchForm = reactive({ type: "", dateRange: null });
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

const editDialogVisible = ref(false);
const editForm = reactive({
  recordId: null,
  exerciseType: "",
  exerciseDuration: null,
  exerciseDate: new Date().toISOString().slice(0, 10),
  userId: null,
  caloriesBurned: null,
});
const isSaving = ref(false);

const confirmDeleteVisible = ref(false);
const deletingRecordId = ref(null);
const isDeleting = ref(false);

const fetchWorkoutsData = async (searchParams = {}) => {
  if (!authStore.userInfo?.id) return;
  try {
    const response = await axios.get(
      `/api/tracking/exercise-records/user/${authStore.userInfo?.id}`,
      {
        headers: { Authorization: `Bearer ${authStore.getToken}` },
        params: {
          page: searchParams.page
            ? searchParams.page - 1
            : currentPage.value - 1,
          size: searchParams.size || pageSize.value,
          type: searchParams.type || undefined,
          startDate: searchParams.dateRange
            ? searchParams.dateRange[0]
            : undefined,
          endDate: searchParams.dateRange
            ? searchParams.dateRange[1]
            : undefined,
        },
      }
    );
    workouts.value = response.data.map((workout) => ({
      ...workout,
      caloriesBurned: workout.caloriesBurned
        ? Math.floor(workout.caloriesBurned)
        : null,
    }));
    total.value = response.data.length;
  } catch (error) {
    console.error("獲取運動記錄失敗", error);
    ElMessage.error("獲取運動記錄失敗");
  }
};

const handleSearch = () => {
  fetchWorkoutsData({ ...workoutSearchForm, page: 1 });
  currentPage.value = 1;
};

const resetSearchForm = () => {
  workoutSearchForm.type = "";
  workoutSearchForm.dateRange = null;
  fetchWorkoutsData({ page: 1 });
  currentPage.value = 1;
};

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  fetchWorkoutsData({ size: newSize, page: currentPage.value });
};

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  fetchWorkoutsData({ page: newPage, size: pageSize.value });
};

const openAddDialog = () => {
  Object.assign(editForm, {
    recordId: null,
    exerciseType: "",
    exerciseDuration: null,
    exerciseDate: new Date().toISOString().slice(0, 10),
    userId: authStore.userInfo?.id,
  });
  editDialogVisible.value = true;
};

const openEditDialog = (row) => {
  Object.assign(editForm, {
    recordId: row.recordId,
    exerciseType: row.exerciseType,
    exerciseDuration: row.exerciseDuration,
    exerciseDate: row.exerciseDate,
    userId: row.userId,
  });
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  isSaving.value = true;
  try {
    const payload = {
      ...editForm,
      userId: authStore.userInfo?.id,
      exerciseDate: editForm.exerciseDate.slice(0, 10),
    };
    const apiEndpoint = editForm.recordId
      ? `/api/tracking/exercise-records/${editForm.recordId}`
      : "/api/tracking/exercise-records";
    const httpMethod = editForm.recordId ? "put" : "post";
    await axios[httpMethod](apiEndpoint, payload, {
      headers: { Authorization: `Bearer ${authStore.getToken}` },
    });
    ElMessage.success(`運動記錄${editForm.recordId ? "更新" : "新增"}成功`);
    editDialogVisible.value = false;
    fetchWorkoutsData();
  } catch (error) {
    console.error(`運動記錄${editForm.recordId ? "更新" : "新增"}失敗`, error);
    ElMessage.error(`運動記錄${editForm.recordId ? "更新" : "新增"}失敗`);
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
    await axios.delete(
      `/api/tracking/exercise-records/${deletingRecordId.value}`,
      {
        headers: { Authorization: `Bearer ${authStore.getToken}` },
      }
    );
    ElMessage.success("運動記錄刪除成功");
    confirmDeleteVisible.value = false;
    fetchWorkoutsData();
  } catch (error) {
    console.error("刪除運動記錄失敗", error);
    ElMessage.error("刪除運動記錄失敗");
  } finally {
    isDeleting.value = false;
    deletingRecordId.value = null;
  }
};

onMounted(() => {
  fetchWorkoutsData();
});

watch(
  () => authStore.userInfo?.id,
  (newUserId) => {
    if (newUserId) {
      fetchWorkoutsData();
    }
  }
);
</script>

<style scoped>
.workouts-management {
  padding: 20px;
}

.search-and-add {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
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
