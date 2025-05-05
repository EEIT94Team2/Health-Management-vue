<template>
  <div class="health-platform frontend-layout course-detail-page">
    <main class="content">
      <div class="container">
        <div v-if="isLoading" class="loading-skeleton">
          <el-skeleton :rows="8" animated />
        </div>

        <div v-else-if="error" class="error-state">
          <el-empty
            :description="`載入課程失敗：${error.message || '未知錯誤'}`"
          ></el-empty>
          <div class="button-container">
            <el-button type="primary" @click="fetchCourseDetails"
              >重新載入</el-button
            >
            <el-button type="info" @click="goToCoursesList"
              >返回課程列表</el-button
            >
          </div>
        </div>

        <div v-else-if="!courseDetails" class="empty-state">
          <el-empty description="找不到此課程資訊"></el-empty>
          <div class="button-container">
            <el-button type="info" @click="goToCoursesList"
              >返回課程列表</el-button
            >
          </div>
        </div>

        <div v-else class="course-details-content">
          <h2 class="page-title">{{ courseDetails.name || "未知課程" }}</h2>

          <el-row :gutter="30" class="details-layout-row">
            <el-col :xs="24" :sm="24" :md="10" :lg="10" class="image-column">
              <div class="course-image-container">
                <el-carousel
                  v-if="courseDetails.images && courseDetails.images.length > 0"
                  :interval="5000"
                  arrow="always"
                  height="400px"
                >
                  <el-carousel-item
                    v-for="(image, index) in courseDetails.images"
                    :key="index"
                  >
                    <img
                      :src="
                        image.imageUrl.replace(
                          'https://imgur.com/',
                          'https://i.imgur.com/'
                        ) + '.jpg'
                      "
                      :alt="courseDetails.name + ' Image ' + (index + 1)"
                      onerror="this.src='https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found'"
                    />
                  </el-carousel-item>
                </el-carousel>
                <div v-else class="no-image-placeholder">
                  <img
                    src="https://placehold.co/600x400/cccccc/ffffff?text=No+Image"
                    :alt="courseDetails.name + ' No Image'"
                  />
                </div>
              </div>
            </el-col>

            <el-col :xs="24" :sm="24" :md="14" :lg="14" class="info-column">
              <div class="course-details-info">
                <div class="detail-section">
                  <h3>課程基本資訊</h3>
                  <p>
                    <strong>教練：</strong>
                    {{ courseDetails.coachName || "N/A" }}
                  </p>
                  <p>
                    <strong>時間：</strong>
                    {{ formatDayOfWeek(courseDetails.dayOfWeek) }}
                    {{ courseDetails.startTime || "N/A" }}
                  </p>
                  <p>
                    <strong>時長：</strong>
                    {{ courseDetails.duration || "N/A" }} 分鐘
                  </p>
                </div>

                <el-divider />

                <div class="detail-section">
                  <h3>課程內容</h3>
                  <p>{{ courseDetails.description || "無描述" }}</p>
                </div>

                <el-divider />

                <div class="status-section">
                  <h3>課程狀態</h3>
                  <div class="status-line">
                    <el-tag
                      :type="
                        courseDetails.full
                          ? 'danger'
                          : courseDetails.maxCapacity > 0 &&
                            courseDetails.registeredCount /
                              courseDetails.maxCapacity >=
                              0.5
                          ? 'warning'
                          : 'success'
                      "
                      size="large"
                    >
                      {{
                        courseDetails.full
                          ? "課程已額滿"
                          : courseDetails.maxCapacity > 0 &&
                            courseDetails.registeredCount /
                              courseDetails.maxCapacity >=
                              0.5
                          ? "課程快額滿"
                          : "課程未額滿"
                      }}
                    </el-tag>
                  </div>

                  <div
                    v-if="courseDetails.offersTrialOption"
                    class="status-line"
                  >
                    <el-tag
                      :type="
                        courseDetails.trialFull
                          ? 'danger'
                          : courseDetails.maxTrialCapacity > 0 &&
                            courseDetails.bookedTrialCount /
                              courseDetails.maxTrialCapacity >=
                              0.5
                          ? 'warning'
                          : 'success'
                      "
                      size="large"
                    >
                      {{
                        courseDetails.trialFull
                          ? "預約已額滿"
                          : courseDetails.maxTrialCapacity > 0 &&
                            courseDetails.bookedTrialCount /
                              courseDetails.maxTrialCapacity >=
                              0.5
                          ? "預約快額滿"
                          : "預約未額滿"
                      }}
                    </el-tag>
                  </div>
                  <div v-else class="status-line">
                    <el-tag type="info" size="large"> 未提供體驗課程 </el-tag>
                  </div>
                </div>

                <el-divider />

                <div class="action-buttons-section">
                  <el-button
                    size="large"
                    :disabled="
                      isUserRegistered ||
                      courseDetails.userStatus === '已報名' ||
                      courseDetails.full
                    "
                    @click="registerCourse"
                  >
                    {{
                      isUserRegistered || courseDetails.userStatus === "已報名"
                        ? "已報名"
                        : "報名課程"
                    }}
                  </el-button>

                  <el-tooltip
                    v-if="courseDetails.offersTrialOption"
                    content="已報名課程，無法再預約體驗"
                    placement="top"
                    :disabled="!isUserRegistered"
                  >
                    <el-button
                      type="plain"
                      size="large"
                      :disabled="
                        isUserRegistered ||
                        courseDetails.userTrialBookingStatus === '已預約' ||
                        courseDetails.trialFull
                      "
                      @click="openTrialModal(courseDetails)"
                    >
                      {{
                        isUserTrialBooked ||
                        courseDetails.userTrialBookingStatus === "已預約"
                          ? "已預約"
                          : "預約體驗"
                      }}
                    </el-button>
                  </el-tooltip>
                  <el-button
                    v-else-if="
                      courseDetails.offersTrialOption && !isUserRegistered
                    "
                    type="plain"
                    size="large"
                    :disabled="
                      isUserTrialBooked ||
                      courseDetails.userTrialBookingStatus === '已預約' ||
                      courseDetails.trialFull
                    "
                    @click="openTrialModal(courseDetails)"
                  >
                    {{
                      isUserTrialBooked ||
                      courseDetails.userTrialBookingStatus === "已預約"
                        ? "已預約"
                        : "預約體驗"
                    }}
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <div class="button-container navigation-button">
        <el-button @click="goToCoursesList">返回課程列表</el-button>
      </div>
    </main>

    <TrialBookingModal
      v-if="showTrialModal"
      :visible="showTrialModal"
      :course="selectedCourse"
      :isAuthenticated="isAuthenticated"
      :userInfo="authStore.userInfo"
      @close="showTrialModal = false"
      @booking-success="handleTrialBookingSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import {
  ElMessage,
  ElButton,
  ElDivider,
  ElTag,
  ElEmpty,
  ElSkeleton,
  ElIcon,
  ElMessageBox,
  ElRow,
  ElCol,
  ElCarousel,
  ElCarouselItem,
  ElTooltip,
} from "element-plus";
import { User, Clock } from "@element-plus/icons-vue";

