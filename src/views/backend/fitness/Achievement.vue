<template>
  <el-card class="achievement-management-container">
    <template #header>
      <div class="achievement-management-header">
        <div class="title">所有獎章</div>
        <el-button type="info" @click="openAddDialog">新增獎章</el-button>
      </div>
    </template>

    <el-table
      :data="allAchievements"
      border
      style="width: 100%"
      :default-sort="{ prop: 'achievementId', order: 'descending' }"
    >
      <el-table-column
        prop="achievementId"
        label="ID"
        width="80"
        sortable
      ></el-table-column>
      <el-table-column prop="userId" label="用戶 ID" sortable></el-table-column>
      <el-table-column
        prop="achievementType"
        label="類型"
        sortable
      ></el-table-column>
      <el-table-column prop="title" label="標題"></el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column prop="achievedDate" label="獲得日期" sortable>
        <template #default="scope">
          {{ formatDate(scope.row.achievedDate) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button type="danger" @click="openDeleteConfirm(scope.row)"
            >刪除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container" v-if="total > pageSize">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next, sizes, jumper"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      ></el-pagination>
    </div>

    <el-dialog title="新增獎章" v-model="addDialogVisible">
      <el-form :model="newAchievement" label-width="120px">
        <el-form-item label="用戶 ID">
          <el-input-number v-model="newAchievement.userId" required :min="1" />
        </el-form-item>
        <el-form-item label="類型">
          <el-select v-model="newAchievement.achievementType" required>
            <el-option label="目標達成" value="目標達成"></el-option>
            <el-option label="一般成就" value="一般成就"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="標題">
          <el-input v-model="newAchievement.title" required />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="newAchievement.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addAchievement">新增</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      title="確認刪除"
      v-model="deleteConfirmVisible"
      @close="closeDeleteConfirm"
      width="30%"
    >
      <span>確定要刪除獎章 "{{ deletingAchievement.title }}" 嗎？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDeleteConfirm">取消</el-button>
          <el-button type="danger" @click="confirmDeleteAchievement"
            >刪除</el-button
          >
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { Delete } from "@element-plus/icons-vue";

export default {
  setup() {
    const allAchievements = ref([]);
    const addDialogVisible = ref(false);
    const newAchievement = ref({
      userId: null,
      achievementType: "",
      title: "",
      description: "",
    });
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);

    // 新增刪除確認相關的 ref
    const deleteConfirmVisible = ref(false);
    const deletingAchievement = ref({});

    onMounted(async () => {
      await fetchAchievements();
    });

    const fetchAchievements = async () => {
      try {
        const response = await axios.get("/api/tracking/achievements/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          params: {
            page: currentPage.value - 1,
            size: pageSize.value,
          },
        });
        allAchievements.value = response.data.content;
        total.value = response.data.totalElements;
      } catch (error) {
        console.error("獲取獎章失敗:", error);
        ElMessage.error("獲取獎章失敗");
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    const openAddDialog = () => {
      newAchievement.value = {
        userId: null,
        achievementType: "",
        title: "",
        description: "",
      };
      addDialogVisible.value = true;
    };

    const addAchievement = async () => {
      try {
        await axios.post(
          `/api/tracking/achievements/${newAchievement.value.userId}`,
          null,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            params: {
              achievementType: newAchievement.value.achievementType,
              title: newAchievement.value.title,
              description: newAchievement.value.description,
            },
          }
        );
        ElMessage.success("新增獎章成功");
        await fetchAchievements();
        addDialogVisible.value = false;
      } catch (error) {
        console.error("新增獎章失敗:", error);
        ElMessage.error("新增獎章失敗");
      }
    };

    // 開啟刪除確認對話框
    const openDeleteConfirm = (achievement) => {
      deletingAchievement.value = achievement;
      deleteConfirmVisible.value = true;
    };

    // 關閉刪除確認對話框
    const closeDeleteConfirm = () => {
      deleteConfirmVisible.value = false;
      deletingAchievement.value = {};
    };

    // 確認刪除獎章
    const confirmDeleteAchievement = async () => {
      try {
        await axios.delete(
          `/api/tracking/achievements/${deletingAchievement.value.achievementId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        ElMessage.success(`獎章 "${deletingAchievement.value.title}" 刪除成功`);
        await fetchAchievements();
        closeDeleteConfirm();
      } catch (error) {
        console.error("刪除獎章失敗:", error);
        ElMessage.error("刪除獎章失敗");
      }
    };

    const handleCurrentChange = (page) => {
      currentPage.value = page;
      fetchAchievements();
    };

    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      fetchAchievements();
    };

    return {
      allAchievements,
      formatDate,
      newAchievement,
      addAchievement,
      addDialogVisible,
      openAddDialog,
      currentPage,
      pageSize,
      total,
      handleCurrentChange,
      handleSizeChange,
      // 刪除確認相關的變數和函數
      deleteConfirmVisible,
      deletingAchievement,
      openDeleteConfirm,
      closeDeleteConfirm,
      confirmDeleteAchievement,
      Delete,
    };
  },
};
</script>

<style scoped>
.achievement-management-container {
  max-width: 1200px;
  margin: 20px auto;
}

.achievement-management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
}

.dialog-footer button {
  margin-left: 5px;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>
