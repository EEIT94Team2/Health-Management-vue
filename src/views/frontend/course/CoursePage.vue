<template>
  <div class="health-platform frontend-layout">
    <main class="content">
      <section class="hot-courses-section">
        <div class="container">
          <h2 class="section-title">
            推薦 <span class="text-highlight">課程</span>
          </h2>
          <el-carousel
            height="300px"
            type="card"
            indicator-position="outside"
            :interval="3000"
          >
            <el-carousel-item v-for="course in hotCourses" :key="course.id">
              <el-card
                class="hot-course-card testimonial-style-card"
                :style="{ backgroundImage: getHotCourseBackground(course) }"
                @click="viewCourseDetails(course.id)"
              >
                <div class="card-content-wrapper">
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

      <section class="courses-section" ref="courseSectionRef">
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
              <el-button
                class="search-button"
                type="primary"
                @click="handleSearch"
              >
                查詢
              </el-button>
              <el-button class="reset-button" @click="resetSearch">
                重置
              </el-button>
            </el-form-item>
          </el-form>

          <div v-if="isLoading" class="loading-skeleton">
            <el-skeleton :rows="6" animated />
          </div>

          <div v-else class="course-list-wrapper" ref="courseListWrapperRef">
            <el-empty
              v-if="courses.length === 0 && !isLoading"
              description="沒有找到相關課程"
              class="empty-courses-list-placeholder"
            ></el-empty>
            <el-row v-else :gutter="30" class="course-grid-row">
              <el-col
                :xs="24"
                :sm="12"
                :md="6"
                v-for="course in courses"
                :key="course.id"
                style="margin-bottom: 30px"
              >
                <div
                  class="course-card new-style-card"
                  @click="viewCourseDetails(course.id)"
                >
                  <div class="course-image">
                    <img
                      :src="
                        course.images && course.images.length > 0 // 確保圖片列表存在且非空
                          ? course.images[0].imageUrl &&
                            typeof course.images[0].imageUrl === 'string' // 確保 imageUrl 存在且是字串
                            ? course.images[0].imageUrl.startsWith(
                                'https://imgur.com/'
                              ) // 檢查是否是 Imgur URL
                              ? course.images[0].imageUrl.replace(
                                  'https://imgur.com/',
                                  'https://i.imgur.com/'
                                ) + '.jpg' // 如果是 Imgur URL，進行轉換並加 .jpg
                              : course.images[0].imageUrl // 如果不是 Imgur URL，直接使用後端提供的原始 URL (例如 http://localhost:8080/...)
                            : 'https://placehold.co/400x250/cccccc/ffffff?text=No+Image' // imageUrl 不存在或不是字串時顯示佔位圖
                          : 'https://placehold.co/400x250/cccccc/ffffff?text=No+Image' // 無圖片時顯示佔位圖
                      "
                      :alt="course.name + '圖片'"
                      @error="
                        (event) =>
                          (event.target.src =
                            'https://placehold.co/400x250/cccccc/ffffff?text=Image+Not+Found') // 圖片載入失敗時顯示
                      "
                      style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 4px;
                      "
                    />
                  </div>
                  <div class="course-content">
                    <h3>{{ course.name }}</h3>
                    <div class="course-info">
                      <span>
                        <el-icon><User /></el-icon>
                        {{ course.coachName || "N/A" }}
                      </span>
                      <span>
                        <el-icon><Clock /></el-icon>
                        {{ course.duration || "N/A" }} 分鐘
                      </span>
                    </div>
                    <el-button
                      type="primary"
                      @click.stop="viewCourseDetails(course.id)"
                    >
                      查看詳情
                    </el-button>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
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
      </section>
      <div class="navigation-buttons">
        <el-button type="info" @click="goToHomepage">返回首頁</el-button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, onActivated } from "vue";
import axios from "axios";
import {
  ElMessage,
  // 移除 ElTag，模板中未直接使用
  ElButton,
  ElSkeleton,
  ElEmpty,
  ElPagination,
  ElCarousel,
  ElCarouselItem,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElMessageBox,
  ElIcon,
  ElRow,
  ElCol,
} from "element-plus";

import { User, Clock } from "@element-plus/icons-vue";

import { storeToRefs } from "pinia";
import { useCourseStore } from "@/stores/courseStore";

import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const courseStore = useCourseStore();

const {
  courses,
  totalCourses,
  isLoading,
  currentPage,
  pageSize,
  activeSearch,
  searchById,
  searchByName,
  searchByCoachName,
} = storeToRefs(courseStore);