import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import TrialBookingModal from "@/views/frontend/course/TrialBookingModal.vue";

const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

const courseDetails = ref(null);
const isLoading = ref(true);
const error = ref(null);
const isUserRegistered = ref(false);
const isUserTrialBooked = ref(false);

const showTrialModal = ref(false);
const selectedCourse = ref(null);

const fetchCourseDetails = async () => {
  const courseId = route.params.courseId;
  if (!courseId) {
    error.value = new Error("未提供課程 ID");
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  error.value = null;
  courseDetails.value = null;

  try {
    const response = await axios.get(`/api/courses/${courseId}`);
    if (response.data) {
      courseDetails.value = response.data;
      if (
        !courseDetails.value.images ||
        courseDetails.value.images.length === 0
      ) {
        console.warn(`課程 ID ${courseId} 沒有圖片數據。`);
        courseDetails.value.images = [];
      } else {
        courseDetails.value.images.sort((a, b) => a.imageOrder - b.imageOrder);
      }

      isUserRegistered.value = courseDetails.value.userStatus === "已報名";
      isUserTrialBooked.value =
        courseDetails.value.userTrialBookingStatus === "已預約";
    } else {
      error.value = new Error("找不到此課程資訊");
    }
  } catch (err) {
    console.error("獲取課程詳情失敗:", err);
    if (
      err.response &&
      (err.response.status === 404 || err.response.status === 400)
    ) {
      error.value = new Error("找不到此課程資訊或請求無效");
    } else {
      error.value = new Error(`載入失敗: ${err.message || "伺服器或網路錯誤"}`);
    }
  } finally {
    isLoading.value = false;
  }
};

const formatDayOfWeek = (day) => {
  if (day === null || day === undefined) return "未知";
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  return days[day] !== undefined ? `星期${days[day]}` : "未知";
};

const registerCourse = async () => {
  if (!courseDetails.value) return;

  if (!isAuthenticated.value) {
    ElMessage.warning("請先登入以報名課程！");
    router.push({
      path: "/user/login",
      query: { redirect: route.fullPath },
    });
    return;
  }

  ElMessageBox.confirm(
    `確定要報名課程 "${courseDetails.value.name}" 嗎？`,
    "報名確認",
    {
      confirmButtonText: "確定報名",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      try {
        const response = await axios.post(
          `/api/enrollments/courses/${courseDetails.value.id}`
        );

        if (response.status === 201) {
          isUserRegistered.value = true;
          if (courseDetails.value) {
            courseDetails.value.userStatus = "已報名";
          }

          if (response.data && response.data.registeredCount !== undefined) {
            courseDetails.value.registeredCount = response.data.registeredCount;
            if (response.data.full !== undefined) {
              courseDetails.value.full = response.data.full;
            }
          } else if (courseDetails.value?.registeredCount !== undefined) {
            courseDetails.value.registeredCount += 1;
            if (
              courseDetails.value.maxCapacity &&
              courseDetails.value.registeredCount >=
                courseDetails.value.maxCapacity
            ) {
              courseDetails.value.full = true;
            }
          }

          ElMessage.success(`報名成功！`);
        } else {
          console.warn(
            "報名請求返回非 201 狀態:",
            response.status,
            response.data
          );
          ElMessage.warning(`報名請求異常：狀態碼 ${response.status}`);
          fetchCourseDetails();
        }
      } catch (error) {
        console.error("報名課程請求失敗:", error);
        if (error.response) {
          const status = error.response.status;
          const errorMessage =
            error.response.data && error.response.data.message
              ? error.response.data.message
              : `報名失敗 (${status})`;
          if (status === 401 || status === 403) {
            ElMessage.error("請先登入或確保權限正確！");
            if (status === 401) {
              router.push({
                path: "/user/login",
                query: { redirect: route.fullPath },
              });
            }
          } else {
            ElMessage.error(`報名失敗：${errorMessage}`);
            fetchCourseDetails();
          }
        } else if (error.request) {
          console.error("錯誤請求:", error.request);
          ElMessage.error("報名請求失敗：伺服器沒有回應或網路問題");
          fetchCourseDetails();
        } else {
          console.error("錯誤訊息:", error.message);
          ElMessage.error(`報名失敗：請求設定錯誤 - ${error.message}`);
          fetchCourseDetails();
        }
      }
    })
    .catch(() => {
      ElMessage.info("已取消報名操作。");
    });
};

const openTrialModal = (course) => {
  if (!courseDetails.value) return;

  if (isUserRegistered.value || courseDetails.value?.userStatus === "已報名") {
    ElMessage.warning("已報名課程，無法再預約體驗");
    return;
  }

  if (
    isUserTrialBooked.value ||
    courseDetails.value?.userTrialBookingStatus === "已預約"
  ) {
    ElMessage.warning("您已預約此體驗課程");
    return;
  }

  if (courseDetails.value?.trialFull) {
    ElMessage.warning("體驗名額已滿。");
    return;
  }

  console.log("可以打開預約體驗 Modal。");
  selectedCourse.value = courseDetails.value;
  showTrialModal.value = true;
};

const handleTrialBookingSuccess = (bookedCourseId) => {
  console.log("收到預約成功事件，課程 ID:", bookedCourseId);
  fetchCourseDetails();
};

const goToCoursesList = () => {
  console.log("導航回課程列表頁面");
  router.push({ name: "Courses" });
};

onMounted(() => {
  console.log("CourseDetailsPage mounted.");
  fetchCourseDetails();
});

// watch(() => route.params.courseId, (newId, oldId) => {
//   if (newId && newId !== oldId) {
//     console.log(`課程 ID 變化: 從 ${oldId} 到 ${newId}, 重新載入詳情.`);
//     fetchCourseDetails();
//   }
// }, { immediate: false });
</script>

<style scoped>
/* 請確保您的全局或父組件中有定義這些 CSS 變數 */
/*
:root {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb; // 主要文字顏色 (例如白色)
  --text-secondary: #9ca3af; // 次要文字顏色 (例如灰色)
  --highlight-color: #10b981; // 您的主題綠色
  --highlight-hover: #059669; // 主題綠色懸停色
  --border-color: #374151; // 邊框顏色
  --card-bg: #1e293b; // 卡片背景色
  // 如果需要在 CSS 中使用主題色的 RGB，請確保在您的變數定義中包含它 (請根據您的 highlight 顏色修改)
  --highlight-color-rgb: 16, 185, 129; // #10b981 的 RGB 值
  // 您也可以考慮為紅色定義一個變數，例如：
  // --danger-color: #e74c3c;
  // --danger-color-rgb: 231, 76, 60;
}
*/

/* 整個頁面容器和基礎佈局 */
.course-detail-page {
  background-color: var(--bg-primary);
  padding-top: 8rem;
  padding-bottom: 4rem;
}

/* 主內容容器，設置最大寬度、置中、背景、邊框、陰影等 */
.course-detail-page .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  background-color: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 頁面主標題 */
.course-detail-page .page-title {
  text-align: center;
  color: var(--highlight-color);
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 2em;
}

/* 雙欄佈局的 Row */
.details-layout-row {
  margin-bottom: 30px;
}

/* 圖片容器 (包裹輪播) */
.image-column {
  margin-bottom: 20px;
}
.course-image-container {
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 輪播組件和輪播項樣式 */
.el-carousel {
  width: 100%;
  height: 100%;
}

.el-carousel__item h3 {
  color: #475669;
  font-size: 18px;
  opacity: 0.75;
  line-height: 300px;
  margin: 0;
  text-align: center;
}

/* 輪播項內的圖片樣式 */
.el-carousel__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 無圖片時的佔位符樣式 */
.no-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-secondary);
}
.no-image-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 詳細資訊區塊 */
.info-column {
  /* margin-top: 0; */
}
.course-details-info {
  /* Info section container */
}
.detail-section,
.status-section {
  margin-bottom: 20px;
}

