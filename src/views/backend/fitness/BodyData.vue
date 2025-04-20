<template>
  <el-card class="body-data-management-container">
    <template #header>
      <div class="body-data-management-header">
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
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                value-format="YYYY-MM-DD"
              ></el-date-picker>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="fetchBodyData">查詢</el-button>

              <el-button @click="resetSearchForm">重置</el-button>
            </el-form-item>
          </el-form>

          <el-button type="info" @click="openEditDialog(null)"
            >新增資料</el-button
          >
        </div>
      </div>
    </template>

    <el-table :data="bodyData" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="50"></el-table-column>

      <el-table-column prop="userId" label="用戶 ID"></el-table-column>

      <el-table-column prop="userName" label="姓名"></el-table-column>

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

      <el-table-column label="操作" width="150">
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
      :title="editForm.id ? '編輯身體數據' : '新增身體數據'"
      v-model="editDialogVisible"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="用戶 ID">
          <el-input
            v-model="editForm.userId"
            :disabled="editForm.id"
          ></el-input>
        </el-form-item>

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
import emitter from "@/utils/eventBus"; // 引入事件總線

const bodyData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchForm = reactive({
  userId: "",
  name: "",
  dateRange: null,
});

const editDialogVisible = ref(false);
const editForm = reactive({
  id: null,
  userId: null,
  userName: "",
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

const fetchBodyData = async () => {
  const params = {
    page: currentPage.value - 1, // 後端 page 從 0 開始
    size: pageSize.value,
    userId: searchForm.userId || undefined,
    name: searchForm.name || undefined,
    startDate: searchForm.dateRange ? searchForm.dateRange[0] : undefined,
    endDate: searchForm.dateRange ? searchForm.dateRange[1] : undefined,
  };

  try {
    const response = await axios.get("/api/tracking/body-metrics/search", {
      params,
      ...getAuthHeaders(),
    });

    bodyData.value = response.data.content; // 資料列表在 content 屬性中
    total.value = response.data.totalElements; // 總筆數在 totalElements 屬性中
    console.log("bodyData:", bodyData.value); // 檢查 bodyData 是否包含 id

    if (
      bodyData.value.length === 0 &&
      (searchForm.userId || searchForm.name || searchForm.dateRange)
    ) {
      ElMessage.warning("查無符合條件的身體數據");
    }
  } catch (error) {
    console.error("獲取身體數據失敗", error);
    ElMessage.error("獲取身體數據失敗");
  }
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1; // 切換每頁大小時回到第一頁
  fetchBodyData();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchBodyData();
};

const resetSearchForm = () => {
  searchForm.userId = "";
  searchForm.name = "";
  searchForm.dateRange = null;
  currentPage.value = 1;
  fetchBodyData();
};

const openEditDialog = (row) => {
  if (row) {
    Object.keys(editForm).forEach((key) => {
      editForm[key] = row[key];
    });
  } else {
    // 清空表單
    Object.keys(editForm).forEach((key) => {
      editForm[key] = null;
    });
    editForm.userName = "";
    editForm.dateRecorded = new Date().toISOString().slice(0, 10);
  }
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  let isValid = true;
  const errors = [];

  if (!editForm.weight) {
    errors.push("體重不能為空");
    isValid = false;
  }
  if (!editForm.height) {
    errors.push("身高不能為空");
    isValid = false;
  }
  if (!editForm.dateRecorded) {
    errors.push("測量日期不能為空");
    isValid = false;
  }
  if (editForm.id === null && !editForm.userId) {
    errors.push("新增時用戶 ID 不能為空");
    isValid = false;
  }

  if (!isValid) {
    errors.forEach((error) => ElMessage.error(error));
    return false;
  }

  try {
    const payload = {
      id: editForm.id,
      userId: editForm.userId,
      weight: editForm.weight,
      bodyFat: editForm.bodyFat,
      height: editForm.height,
      waistCircumference: editForm.waistCircumference,
      hipCircumference: editForm.hipCircumference,
      dateRecorded: editForm.dateRecorded,
      muscleMass: editForm.muscleMass,
    };

    console.log("準備發送的數據:", payload);
    console.log("編輯的ID值:", editForm.id);

    let successMessage = "";
    if (editForm.id !== null && editForm.id !== undefined) {
      // 更新現有記錄
      console.log(`執行更新，ID: ${editForm.id}`);
      const response = await axios({
        method: "put",
        url: `/api/tracking/body-metrics/${editForm.id}`,
        data: payload,
        headers: getAuthHeaders().headers,
      });
      console.log("更新響應:", response);
      successMessage = "身體數據更新成功";
    } else {
      // 新增記錄
      console.log("執行新增");
      const response = await axios({
        method: "post",
        url: "/api/tracking/body-metrics",
        data: payload,
        headers: getAuthHeaders().headers,
      });
      console.log("新增響應:", response);
      successMessage = "身體數據新增成功";
    }
    ElMessage.success(successMessage);
    editDialogVisible.value = false;

    emitter.emit("body-data-updated"); // 發送事件通知目標進度需要更新

    fetchBodyData(); // 刷新身體數據列表
  } catch (error) {
    console.error(editForm.id ? "更新身體數據失敗" : "新增身體數據失敗", error);
    console.error("錯誤詳情:", error.response ? error.response.data : error);
    ElMessage.error(editForm.id ? "更新身體數據失敗" : "新增身體數據失敗");
  }
};

const handleDelete = async (id) => {
  try {
    await axios({
      method: "delete",
      url: `/api/tracking/body-metrics/${id}`,
      headers: getAuthHeaders().headers,
    });
    ElMessage.success("身體數據刪除成功");
    fetchBodyData();
  } catch (error) {
    console.error("刪除身體數據失敗", error);
    console.error("錯誤詳情:", error.response ? error.response.data : error);
    ElMessage.error("刪除身體數據失敗");
  }
};

onMounted(() => {
  fetchBodyData();
});
</script>

<style scoped>
.body-data-management-container {
  max-width: 1200px;
  margin: 20px auto;
}

.body-data-management-header {
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

.el-button {
  margin-left: 5px;
}
</style>