const {
  fetchCourses,
  searchCourseById,
  searchCourseByName,
  searchCourseByCoachName,
  resetSearchStates,
  clearTableFilterState,
} = courseStore;

const searchType = ref("");
const searchKeyword = ref("");
const hotCourses = ref([]);

const courseSectionRef = ref(null);

const formatDayOfWeek = (day) => {
  if (day === null || day === undefined) return "未知";
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  return days[day] !== undefined ? `星期${days[day]}` : "未知";
};

const viewCourseDetails = (courseId) => {
  if (courseId) {
    console.log("導航到課程詳情 ID:", courseId);
    sessionStorage.setItem("courseListScrollY", window.scrollY);
    router.push({ name: "course-details", params: { courseId: courseId } }); // 確保路由名稱正確
  } else {
    console.warn("無法導航到課程詳情，課程 ID 無效。");
    ElMessage.warning("課程信息不完整，無法查看詳情。");
  }
};

const handleSearch = () => {
  if (!searchType.value) {
    ElMessage.warning("請選擇查詢方式。");
    return;
  }
  if (searchKeyword.value === null || searchKeyword.value.trim() === "") {
    ElMessage.warning("請輸入關鍵字。");
    return;
  }
  resetSearchStates();
  clearTableFilterState();

  switch (searchType.value) {
    case "byName":
      searchByName.value.name = searchKeyword.value;
      activeSearch.value = "byName";
      searchCourseByName();
      break;
    case "byCoachName":
      searchByCoachName.value.name = searchKeyword.value;
      activeSearch.value = "byCoachName";
      searchCourseByCoachName();
      break;
    case "byId":
      const id = parseInt(searchKeyword.value);
      if (isNaN(id)) {
        ElMessage.warning("課程編號必須是數字。");
      }
      searchById.value.id = isNaN(id) ? null : id;
      activeSearch.value = "byId";
      searchCourseById();
      break;
    default:
      console.warn(`未知的查詢方式: ${searchType.value}`);
      ElMessage.error("未知的查詢方式。");
      resetSearchStates();
      clearTableFilterState();
      activeSearch.value = null;
      fetchCourses();
      break;
  }
};

const resetSearch = () => {
  searchType.value = "";
  searchKeyword.value = "";
  resetSearchStates();
  clearTableFilterState();
  activeSearch.value = null;
  fetchCourses();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  let fetchPromise;
  if (activeSearch.value === null) {
    fetchPromise = fetchCourses();
  } else if (activeSearch.value === "byName") {
    fetchPromise = searchCourseByName();
  } else if (activeSearch.value === "byCoachName") {
    fetchPromise = searchCourseByCoachName();
  } else {
    return;
  }
  fetchPromise
    .then(() => {
      requestAnimationFrame(() => {
        if (courseSectionRef.value) {
          courseSectionRef.value.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
          console.warn(
            "courseSectionRef is null, cannot scroll to search bar."
          );
        }
      });
    })
    .catch((error) => {
      console.error("獲取數據時發生錯誤:", error);
      ElMessage.error("載入課程失敗，請稍後再試！");
    });
};

// 移除此處的 registerCourse 方法，應該在課程詳情頁面處理

const goToHomepage = () => {
  router.push("/");
};

const restoreScrollPosition = () => {
  const savedScrollY = sessionStorage.getItem("courseListScrollY");
  if (savedScrollY) {
    sessionStorage.removeItem("courseListScrollY");
    nextTick(() => {
      window.scrollTo(0, parseInt(savedScrollY));
      console.log("恢復到保存的捲動位置:", parseInt(savedScrollY));
    });
  }
};

// === 修改：根據課程圖片生成背景樣式的方法 ===
const getHotCourseBackground = (course) => {
  if (
    course.images &&
    Array.isArray(course.images) &&
    course.images.length > 0
  ) {
    // 確保圖片列表存在且非空陣列
    const firstImage = course.images.sort(
      (a, b) => (a.imageOrder || 0) - (b.imageOrder || 0)
    )[0];

    let imageUrl = firstImage.imageUrl;
    // 只有當 imageUrl 存在且是一個字串時才進行處理
    if (imageUrl && typeof imageUrl === "string") {
      if (imageUrl.startsWith("https://imgur.com/")) {
        // 檢查是否是 Imgur URL
        // 如果是 Imgur URL，進行轉換並加 .jpg
        imageUrl =
          imageUrl.replace("https://imgur.com/", "https://i.imgur.com/") +
          ".jpg";
      }
      // 如果不是 Imgur URL (例如您自己的 http://localhost:8080 URL)，則直接使用原始 imageUrl
    } else {
      // 如果 imageUrl 不存在或不是字串，使用一個佔位圖或最小的透明圖片 base64
      // 使用最小的透明圖片 base64 可以避免載入錯誤和一些排版問題
      imageUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      // 或者您可以直接返回不包含背景圖的漸變：
      // return "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2))";
    }

    // 返回包含背景圖的漸變樣式
    // 使用 encodeURI 處理 URL 中的特殊字元，確保其在 CSS 中有效
    return `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2)), url(${encodeURI(
      imageUrl
    )})`;
  }
  // 沒有圖片時的背景漸變
  return "linear-gradient(to bottom right, var(--bg-secondary), var(--card-bg))";
};
// ===========================================