.detail-section h3,
.status-section h3 {
  font-size: 1.3em;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 15px;
}

.detail-section p {
  margin-bottom: 12px;
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 1rem;
}

.detail-section strong {
  color: var(--text-secondary);
  margin-right: 8px;
  font-weight: bold;
}

.status-section {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-section .status-line {
  display: flex;
  align-items: center;
  font-size: 1.1em;
  color: var(--text-primary);
}

.status-section .status-line strong {
  color: var(--text-secondary);
  margin-right: 10px;
  min-width: 80px;
}

.status-section .status-line .el-tag {
  font-size: 15px;
  padding: 7px 14px;
  height: auto;
  line-height: 1.2;
  border-radius: 4px;
  border: 1px solid transparent;
}

/* === 動作按鈕區塊 (報名、預約) 樣式 === */
.action-buttons-section {
  margin-top: 30px;
  display: flex;
  gap: 20px;
  justify-content: center;
}

/* "報名課程" 按鈕樣式 (默認 - 實心主題色) */
.action-buttons-section .el-button:not([type="plain"]) {
  /* 選取不是 type="plain" 的按鈕 */
  padding: 10px 20px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  min-width: 120px;
  justify-content: center;

  background-color: var(--highlight-color);
  color: var(--text-primary); /* 例如白色文字 */
  border: none;

  &:hover,
  &:active,
  &:focus,
  &:focus-visible {
    background-color: var(--highlight-hover);
    border-color: var(--highlight-hover);
    color: var(--text-primary);
    outline: none;
  }

  &.is-disabled {
    background-color: var(--border-color);
    color: var(--text-secondary);
    border: none;
    cursor: not-allowed;
    opacity: 0.6;

    &:hover,
    &:active,
    &:focus,
    &:focus-visible {
      background-color: var(--border-color);
      color: var(--text-secondary);
      border: none;
      outline: none;
    }
  }
}

/* "預約體驗" 按鈕樣式 (type="plain" - 邊框主題色，參照 Homepage 風格) */
/* 使用 :deep() 和 .el-button--plain 提高優先級 */
.action-buttons-section :deep(.el-button.el-button--plain) {
  padding: 10px 20px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  min-width: 120px;
  justify-content: center;

  /* --- 主要風格：白底綠邊綠字 --- */
  background-color: var(--text-primary); /* 使用白色作為背景 */
  color: var(--highlight-color); /* 使用主題色作為文字顏色 */
  border: 1px solid var(--highlight-color); /* 使用主題色作為邊框顏色 */

  &:hover,
  &:active,
  &:focus,
  &:focus-visible {
    /* --- 懸停時風格：變為實心主題色 --- */
    background-color: var(--highlight-color); /* 變為實心主題色背景 */
    color: var(--text-primary); /* 變為主要文字色 (白色) */
    border-color: var(--highlight-color); /* 邊框色不變或變深 */
    outline: none;
  }

  /* 禁用狀態樣式 */
  &.is-disabled {
    background-color: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--text-secondary);
    cursor: not-allowed;
    opacity: 0.6;

    &:hover,
    &:active,
    &:focus,
    &:focus-visible {
      background-color: transparent;
      color: var(--text-secondary);
      border-color: var(--text-secondary);
      outline: none;
    }
  }
}
/* --- 結束動作按鈕區塊樣式 --- */

