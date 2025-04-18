<template>
  <div>
    <h1>獎章管理</h1>

    <div class="actions">
      <el-button type="primary" @click="openCreateModal">新增獎章</el-button>
    </div>

    <div class="table-container">
      <el-table :data="achievements" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column
          prop="userId"
          label="用戶 ID"
          width="100"
        ></el-table-column>
        <el-table-column
          prop="achievementType"
          label="獎章類型"
        ></el-table-column>
        <el-table-column prop="title" label="標題"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button
              size="small"
              type="danger"
              @click="openDeleteConfirm(scope.row)"
              >刪除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="totalAchievements"
        layout="total, prev, pager, next, sizes, jumper"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        style="margin-top: 20px; justify-content: flex-end; display: flex"
      ></el-pagination>
    </div>

    <el-dialog
      title="新增獎章"
      :model-value="dialogVisible"
      @close="closeDialog"
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="用戶 ID">
          <el-input-number v-model="form.userId" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="獎章類型">
          <el-input v-model="form.achievementType"></el-input>
        </el-form-item>
        <el-form-item label="標題">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="saveAchievement">新增</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      title="確認刪除"
      :model-value="deleteConfirmVisible"
      @close="closeDeleteConfirm"
      width="30%"
    >
      <span>確定要刪除獎章 "{{ deletingAchievement.title }}" 嗎？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDeleteConfirm">取消</el-button>
          <el-button type="danger" @click="deleteAchievement">刪除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElPagination,
} from "element-plus";
import "element-plus/dist/index.css";
import axios from "axios"; // 確保你已安裝 axios

export default {
  components: {
    ElTable,
    ElTableColumn,
    ElButton,
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElInputNumber,
    ElPagination,
  },
  setup() {
    const achievements = ref([]);
    const dialogVisible = ref(false);
    const isEdit = ref(false); // 後端沒有編輯 API
    const form = reactive({
      id: null,
      userId: null,
      achievementType: "",
      title: "",
      description: "",
    });
    const deleteConfirmVisible = ref(false);
    const deletingAchievement = ref({});

    // 分頁相關變數
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalAchievements = ref(0);

    const fetchAchievements = async (
      page = currentPage.value,
      size = pageSize.value
    ) => {
      try {
        const response = await axios.get(
          `/api/tracking/achievements/all?page=${page - 1}&size=${size}`
        );
        achievements.value = response.data.content;
        totalAchievements.value = response.data.totalElements;
      } catch (error) {
        console.error("獲取獎章列表失敗:", error);
        ElMessage.error("獲取獎章列表失敗");
      }
    };

    const openCreateModal = () => {
      isEdit.value = false;
      form.id = null;
      form.userId = null;
      form.achievementType = "";
      form.title = "";
      form.description = "";
      dialogVisible.value = true;
    };

    const openEditModal = (achievement) => {
      ElMessage.warning("後端 API 沒有提供編輯獎章的功能");
      return;
    };

    const closeDialog = () => {
      dialogVisible.value = false;
      // 重置表單
      form.id = null;
      form.userId = null;
      form.achievementType = "";
      form.title = "";
      form.description = "";
    };

    const saveAchievement = async () => {
      try {
        if (isEdit.value) {
          ElMessage.warning("後端 API 似乎沒有編輯獎章的功能");
          closeDialog();
          return;
        } else {
          if (!form.userId || !form.achievementType || !form.title) {
            ElMessage.warning("請填寫用戶 ID、獎章類型和標題");
            return;
          }
          const response = await axios.post(
            `/api/tracking/achievements/${form.userId}?achievementType=${
              form.achievementType
            }&title=${form.title}&description=${form.description || ""}`
          );
          ElMessage.success("獎章新增成功");
          fetchAchievements();
          closeDialog();
        }
      } catch (error) {
        console.error("新增獎章失敗:", error);
        ElMessage.error("新增獎章失敗");
      }
    };

    const openDeleteConfirm = (achievement) => {
      deletingAchievement.value = achievement;
      deleteConfirmVisible.value = true;
    };

    const closeDeleteConfirm = () => {
      deleteConfirmVisible.value = false;
      deletingAchievement.value = {};
    };

    const deleteAchievement = async () => {
      try {
        await axios.delete(
          `/api/tracking/achievements/${deletingAchievement.value.id}`
        );
        ElMessage.success(`獎章 "${deletingAchievement.value.title}" 刪除成功`);
        fetchAchievements();
        closeDeleteConfirm();
      } catch (error) {
        console.error("刪除獎章失敗:", error);
        ElMessage.error("刪除獎章失敗");
      }
    };

    const handleCurrentChange = (page) => {
      currentPage.value = page;
      fetchAchievements(page);
    };

    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      fetchAchievements(1, size);
    };

    onMounted(fetchAchievements);

    return {
      achievements,
      dialogVisible,
      isEdit,
      form,
      deleteConfirmVisible,
      deletingAchievement,
      openCreateModal,
      openEditModal,
      closeDialog,
      saveAchievement,
      openDeleteConfirm,
      closeDeleteConfirm,
      deleteAchievement,
      currentPage,
      pageSize,
      totalAchievements,
      handleCurrentChange,
      handleSizeChange,
    };
  },
};
</script>

<style scoped>
h1 {
  margin-bottom: 20px;
}

.actions {
  margin-bottom: 15px;
}

.table-container {
  margin-top: 20px;
}
</style>
