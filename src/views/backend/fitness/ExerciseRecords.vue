<template>
  <el-card class="workout-management-container">
    <template #header>
      <div class="workout-management-header">
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
            <el-form-item label="運動類型">
              <el-select
                v-model="searchForm.type"
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
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                value-format="YYYY-MM-DD"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="fetchWorkoutRecords"
                :icon="Search"
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

    <el-table :data="workoutRecords" border style="width: 100%">
      <el-table-column prop="recordId" label="ID" width="80"></el-table-column>
      <el-table-column
        prop="userId"
        label="用戶 ID"
        width="100"
      ></el-table-column>
      <el-table-column prop="userName" label="姓名"></el-table-column>
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
      <el-table-column label="操作" width="205">
        <template #default="scope">
          <el-button :icon="Edit" @click="openEditDialog(scope.row)"
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
      v-model="editDialogVisible"
      :title="editForm.recordId ? '編輯運動紀錄' : '新增運動紀錄'"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="用戶 ID" required>
          <el-input
            v-model="editForm.userId"
            :disabled="!!editForm.recordId"
            placeholder="請輸入用戶 ID"
          ></el-input>
          <!-- 顯示用戶身體資料狀態 -->
          <div
            v-if="editForm.userId && !editForm.recordId"
            style="margin-top: 5px"
          >
            <el-tag v-if="bodyMetricsExists" type="success"
              >用戶已有身體資料</el-tag
            >
            <el-tag v-else type="danger">用戶尚未建立身體資料</el-tag>
          </div>
        </el-form-item>
        <el-form-item label="運動類型">
          <el-select
            :key="editDialogVisible"
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
import { ref, reactive, onMounted, watch } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { Edit, Delete, Search } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();

const bodyMetricsExists = ref(false);
const workoutRecords = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = reactive({
  userId: "",
  name: "",
  type: "",
  dateRange: null,
});

const editDialogVisible = ref(false);
const editForm = reactive({
  recordId: null,
  userId: "", // 不自動填充 ID
  exerciseType: "",
  exerciseDuration: null,
  caloriesBurned: null,
  exerciseDate: null,
});

// 當用戶ID變化時，檢查該用戶是否有身體數據
watch(
  () => editForm.userId,
  async (newVal) => {
    if (newVal) {
      await checkSpecificUserBodyMetricsExists(newVal);
    } else {
      bodyMetricsExists.value = false;
    }
  },
  { immediate: false }
);

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

const fetchWorkoutRecords = async () => {
  const params = {
    page: currentPage.value - 1,
    size: pageSize.value,
    userId: searchForm.userId || undefined,
    userName: searchForm.name || undefined,
    exerciseType: searchForm.type || undefined,
    startDate: searchForm.dateRange ? searchForm.dateRange[0] : undefined,
    endDate: searchForm.dateRange ? searchForm.dateRange[1] : undefined,
  };

  const apiUrl = "/api/tracking/exercise-records";

  try {
    const response = await axios.get(apiUrl, { params, ...getAuthHeaders() });
    workoutRecords.value = response.data.content;
    total.value = response.data.totalElements;

    if (
      workoutRecords.value.length === 0 &&
      (searchForm.userId ||
        searchForm.name ||
        searchForm.type ||
        searchForm.dateRange)
    ) {
      ElMessage.warning("查無符合條件的健身紀錄");
    }
  } catch (error) {
    console.error("獲取健身紀錄失敗", error);
    ElMessage.error("獲取健身紀錄失敗");
  }
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchWorkoutRecords();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchWorkoutRecords();
};

const resetSearchForm = () => {
  searchForm.userId = "";
  searchForm.name = "";
  searchForm.type = "";
  searchForm.dateRange = null;
  currentPage.value = 1;
  fetchWorkoutRecords();
};

// 檢查指定用戶ID是否有身體數據
const checkSpecificUserBodyMetricsExists = async (userId) => {
  if (!userId) {
    bodyMetricsExists.value = false;
    return false;
  }

  try {
    const response = await axios.get(
      `/api/tracking/body-metrics/user/${userId}/exists`,
      getAuthHeaders()
    );
    bodyMetricsExists.value = response.data;
    return response.data;
  } catch (error) {
    console.error(`檢查用戶 ${userId} 身體資料是否存在失敗`, error);
    ElMessage.error(`檢查用戶身體資料是否存在失敗`);
    bodyMetricsExists.value = false;
    return false;
  }
};

