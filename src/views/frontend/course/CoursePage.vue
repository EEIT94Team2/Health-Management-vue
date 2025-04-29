<template>
  <div class="health-platform frontend-layout">
    <main class="content">
      <section class="hot-courses-section">
        <div class="container">
          <h2 class="section-title">
            熱門 <span class="text-highlight">課程</span>
          </h2>
          <el-carousel height="300px" type="card" indicator-position="outside">
            <el-carousel-item v-for="course in hotCourses" :key="course.id">
              <el-card class="hot-course-card testimonial-style-card">
                <div class="card-content-wrapper">
                  <div class="quote-icon">🏋️</div>
                  <h3 class="hot-course-name">{{ course.name }}</h3>
                  <p class="hot-course-description">
                    {{ course.description || "無描述" }}
                  </p>
                  <p class="card-detail">
                    時間：{{ formatDayOfWeek(course.dayOfWeek) }}
                    {{ course.startTime }}
                  </p>
                </div>
                <div class="card-author-wrapper">
                  <div class="author-info">
                    <div class="author-name">
                      教練：{{ course.coachName || "N/A" }}
                    </div>
                  </div>
                </div>
              </el-card>
            </el-carousel-item>
          </el-carousel>
        </div>
      </section>

      <section class="courses-section">
        <div class="container">
          <h2 class="section-title">
            課程 <span class="text-highlight">列表</span>
          </h2>
          <el-form :inline="true" class="course-search-form">
            <el-form-item label="查詢方式">
              <el-select
                v-model="searchType"
                placeholder="請選擇"
                style="width: 150px"
                clearable
              >
                <el-option label="課程名稱" value="byName" />
                <el-option label="教練名稱" value="byCoachName" />
              </el-select>
            </el-form-item>
            <el-form-item label="關鍵字">
              <el-input
                v-model="searchKeyword"
                placeholder="請輸入關鍵字"
                style="width: 200px"
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSearch">查詢</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>

          <div v-if="isLoading" class="loading-skeleton">
            <el-skeleton :rows="6" animated />
          </div>

          <div v-else class="course-list-wrapper">
            <el-empty
              v-if="courses.length === 0 && !isLoading"
              description="沒有找到相關課程"
            ></el-empty>

            <ul v-else class="course-grid">
              <li
                v-for="course in courses"
                :key="course.id"
                class="course-card"
                @click="toggleDetails(course.id)"
              >
                <div class="card-content">
                  <div class="course-header">
                    <span class="course-name">{{ course.name }}</span>
                  </div>

                  <p class="card-detail">教練：{{ course.coachName }}</p>

                  <p class="card-detail">
                    時間：{{ formatDayOfWeek(course.dayOfWeek) }}
                    {{ course.startTime }}
                  </p>
                  <p class="card-detail">時長：{{ course.duration }} 分鐘</p>
                  <div
                    v-if="revealedDetails[course.id]"
                    class="expanded-details"
                  >
                    <p class="card-detail">
                      課程內容： {{ course.description || "無描述" }}
                    </p>

                    <p class="card-detail">
                      <strong>課程人數：</strong>
                      {{ course.maxCapacity || 0 }} 人
                    </p>

                    <p class="card-detail" v-if="course.offersTrialOption">
                      <strong>預約課程人數：</strong>
                      {{ course.maxTrialCapacity || 0 }} 人
                    </p>
                  </div>
                  <div class="combined-fullness-cell">
                    <div class="status-line">
                      <el-tag
                        :type="
                          course.full
                            ? 'danger' /* 如果額滿，顯示紅色 danger */
                            : course.maxCapacity > 0 &&
                              course.registeredCount / course.maxCapacity >= 0.5
                            ? 'warning' /* 如果未額滿但超過一半，顯示黃色 warning */
                            : 'success' /* 否則顯示綠色 success */
                        "
                        size="large"
                        class="fullness-tag-small"
                      >
                        {{
                          course.full
                            ? "課程已額滿"
                            : course.maxCapacity > 0 &&
                              course.registeredCount / course.maxCapacity >= 0.5
                            ? "課程快額滿"
                            : "課程未額滿"
                        }}
                      </el-tag>
                    </div>
                    <div class="status-line" v-if="course.offersTrialOption">
                      <el-tag
                        :type="
                          course.trialFull
                            ? 'danger' /* 如果體驗額滿，顯示紅色 danger */
                            : course.maxTrialCapacity > 0 &&
                              course.bookedTrialCount /
                                course.maxTrialCapacity >=
                                0.5
                            ? 'warning' /* 如果未額滿但超過一半，顯示黃色 warning */
                            : 'success' /* 否則顯示綠色 success */
                        "
                        size="large"
                        class="fullness-tag-small"
                      >
                        {{
                          course.trialFull
                            ? "預約已額滿"
                            : course.maxTrialCapacity > 0 &&
                              course.bookedTrialCount /
                                course.maxTrialCapacity >=
                                0.5
                            ? "預約快額滿"
                            : "預約未額滿"
                        }}
                      </el-tag>
                    </div>
                    <div class="status-line" v-else>
                      <el-tag
                        type="info"
                        size="large"
                        class="fullness-tag-small"
                      >
                        未提供體驗課程
                      </el-tag>
                    </div>
                  </div>
                </div>

                <div class="card-buttons">
                  <el-button
                    v-if="course.offersTrialOption"
                    type="primary"
                    size="large"
                    :disabled="course.userTrialBookingStatus === '已預約'"
                    @click.stop="openTrialModal(course)"
                    class="book-button"
                  >
                    {{
                      course.userTrialBookingStatus === "已預約"
                        ? "已預約"
                        : "預約體驗"
                    }}
                  </el-button>

                  <el-button
                    type="success"
                    size="large"
                    @click.stop="registerCourse(course)"
                    class="book-button"
                    >報名課程
                  </el-button>
                </div>
              </li>
            </ul>

            <div class="pagination">
              <el-pagination
                background
                layout="total, prev, pager, next, jumper"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :total="totalCourses"
                @current-change="handlePageChange"
              />
            </div>
          </div>
        </div>
      </section>

      <TrialBookingModal
        v-if="showTrialModal"
        :visible="showTrialModal"
        :course="selectedCourse"
        @close="showTrialModal = false"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import axios from "axios"; // 引入 axios 用於發送 HTTP 請求