onMounted(() => {
  console.log("CoursePage mounted.");
  activeSearch.value = null;
  fetchCourses().then(() => {
    // fetchCourses 會獲取所有課程到 courses.value
    if (courses.value.length > 0) {
      // === 修改這裡的 slice 數量，取更多個作為推薦課程 ===
      hotCourses.value = [...courses.value] // 使用 courses.value 數據
        .sort((a, b) => {
          const countA = a.registeredCount || 0;
          const countB = b.registeredCount || 0;
          return countB - countA;
        })
        .slice(0, 8); // === 改為取前 8 個 (可以調整數量，例如 10) ===
      console.log("設置推薦課程成功:", hotCourses.value.length, "個課程");
    } else {
      hotCourses.value = [];
      console.log("沒有獲取到課程數據，推薦課程為空");
    }
    restoreScrollPosition();
  });
});

onActivated(() => {
  console.log("CourseListPage Activated");
  restoreScrollPosition();
});
</script>

<style scoped>
/* 全局容器樣式 */
.health-platform.frontend-layout .container {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 標題樣式 */
.section-title {
  text-align: center;
  color: var(--text-primary, #333); /* 使用變數 */
  margin-bottom: 20px;
  font-size: 2em;
}
.text-highlight {
  color: var(--highlight-color); /* 直接使用 highlight 顏色 */
  font-weight: 600;
}

/* 熱門課程輪播區塊樣式 */
.hot-courses-section {
  padding-top: 120px;
  /* background-color: var(--bg-secondary); */ /* 如果卡片有背景圖片，區塊本身不需要背景色 */
}
.el-carousel {
  margin-bottom: 20px;
}

/* === 熱門課程卡片樣式 (調整以適應背景圖片) === */
.hot-course-card.testimonial-style-card {
  /* 移除 background-color，因為要用背景圖片 */
  /* background-color: var(--card-bg); */
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%; /* 確保卡片填滿輪播項高度 */
  text-align: center;
  overflow: hidden; /* 確保背景圖片圓角被裁剪 */
  position: relative; /* 為內容的 z-index 做準備 */
  cursor: pointer; /* 添加手形游標 */
  /* === 背景圖片樣式 === */
  background-size: cover; /* 圖片覆蓋整個卡片 */
  background-position: center; /* 圖片居中 */
  background-repeat: no-repeat; /* 不重複 */
  /* color 應該設定在內容元素上以確保可讀性 */
}

.hot-course-card.testimonial-style-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

/* === 調整卡片內文字顏色以提高可讀性 === */
.hot-course-card.testimonial-style-card .card-content-wrapper,
.hot-course-card.testimonial-style-card .card-author-wrapper {
  position: relative; /* 確保內容在疊加層上方 */
  z-index: 2; /* 設置較高的 z-index */
  color: white; /* 設置內容的基礎文字顏色為白色 */
}

.hot-course-card.testimonial-style-card .quote-icon {
  font-size: 2.5em;
  color: var(--highlight-color-light, #32c98d); /* 或其他適合深色背景的顏色 */
}
.hot-course-card.testimonial-style-card .hot-course-name {
  margin: 0;
  color: var(--highlight-color-light, #32c98d); /* 使用亮色的 highlight 顏色 */
  font-size: 1.3em;
  font-weight: bold;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3); /* 可選：文字陰影增強對比 */
}
.hot-course-card.testimonial-style-card .hot-course-description {
  margin: 10px;
  color: rgba(255, 255, 255, 0.9); /* 稍透明的白色 */
  font-size: 1em;
  line-height: 1.5;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3); /* 可選：文字陰影增強對比 */
}
.hot-course-card.testimonial-style-card .card-detail {
  color: rgba(255, 255, 255, 0.8); /* 稍透明的白色 */
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3); /* 可選：文字陰影增強對比 */
}
.hot-course-card.testimonial-style-card .author-name {
  margin: 0 0 5px 0;
  font-weight: bold;
  color: white; /* 純白色 */
  font-size: 1em;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3); /* 可選：文字陰影增強對比 */
}
/* 在 .hot-courses-section 內部調整輪播箭頭的點擊範圍 */
.hot-courses-section :deep(.el-carousel__arrow) {
  width: 40px; /* 增加寬度 */
  height: 40px; /* 增加高度 */
  /* 如果需要，可以調整背景顏色和邊框 */
  /* background-color: rgba(0, 0, 0, 0.5); */
  /* border: 1px solid rgba(255, 255, 255, 0.8); */

  /* 使箭頭圖標在按鈕中居中 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 可選：調整箭頭圖標本身的大小 */
.hot-courses-section :deep(.el-carousel__arrow svg) {
  width: 20px; /* 調整圖標寬度 */
  height: 20px; /* 調整圖標高度 */
}

/* --- 主要課程列表區塊樣式 --- */
.courses-section {
  padding: 2rem 0;
  background-color: var(--bg-primary);
  text-align: left;

  .course-grid-row {
    margin-top: 2rem;
  }

  .course-card.new-style-card {
    background-color: var(--card-bg);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    cursor: pointer;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    .course-image {
      height: 200px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }

    .course-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      h3 {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
        color: var(--highlight-color);
      }

      .course-info {
        display: flex;
        gap: 1rem;
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-bottom: 1rem;
        flex-grow: 1;

        .el-icon {
          margin-right: 0.3rem;
          color: var(--highlight-color);
        }
      }

      .el-button {
        align-self: flex-start;

        background-color: var(--highlight-color);
        color: var(--text-primary);
        border: none;
        padding: 0.6rem 1.5rem;
        font-size: 1.01rem;

        &:hover,
        &:active {
          background-color: var(--highlight-hover);
          border-color: var(--highlight-hover);
        }
      }
    }
  }
}
/* --- 結束主要課程列表區塊樣式 --- */
/* 搜尋表單樣式 */
.course-search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px; /* 調整 gap，增加水平間距，垂直間距 10px */
  align-items: center; /* 使 el-form-item 在容器中垂直居中 */
  justify-content: center; /* 使 el-form-item 在容器中水平居中 */
}
/* === 添加以下針對 el-form-item 內部元素的 :deep() 樣式 === */