const navigateToBodyMetrics = () => {
  router.push("/user/body-data"); // 正確的用戶身體數據頁面路由
};

const openEditDialog = async (row) => {
  if (row) {
    // 編輯現有記錄
    editForm.recordId = row.recordId;
    editForm.userId = row.userId;
    editForm.exerciseType = row.exerciseType;
    editForm.exerciseDuration = row.exerciseDuration;
    editForm.caloriesBurned = row.caloriesBurned;
    editForm.exerciseDate = row.exerciseDate;

    // 檢查此用戶是否有身體數據（僅供參考，編輯時不阻止）
    await checkSpecificUserBodyMetricsExists(row.userId);
  } else {
    // 新增記錄，重置表單
    editForm.recordId = null;
    editForm.userId = ""; // 不預設用戶ID
    editForm.exerciseType = "";
    editForm.exerciseDuration = null;
    editForm.caloriesBurned = null;
    editForm.exerciseDate = new Date().toISOString().split("T")[0];
    bodyMetricsExists.value = false; // 重置身體數據檢查狀態
  }

  editDialogVisible.value = true;
};

const saveEdit = async () => {
  // 檢查必填字段
  if (!editForm.userId) {
    ElMessage.warning("請輸入用戶 ID");
    return;
  }
  if (!editForm.exerciseType) {
    ElMessage.warning("請選擇運動類型");
    return;
  }
  if (!editForm.exerciseDuration || editForm.exerciseDuration < 1) {
    ElMessage.warning("請輸入有效的運動時間");
    return;
  }
  if (!editForm.exerciseDate) {
    ElMessage.warning("請選擇運動日期");
    return;
  }

  // 新增時，檢查用戶是否有身體數據
  if (!editForm.recordId) {
    const hasBodyMetrics = await checkSpecificUserBodyMetricsExists(
      editForm.userId
    );
    if (!hasBodyMetrics) {
      ElMessage.error(
        `用戶 ${editForm.userId} 尚未建立身體資料，請先為該用戶新增身體資料`
      );
      return;
    }
  }

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
    fetchWorkoutRecords();
  } catch (error) {
    console.error(
      editForm.recordId ? "更新健身紀錄失敗" : "新增健身紀錄失敗",
      error
    );

    // 檢查錯誤信息
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      "";

    if (
      typeof errorMsg === "string" &&
      errorMsg.includes("找不到用戶的身體數據")
    ) {
      ElMessage.error(
        `新增失敗：用戶 ${editForm.userId} 尚未建立身體資料，請先為該用戶新增身體資料`
      );
    } else {
      ElMessage.error(
        editForm.recordId ? "更新健身紀錄失敗" : "新增健身紀錄失敗"
      );
    }
  }
};

const handleDelete = async (id) => {
  try {
    await axios.delete(
      `/api/tracking/exercise-records/${id}`,
      getAuthHeaders()
    );
    ElMessage.success("健身紀錄刪除成功");
    fetchWorkoutRecords();
  } catch (error) {
    console.error("刪除健身紀錄失敗", error);
    ElMessage.error("刪除健身紀錄失敗");
  }
};

onMounted(async () => {
  fetchWorkoutRecords();
});
</script>

<style scoped>
.workout-management-container {
  max-width: 1200px; /* 限制卡片最大寬度，使其不會佔滿整個螢幕 */
  margin: 20px auto; /* 上下留白，水平居中 */
}

.workout-management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px; /* 搜尋表單與表格間距 */
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
}

.search-and-add {
  display: flex;
  align-items: center;
  gap: 10px; /* 搜尋表單與新增按鈕間距 */
}

.search-form {
  margin-right: 10px; /* 搜尋表單內元素間距已由 el-form-item 控制 */
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end; /* 分頁器靠右 */
}

.el-button {
  margin-left: 5px; /* 按鈕之間的間距 */
}
</style>