// 引入所有用到的 Element Plus 組件
import {
  ElMessage, // 引入 ElMessage 用於顯示提示訊息
  ElTag,
  ElButton,
  ElCard,
  ElSkeleton,
  ElEmpty,
  ElPagination,
  ElCarousel,
  ElCarouselItem,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption, // 引入 ElMessageBox 用於報名確認彈窗
  ElMessageBox,
} from "element-plus";

import { storeToRefs } from "pinia";

// 引入 Pinia Store
import { useCourseStore } from "@/stores/courseStore";

// 引入其他使用的子組件
import TrialBookingModal from "@/views/frontend/course/TrialBookingModal.vue";
// 引入 Vue Router 用於跳轉
import { useRouter } from "vue-router";

const router = useRouter(); // 獲取路由器實例

// 從 Store 中獲取狀態 (使用 storeToRefs 保持響應性)
const courseStore = useCourseStore();
const {
  courses, // Store 中當前頁的課程列表 (已篩選且已分頁), 非依 ID 搜尋模式使用此狀態
  totalCourses, // 符合篩選條件的課程總數 (用於分頁), 非依 ID 搜尋模式使用此狀態
  isLoading, // Store 中的載入狀態
  currentPage, // Store 中當前頁碼
  pageSize, // Store 中的每頁大小

  // *** 確保這裡正確解構了所有需要的搜尋相關狀態 ***
  activeSearch, // 從 Store 獲取當前啟用的搜尋模式
  searchById, // 從 Store 獲取依 ID 搜尋的狀態和結果
  searchByName, // 從 Store 獲取依名稱搜尋的狀態
  searchByCoachName, // 從 Store 獲取依教練名稱搜尋的狀態 // 你可能還有其他從 Store 拿的狀態，請確保也解構出來 // 例如：userInfo 從 authStore // userInfo
} = storeToRefs(courseStore); // <--- 確保這些變數都在這裡被解構了

// 從 Store 中獲取 Action (直接從 store 實例獲取，不需要 .value)
const {
  fetchCourses, // 獲取課程列表 (用於非特定關鍵字搜尋，如初始載入或表格篩選)
  searchCourseById, // 依 ID 搜尋 Action
  searchCourseByName, // 依名稱搜尋 Action
  searchCourseByCoachName, // 依教練名稱搜尋 Action

  resetSearchStates, // 重置所有搜尋狀態 (包括清空 courses, totalCourses, 重置分頁等)
  clearTableFilterState, // 清除表格篩選狀態 // 你可能還有其他從 Store 拿的 Action // 例如：fetchUserInfo 從 authStore // fetchUserInfo
} = courseStore; // <--- Actions 直接從 store 實例獲取

