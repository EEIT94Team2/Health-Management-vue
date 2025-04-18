<template>
  <el-card class="goals-progress-management-container">
    <template #header>
      <div class="goals-progress-management-header">
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
              >
                <el-option label="全部" value=""></el-option>
                <el-option label="減重" value="減重"></el-option>
                <el-option label="增肌" value="增肌"></el-option>
                <el-option label="心肺健康" value="心肺健康"></el-option>
                <el-option label="其他" value="其他"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="狀態">
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
  </el-card>
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
  goalType: "",
  status: "",
});
const editDialogVisible = ref(false);
const editForm = reactive({
  goalId: null,
  userId: null,
  goalType: "",
  targetValue: null,
  currentValue: null,
  startDate: null,
  endDate: null,
  status: "進行中",
});

const fetchGoalsProgress = async () => {
  const token = localStorage.getItem("authToken"); // 假設您已儲存 token

  const params = {
    page: currentPage.value - 1,
    size: pageSize.value,
    userId: searchForm.userId || null,
    name: searchForm.name || null,
    startDate: searchForm.startDateRange ? searchForm.startDateRange[0] : null,
    endDate: searchForm.startDateRange ? searchForm.startDateRange[1] : null,
    goalType: searchForm.goalType || null, // 包含目標類型
    status: searchForm.status || null, // 包含狀態
  };

  try {
    const response = await axios.get(`/api/tracking/fitnessgoals`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`, // 包含授權標頭
      },
    });
    goalsProgress.value = response.data.content;
    total.value = response.data.totalElements;
  } catch (error) {
    console.error("獲取健身目標失敗", error);
    ElMessage.error("獲取健身目標失敗");
    if (error.response && error.response.status === 403) {
      ElMessage.error("您沒有權限存取該資源，請確認您已登入。");
      // 可以導向登入頁面或其他處理邏輯
    }
  }
};

const resetSearchForm = () => {
  searchForm.userId = "";
  searchForm.name = "";
  searchForm.startDateRange = null;
  searchForm.goalType = "";
  searchForm.status = "";
  currentPage.value = 1;
  fetchGoalsProgress();
};

const openEditDialog = (row) => {
  if (row) {
    Object.assign(editForm, row);
  } else {
    editForm.goalId = null;
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

.title {
  font-size: 1.5rem;
  font-weight: bold;
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

.pagination .el-button {
  /* 可以根據需要調整樣式 */
  margin-left: 5px;
}
</style>