/* --- 狀態標籤樣式 - 類似色系但不同於主題色按鈕 --- */
/* "已額滿" (Danger) - 使用紅色系，並設定為半透明 */
.status-section .status-line :deep(.el-tag--danger) {
  background-color: rgba(
    231,
    76,
    60,
    0.2
  ); /* 使用紅色 RGB (231, 76, 60) 的半透明背景 */
  color: #e74c3c; /* 實心紅色文字 */
  border-color: rgba(231, 76, 60, 0.5); /* 邊框顏色與背景協調 (可選) */
}

/* "快額滿" (Warning) - 保持原先的灰色系或邊框色系 */
.status-section .status-line :deep(.el-tag--warning) {
  background-color: var(--border-color);
  color: var(--text-primary);
  border-color: var(--border-color);
}

/* "未額滿" (Success) - 保持原先的主題色半透明背景 + 主題色文字 */
.status-section .status-line :deep(.el-tag--success) {
  background-color: rgba(var(--highlight-color-rgb, 16, 185, 129), 0.2);
  color: var(--highlight-color);
  border-color: rgba(var(--highlight-color-rgb, 16, 185, 129), 0.5);
}

/* "未提供體驗" (Info) - 保持原先的灰色系 */
.status-section .status-line :deep(.el-tag--info) {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  border-color: var(--border-color);
}
/* --- 結束狀態標籤樣式 --- */

