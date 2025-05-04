<template>
  <div class="my-courses-page">
    <div class="section-container">
      <h2 class="section-title">
        我的 <span class="text-highlight">課程</span>
      </h2>

      <div v-if="isLoadingEnrollments" class="loading-spinner">
        <el-icon class="is-loading" size="30px"> <Loading /> </el-icon>
        <span>載入中...</span>
      </div>
      <div v-else-if="enrollmentError">
        <el-empty description="載入您的課程時發生錯誤，請稍後再試。"></el-empty>
      </div>

      <div
        v-else-if="myEnrollments.length === 0 && !isLoadingEnrollments"
        class="empty-state-actions"
      >
        <el-empty description="您目前沒有報名或預約任何課程"></el-empty>
        <el-button type="primary" @click="router.push('/courses')">
          去看看所有課程
        </el-button>
      </div>

      <div v-else class="enrollment-sections">
        <div class="registered-courses-section">
          <h3 class="section-subtitle">已報名課程</h3>
          <div
            v-if="activeRegisteredEnrollments.length === 0"
            class="empty-list-placeholder"
          >
            <el-empty description="您目前沒有已報名的課程"></el-empty>
          </div>
          <div v-else class="enrollment-list-table">
            <el-table
              :data="activeRegisteredEnrollments"
              style="width: 100%"
              stripe
              class="my-courses-table"
            >
              <el-table-column label="課程名稱" min-width="180">
                <template #default="{ row }">
                  <span>{{ row.courseName || "未知課程" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="教練" width="100">
                <template #default="{ row }">
                  <span>{{ row.coachName || "未知教練" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="報名時間" width="200">
                <template #default="{ row }">
                  <span>{{ formatEnrollmentTime(row.enrollmentTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="狀態" width="105">
                <template #default="{ row }">
                  <el-tag :type="displayStatusTag(row).type" size="default">
                    {{ displayStatusTag(row).label }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    size="default"
                    @click="cancelEnrollment(row.id)"
                    :disabled="!['已報名', '候補中'].includes(row.status)"
                    class="table-action-button"
                    >取消報名
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="booked-courses-section">
          <h3 class="section-subtitle">已預約課程</h3>
          <div
            v-if="activeTrialBookings.length === 0"
            class="empty-list-placeholder"
          >
            <el-empty description="您目前沒有已預約的課程"></el-empty>
          </div>
          <div v-else class="enrollment-list-table">
            <el-table
              :data="activeTrialBookings"
              style="width: 100%"
              stripe
              class="my-courses-table"
            >
              <el-table-column label="課程名稱" min-width="180">
                <template #default="{ row }">
                  <span>{{ row.courseName || "未知課程" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="教練" width="100">
                <template #default="{ row }">
                  <span>{{ row.coachName || "未知教練" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="預約時間" width="200">
                <template #default="{ row }">
                  <span>{{ formatBookingTime(row.bookingTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="狀態" width="105">
                <template #default="{ row }">
                  <el-tag :type="displayStatusTag(row).type" size="default">
                    {{ displayStatusTag(row).label }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    size="default"
                    @click="cancelBooking(row.id)"
                    :disabled="
                      row.bookingStatus !== '已預約' &&
                      row.bookingStatus !== 'BOOKED'
                    "
                    class="table-action-button"
                  >
                    取消預約
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div
          v-if="historyCourses.length > 0 && !isLoadingEnrollments"
          class="history-courses-section"
        >
          <h3 class="section-subtitle">歷史課程</h3>
          <div class="history-filter-controls">
            <span>篩選狀態：</span>
            <el-select
              v-model="selectedHistoryStatus"
              placeholder="請選擇狀態"
              style="width: 180px"
            >
              <el-option
                v-for="item in historyStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>

          <div
            v-if="filteredHistoryCourses.length > 0"
            class="enrollment-list-table"
          >
            <el-table
              :data="filteredHistoryCourses"
              style="width: 100%"
              stripe
              class="my-courses-table"
            >
              <el-table-column label="課程名稱" min-width="180">
                <template #default="{ row }">
                  <span>{{ row.courseName || "未知課程" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="教練" width="100">
                <template #default="{ row }">
                  <span>{{ row.coachName || "未知教練" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="時間" width="200">
                <template #default="{ row }">
                  {{
                    row.recordType === "enrollment"
                      ? row.enrollmentTime
                        ? new Date(row.enrollmentTime).toLocaleString()
                        : "N/A"
                      : row.bookingTime
                      ? new Date(row.bookingTime).toLocaleString()
                      : "N/A"
                  }}
                </template>
              </el-table-column>
              <el-table-column label="狀態" width="105">
                <template #default="{ row }">
                  <el-tag :type="displayStatusTag(row).type" size="default">
                    {{ displayStatusTag(row).label }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button
                    v-if="
                      row.recordType === 'enrollment' && row.status === '已取消'
                    "
                    type="primary"
                    size="default"
                    @click="viewCourseDetails(row.courseId)"
                    class="table-action-button"
                    >重新報名</el-button
                  >
                  <el-button
                    v-else-if="
                      row.recordType === 'trialBooking' &&
                      row.bookingStatus === '已取消'
                    "
                    type="primary"
                    size="default"
                    @click="viewCourseDetails(row.courseId)"
                    class="table-action-button"
                    >重新預約</el-button
                  >
                  <span v-else>無</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div
            v-if="
              historyCourses.length > 0 && filteredHistoryCourses.length === 0
            "
            class="empty-list-placeholder"
          >
            <el-empty description="沒有找到符合篩選條件的歷史記錄"></el-empty>
          </div>
        </div>
      </div>
      <div class="navigation-buttons">
        <el-button type="primary" @click="goToCourseList"
          >返回課程列表</el-button
        >
        <el-button type="info" @click="goToHomepage">返回首頁</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import {
  ElMessage,
  ElEmpty,
  ElSkeleton, // 雖然模板中沒有直接使用 ElSkeleton，但可能在某個狀態下會用到，保留引入
  ElTable,
  ElTableColumn,
  ElButton,
  ElMessageBox,
  ElIcon,
  ElTag,
  ElSelect,
  ElOption,
  ElForm,
  ElFormItem,
} from "element-plus";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { Loading } from "@element-plus/icons-vue";

const router = useRouter();

const authStore = useAuthStore();

const { userInfo, isAuthenticated } = storeToRefs(authStore);
const myEnrollments = ref([]);
const isLoadingEnrollments = ref(false); // 預設為 false
const enrollmentError = ref(null);

// Computed Properties (保留)
const activeRegisteredEnrollments = computed(() => {
  return myEnrollments.value.filter(
    (record) =>
      record.recordType === "enrollment" &&
      ["已報名", "候補中"].includes(record.status)
  );
});

const activeTrialBookings = computed(() => {
  return myEnrollments.value.filter(
    (record) =>
      record.recordType === "trialBooking" && record.bookingStatus === "已預約"
  );
});

const historyCourses = computed(() => {
  return myEnrollments.value.filter(
    (item) =>
      (item.recordType === "enrollment" &&
        (item.status === "已取消" ||
          item.status === "未到場" ||
          item.status === "已完成")) ||
      (item.recordType === "trialBooking" &&
        (item.bookingStatus === "已取消預約" || // 確保這裡與選項 value 一致
          item.bookingStatus === "未到場" ||
          item.bookingStatus === "已完成"))
  );
});

const selectedHistoryStatus = ref("");
const historyStatusOptions = ref([
  { label: "所有歷史記錄", value: "" },
  { label: "已取消 (報名)", value: "已取消" },
  { label: "已取消 (預約)", value: "已取消預約" }, // 修正 value
  { label: "未到場", value: "未到場" },
  { label: "已完成", value: "已完成" },
]);

const filteredHistoryCourses = computed(() => {
  const selectedStatus = selectedHistoryStatus.value;
  if (selectedStatus === "") {
    return historyCourses.value;
  }

  return historyCourses.value.filter((item) => {
    if (item.recordType === "enrollment") {
      return item.status === selectedStatus;
    } else if (item.recordType === "trialBooking") {
      return item.bookingStatus === selectedStatus; // 直接比較 bookingStatus
    }
    return false;
  });
});

// 數據獲取函式 (刪除不必要的 log)
const fetchMyEnrollments = async () => {
  // console.log("Attempting to fetch all user enrollments and bookings..."); // 刪除

  if (!isAuthenticated.value || !userInfo.value || !userInfo.value.id) {
    // console.warn("使用者未登入或無法獲取 User ID，跳過獲取課程記錄。"); // 保留 warning
    myEnrollments.value = [];
    enrollmentError.value = null; // 清除可能的錯誤狀態
    isLoadingEnrollments.value = false;
    return;
  }

  isLoadingEnrollments.value = true;
  enrollmentError.value = null; // 清除可能的錯誤狀態
  const userId = userInfo.value.id; // console.log("Fetching enrollments for user ID:", userId); // 刪除
  try {
    const [enrollmentsResponse, trialBookingsResponse] = await Promise.all([
      axios.get(`/api/enrollments/users/${userId}`).catch((error) => {
        console.error("Error fetching regular enrollments:", error); // 保留 error
        return { data: [] };
      }),
      axios.get(`/api/trial-bookings/user/${userId}`).catch((error) => {
        console.error("Error fetching trial bookings:", error); // 保留 error
        return { data: [] };
      }),
    ]);

    const regularEnrollments = enrollmentsResponse.data || [];
    const trialBookings = trialBookingsResponse.data || [];

    myEnrollments.value = [
      ...regularEnrollments.map((item) => ({
        ...item,
        recordType: "enrollment",
        courseName: item.courseName,
        coachName: item.coachName,
      })),
      ...trialBookings.map((item) => ({
        ...item,
        recordType: "trialBooking",
        courseName: item.courseName,
        coachName: item.coachName,
      })),
    ]; // console.log(`Successfully fetched ${regularEnrollments.length} regular enrollments and ${trialBookings.length} trial bookings.`); // 刪除 // console.log("Combined enrollments data:", myEnrollments.value); // 刪除
  } catch (error) {
    console.error("Error fetching combined data:", error); // 保留 error
    myEnrollments.value = [];
    enrollmentError.value = error;
    const errorMessage = "載入您的課程記錄時發生錯誤，請稍後再試。";
    ElMessage.error(errorMessage); // 保留用戶提示
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 300)); // 延遲 500 毫秒
    isLoadingEnrollments.value = false;
  }
};

// 取消常規報名函式 (刪除不必要的 log)
const cancelEnrollment = async (enrollmentId) => {
  // console.log("嘗試取消常規報名 ID:", enrollmentId); // 刪除
  ElMessageBox.confirm(
    "確定要取消此課程報名嗎？取消後可能影響候補名單遞補。",
    "取消確認",
    { confirmButtonText: "確定取消", cancelButtonText: "放棄", type: "warning" }
  )
    .then(async () => {
      try {
        const response = await axios.delete(`/api/enrollments/${enrollmentId}`);

        if (response.status === 200) {
          ElMessage.success("報名已成功取消！"); // 保留用戶提示 // console.log(`Enrollment ID ${enrollmentId} cancelled successfully. Refetching enrollments.`); // 刪除
          fetchMyEnrollments();
        } else {
          console.warn(
            "取消常規報名請求返回非 200 狀態:",
            response.status,
            response.data
          ); // 保留 warning
          ElMessage.warning(`取消請求異常：狀態碼 ${response.status}`); // 保留用戶提示
          fetchMyEnrollments();
        }
      } catch (error) {
        console.error("取消常規報名請求失敗:", error); // 保留 error
        let errorMessage = "取消報名失敗，請稍後再試。";
        const status = error.response?.status;
        const backendMessage = error.response?.data?.message || "";

        if (status) {
          // console.error("錯誤響應數據:", error.response?.data); // 刪除，除非需要詳細後端響應
          // console.error("錯誤響應狀態:", status); // 刪除，狀態已在 errorMessage 中
          if (status === 404) {
            errorMessage = `取消失敗：找不到該報名記錄。${
              backendMessage ? ` (${backendMessage})` : ""
            }`;
          } else if (status === 403) {
            errorMessage = `取消失敗：${
              backendMessage || "權限不足或不符合取消條件"
            }`;
          } else if (status === 500) {
            errorMessage = `伺服器內部錯誤，取消失敗，請稍後再試。${
              backendMessage ? ` (${backendMessage})` : ""
            }`;
          } else if (status === 401) {
            errorMessage = "請先登入！";
            router.push({
              path: "/member/login",
              query: { redirect: router.currentRoute.value.fullPath },
            });
            return; // 登入跳轉後結束函式
          } else {
            errorMessage = `取消失敗：收到非預期狀態碼 ${status}${
              backendMessage ? ` (${backendMessage})` : ""
            }`;
          }
          ElMessage.error(errorMessage); // 保留用戶提示
        } else if (error.request) {
          errorMessage = "取消報名請求失敗：伺服器沒有回應或網路問題";
          ElMessage.error(errorMessage); // 保留用戶提示
        } else {
          errorMessage = `取消報名失敗：請求設定錯誤 - ${error.message}`;
          ElMessage.error(errorMessage); // 保留用戶提示
        } // 對於取消操作失敗的情況，建議重新獲取一次 // 避免狀態不一致，比如後端取消失敗但前端顯示成功等情況

        if (status !== 401) {
          // 如果是未授權跳轉，則不重新獲取
          fetchMyEnrollments();
        }
      }
    })
    .catch(() => {
      ElMessage.info("已取消操作。"); // 保留用戶提示
    });
};

// 取消體驗預約函式 (刪除不必要的 log)
const cancelBooking = async (bookingId) => {
  // console.log("嘗試取消體驗預約 ID:", bookingId); // 刪除
  ElMessageBox.confirm("確定要取消此課程預約嗎？", "取消確認", {
    confirmButtonText: "確定取消",
    cancelButtonText: "放棄",
    type: "warning",
  })
    .then(async () => {
      try {
        const response = await axios.delete(`/api/trial-bookings/${bookingId}`);

        if (response.status === 200 || response.status === 204) {
          ElMessage.success("預約已成功取消！"); // 保留用戶提示 // console.log(`Trial booking ID ${bookingId} cancelled successfully. Refetching enrollments.`); // 刪除
          fetchMyEnrollments();
        } else {
          console.warn(
            "取消體驗預約請求返回非 200/204 狀態:",
            response.status,
            response.data
          ); // 保留 warning
          ElMessage.warning(`取消預約請求異常：狀態碼 ${response.status}`); // 保留用戶提示
          fetchMyEnrollments();
        }
      } catch (error) {
        console.error("取消體驗預約請求失敗:", error); // 保留 error
        let errorMessage = "取消預約失敗，請稍後再試。";
        const status = error.response?.status;
        const backendMessage = error.response?.data?.message || "";

        if (status) {
          // console.error("錯誤響應數據:", error.response?.data); // 刪除
          // console.error("錯誤響應狀態:", status); // 刪除
          if (status === 404) {
            errorMessage = `取消失敗：找不到該預約記錄。${
              backendMessage ? ` (${backendMessage})` : ""
            }`;
          } else if (status === 403) {
            errorMessage = `取消失敗：${
              backendMessage || "權限不足或不符合取消條件"
            }`;
          } else if (status === 500) {
            errorMessage = `伺服器內部錯誤，取消失敗，請稍後再試。${
              backendMessage ? ` (${backendMessage})` : ""
            }`;
          } else if (status === 401) {
            errorMessage = "請先登入！";
            router.push({
              path: "/member/login",
              query: { redirect: router.currentRoute.value.fullPath },
            });
            return; // 登入跳轉後結束函式
          } else {
            errorMessage = `取消失敗：收到非預期狀態碼 ${status}${
              backendMessage ? ` (${backendMessage})` : ""
            }`;
          }
          ElMessage.error(errorMessage); // 保留用戶提示
        } else if (error.request) {
          errorMessage = "取消預約請求失敗：伺服器沒有回應或網路問題";
          ElMessage.error(errorMessage); // 保留用戶提示
        } else {
          errorMessage = `取消預約失敗：請求設定錯誤 - ${error.message}`;
          ElMessage.error(errorMessage); // 保留用戶提示
        } // 對於取消操作失敗的情況，建議重新獲取一次

        if (status !== 401) {
          // 如果是未授權跳轉，則不重新獲取
          fetchMyEnrollments();
        }
      }
    })
    .catch(() => {
      ElMessage.info("已取消操作。"); // 保留用戶提示
    });
};

// 導航到課程詳情頁面 (刪除不必要的 log)
const viewCourseDetails = (courseId) => {
  // console.log("嘗試導航到課程 ID {} 的詳情頁面。", courseId); // 刪除
  if (courseId) {
    router.push(`/courses/${courseId}`);
  } else {
    console.warn("無法查看課程詳情，課程 ID 無效。"); // 保留 warning
    ElMessage.warning("課程信息不完整，無法查看詳情。"); // 保留用戶提示
  }
};

// 導航到課程列表頁面 (保留)
const goToCourseList = () => {
  router.push("/courses");
};

// 導航到首頁 (保留)
const goToHomepage = () => {
  router.push("/");
};

// 格式化時間輔助函式 (保留)
const formatBookingTime = (timeString) => {
  if (!timeString) return "N/A";
  try {
    const date = new Date(timeString);
    return date.toLocaleString();
  } catch (e) {
    console.error("格式化預約時間錯誤:", e); // 保留 error
    return timeString;
  }
};
const formatEnrollmentTime = (timeString) => {
  if (!timeString) return "N/A";
  try {
    const date = new Date(timeString);
    return date.toLocaleString();
  } catch (e) {
    console.error("格式化報名時間錯誤:", e); // 保留 error
    return timeString;
  }
};

// === 輔助方法：根據記錄類型和狀態顯示狀態標籤 (保留) ===
const displayStatusTag = (row) => {
  let type = "";
  let label = "";
  let status = "";

  if (row.recordType === "enrollment") {
    status = row.status;
    label = status;
    switch (status) {
      case "已報名":
        type = "success";
        break;
      case "候補中":
        type = "warning";
        break;
      case "已取消":
        type = "info";
        break;
      case "未到場":
        type = "danger";
        break;
      case "已完成":
        type = "success";
        break;
      default:
        type = "info";
        label = status; // 未知狀態顯示原始狀態字符串
    } // label = `${label}`; // 移除類型前綴，只顯示狀態本身
  } else if (row.recordType === "trialBooking") {
    status = row.bookingStatus;
    label = status;
    switch (status) {
      case "已預約":
        type = "primary";
        break;
      case "已取消預約": // 注意這裡應該匹配後端狀態字符串
        type = "info";
        break;
      case "未到場":
        type = "danger";
        break;
      case "已完成":
        type = "success";
        break;
      default:
        type = "info";
        label = status; // 未知狀態顯示原始狀態字符串
    } // label = `${label}`; // 移除類型前綴，只顯示狀態本身
  } else {
    status = "未知";
    type = "info";
    label = "未知狀態";
  }

  return { type, label: status, status }; // 返回原始狀態字符串作為 label 顯示
};

onMounted(() => {
  // console.log("MyCoursesPage mounted."); // 刪除
  fetchMyEnrollments();
});

watch(
  [isAuthenticated, userInfo],
  ([newIsAuthenticated, newUserInfo]) => {
    // console.log("isAuthenticated or userInfo changed:", { newIsAuthenticated, newUserInfo, }); // 刪除
    if (newIsAuthenticated && newUserInfo && newUserInfo.id) {
      // console.log("User is authenticated and userInfo is available, fetching enrollments..."); // 刪除
      fetchMyEnrollments();
    } else {
      // console.log("User not authenticated or userInfo not available, clearing enrollments."); // 刪除
      myEnrollments.value = [];
      enrollmentError.value = null;
      isLoadingEnrollments.value = false;
    }
  },
  { immediate: true }
);

// <script setup> 不需要 return
</script>

<style scoped lang="scss">
.my-courses-page {
  padding: 120px 0;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}

.section-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
}

.section-subtitle {
  font-size: 1.8rem;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  border-bottom: 2px solid var(--highlight-color);
  padding-bottom: 0.5rem;
}

.text-highlight {
  color: var(--highlight-color);
  font-weight: 600;
}

.enrollment-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

// 歷史課程區塊的樣式，如果需要可以添加一些特有的
.history-courses-section {
  /* 例如： margin-top: 2rem; */
  /* 例如： border-top: 1px solid var(--border-color); */
  margin-top: 2rem; /* 與上一個區塊間隔 */
}

.enrollment-list-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color, #374151);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  :deep(.el-table) {
    background-color: var(--card-bg, #1e293b);
    color: var(--text-primary, #f9fafb);
    --el-table-border: none;
  }
  :deep(.el-table th) {
    background-color: var(--bg-secondary, #1f2937);
    color: var(--text-secondary, #9ca3af);
    font-weight: 600;
    border-bottom: 1px solid var(--border-color, #374151);
    padding: 12px 0;
  }
  :deep(.el-table tr) {
    background-color: var(--card-bg, #1e293b);
    color: var(--text-primary, #f9fafb);
    transition: background-color 0.3s ease;
  }
  :deep(.el-table tr:hover) {
    background-color: rgba(16, 185, 129, 0.08);
  }
  :deep(.el-table td) {
    border-bottom: 1px solid var(--border-color, #374151);
    color: var(--text-primary, #f9fafb);
    padding: 12px 0;
  }
  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background-color: var(--bg-secondary, #1f2937);
  }

  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }
  :deep(.el-table::before) {
    display: none;
  }
  :deep(.el-table__border-left-patch) {
    display: none;
  }
  :deep(
      .el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell
    ) {
    background-color: var(--border-color, #10b981);
  }
  :deep(.el-table .cell) {
    padding: 0 19px;
  }
}

:deep(.table-action-button) {
  // 統一大小的樣式 (padding, min-width 等)
  padding: 8px 12px; // 範例值
  min-width: 80px; // 範例值
  box-sizing: border-box;

  &.el-button--primary {
    // 表格內 "重新報名"/"重新預約" 的綠色樣式
    background-color: var(--highlight-color, #10b981);
    border-color: var(--highlight-color, #10b981);
    color: var(--text-primary, #f9fafb);
    &:hover {
      background-color: var(--highlight-hover, #059669);
      border-color: var(--highlight-hover, #059669);
      color: var(--text-primary, #f9fafb);
    }
    &:active {
      background-color: var(--highlight-hover, #059669);
      border-color: var(--highlight-hover, #059669);
    }
  }

  &.el-button--danger {
    // 表格內 "取消報名"/"取消預約" 的紅色樣式 (或其他您希望的樣式)
    color: var(--text-primary, #f9fafb); // 例如
    &:hover {
      color: var(--text-primary, #f9fafb);
    }
  }
}

.empty-list-placeholder {
  margin-top: 1.5rem;
  padding: 20px;
  background-color: var(--card-bg, #1e293b);
  border-radius: 8px;
  border: 1px solid var(--border-color, #374151);
  :deep(.el-empty) {
    --el-empty-text-color: var(--text-secondary, #9ca3af);
    --el-empty-fill-color: var(--border-color, #374151);
    /* ... 其他 el-empty 變數 ... */
  }
}

.loading-skeleton {
  margin-top: 2rem;
  padding: 20px;
  background-color: var(--card-bg, #1e293b);
  border-radius: 8px;
  border: 1px solid var(--border-color, #374151);
}
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px; /* 設定一個最小高度，避免內容跳動 */
  font-size: 24px; /* 調整圖標大小 */
  color: var(--highlight-color, #10b981); /* 設定圖標顏色 */

  .el-icon {
    margin-right: 10px; /* 圖標和文字之間的間距 */
  }
}

// === 新增這條規則來針對導航按鈕 ===
// 專門針對 .navigation-buttons 裡面的 primary 按鈕
.navigation-buttons .el-button--primary {
  // 設定導航按鈕的綠色樣式
  background-color: var(--highlight-color, #10b981);
  color: var(--text-primary, #f9fafb);
  border: none; // 移除邊框，風格與表格內按鈕一致
  &:hover {
    background-color: var(--highlight-hover, #059669);
    border-color: var(--highlight-hover, #059669);
    color: var(--text-primary, #f9fafb);
  }
  &:active {
    background-color: var(--highlight-hover, #059669);
    border-color: var(--highlight-hover, #059669);
  }
}
.navigation-buttons {
  margin-top: 3rem;
  text-align: center;

  .el-button {
    margin: 0 10px;
  }
}
// === 新增這條規則來樣式化沒有課程記錄時的區塊 ===
.empty-state-actions {
  text-align: center; // 將內容置中 (ElEmpty 的內容和按鈕)
  margin-top: 2rem; // 增加一些頂部間距
  padding: 20px; // 增加一些內邊距，使其看起來像一個區塊
  background-color: var(--card-bg, #1e293b); // 背景色與其他區塊一致
  border-radius: 8px;
  border: 1px solid var(--border-color, #374151);
  .el-button {
    margin-top: 20px; // 讓按鈕與上面的 ElEmpty 內容之間有間距
  }

  // 您可能也想確保 ElEmpty 裡面的圖片和文字本身是置中的
  :deep(.el-empty) {
    .el-empty__description {
      text-align: center;
    }
    .el-empty__image {
      margin: 0 auto;
    }
    // 繼承空狀態的顏色變數
    --el-empty-text-color: var(--text-secondary, #9ca3af);
    --el-empty-fill-color: var(--border-color, #374151);
  }

  // 在這個區塊內的 primary 按鈕 (也就是 "去看看所有課程")
  .el-button--primary {
    background-color: var(--highlight-color, #10b981); // 設定為綠色
    color: var(--text-primary, #f9fafb); // 設定文字顏色
    border: none; // 移除邊框
    &:hover {
      background-color: var(--highlight-hover, #059669); // 設定 hover 背景色
      border-color: var(--highlight-hover, #059669); // 設定 hover 邊框色
      color: var(--text-primary, #f9fafb); // 設定 hover 文字顏色
    }
    &:active {
      background-color: var(--highlight-hover, #059669);
      border-color: var(--highlight-hover, #059669);
    }
  }
}

/* 歷史課程篩選器樣式 (新增並調整以匹配 456.txt 風格) */
.history-filter-controls {
  margin-bottom: 1.5rem; /* 篩選器與表格間距 */
  padding: 10px; /* 內邊距 */
  background-color: var(--bg-secondary); /* 背景色 */
  border-radius: 4px; /* 圓角 */
  border: 1px solid var(--border-color); /* 邊框 */
  display: flex; /* 使用 flex 佈局 */
  align-items: center; /* 垂直居中 */
  gap: 15px; /* 元素間間距 */
  flex-wrap: wrap; /* 空間不足時換行 */
  /* font-size: 0.9rem; */ /* 可以調整字體大小 */
}

.history-filter-controls span {
  color: var(--text-primary); /* 標籤文字顏色 */
  font-weight: bold;
  /* min-width: 60px; */ /* 如果需要固定標籤寬度對齊 */
}

.history-filter-controls .el-form-item {
  margin-right: 0 !important; /* 移除 Element Plus 默認的右側 margin */
  margin-bottom: 0 !important; /* 移除 Element Plus 默認的底部 margin */
}

.history-filter-controls .inline-filter-form {
  /* 確保 form 元素本身也是 flex 或 inline-flex 以保持內部元素排列 */
  display: flex;
  align-items: center;
  width: 100%; /* 佔滿父容器寬度 */
  /* 可以根據需要調整 justify-content */
  justify-content: flex-start; /* 左對齊 */
}

// 如果歷史課程區塊顯示但內部篩選後為空
.history-courses-section .empty-list-placeholder {
  margin-top: 1.5rem; /* 與篩選器間距 */
  /* 其他樣式繼承自 .empty-list-placeholder */
}

/* 響應式設計 (複製 456.txt 的媒體查詢，並添加歷史篩選器的調整) */
@media (max-width: 768px) {
  .section-container {
    padding: 0 15px;
  }
  .section-title {
    font-size: 2rem;
  }
  .section-subtitle {
    font-size: 1.5rem;
  }
  /* 響應式調整歷史篩選器佈局 */
  .history-filter-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .history-filter-controls .el-select {
    width: 100% !important; /* 下拉選單佔滿寬度 */
  }
}

@media (max-width: 480px) {
  .section-container {
    padding: 0 10px;
  }
  .section-title {
    font-size: 1.8rem;
  }
  .section-subtitle {
    font-size: 1.3rem;
  }
  /* 微調表格內部按鈕大小 */
  :deep(.table-action-button) {
    padding: 6px 10px;
    min-width: 60px;
    font-size: 0.8em;
  }
  /* 微調表格單元格內邊距 */
  :deep(.el-table .cell) {
    padding: 0 10px;
  }
}
</style>