:deep(.el-form-item) {
  margin-right: 0 !important;
  margin-bottom: 0 !important; /* 確保在換行時沒有額外的底部間距 */
  /* // display: flex; */
  /* // align-items: center; */
}

:deep(.el-form-item__label) {
  display: flex;
  align-items: center; /* 使標籤文字在標籤區域內垂直居中 */
  padding-bottom: 0 !important; /* 移除可能的底部 padding */
  /* // height: 100%; 使 label 佔滿 el-form-item 的高度，可選 */
  color: var(--highlight-color); /* 保留你原有的顏色設定 */
  font-size: 1.05em;
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: center; /* 使輸入框/下拉框等內容在內容區域內垂直居中 */
  line-height: unset !important; /* 移除默認的行高，避免影響垂直對齊 */
  font-size: 1em;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  align-items: center; /* 確保輸入框/下拉框內部的 icon 和文字垂直居中 */
  font-size: 1em;
}

:deep(.el-form-item .el-button) {
  display: flex;
  align-items: center;
  font-size: 1em;
  /* // height: 100%; 讓按鈕高度與輸入框等一致，可選 */
}

/* === 結束添加 === */

/* 其他按鈕樣式保留 */
.search-button {
  background-color: var(--highlight-color);
  border-color: var(--highlight-color);
  color: var(--text-primary);
  transition: all 0.3s ease;

  &:hover,
  &:active,
  &:focus,
  &:focus-visible {
    background-color: var(--highlight-hover);
    border-color: var(--highlight-hover);
    color: var(--text-primary);
    outline: none;
  }
}

/* 修改 重置按鈕樣式，使用 highlight 色 */
.reset-button {
  background-color: transparent;
  border-color: var(--highlight-color);
  color: var(--highlight-color);
  transition: all 0.3s ease;

  &:hover,
  &:active,
  &:focus,
  &:focus-visible {
    background-color: rgba(var(--highlight-color-rgb, 16, 185, 129), 0.1);
    border-color: var(--highlight-hover);
    color: var(--highlight-hover);
    outline: none;
  }
}