// 本地狀態：用於綁定搜尋列的輸入
// 這些狀態將用於設定 Store 中對應的搜尋狀態，然後由 Action 讀取
const searchType = ref(""); // 儲存選中的查詢方式
const searchKeyword = ref(""); // 儲存輸入的關鍵字

// 熱門課程列表 (將使用 Store 載入的數據來填充)
const hotCourses = ref([]);

// 彈窗相關狀態
const showTrialModal = ref(false); // 控制預約體驗彈窗

// selectedCourse ref 用於儲存當前選中的課程數據，只供預約體驗對話框使用
const selectedCourse = ref(null);

// 用於追蹤哪些卡片的詳細資訊已展開的狀態
const revealedDetails = reactive({});

// 工具函式：格式化星期
const formatDayOfWeek = (day) => {
  if (day === null || day === undefined) return "未知";
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  return days[day] !== undefined ? `星期${days[day]}` : "未知";
};

// 方法：打開預約體驗彈窗
const openTrialModal = (course) => {
  selectedCourse.value = course;
  showTrialModal.value = true;
};

// 切換詳細資訊展開狀態的方法
const toggleDetails = (courseId) => {
  revealedDetails[courseId] = !revealedDetails[courseId];
};

// 修改：處理搜尋 (根據 searchType 調用不同的 Store Action)
const handleSearch = () => {
  // 檢查是否有選擇查詢方式和輸入關鍵字
  if (!searchType.value) {
    ElMessage.warning("請選擇查詢方式。");
    return;
  }
  // 課程編號為 0 也可以查，所以只檢查是否為空或僅包含空白
  if (searchKeyword.value === null || searchKeyword.value.trim() === "") {
    ElMessage.warning("請輸入關鍵字。");
    return;
  }

  // 清空之前的搜尋結果和狀態
  resetSearchStates(); // 清空 Store 中所有搜尋相關狀態 (包括清空 courses, totalCourses, 重置分頁)
  clearTableFilterState(); // 搜尋時清除表格篩選，以免衝突
  // currentPage.value = 1; // resetSearchStates 會重置分頁，這裡不需要再次設置

  // 根據選擇的搜尋類型，設定 Store 中的對應狀態並呼叫相應的 Action
  switch (searchType.value) {
    case "byName":
      // 將關鍵字存入 Store 中依名稱搜尋的狀態
      searchByName.value.name = searchKeyword.value; // <-- 這裡使用了 searchByName.value
      // 設定當前搜尋模式為 byName (會影響模板顯示)
      activeSearch.value = "byName"; // <-- 這裡使用了 activeSearch.value
      // 呼叫依名稱搜尋的 Action
      searchCourseByName();
      break;

    case "byCoachName":
      // 將關鍵字存入 Store 中依教練名稱搜尋的狀態
      searchByCoachName.value.name = searchKeyword.value; // <-- 這裡使用了 searchByCoachName.value
      // 設定當前搜尋模式為 byCoachName
      activeSearch.value = "byCoachName"; // <-- 這裡使用了 activeSearch.value
      // 呼叫依教練名稱搜尋的 Action
      searchCourseByCoachName();
      break;

    case "byId":
      // 將關鍵字轉換為數字（如果需要）並存入 Store 中依 ID 搜尋的狀態
      // 注意：El-input 默認是字串，如果後端接收 Integer，這裡可能需要轉換
      const id = parseInt(searchKeyword.value);
      if (isNaN(id)) {
        ElMessage.warning("課程編號必須是數字。");
        // 這裡不需要 return，讓後續的 searchById Action 處理無效輸入後的狀態設置
        // 或者如果想直接停止，可以 return;
      }
      searchById.value.id = isNaN(id) ? null : id; // 如果不是數字，設為 null 或你 Store 中的預設無效值
      // 設定當前搜尋模式為 byId
      activeSearch.value = "byId"; // <-- 這裡使用了 activeSearch.value
      // 呼叫依 ID 搜尋的 Action (Action 內部會檢查 id 是否有效)
      searchCourseById(); // <-- 這裡使用了 searchById.value (在 Action 內部)
      break;

    default:
      // 理論上不會到這裡，但作為安全措施
      console.warn(`未知的查詢方式: ${searchType.value}`);
      ElMessage.error("未知的查詢方式。");
      // 如果是未知類型，可以重置回預設狀態
      resetSearchStates();
      clearTableFilterState();
      activeSearch.value = null; // <-- 這裡使用了 activeSearch.value
      fetchCourses(); // 獲取全部課程
      break;
  }
};

