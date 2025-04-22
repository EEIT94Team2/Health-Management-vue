<template>
  <div class="workouts-management">
    <div class="card-header">
      <h2>運動記錄</h2>
    </div>

    <div class="search-and-add">
      <div class="search-group">
        <el-select
          v-model="workoutSearchForm.type"
          placeholder="請選擇運動類型"
          style="width: 180px"
          clearable
        >
          <el-option
            v-for="type in exerciseTypes"
            :key="type"
            :label="type"
            :value="type"
          />
        </el-select>

        <el-date-picker
          v-model="workoutSearchForm.dateRange"
          type="daterange"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          value-format="YYYY-MM-DD"
          style="width: 280px"
          clearable
        />

        <el-button type="primary" @click="handleSearch">查詢</el-button>
        <el-button @click="resetSearchForm">重置</el-button>
      </div>

      <el-button type="info" @click="openAddDialog">新增運動記錄</el-button>
    </div>

    <el-table :data="workouts" border style="width: 100%; margin-top: 15px">
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
  /* 移除容器的內邊距，讓父組件 el-card 控制 */
}

.card-header {
  margin-bottom: 15px;
  h2 {
    color: #fff !important; /* 將標題文字顏色設定為白色 */
    font-size: 1.5rem; /* 可以根據需要調整字體大小 */
    margin: 0; /* 移除預設的 margin */
  }
}

.search-and-add {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.search-group {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-group .el-select .el-input__wrapper,
.search-group .el-date-picker .el-input__wrapper {
  border-radius: 8px; /* 調整圓角 */
  border: 1px solid #ccc;
  box-shadow: none; /* 移除陰影 */
}

/* 修改 "運動類型" 和 "日期範圍" 標籤文字顏色為白色 */
:deep(.el-form-item__label) {
  color: #fff !important;
  font-size: 1rem !important;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center; /* 將分頁組件置中 */
  color: #fff !important; /* 修改 "Total" 和 "Go to" 的文字顏色為白色 */
}

/* 修改分頁組件的數字顏色為白色 */
:deep(.el-pagination__total),
:deep(.el-pagination__jump),
:deep(.el-pagination__pager li),
:deep(.el-pagination__text) {
  color: #fff !important;
}

:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

:deep(.el-table th.el-table__cell) {
  background: linear-gradient(135deg, #10202b, #234567);
  color: #fff !important; /* 表格標題文字顏色改為白色 */
}

:deep(.el-table thead th:first-child) {
  border-top-left-radius: 12px;
}

:deep(.el-table thead th:last-child) {
  border-top-right-radius: 12px;
}

:deep(.el-table__body-wrapper) {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  overflow: hidden;
}

/* 修改表格數據文字顏色為深灰色並加粗，並設定字體大小 */
:deep(.el-table td.el-table__cell) {
  color: #333 !important;
  font-weight: bold !important;
  font-size: 1rem !important; /* 設定字體大小 */
}

/* 更進一步確保表格數據文字顏色和字體大小 */
:deep(.el-table__body tr td.el-table__cell > div) {
  color: #333 !important;
  font-weight: bold !important;
  font-size: 1rem !important; /* 設定字體大小 */
}

.add-button-wrapper {
  flex-shrink: 0;
}
</style>