/* === 添加以下針對 el-form-item 內部元素的 :deep() 樣式 === */
/* （這部分保留原樣，確保 el-button 的樣式能正確應用）*/
:deep(.el-form-item .el-button) {
  display: flex;
  align-items: center;
  font-size: 1em;
  /* // height: 100%; */
}

/* Loading 骨架屏樣式 */
.loading-skeleton {
  margin-top: 20px;
}

/* 包裹課程網格和分頁的 div */
.course-list-wrapper {
  margin-top: 20px;
}

/* 分頁組件容器樣式 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 分頁組件細節樣式 */
:deep(.el-pagination) {
  color: var(--text-secondary);
}
:deep(.el-pagination__total) {
  color: var(--text-secondary);
}
:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next),
:deep(.el-pager li) {
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin: 0 4px;
  min-width: 30px;
  height: 30px;
  line-height: 28px;
  box-sizing: border-box;
}
:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover),
:deep(.el-pager li:hover) {
  color: var(--highlight-color);
  border-color: var(--highlight-color);
}
:deep(.el-pager li.is-active) {
  color: var(--text-primary);
  background-color: var(--highlight-color) !important;
  border-color: var(--highlight-color);
  font-weight: bold;
}
:deep(.el-pager li.is-active:hover) {
  background-color: var(--highlight-hover);
  border-color: var(--highlight-hover);
  color: var(--text-primary);
}
:deep(.el-pagination .btn-prev:disabled),
:deep(.el-pagination .btn-next:disabled) {
  color: var(--text-secondary);
  border-color: var(--border-color);
  background-color: var(--bg-secondary);
  opacity: 0.5;
  cursor: not-allowed;
}
:deep(.el-pager .more) {
  font-weight: normal;
}
:deep(.el-pager .more:hover) {
  color: var(--highlight-color);
}

/* 底部導航按鈕區塊 */
.navigation-buttons {
  margin-bottom: 4rem;
  text-align: center;
}
.navigation-buttons .el-button {
  margin: 0 10px;
}
.navigation-buttons .el-button--info {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
.navigation-buttons .el-button--info:hover,
.navigation-buttons .el-button--info:active {
  background-color: var(--border-color);
  color: var(--text-primary);
}

/* 課程列表為空時的狀態區塊 */
.empty-courses-list-placeholder {
  margin-top: 20px;
  padding: 20px;
  background-color: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  text-align: center;
}
.empty-courses-list-placeholder :deep(.el-empty) {
  --el-empty-text-color: var(--text-secondary);
  --el-empty-fill-color: var(--border-color);
}

/* 響應式設計 */
@media (max-width: 992px) {
  .courses-section .course-card.new-style-card .course-image {
    height: 150px;
  }
  /* 平板下調整輪播高度 */
  .el-carousel[type="card"] {
    height: 250px !important;
  }
}

@media (max-width: 768px) {
  /* 在小屏幕下調整輪播高度和卡片样式 */
  .el-carousel[type="card"] {
    height: 200px !important; /* 进一步减小高度 */
  }
  .hot-course-card.testimonial-style-card {
    padding: 15px; /* 减小内边距 */
  }
  .hot-course-card .quote-icon {
    font-size: 2em; /* 减小图标大小 */
  }
  .hot-course-card .hot-course-name {
    font-size: 1.1em; /* 减小标题大小 */
  }
  .hot-course-card .hot-course-description,
  .hot-course-card .card-detail,
  .hot-course-card .author-name {
    font-size: 0.9em; /* 减小文字大小 */
  }
}

@media (max-width: 576px) {
  .health-platform.frontend-layout .container {
    padding: 0 15px;
  }
  .courses-section .course-card.new-style-card .course-image {
    height: 120px;
  }
  .course-search-form {
    flex-direction: column;
    align-items: stretch;
  }
  .course-search-form .el-form-item {
    width: 100%;
  }
  .course-search-form .el-form-item .el-select,
  .course-search-form .el-form-item .el-input {
    width: 100% !important;
  }
  /* 在更小屏幕下调整轮播高度和卡片样式 */
  .el-carousel[type="card"] {
    height: 180px !important; /* 进一步减小高度 */
  }
  .hot-course-card.testimonial-style-card {
    padding: 10px; /* 再次减小内边距 */
  }
  .hot-course-card .quote-icon {
    font-size: 1.8em; /* 再次减小图标大小 */
  }
  .hot-course-card .hot-course-name {
    font-size: 1em; /* 再次减小标题大小 */
  }
  .hot-course-card .hot-course-description,
  .hot-course-card .card-detail,
  .hot-course-card .author-name {
    font-size: 0.8em; /* 再次减小文字大小 */
  }
}
</style>