// 方法：重置搜尋 (清空所有搜尋和篩選狀態，並獲取全部課程)
const resetSearch = () => {
  searchType.value = ""; // 清空查詢方式選擇
  searchKeyword.value = ""; // 清空關鍵字輸入

  // 重置 Store 中所有搜尋相關狀態 (包括清空 courses, totalCourses, 重置分頁)
  resetSearchStates();
  clearTableFilterState(); // 清除 Store 中表格篩選狀態

  activeSearch.value = null; // 設定當前搜尋模式為 null (顯示主要列表)

  fetchCourses(); // 重新獲取全部課程
};

// 方法：處理分頁變化 (僅適用於非依 ID 搜尋模式)
const handlePageChange = (page) => {
  currentPage.value = page; // <-- 這裡使用了 currentPage.value
  // 當頁碼改變時，應該根據當前處於的搜尋模式來重新獲取數據
  // 如果是主列表模式，呼叫 fetchCourses
  // 如果是依名稱搜尋模式，呼叫 searchCourseByName
  // 如果是依教練名稱搜尋模式，呼叫 searchCourseByCoachName
  // 依 ID 搜尋模式不涉及分頁，所以這裡不需要處理

  if (activeSearch.value === null) {
    // <-- 這裡使用了 activeSearch.value
    fetchCourses();
  } else if (activeSearch.value === "byName") {
    // <-- 這裡使用了 activeSearch.value
    searchCourseByName(); // 使用 Store 中已保存的名稱關鍵字
  } else if (activeSearch.value === "byCoachName") {
    // <-- 這裡使用了 activeSearch.value
    searchCourseByCoachName(); // 使用 Store 中已保存的教練名稱關鍵字
  }
  // byId 模式的分頁處理邏輯在 searchCourseById Action 內部處理，或由於它只返回單個結果而不涉及分頁
};

// 修改：報名課程的方法，發送 API 請求
const registerCourse = async (course) => {
  // 將方法改為 async
  console.log("點擊了報名課程:", course);

  // 添加確認對話框
  ElMessageBox.confirm(`確定要報名課程 "${course.name}" 嗎？`, "報名確認", {
    confirmButtonText: "確定報名",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      // 使用 async 確保內部的 await 可以工作
      try {
        // 發送 POST 請求到後端報名 endpoint
        // 假設後端報名常規課程的 API 路徑是 /api/enrollments/courses/{courseId}
        // 注意：根據你之前提供的 EnrollmentController 來看，報名接口的路徑是 /api/enrollments/courses/{courseId}
        const response = await axios.post(
          `/api/enrollments/courses/${course.id}`
        );

        // 根據後端返回的狀態碼判斷是否成功 (你提供的 Controller 返回 HttpStatus.CREATED 即 201)
        if (response.status === 201) {
          ElMessage.success(`${course.name} 報名成功！`);
          // 報名成功後，需要刷新課程列表以更新報名人數和使用者狀態
          // 根據當前所在的模式，呼叫對應的 Action 刷新列表
          if (activeSearch.value === null) {
            // <-- 這裡使用了 activeSearch.value
            fetchCourses(); // 刷新主列表
          } else if (activeSearch.value === "byName") {
            // <-- 這裡使用了 activeSearch.value
            searchCourseByName(); // 刷新名稱搜尋結果
          } else if (activeSearch.value === "byCoachName") {
            // <-- 這裡使用了 activeSearch.value
            searchCourseByCoachName(); // 刷新教練名稱搜尋結果
          } else if (activeSearch.value === "byId" && searchById.value.course) {
            // <-- 這裡使用了 activeSearch.value 和 searchById.value
            // 如果是依 ID 搜尋且有結果，可能需要刷新單個課程狀態
            // 但依 ID 查詢只返回單個結果，刷新通常意味著重新獲取這個單個課程的最新狀態
            // 這裡可以選擇重新呼叫 searchCourseById 或直接更新 searchById.course 中的狀態，取決於後端返回的數據
            // 重新呼叫 searchCourseById 是一個簡單的方式來獲取最新狀態
            searchCourseById(); // 刷新依 ID 搜尋結果
          }
        } else {
          // 處理其他非預期的成功狀態碼 (如果有的話)
          console.warn(
            "報名請求返回非 201 狀態:",
            response.status,
            response.data
          );
          ElMessage.warning(`報名請求異常：狀態碼 ${response.status}`);
        }
      } catch (error) {
        console.error("報名課程請求失敗:", error);
        // 處理來自後端的錯誤響應 (例如 4xx 或 5xx 狀態)
        if (error.response) {
          // 伺服器返回了錯誤狀態碼
          const status = error.response.status;
          console.error("錯誤響應數據:", error.response.data);
          console.error("錯誤響應狀態:", error.response.status);

          // 提取後端提供的錯誤訊息並顯示
          const errorMessage =
            error.response.data && error.response.data.message
              ? error.response.data.message
              : `報名失敗 (${status})`; // 如果沒有後端訊息，顯示通用訊息+狀態碼

          // 如果是 401 未授權錯誤，通常是 Token 問題或未登入
          // 根據你之前的處理，這裡應該跳轉到登入頁
          if (status === 401 || status === 403) {
            // 增加 403 判斷
            ElMessage.error("請先登入或確保權限正確！"); // 提示用戶登入或權限問題
            // 跳轉到登入頁，並帶上回來的路徑，以便登入後可以跳回來
            // 請確保你的路由中有一個名為 'Login' 的路由或正確的路徑 '/member/login'
            router.push({
              path: "/member/login", // 使用你的登入頁路徑
              query: { redirect: router.currentRoute.value.fullPath },
            });
          } else {
            ElMessage.error(`報名失敗：${errorMessage}`);
          }
        } else if (error.request) {
          // 請求發出但沒有收到回應 (例如伺服器無回應或網路問題)
          console.error("錯誤請求:", error.request);
          ElMessage.error("報名請求失敗：伺服器沒有回應或網路問題");
        } else {
          // 在設定請求時發生錯誤
          console.error("錯誤訊息:", error.message);
          ElMessage.error(`報名失敗：請求設定錯誤 - ${error.message}`);
        }
      }
    })
    .catch(() => {
      // 用戶點擊取消按鈕
      ElMessage.info("已取消報名。");
    });
};

