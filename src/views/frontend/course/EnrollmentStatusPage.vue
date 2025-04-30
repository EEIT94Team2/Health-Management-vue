<template>
  <div class="enrollment-status-page frontend-layout">
    <div class="page-content section-container">
      <h2 class="section-title">
        所有課程與我的<span class="text-highlight">報名狀態</span>
      </h2>

      <div v-if="isLoading" class="loading-skeleton">
        <el-skeleton :rows="8" animated />
      </div>

      <div v-else class="enrollment-list">
        <el-table
          :data="courses"
          style="width: 100%"
          class="enrollment-table"
          empty-text="沒有找到課程數據"
        >
          <el-table-column
            prop="name"
            label="課程名稱"
            width="180"
          ></el-table-column>
          <el-table-column label="時間" width="150">
            <template #default="{ row }">
              {{ formatDayOfWeek(row.dayOfWeek) }} {{ row.startTime }}
            </template>
          </el-table-column>
          <el-table-column label="類型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isTrial ? 'info' : ''">
                {{ row.isTrial ? "體驗課" : "常規課" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="duration"
            label="時長"
            width="100"
          ></el-table-column>
          <el-table-column label="已報名 / 容量" width="120">
            <template #default="{ row }">
              {{ row.registeredCount }} / {{ row.maxCapacity }}
            </template>
          </el-table-column>
          <el-table-column
            prop="waitlistCount"
            label="候補人數"
            width="100"
          ></el-table-column>
          <el-table-column label="我的狀態" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.userStatus)">
                {{ row.userStatus || "未登入" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const authStore = useAuthStore();

const courses = ref([]);
const isLoading = ref(true);

const formatDayOfWeek = (dayOfWeek) => {
  const days = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  return days[dayOfWeek] || "未知";
};

const getStatusTagType = (status) => {
  switch (status) {
    case "已報名":
      return "success";
    case "候補":
      return "warning";
    case "取消":
      return "danger";
    case "未報名":
    default:
      return "";
  }
};

const fetchCoursesWithStatus = async () => {
  isLoading.value = true;
  try {
    const url = authStore.user
      ? `${apiBaseUrl}/enrollments/courses/all/with-status`
      : `${apiBaseUrl}/courses`; // 假設這是課程公開列表

    const headers = authStore.user
      ? { Authorization: `Bearer ${authStore.token}` }
      : {};

    const response = await axios.get(url, { headers });
    courses.value = response.data;
  } catch (error) {
    console.error("獲取課程資料失敗:", error);
    ElMessage.error("無法載入課程資料，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchCoursesWithStatus();
});
</script>

<style lang="scss" scoped>
/* Import variables and mixins if you have separate files */
/* @import '@/assets/styles/variables'; */
/* @import '@/assets/styles/mixins'; */

.enrollment-status-page {
  // Inherit dark theme variables from .frontend-layout applied globally or to parent

  .page-content {
    padding-top: 30px;
    padding-bottom: 50px;
  }

  .section-title {
    text-align: center;
    margin-bottom: 2.5rem;
    color: var(--text-primary);
  }

  .text-highlight {
    color: var(--highlight-color);
  }

  .loading-skeleton {
    padding: 20px;
    background-color: var(--card-bg);
    border-radius: 8px;
    max-width: 100%;
    margin: 20px auto;
  }

  .enrollment-list {
    margin-top: 20px;

    .enrollment-table {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;

      :deep(.el-table__header-wrapper) {
        th {
          // 使用定義好的更深的顏色變數
          background-color: var(--card-bg-darker);
          color: var(--text-primary);
          border-color: var(--border-color);
          font-weight: bold;
        }
      }

      :deep(.el-table__body-wrapper) {
        td {
          background-color: var(--card-bg);
          color: var(--text-secondary);
          border-color: var(--border-color);
        }
        tr:nth-child(even) {
          td {
            background-color: var(--card-bg-lighter);
          }
        }
      }

      :deep(.el-table__empty-block) {
        background-color: var(--card-bg);
        color: var(--text-secondary);
      }

      .el-tag {
        &.el-tag--success {
          background-color: var(--highlight-color);
          color: var(--text-primary);
          border-color: var(--highlight-color);
          opacity: 0.9;
          font-weight: normal;
        }
        &.el-tag--warning {
          background-color: lighten(#ff9800, 10%);
          color: #333;
          border-color: lighten(#ff9800, 10%);
          opacity: 0.9;
          font-weight: normal;
        }
        &.el-tag--danger {
          background-color: lighten(#f44336, 10%);
          color: var(--text-primary);
          border-color: lighten(#f44336, 10%);
          opacity: 0.9;
          font-weight: normal;
        }
        &.el-tag--info {
          background-color: var(--border-color);
          color: var(--text-secondary);
          border-color: var(--border-color);
          opacity: 0.9;
          font-weight: normal;
        }
      }
      // Button styles removed
    }
  }
}
</style>
