<template>
  <div>
    <h1>目標設定與進度監控</h1>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="用戶 ID">
        <el-input
          v-model="searchForm.userId"
          placeholder="輸入用戶 ID"
        ></el-input>
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="輸入姓名"></el-input>
      </el-form-item>
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
      <el-form-item>
        <el-button type="primary" @click="fetchGoalsProgress">查詢</el-button>
        <el-button @click="resetSearchForm">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="goalsProgress" border style="width: 100%">
      <el-table-column prop="userId" label="用戶 ID"></el-table-column>
      <el-table-column prop="goalType" label="目標類型"></el-table-column>
      <el-table-column prop="targetValue" label="目標值"></el-table-column>
      <el-table-column prop="currentValue" label="目前進度"></el-table-column>
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
            @click="handleDelete(scope.row.goalId)"
            >刪除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div
      style="
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <el-pagination
        v-model:currentPage="currentPage"
        v-model:pageSize="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <el-button @click="openEditDialog(null)">新增目標</el-button>
    </div>

    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.goalId ? '編輯目標' : '新增目標'"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="用戶 ID">
          <el-input
            v-model="editForm.userId"
            :disabled="editForm.goalId"
          ></el-input>
        </el-form-item>
        <el-form-item label="目標類型">
          <el-input v-model="editForm.goalType"></el-input>
        </el-form-item>
        <el-form-item label="目標值">
          <el-input-number
            v-model="editForm.targetValue"
            :min="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="目前進度">
          <el-input-number
            v-model="editForm.currentValue"
            :min="0"
          ></el-input-number>
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
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">儲存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";

const goalsProgress = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = reactive({
  userId: "",
  name: "",
  startDateRange: null,
});
const editDialogVisible = ref(false);
const editForm = reactive({
  goalId: null, // 將 id 更名為 goalId 以匹配後端
  userId: null,
  goalType: "",
  targetValue: null,
  currentValue: null,
  startDate: null,
  endDate: null,
  status: "進行中",
});

const fetchGoalsProgress = async () => {
  const params = {
    page: currentPage.value - 1,
    size: pageSize.value,
  };
  let apiUrl = "";

  if (searchForm.userId && searchForm.name && searchForm.startDateRange) {
    // 需要後端同時支持這三個條件的查詢
    console.warn("後端 API 目前沒有同時按用戶 ID、姓名和日期範圍查詢的功能。");
    return;
  } else if (searchForm.userId && searchForm.name) {
    console.warn("後端 API 目前沒有同時按用戶 ID 和姓名查詢的功能。");
    return;
  } else if (searchForm.userId && searchForm.startDateRange) {
    const startDate = searchForm.startDateRange[0];
    const endDate = searchForm.startDateRange[1];
    apiUrl = `/api/tracking/fitnessgoals/user/${searchForm.userId}/by-date-range?startDate=${startDate}&endDate=${endDate}`;
  } else if (searchForm.name && searchForm.startDateRange) {
    const startDate = searchForm.startDateRange[0];
    const endDate = searchForm.startDateRange[1];
    apiUrl = `/api/tracking/fitnessgoals/by-date-range?name=${searchForm.name}&startDate=${startDate}&endDate=${endDate}`;
  } else if (searchForm.userId) {
    apiUrl = `/api/tracking/fitnessgoals/user/${searchForm.userId}`;
  } else if (searchForm.name) {
    apiUrl = `/api/tracking/fitnessgoals/user/by-name?name=${searchForm.name}`;
  } else if (searchForm.startDateRange) {
    const startDate = searchForm.startDateRange[0];
    const endDate = searchForm.startDateRange[1];
    apiUrl = `/api/tracking/fitnessgoals/by-date-range?startDate=${startDate}&endDate=${endDate}`;
  } else {
    apiUrl = `/api/tracking/fitnessgoals/user/`;
  }

  try {
    const response = await axios.get(apiUrl, { params });
    goalsProgress.value = response.data;
    total.value = response.data.length;
  } catch (error) {
    console.error("獲取健身目標失敗", error);
    ElMessage.error("獲取健身目標失敗");
  }
};

const resetSearchForm = () => {
  searchForm.userId = "";
  searchForm.name = "";
  searchForm.startDateRange = null;
  currentPage.value = 1;
  fetchGoalsProgress();
};

const openEditDialog = (row) => {
  if (row) {
    Object.assign(editForm, row);
  } else {
    editForm.goalId = null; // 將 id 更名為 goalId
    editForm.userId = null;
    editForm.goalType = "";
    editForm.targetValue = null;
    editForm.currentValue = null;
    editForm.startDate = null;
    editForm.endDate = null;
    editForm.status = "進行中";
  }
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    const payload = {
      userId: editForm.userId,
      goalType: editForm.goalType,
      targetValue: editForm.targetValue,
      currentValue: editForm.currentValue,
      startDate: editForm.startDate,
      endDate: editForm.endDate,
      status: editForm.status,
    };
    if (editForm.goalId) {
      await axios.put(`/api/tracking/fitnessgoals/${editForm.goalId}`, payload);
      ElMessage.success("健身目標更新成功");
    } else {
      await axios.post("/api/tracking/fitnessgoals", payload);
      ElMessage.success("健身目標新增成功");
    }
    editDialogVisible.value = false;
    fetchGoalsProgress();
  } catch (error) {
    console.error(
      editForm.goalId ? "更新健身目標失敗" : "新增健身目標失敗",
      error
    );
    ElMessage.error(editForm.goalId ? "更新健身目標失敗" : "新增健身目標失敗");
  }
};

const handleDelete = async (id) => {
  try {
    await axios.delete(`/api/tracking/fitnessgoals/${id}`);
    ElMessage.success("健身目標已刪除");
    fetchGoalsProgress();
  } catch (error) {
    console.error("刪除健身目標失敗", error);
    ElMessage.error("刪除健身目標失敗");
  }
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchGoalsProgress();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchGoalsProgress();
};

onMounted(() => {
  // 初始載入時，可以根據需要查詢特定用戶的目標，或者不帶參數查詢所有（如果後端支持）
  // 目前前端預設會查詢 userId 為空的，後端可能會返回所有用戶的目標（如果沒有 userId）。
  fetchGoalsProgress();
});
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination .el-button {
  /* 可以根據需要調整樣式 */
}
</style>