// 元件掛載後載入數據
onMounted(() => {
  // 初始載入時，呼叫 fetchCourses 獲取全部課程列表
  activeSearch.value = null; // 確保初始狀態是顯示主列表
  fetchCourses().then(() => {
    // 初始載入成功後，填充熱門課程列表
    if (courses.value.length > 0) {
      hotCourses.value = [...courses.value]
        .sort((a, b) => {
          const countA = a.registeredCount || 0;
          const countB = b.registeredCount || 0;
          return countB - countA; // 降序排序
        })
        .slice(0, 4);
    } else {
      hotCourses.value = []; // 如果沒有課程，熱門課程列表為空
    }
  });
});
</script>

<style scoped>
/* --- 基本頁面結構與容器樣式 --- */
.health-platform.frontend-layout {
  /* 整體佈局相關樣式 */
}

.content {
  /* 主要內容區域樣式 */
}

/* 修改整體容器最大寬度 - 使用更具體的選擇器來提高優先級 */
/* **不動到 index.scss 的方法：增加選擇器的優先級** */
.health-platform.frontend-layout .container {
  /* <-- 使用更具體的選擇器 */
  max-width: 1400px; /* 在這裡設定你想要的最大寬度，例如 1200px 或更高 */
  margin: 0 auto; /* 置中 */
  padding: 0 20px; /* 左右內邊距，使用你希望的值 */

  /* 其他不衝突的樣式也可以保留 */
}

.section-title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 2em;
}

.text-highlight {
  color: var(--highlight-color, #007bff);
}

/* --- 熱門課程輪播區塊樣式 (使用 testimonial-style 概念) --- */
.hot-courses-section {
  padding-top: 120px;
  /* background-color: #f8f8f8; */
}

.el-carousel {
  margin-bottom: 20px;
}

/* 熱門課程卡片樣式 (作用在 el-card.testimonial-style-card) */
.hot-course-card.testimonial-style-card {
  background-color: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  text-align: center;
}

.card-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.quote-icon {
  font-size: 2.5em;
  color: var(--highlight-color, #007bff);
}

.hot-course-name {
  margin: 0;
  color: var(--highlight-color);
  font-size: 1.3em;
  font-weight: bold;
}

.hot-course-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1em;
  line-height: 1.5;
}

.card-author-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  margin-top: auto;
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  flex-grow: 1;
  text-align: center;
}

.author-name {
  margin: 0 0 5px 0;
  font-weight: bold;
  color: var(--text-secondary);
  font-size: 1em;
}