/* 返回課程列表按鈕區塊 */
.button-container.navigation-button {
  margin-top: 30px;
  text-align: center;
}
/* 返回課程列表按鈕樣式 - 次要按鈕風格 (灰色系) */
.button-container.navigation-button .el-button {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--text-secondary);
  padding: 10px 20px;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-width: 120px;

  &:hover,
  &:active,
  &:focus,
  &:focus-visible {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border-color: var(--text-secondary);
    outline: none;
  }
}

/* 載入中、錯誤、空狀態的基本樣式 */
.loading-skeleton,
.error-state,
.empty-state {
  margin-top: 30px;
  padding: 20px;
  background-color: var(--card-bg, #1e293b);
  border-radius: 8px;
  border: 1px solid var(--border-color, #374151);
  text-align: center;
}

.error-state .button-container,
.empty-state .button-container {
  margin-top: 20px;
}

.error-state :deep(.el-empty),
.empty-state :deep(.el-empty) {
  --el-empty-text-color: var(--text-secondary, #9ca3af);
  --el-empty-fill-color: var(--border-color, #374151);
  .el-empty__description {
    text-align: center;
  }
  .el-empty__image {
    margin: 0 auto;
  }
}

/* === 響應式設計 === */
@media (max-width: 992px) {
  .details-layout-row {
    flex-direction: column;
  }
  .image-column,
  .info-column {
    margin-bottom: 20px;
  }
  .info-column {
    margin-top: 0;
  }

  .course-image-container {
    height: 300px;
  }

  .el-carousel {
    height: 300px !important;
  }

  .action-buttons-section .el-button {
    padding: 8px 15px;
    font-size: 1rem;
  }
  .action-buttons-section {
    flex-direction: column;
    gap: 10px;
  }
  .action-buttons-section .el-button {
    width: 100%;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}

@media (max-width: 480px) {
  .course-detail-page .container {
    padding: 20px;
  }
  .course-detail-page .page-title {
    font-size: 1.8em;
  }
  .course-image-container {
    height: 250px;
  }
  .el-carousel {
    height: 250px !important;
  }
  .button-container.navigation-button .el-button {
    font-size: 0.9rem;
    padding: 8px 15px;
  }
}
</style>
