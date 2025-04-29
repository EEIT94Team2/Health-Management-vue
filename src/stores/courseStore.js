import { defineStore } from 'pinia';
import axios from 'axios';
import { ElMessage } from 'element-plus';

// 定義 Pinia Store
export const useCourseStore = defineStore('course', {
  // State：儲存應用程式的狀態資料
  state: () => ({
    courses: [], // 儲存當前頁面顯示的課程列表 (已篩選且已分頁)
    totalCourses: 0, // 符合篩選條件的課程總數 (用於分頁)
    isLoading: false, // 載入狀態標記
    activeSearch: null, // 當前啟用的搜尋模式 ('byId', 'byName', 'byCoachId', 'byCoachName', null 表示顯示主要表格)

    // 各種搜尋模式的獨立狀態 (主要用於儲存輸入框的值和 performed 標記)
    searchById: {
      id: null, // 依 ID 查詢的輸入值
      course: null, // 依 ID 查詢到的單個課程結果 (不分頁)
      performed: false, // 是否已執行過依 ID 查詢
    },
    searchByName: {
      name: '', // 依名稱查詢的輸入值
      // courses: [], // <-- 移除這個狀態，數據統一存到 courses
      performed: false, // 是否已執行過依名稱查詢
    },
    searchByCoachId: {
      coachId: null, // 依教練 ID 查詢的輸入值
      // courses: [], // <-- 移除這個狀態，數據統一存到 courses
      performed: false, // 是否已執行過依教練 ID 查詢
    },
    searchByCoachName: {
      name: '', // 依教練名稱查詢的輸入值
      // courses: [], // <-- 移除這個狀態，數據統一存到 courses
      performed: false, // 是否已執行過依教練名稱查詢
    },

    // 分頁相關狀態 (由 Store 統一管理)
    currentPage: 1,
    pageSize: 10, // 每頁筆數預設值

    // 儲存當前表格篩選狀態 (主要用於主列表)
    currentTableFilter: {
      offersTrialOption: null, // null 表示無篩選, true/false 表示篩選體驗課
      dayOfWeek: null, // 儲存星期幾的篩選值 (0-6 或 null)
      fullness: null, // 新增 fullness 篩選狀態 ('full', 'notFull', null)
    },
  }),

  // Getters：從 State 計算衍生資料
  getters: {
    // 您可以在這裡添加根據 State 計算的 Getter
    // displayedCourses Getter 在元件中實現，因為它依賴 activeSearch 這個 Store 狀態，但在元件中更方便訪問
  },

  // Actions：執行非同步操作或修改 State 的方法
  actions: {
    // 重置所有搜尋相關的狀態 (不包含表格篩選，並清空主要課程列表和總數)
    resetSearchStates() {
      this.searchById = { id: null, course: null, performed: false };
      this.searchByName = { name: '', performed: false }; // 移除 courses []
      this.searchByCoachId = { coachId: null, performed: false }; // 移除 courses []
      this.searchByCoachName = { name: '', performed: false }; // 移除 courses []

      // 清空 Store 中的主要課程列表和總數
      this.courses = [];
      this.totalCourses = 0;

      // 重置分頁到第一頁 (通常在切換搜尋模式時發生)
      this.currentPage = 1;
    },

    // 清除表格篩選狀態
    clearTableFilterState() {
      this.currentTableFilter = {
        offersTrialOption: null,
        dayOfWeek: null,
        fullness: null, // 清空 fullness 篩選
      };
    },

    // 獲取課程列表 (支援分頁和表格篩選)
    // 此 Action 會使用 Store 中自身的 currentPage, pageSize, currentTableFilter
    async fetchCourses() {
      this.isLoading = true;

      try {
        // 構建 API 請求參數，使用 Store 中的分頁和篩選狀態
        const apiParams = {
          page: this.currentPage - 1, // 後端分頁通常從 0 開始
          size: this.pageSize, // 使用 Store 的 pageSize
        };

        // 如果有篩選條件，加入參數 (確保後端 API 支援這些參數)
        if (this.currentTableFilter.offersTrialOption !== null) {
          apiParams.offersTrialOption = this.currentTableFilter.offersTrialOption;
        }
        if (this.currentTableFilter.dayOfWeek !== null) {
          apiParams.dayOfWeek = this.currentTableFilter.dayOfWeek;
        }
        if (this.currentTableFilter.fullness !== null) {
          // 將前端 fullness 篩選值轉換為後端期望的參數名/值
          // 假設後端接受 fullness=full 或 fullness=notFull
          apiParams.fullness = this.currentTableFilter.fullness;
        }

        // *** 呼叫後端獲取課程列表的 API (支援分頁和篩選) ***
        // 假設後端 API 是 GET /api/courses 並支援 page, size, offersTrialOption, dayOfWeek, fullness 參數
        const res = await axios.get('/api/courses', {
          params: apiParams
        });

        // *** 處理後端回傳的數據，假設是 Page 物件結構 { content: [...], totalElements: ... } ***
        const responseData = res.data;

        if (responseData && Array.isArray(responseData.content)) { // 假設後端返回 Page 物件結構
          this.courses = responseData.content; // 更新當前頁的課程列表
          this.totalCourses = responseData.totalElements; // 更新符合篩選條件的總數
        } else {
          this.courses = [];
          this.totalCourses = 0;
          // 只有在不是手動清除或切換模式導致清空時才顯示錯誤
          // 如果需要更精確的錯誤判斷，可以添加更多條件
          if (this.activeSearch === null) { // 僅在主列表模式下顯示數據格式錯誤
            ElMessage.error("獲取課程列表數據格式錯誤。");
          }
        }

      } catch (error) {
        this.handleApiError(error, "獲取課程列表失敗");
        this.courses = [];
        this.totalCourses = 0;
      } finally {
        this.isLoading = false;
      }
    },

    // 依課程 ID 查詢 (不分頁，結果單個或 null)
    async searchCourseById() {
      this.isLoading = true;
      // 清空主要的課程列表和總數，以免混淆
      this.courses = [];
      this.totalCourses = 0;

      const courseId = this.searchById.id;
      // 檢查 ID 是否有效
      if (courseId === null || courseId === '' || courseId < 0) {
        ElMessage.warning("請輸入課程編號進行查詢。");
        this.isLoading = false;
        this.searchById.performed = true; // 標記已嘗試搜尋（但無效輸入）
        this.searchById.course = null; // 清空結果
        return;
      }

      try {
        // *** 呼叫後端依 ID 查詢的 API ***
        // 根據您的 Controller 定義，這是 GET /api/courses/{id}
        const res = await axios.get(`/api/courses/${courseId}`);

        // 假設後端回傳的資料結構是包含單個課程物件
        const courseData = res.data.data || res.data; // 嘗試從 data 屬性或直接獲取

        // 檢查回傳的資料是否是有效的課程物件
        if (courseData && typeof courseData === 'object' && courseData !== null) {
          this.searchById.course = courseData; // 設定依 ID 搜尋的結果
        } else {
          this.searchById.course = null; // 後端沒有返回有效的課程資料
        }
        this.searchById.performed = true; // 標記已執行搜尋

      } catch (error) {
        // 處理 404 Not Found 錯誤，表示找不到該 ID 的課程
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
          this.searchById.course = null; // 明確標記為找不到
          ElMessage.info(`找不到編號為 ${courseId} 的課程。`); // 在這裡顯示找不到的訊息
        } else {
          this.handleApiError(error, `依課程編號 ${courseId} 查詢失敗`);
          this.searchById.course = null; // 其他錯誤也清空結果
        }
        this.searchById.performed = true; // 標記已執行搜尋

      } finally {
        this.isLoading = false;
      }
    },

    // 依課程名稱查詢 (需要根據後端是否支援分頁來處理)
    // 此 Action 會使用 Store 中自身的 currentPage 和 pageSize
    async searchCourseByName() {
      this.isLoading = true;
      // 清空依 ID 搜尋的結果，以免混淆
      this.searchById.course = null;

      const courseName = this.searchByName.name;
      // 檢查名稱是否為空
      if (!courseName || courseName.trim() === '') {
        ElMessage.warning("請輸入課程名稱進行查詢。");
        this.isLoading = false;
        this.searchByName.performed = true; // 標記已嘗試搜尋（但無效輸入）
        this.courses = []; // 清空結果
        this.totalCourses = 0; // 設定總數為 0
        return;
      }

      try {
          // 構建 API 請求參數 (傳 name，如果後端支援分頁，也要傳 page 和 size)
          const apiParams = {
            name: courseName.trim(), // 傳遞名稱參數
            // 如果後端支援分頁，添加以下兩行
            page: this.currentPage - 1, // 使用 Store 的 currentPage
            size: this.pageSize, // 使用 Store 的 pageSize
          };

        // *** 呼叫後端依名稱查詢的 API ***
        // 假設後端 API 是 GET /api/courses/course_search 並支援 name 參數 (可能也支援 page, size)
        const res = await axios.get('/api/courses/course_search', {
          params: apiParams // 傳遞參數 (包括分頁參數，如果後端支援會使用，否則會忽略)
        });

        // *** 處理後端回傳的數據，更具彈性地提取數據 ***
        const responseData = res.data;
        let courseList = [];
        let totalElements = 0;

        // 嘗試從不同的響應結構中提取數據
        if (responseData && Array.isArray(responseData.content)) {
            // 如果是 Spring Data JPA Page 結構
            courseList = responseData.content;
            totalElements = responseData.totalElements;
        } else if (responseData && Array.isArray(responseData.data)) {
            // 如果是 { data: [...] } 結構
            courseList = responseData.data;
            totalElements = courseList.length; // 假設總數就是列表長度，或後端提供了總數在其他地方
        } else if (Array.isArray(responseData)) {
            // 如果是純粹的陣列 (假設後端未分頁，回傳所有結果)
            courseList = responseData;
            totalElements = courseList.length; // 總數就是列表長度

            // *** 在前端進行分頁切片 (僅當後端未分頁時) ***
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            courseList = courseList.slice(start, end); // 只取當前頁的數據
        } else {
            // 如果都不是預期格式
            this.courses = [];
            this.totalCourses = 0;
            this.searchByName.performed = true; // 標記已執行（但失敗）
            ElMessage.error("依課程名稱查詢數據格式錯誤，請檢查後端響應。"); // 提示更具體
            this.isLoading = false; // 確保停止載入
            return; // 提前返回
        }

        // *** 將提取到的數據設定到主要的 this.courses 和 this.totalCourses 狀態 ***
        this.courses = courseList; // 設定當前頁的課程列表
        this.totalCourses = totalElements; // 設定總數

        this.searchByName.performed = true; // 在成功獲取數據後設定為 true

      } catch (error) {
        this.handleApiError(error, `依課程名稱 '${courseName}' 查詢失敗`);
        this.courses = []; // 搜尋失敗，清空主要的課程列表
        this.totalCourses = 0; // 設定總數為 0
        this.searchByName.performed = true; // 在錯誤發生後設定為 true

      } finally {
        this.isLoading = false;
      }
    },

    // 依教練 ID 查詢 (需要根據後端是否支援分頁來處理)
    // 此 Action 會使用 Store 中自身的 currentPage 和 pageSize
    async searchCourseByCoachId() {
      this.isLoading = true;
      // 清空依 ID 搜尋的結果，以免混淆
      this.searchById.course = null;

      const coachId = this.searchByCoachId.coachId;

      // 檢查 coachId 有效性
      if (coachId === null || coachId === '' || coachId < 0) {
        ElMessage.warning("請輸入教練編號進行查詢。");
        this.isLoading = false;
        this.searchByCoachId.performed = true; // 標記已嘗試搜尋（但無效輸入）
        this.courses = []; // 清空結果
        this.totalCourses = 0; // 設定總數為 0
        return; // 輸入無效時直接返回
      }

      try {
          // 構建 API 請求參數，加入教練ID和分頁參數
          const apiParams = {
            coachId: coachId, // 傳遞教練 ID 參數
            page: this.currentPage - 1, // 使用 Store 的 currentPage
            size: this.pageSize, // 使用 Store 的 pageSize
          };

          // *** 呼叫後端依教練 ID 查詢的 API，並傳遞參數 ***
          // 假設後端 API 是 GET /api/courses/coach 並支援 coachId, page, size 參數並回傳 Page 物件
          const res = await axios.get('/api/courses/coach', {
            params: apiParams // 傳遞包含教練ID和分頁參數的 apiParams
          });

          // *** 處理後端回傳數據，假設是 Page 物件結構 { content: [...], totalElements: ... } ***
          const responseData = res.data;

          if (responseData && Array.isArray(responseData.content)) {
            // 更新 Store 的主要課程列表和總數狀態
            this.courses = responseData.content;
            this.totalCourses = responseData.totalElements;

          } else {
            // 處理數據格式不正確的情況
            this.courses = [];
            this.totalCourses = 0;
            ElMessage.error("依教練編號查詢數據格式錯誤。");
          }

          this.searchByCoachId.performed = true; // 標記已執行搜尋

      } catch (error) {
          // ... 錯誤處理邏輯 ...
          this.handleApiError(error, `依教練編號 ${coachId} 查詢失敗`);
          this.courses = [];
          this.totalCourses = 0;
          this.searchByCoachId.performed = true; // 在錯誤發生後標記已執行

      } finally {
          this.isLoading = false;
      }
  },

    // 依教練名字查詢 (需要根據後端是否支援分頁來處理)
    // 此 Action 會使用 Store 中自身的 currentPage 和 pageSize
    async searchCourseByCoachName() {
      this.isLoading = true;
      // 清空依 ID 搜尋的結果，以免混淆
      this.searchById.course = null;

      const coachName = this.searchByCoachName.name;
      // 檢查名稱是否為空
      if (!coachName || coachName.trim() === '') {
        ElMessage.warning("請輸入教練名稱進行查詢。");
        this.isLoading = false;
        this.searchByCoachName.performed = true; // 標記已嘗試搜尋（但無效輸入）
        this.courses = []; // 清空結果
        this.totalCourses = 0; // 設定總數為 0
        return;
      }

      try {
        // 構建 API 請求參數 (傳 coachName，如果後端支援分頁，也要傳 page 和 size)
        const apiParams = {
          coachName: coachName.trim(), // 傳遞教練名稱參數
          // 如果後端支援分頁，添加以下兩行
          page: this.currentPage - 1, // 使用 Store 的 currentPage
          size: this.pageSize, // 使用 Store 的 pageSize
        };

        // *** 呼叫後端依教練名稱查詢的 API ***
        // 假設後端 API 是 GET /api/courses/coach_search 並支援 coachName 參數 (可能也支援 page, size)
        const res = await axios.get('/api/courses/coach_search', {
          params: apiParams // 傳遞參數
        });

        // *** 處理後端回傳的數據，更具彈性地提取數據 ***
        const responseData = res.data;
        let courseList = [];
        let totalElements = 0;

        // 嘗試從不同的響應結構中提取數據
        if (responseData && Array.isArray(responseData.content)) {
            // 如果是 Spring Data JPA Page 結構
            courseList = responseData.content;
            totalElements = responseData.totalElements;
        } else if (responseData && Array.isArray(responseData.data)) {
            // 如果是 { data: [...] } 結構
            courseList = responseData.data;
            totalElements = courseList.length; // 假設總數就是列表長度，或後端提供了總數在其他地方
        } else if (Array.isArray(responseData)) {
            // 如果是純粹的陣列 (假設後端未分頁，回傳所有結果)
            courseList = responseData;
            totalElements = courseList.length; // 總數就是列表長度

            // *** 在前端進行分頁切片 (僅當後端未分頁時) ***
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            courseList = courseList.slice(start, end); // 只取當前頁的數據
        } else {
            // 如果都不是預期格式
            this.courses = [];
            this.totalCourses = 0;
            this.searchByCoachName.performed = true; // 標記已執行（但失敗）
            ElMessage.error("依教練名稱查詢數據格式錯誤，請檢查後端響應。"); // 提示更具體
            this.isLoading = false; // 確保停止載入
            return; // 提前返回
        }

        // *** 將提取到的數據設定到主要的 this.courses 和 this.totalCourses 狀態 ***
        this.courses = courseList; // 設定當前頁的課程列表
        this.totalCourses = totalElements; // 設定總數


        this.searchByCoachName.performed = true; // 在成功獲取數據後設定為 true

      } catch (error) {
        this.handleApiError(error, `依教練名稱 '${coachName}' 查詢失敗`);
        this.courses = []; // 搜尋失敗，清空主要的課程列表
        this.totalCourses = 0; // 設定總數為 0
        this.searchByCoachName.performed = true; // 在錯誤發生後設定為 true

      } finally {
        this.isLoading = false;
      }
    },


    // 通用的 API 錯誤處理方法
    handleApiError(error, defaultMessage) {
      console.error(defaultMessage, error); // 輸出詳細錯誤到控制台
      const errorMessage = error.response?.data?.message || error.message || defaultMessage + "，請檢查網絡或伺服器。";
      ElMessage.error(errorMessage);
      // 您可能還需要根據錯誤類型進行其他處理，例如 401 未授權時導向登入頁
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        console.warn("未授權操作，可能需要重新登入。");
        // 導向登入頁面的邏輯可以在這裡添加，例如：router.push('/login');
      }
    },

    // 設定表格篩選狀態的 Action
    setCurrentTableFilter(filterState) {
      // 使用展開運算符來合併新的篩選狀態，保持響應性
      this.currentTableFilter = { ...this.currentTableFilter, ...filterState };
    },

    // 新增 deleteCourse Action
        async deleteCourse(courseId) {
            this.isLoading = true; // 開始載入狀態
            try {
              // *** 呼叫後端刪除課程的 API ***
              // 假設後端 API 是 DELETE /api/courses/{id}
              const response = await axios.delete(`/api/courses/${courseId}`);
      
              console.log(`課程編號 ${courseId} 刪除成功`, response.data);
      
              // 刪除成功後，通常不需要在這裡直接修改 courses 陣列，
              // 您的 CourseList.vue 已經在 handleDelete 成功後呼叫了 fetchCourses 或對應的搜尋 Action 來重新載入列表，這是比較好的做法。
      
              this.isLoading = false; // 結束載入狀態
              return response.data; // 可以回傳 API 的回應數據
            } catch (error) {
              this.isLoading = false; // 結束載入狀態
              // 這裡呼叫 Store 中已定義的錯誤處理方法
              this.handleApiError(error, `刪除課程編號 ${courseId} 失敗`);
              // 為了讓元件中的 .catch 能夠捕捉到錯誤，需要重新拋出錯誤
              throw error;
            }
          },
      
  },
});