.author-title {
  margin: 0 0 5px 0;
  font-size: 0.9em;
  color: var(--text-secondary);
}

.rating .el-tag {
  /* 如果需要調整 tag 的外觀可以在這裡寫 */
}

/* --- 主要課程列表區塊樣式 --- */
.courses-section {
  padding: 40px 0;
}

/* 搜尋表單樣式 */
.course-search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex; /* 使用 flex 佈局 */
  flex-wrap: wrap; /* 允許換行 */
  gap: 10px; /* 表單項之間的間隙 */
  align-items: center; /* 垂直置中 */
}

/* 微調 Element Plus 表單項的外邊距，讓 gap 生效 */
.course-search-form .el-form-item {
  margin-right: 0 !important; /* 移除默認右外邊距 */
  margin-bottom: 0 !important; /* 移除默認底外邊距 */
}

/* 包裹課程網格和分頁的 div */
.course-list-wrapper {
  margin-top: 20px;
  padding: 20px;
}

/* 載入中和空狀態樣式 */
.loading-skeleton {
  margin-top: 20px;
}

/* --- CSS Grid 佈局：作用在 ul.course-grid 上 --- */
.course-grid {
  list-style: none;
  padding: 0;
  margin: 0;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

/* --- 單個課程卡片樣式：作用在 li.course-card 上 --- */
.course-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  height: 100%;
  cursor: pointer; /* 顯示手形游標，表示可點擊 */
}

/* 懸停效果 */
.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-content {
  flex-grow: 1;
  margin-bottom: 15px; /* 內容與狀態/按鈕間距 */
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
}

.course-name {
  flex-grow: 1;
  margin-right: 10px;
  color: var(--highlight-color);
}

.card-detail {
  margin: 8px 0;
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 1rem;
}

.card-detail strong {
  color: var(--text-secondary);
}

.card-detail .el-tag {
  margin-left: 5px;
}

/* 展開的詳細資訊區塊樣式 (這個樣式已經不再使用了，可以移除) */
/* .expanded-details { ... } */

/* 課程狀態 Tag 容器樣式 (在基本詳細資訊下方) */
.combined-fullness-cell {
  margin-top: auto; /* 將狀態區塊推到底部，與按鈕區塊對齊 */
  padding-top: 15px;
  border-top: 1px dashed #eee; /* 分隔線 */
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px; /* 狀態區塊與按鈕區塊間距 */
}

/* 每一行狀態 (Tag) 的樣式 */
.status-line {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
  flex-wrap: nowrap;
}

/* 狀態 Tag 的樣式 */
.fullness-tag-small {
  flex-shrink: 0;
}

/* 按鈕區塊樣式 (在狀態區塊下方) */
.card-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-buttons .el-button {
  margin-left: 0 !important; /* 強制取消左邊距 */
}

/* 報名/預約按鈕樣式 */
.book-button {
  display: block;
  width: 100%;
  text-align: center;
  padding: 10px 0;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

/* --- 分頁組件容器樣式 --- */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* --- 課程詳細資訊對話框內容樣式 (修改以更美觀) --- */
.course-detail-modal-content {
  padding: 0 10px; /* 調整內邊距 */
  font-size: 1rem;
  color: #333; /* 文字顏色調整為深一點 */
}

.course-detail-modal-content p {
  margin-bottom: 12px; /* 段落間距 */
  line-height: 1.6;
  /* 移除下邊框，使用外邊距分隔 */
  padding-bottom: 0;
  border-bottom: none;
}

.course-detail-modal-content p:last-child {
  margin-bottom: 0;
}

.course-detail-modal-content strong {
  color: #000; /* 加粗文字顏色 */
  margin-right: 8px;
  font-weight: bold;
  display: inline-block; /* 讓 label 可以設定寬度或保持對齊 */
  width: 100px; /* 設定一個固定寬度讓 label 對齊 */
}

/* 如果需要，可以對特定段落或組別進行樣式調整 */
.course-detail-modal-content .el-tag {
  margin-left: 0; /* tag 在 modal 中可能不需要左外邊距 */
}

/* --- 響應式設計 --- */

@media (max-width: 992px) {
  .course-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 15px;
  }
  .course-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .course-card {
    padding: 15px;
  }

  .course-header {
    font-size: 1.1em;
  }
  .card-detail {
    font-size: 0.95rem;
  }
  .status-line,
  .fullness-tag-small {
    font-size: 13px;
  }
}

.el-button--primary {
  background-color: var(--highlight-color);
  border: var(--highlight-color);
}
</style>
