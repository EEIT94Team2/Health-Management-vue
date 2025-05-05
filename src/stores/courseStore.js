// useCourseStore.js

import { defineStore } from 'pinia';
import axios from 'axios';
import { ElMessage } from 'element-plus';

// 定義 Pinia Store
export const useCourseStore = defineStore('course', {
    // State：儲存應用程式的狀態資料 (保持不變)
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
            performed: false, // 是否已執行過依名稱查詢
        },
        searchByCoachId: {
            coachId: null, // 依教練 ID 查詢的輸入值
            performed: false, // 是否已執行過依教練 ID 查詢
        },
        searchByCoachName: {
            name: '', // 依教練名稱查詢的輸入值
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

    // Getters：從 State 計算衍生資料 (保持不變)
    getters: {
        // ...
    },

    // Actions：執行非同步操作或修改 State 的方法
    actions: {
        // 重置所有搜尋相關的狀態 (保持不變)
        resetSearchStates() {
            this.searchById = { id: null, course: null, performed: false };
            this.searchByName = { name: '', performed: false };
            this.searchByCoachId = { coachId: null, performed: false };
            this.searchByCoachName = { name: '', performed: false };

            this.courses = [];
            this.totalCourses = 0;
            this.currentPage = 1;
        },

        // 清除表格篩選狀態 (保持不變)
        clearTableFilterState() {
            this.currentTableFilter = {
                offersTrialOption: null,
                dayOfWeek: null,
                fullness: null,
            };
        },

        async fetchCourses() {
                         this.isLoading = true;
                         try {
                             console.log(`[Store] Fetching courses: Page ${this.currentPage}, Size ${this.pageSize}`); // 新增日誌
            
                             const apiParams = {
                                 page: this.currentPage - 1, // 後端使用 0-based index
                                 size: this.pageSize,
                             };
            
                             if (this.currentTableFilter.offersTrialOption !== null) {
                                 apiParams.offersTrialOption = this.currentTableFilter.offersTrialOption;
                             }
                             if (this.currentTableFilter.dayOfWeek !== null) {
                                 apiParams.dayOfWeek = this.currentTableFilter.dayOfWeek;
                             }
                             if (this.currentTableFilter.fullness !== null) {
                                 apiParams.fullness = this.currentTableFilter.fullness;
                             }
            
                             const res = await axios.get('/api/courses', {
                                 params: apiParams
                             });
            
                             // **** 新增日誌來檢查獲取到的數據結構和內容 ****
                             console.log("[Store] fetchCourses API response received:", res); // 打印完整的響應物件
                             console.log("[Store] fetchCourses response.data:", res.data); // 打印響應體數據
            
                             const responseData = res.data;
            
                             // 假設後端返回的分頁數據結構是 { content: [...], totalElements: ... }
                             // 或者直接返回課程列表 [...]
                             if (responseData && Array.isArray(responseData.content)) {
                                 this.courses = responseData.content;
                                 this.totalCourses = responseData.totalElements;
                                 console.log(`[Store] Fetched ${this.courses.length} courses. Total: ${this.totalCourses}`); // 新增日誌
                                 // 您可以在這裡選擇性地檢查每個課程的圖片列表，以確認數據中是否包含圖片
                                 console.log("[Store] Inspecting images for fetched courses:");
                                 this.courses.forEach(course => {
                                    if (course.images && course.images.length > 0) {
                                        console.log(`  Course ID ${course.id} has ${course.images.length} images. First image URL: ${course.images[0].imageUrl}`);
                                    } else {
                                        console.log(`  Course ID ${course.id} has no images or empty images array.`);
                                    }
                                 });
            
            
                             } else if (Array.isArray(responseData)) { // 處理後端直接返回列表而不是分頁物件的情況
                                 this.courses = responseData;
                                 this.totalCourses = responseData.length; // 在這種情況下 totalCourses 可能需要額外獲取
                                 console.log(`[Store] Fetched ${this.courses.length} courses (as list). Total: ${this.totalCourses}`); // 新增日誌
                                 // 檢查每個課程的圖片列表
                                 console.log("[Store] Inspecting images for fetched courses (list):");
                                 this.courses.forEach(course => {
                                    if (course.images && course.images.length > 0) {
                                        console.log(`  Course ID ${course.id} has ${course.images.length} images. First image URL: ${course.images[0].imageUrl}`);
                                    } else {
                                        console.log(`  Course ID ${course.id} has no images or empty images array.`);
                                    }
                                 });
            
                             } else {
                                 console.warn("[Store] fetchCourses received unexpected data format:", response.data); // 新增警告日誌
                                 this.courses = [];
                                 this.totalCourses = 0;
                                 // 只有在載入主列表時才顯示錯誤訊息
                                 if (this.activeSearch === null) {
                                     ElMessage.error("獲取課程列表數據格式錯誤。");
                                 }
                             }
            
                         } catch (error) {
                             this.isLoading = false;
                             console.error("[Store] Failed to fetch courses:", error); // 新增日誌
                             // 使用 handleApiError 或讓元件處理
                             this.handleApiError(error, "載入課程列表失敗"); // 假設 handleApiError 是定義在 Store 的 actions 中
                             // throw error; // 如果呼叫這個 action 的地方有 try...catch，則需要重新拋出錯誤
                         } finally {
                             this.isLoading = false;
                         }
                    },

        // 依課程 ID 查詢 (不分頁，結果單個或 null) (保持不變)
        async searchCourseById() {
            // ... 原始 searchCourseById 邏輯 ...
             this.isLoading = true;
             this.courses = [];
             this.totalCourses = 0;

             const courseId = this.searchById.id;
             if (courseId === null || courseId === '' || courseId < 0) {
                 ElMessage.warning("請輸入課程編號進行查詢。");
                 this.isLoading = false;
                 this.searchById.performed = true;
                 this.searchById.course = null;
                 return;
             }

             try {
                 const res = await axios.get(`/api/courses/${courseId}`);
                 const courseData = res.data.data || res.data;

                 if (courseData && typeof courseData === 'object' && courseData !== null) {
                     this.searchById.course = courseData;
                 } else {
                     this.searchById.course = null;
                 }
                 this.searchById.performed = true;

             } catch (error) {
                 if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
                     this.searchById.course = null;
                     ElMessage.info(`找不到編號為 ${courseId} 的課程。`);
                 } else {
                     this.handleApiError(error, `依課程編號 ${courseId} 查詢失敗`);
                     this.searchById.course = null;
                 }
                 this.searchById.performed = true;

             } finally {
                 this.isLoading = false;
             }
        },

        // 依課程名稱查詢 (保持不變)
        async searchCourseByName() {
            // ... 原始 searchCourseByName 邏輯 ...
             this.isLoading = true;
             this.searchById.course = null;

             const courseName = this.searchByName.name;
             if (!courseName || courseName.trim() === '') {
                 ElMessage.warning("請輸入課程名稱進行查詢。");
                 this.isLoading = false;
                 this.searchByName.performed = true;
                 this.courses = [];
                 this.totalCourses = 0;
                 return;
             }

             try {
                 const apiParams = {
                     name: courseName.trim(),
                     page: this.currentPage - 1,
                     size: this.pageSize,
                 };

                 const res = await axios.get('/api/courses/course_search', {
                     params: apiParams
                 });

                 const responseData = res.data;
                 let courseList = [];
                 let totalElements = 0;

                 if (responseData && Array.isArray(responseData.content)) {
                     courseList = responseData.content;
                     totalElements = responseData.totalElements;
                 } else if (responseData && Array.isArray(responseData.data)) {
                     courseList = responseData.data;
                     totalElements = courseList.length;
                 } else if (Array.isArray(responseData)) {
                     courseList = responseData;
                     totalElements = courseList.length;
                     const start = (this.currentPage - 1) * this.pageSize;
                     const end = start + this.pageSize;
                     courseList = courseList.slice(start, end);
                 } else {
                     this.courses = [];
                     this.totalCourses = 0;
                     this.searchByName.performed = true;
                     ElMessage.error("依課程名稱查詢數據格式錯誤，請檢查後端響應。");
                     this.isLoading = false;
                     return;
                 }

                 this.courses = courseList;
                 this.totalCourses = totalElements;
                 this.searchByName.performed = true;

             } catch (error) {
                 this.handleApiError(error, `依課程名稱 '${courseName}' 查詢失敗`);
                 this.courses = [];
                 this.totalCourses = 0;
                 this.searchByName.performed = true;
             } finally {
                 this.isLoading = false;
             }
        },

        // 依教練 ID 查詢 (保持不變)
        async searchCourseByCoachId() {
            // ... 原始 searchCourseByCoachId 邏輯 ...
             this.isLoading = true;
             this.searchById.course = null;

             const coachId = this.searchByCoachId.coachId;

             if (coachId === null || coachId === '' || coachId < 0) {
                 ElMessage.warning("請輸入教練編號進行查詢。");
                 this.isLoading = false;
                 this.searchByCoachId.performed = true;
                 this.courses = [];
                 this.totalCourses = 0;
                 return;
             }

             try {
                 const apiParams = {
                     coachId: coachId,
                     page: this.currentPage - 1,
                     size: this.pageSize,
                 };

                 const res = await axios.get('/api/courses/coach', {
                     params: apiParams
                 });

                 const responseData = res.data;

                 if (responseData && Array.isArray(responseData.content)) {
                     this.courses = responseData.content;
                     this.totalCourses = responseData.totalElements;
                 } else {
                     this.courses = [];
                     this.totalCourses = 0;
                     ElMessage.error("依教練編號查詢數據格式錯誤。");
                 }

                 this.searchByCoachId.performed = true;

             } catch (error) {
                 this.handleApiError(error, `依教練編號 ${coachId} 查詢失敗`);
                 this.courses = [];
                 this.totalCourses = 0;
                 this.searchByCoachId.performed = true;
             } finally {
                 this.isLoading = false;
             }
        },


        // 依教練名字查詢 (保持不變)
        async searchCourseByCoachName() {
            // ... 原始 searchCourseByCoachName 邏輯 ...
             this.isLoading = true;
             this.searchById.course = null;

             const coachName = this.searchByCoachName.name;
             if (!coachName || coachName.trim() === '') {
                 ElMessage.warning("請輸入教練名稱進行查詢。");
                 this.isLoading = false;
                 this.searchByCoachName.performed = true;
                 this.courses = [];
                 this.totalCourses = 0;
                 return;
             }

             try {
                 const apiParams = {
                     coachName: coachName.trim(),
                     page: this.currentPage - 1,
                     size: this.pageSize,
                 };

                 const res = await axios.get('/api/courses/coach_search', {
                     params: apiParams
                 });

                 const responseData = res.data;
                 let courseList = [];
                 let totalElements = 0;

                 if (responseData && Array.isArray(responseData.content)) {
                     courseList = responseData.content;
                     totalElements = responseData.totalElements;
                 } else if (responseData && Array.isArray(responseData.data)) {
                     courseList = responseData.data;
                     totalElements = courseList.length;
                 } else if (Array.isArray(responseData)) {
                     courseList = responseData;
                     totalElements = courseList.length;
                     const start = (this.currentPage - 1) * this.pageSize;
                     const end = start + this.pageSize;
                     courseList = courseList.slice(start, end);
                 } else {
                     this.courses = [];
                     this.totalCourses = 0;
                     this.searchByCoachName.performed = true;
                     ElMessage.error("依教練名稱查詢數據格式錯誤，請檢查後端響應。");
                     this.isLoading = false;
                     return;
                 }

                 this.courses = courseList;
                 this.totalCourses = totalElements;
                 this.searchByCoachName.performed = true;

             } catch (error) {
                 this.handleApiError(error, `依教練名稱 '${coachName}' 查詢失敗`);
                 this.courses = [];
                 this.totalCourses = 0;
                 this.searchByCoachName.performed = true;
             } finally {
                 this.isLoading = false;
             }
        },



                // 通用的 API 錯誤處理方法
                handleApiError(error, defaultMessage) {
                    console.error(defaultMessage, error);
                    // 嘗試從 error.response.data 中獲取後端詳細錯誤訊息
                    const backendErrorMessage = error.response?.data?.message || error.response?.data?.error || (typeof error.response?.data === 'string' ? error.response.data : null);
                    const errorMessage = backendErrorMessage || error.message || defaultMessage + "，請檢查網絡或伺服器。";
        
                    ElMessage.error(errorMessage);
        
                     if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
                         console.warn("未授權操作，可能需要重新登入。");
                         // 如果需要自動跳轉登入，這裡可以發出一個事件或使用 Pinia 另一個 Store 進行處理
                         // 通常不在這個通用的 API 錯誤處理直接進行路由跳轉，而是讓調用者處理特定狀態碼
                     }
                },

        // 設定表格篩選狀態的 Action (保持不變)
        setCurrentTableFilter(filterState) {
            this.currentTableFilter = { ...this.currentTableFilter, ...filterState };
        },

        // deleteCourse Action (保持不變)
        async deleteCourse(courseId) {
             this.isLoading = true;
             try {
                 const response = await axios.delete(`/api/courses/${courseId}`);
                 console.log(`課程編號 ${courseId} 刪除成功`, response.data);
                 this.isLoading = false;
                 return response.data;
             } catch (error) {
                 this.isLoading = false;
                //  this.handleApiError(error, `刪除課程編號 ${courseId} 失敗`);
                 throw error; // 重新拋出錯誤
             }
        },

        // *** 新增 Action: 根據課程 ID 查詢其所在頁碼 ***
        // 需要後端提供對應的 API 接口
        async findCoursePageIndex(courseId) {
            console.log(`Store: 嘗試查詢課程 ID ${courseId} 所在的頁碼...`);
            this.isLoading = true; // 標記載入狀態 (雖然這個請求可能很快，但邏輯上仍是載入過程的一部分)

            // 確保 ID 是數字
            const idNum = parseInt(courseId);
            if (isNaN(idNum)) {
                 console.warn(`Store: 無效的課程 ID ${courseId}，無法查詢頁碼。`);
                 this.isLoading = false;
                 return -1; // 返回一個無效的標記
            }

            try {
                // *** 構建 API 請求參數 ***
                // 需要將當前應用在列表上的所有搜尋和篩選條件都傳遞給後端
                // 這樣後端才能在正確的數據集範圍內計算頁碼
                const apiParams = {
                    courseId: idNum, // 要查詢的課程 ID
                    pageSize: this.pageSize, // 每頁大小 (後端計算頁碼需要知道這個)
                    // *** 根據 activeSearch 狀態添加對應的搜尋參數 ***
                    ...(this.activeSearch === 'byName' && { name: this.searchByName.name }),
                    ...(this.activeSearch === 'byCoachId' && { coachId: this.searchByCoachId.coachId }),
                    ...(this.activeSearch === 'byCoachName' && { coachName: this.searchByCoachName.name }),
                    // *** 根據 currentTableFilter 狀態添加對應的篩選參數 ***
                    ...(this.currentTableFilter.offersTrialOption !== null && { offersTrialOption: this.currentTableFilter.offersTrialOption }),
                    ...(this.currentTableFilter.dayOfWeek !== null && { dayOfWeek: this.currentTableFilter.dayOfWeek }),
                    ...(this.currentTableFilter.fullness !== null && { fullness: this.currentTableFilter.fullness }),
                    // 注意：如果是 activeSearch === 'byId' 模式，這個 Action 不應該被呼叫，
                    // 因為依 ID 查詢只有一個結果，不需要分頁和找頁碼。
                    // 在元件中呼叫這個 Action 時需要判斷 activeSearch !== 'byId'。
                };

                // *** 呼叫後端新接口來查詢頁碼 ***
                // 假設後端提供一個接口，例如 GET /api/courses/find-page
                // 該接口接收 courseId 和其他篩選/搜尋參數，並返回該課程所在的 0-based 頁碼。
                // 例如，返回 { pageIndex: 2 }
                const res = await axios.get('/api/courses/find-page', {
                    params: apiParams
                });

                // *** 處理後端響應，提取頁碼 ***
                // 假設後端返回的數據結構是 { pageIndex: number }
                const responseData = res.data;
                let pageIndex = -1; // 預設無效頁碼

                if (responseData && typeof responseData.pageIndex === 'number' && responseData.pageIndex >= 0) {
                    pageIndex = responseData.pageIndex;
                    console.log(`Store: 課程 ID ${idNum} 位於 0-based 頁碼 ${pageIndex}`);
                } else if (responseData && typeof responseData === 'number' && responseData >= 0) {
                     // 如果後端直接返回頁碼數字
                     pageIndex = responseData;
                     console.log(`Store: 課程 ID ${idNum} 位於 0-based 頁碼 ${pageIndex} (後端直接返回數字)`);
                }
                else {
                    console.warn(`Store: 後端返回的數據格式不正確或未找到頁碼。`, responseData);
                    ElMessage.info(`無法確定課程 ID ${idNum} 所在的頁面。`);
                }


                this.isLoading = false; // 結束載入狀態
                return pageIndex; // 返回查詢到的 0-based 頁碼，如果找不到則返回 -1

            } catch (error) {
                this.isLoading = false; // 結束載入狀態

                // 如果後端返回 404，表示在當前篩選/搜尋條件下找不到該課程
                if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
                     ElMessage.info(`在當前篩選條件下找不到課程 ID ${idNum}。`);
                     console.log(`Store: 後端報告課程 ID ${idNum} 在當前條件下找不到 (404)。`);
                     return -1; // 返回無效頁碼
                } else {
                    // 其他錯誤，使用通用錯誤處理
                    this.handleApiError(error, `查詢課程 ID ${idNum} 所在頁碼失敗`);
                    throw error; // 重新拋出錯誤，讓元件可以捕捉
                }
            }
        },
    },
});