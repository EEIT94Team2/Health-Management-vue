<template>
  <div>
    <h3>{{ isEdit ? "編輯課程" : "新增課程" }}</h3>
    <el-form
      :model="form"
      :rules="rules"
      ref="courseFormRef"
      label-width="120px"
      status-icon
    >
      <el-form-item label="課程名稱：" prop="name">
        <el-input
          v-model="form.name"
          placeholder="請輸入課程名稱"
          style="width: 300px"
        />
      </el-form-item>
      <el-form-item label="課程內容：" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="請輸入課程內容"
          style="width: 300px"
        />
      </el-form-item>

      <el-form-item label="星期：" prop="dayOfWeek">
        <el-select
          v-model="form.dayOfWeek"
          placeholder="請選擇星期"
          style="width: 150px"
        >
          <el-option label="星期日" :value="0"></el-option>
          <el-option label="星期一" :value="1"></el-option>
          <el-option label="星期二" :value="2"></el-option>
          <el-option label="星期三" :value="3"></el-option>
          <el-option label="星期四" :value="4"></el-option>
          <el-option label="星期五" :value="5"></el-option>
          <el-option label="星期六" :value="6"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="時間：" prop="startTime">
        <el-time-picker
          v-model="form.startTime"
          placeholder="選擇時間"
          format="HH:mm"
          value-format="HH:mm:ss"
          style="width: 150px"
        />
      </el-form-item>

      <el-form-item label="時長（分）：" prop="duration">
        <el-input-number
          v-model="form.duration"
          :min="1"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="課程人數：" prop="maxCapacity">
        <el-input-number
          v-model="form.maxCapacity"
          :min="1"
          style="width: 150px"
        />
      </el-form-item>

      <el-form-item label="教練：" prop="coachId">
        <el-select
          v-model="form.coachId"
          placeholder="請選擇教練"
          style="width: 200px"
          filterable
          clearable
          :loading="fetchingCoaches"
        >
          <el-option
            v-for="coach in coaches"
            :key="coach.id"
            :label="`${coach.name}（ID：${coach.id}）`"
            :value="coach.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="是否為體驗課：" prop="offersTrialOption">
        <el-switch v-model="form.offersTrialOption"></el-switch>
      </el-form-item>

      <el-form-item
        v-if="form.offersTrialOption"
        label="體驗課程人數："
        prop="maxTrialCapacity"
      >
        <el-input-number
          v-model="form.maxTrialCapacity"
          :min="0"
          style="width: 150px"
        />
      </el-form-item>

      <el-form-item label="課程圖片：">
        <el-upload
          v-model:file-list="fileList"
          :action="'/api/upload/image'"
          list-type="picture-card"
          :on-success="handleUploadSuccess"
          :on-remove="handleRemove"
          :before-upload="beforeUpload"
          multiple
          accept="image/*"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <div v-if="form.images.length > 0" style="margin-top: 10px">
          <span style="font-size: 0.9em; color: #606266"
            >已上傳圖片數量：{{ form.images.length }}</span
          >
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElButton,
  ElMessage,
  ElSelect,
  ElOption,
  ElTimePicker,
  ElSwitch,
  ElMessageBox,
  ElUpload,
  ElIcon,
} from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import axios from "axios";

const router = useRouter();

const props = defineProps({
  courseId: {
    type: Number,
    default: null,
  },
});

const isEdit = computed(() => !!props.courseId);

const form = ref({
  name: "",
  description: "",
  dayOfWeek: null,
  startTime: null,
  duration: 60,
  maxCapacity: 10,
  coachId: null,
  offersTrialOption: false,
  maxTrialCapacity: null,
  images: [],
});

// ====== START: 添加圖片處理相關的數據和方法 ======
const fileList = ref([]); // 用於 ElUpload 的檔案列表，格式與 ElUpload 要求一致

// ====== 添加圖片處理相關的數據和方法 ======
// ... 其他數據和方法 ...

// 圖片上傳成功時觸發
// response: 後端 API 返回的數據 (應該是 { url: '...', id: ... } 格式)
// uploadFile: 當前上傳的檔案信息
// fileList: 所有正在上傳或已上傳的檔案列表
const handleUploadSuccess = (response, uploadFile, fileList) => {
  console.log(">>> CourseForm: handleUploadSuccess executed");
  console.log(
    ">>> CourseForm: Received backend response (raw parameter):",
    response
  );
  console.log(">>> CourseForm: Received fileList parameter:", fileList);

  // 檢查 response 是否是物件，並且包含 'url' 屬性
  if (response && typeof response === "object" && response.url) {
    const imageUrlFromBackend = response.url; // 從 response.url 讀取 URL
    const imageIdFromBackend = response.id || null; // 從 response.id 讀取 ID (如果後端有返回)

    if (!imageUrlFromBackend || typeof imageUrlFromBackend !== "string") {
      console.error(
        ">>> CourseForm: Image upload failed - Invalid URL data received from backend.",
        response
      );
      ElMessage.error(`${uploadFile.name} 上傳失敗：後端返回的圖片 URL 無效。`);
      // 移除預覽 (這裡 fileList 是參數，直接修改它)
      const index = fileList.findIndex((f) => f.uid === uploadFile.uid);
      if (index > -1) {
        fileList.splice(index, 1); // 直接修改傳入的 fileList 陣列參數
      }
      return;
    }

    // 構建用於 form.value.images 的圖片物件
    const newImage = {
      id: imageIdFromBackend, // 使用從後端獲取的 ID
      imageUrl: imageUrlFromBackend, // 使用從後端獲取的 URL
      imageOrder:
        form.value.images.length > 0
          ? Math.max(...form.value.images.map((img) => img.imageOrder || 0)) + 1
          : 0,
    };

    // 將新圖片資訊添加到用於提交的 form 數據中
    form.value.images.push(newImage);
    ElMessage.success(`${uploadFile.name} 上傳成功！`);
    console.log(
      ">>> CourseForm: Image uploaded successfully, added to form.images:",
      newImage
    );

    // **更新傳入的 fileList 參數中的對應項目**
    const uploadedFileInListIndex = fileList.findIndex(
      (f) => f.uid === uploadFile.uid
    );
    if (uploadedFileInListIndex > -1) {
      // 更新 fileList 參數中的對應項目屬性
      fileList[uploadedFileInListIndex].url = imageUrlFromBackend; // 更新 url
      fileList[uploadedFileInListIndex].id = imageIdFromBackend; // 存儲 ID (可選)
      fileList[uploadedFileInListIndex].imageOrder = newImage.imageOrder; // 存儲排序 (可選)
      fileList[uploadedFileInListIndex].status = "success"; // 確保狀態正確

      console.log(
        ">>> CourseForm: Updated item within fileList parameter:",
        fileList[uploadedFileInListIndex]
      );

      // **** 修正後的強制更新 fileList.value ref 的方法 ****
      // 將更新後的 fileList 參數陣列賦值回 fileList.value ref
      // 使用 Array.from() 創建一個新的陣列實例並賦值，以確保響應性被觸發
      fileList.value = Array.from(fileList); // <-- 修正這裡：使用 Array.from
      console.log(
        ">>> CourseForm: Reassigned fileList.value with Array.from copy from parameter."
      );
      // ****************************************************

      nextTick(() => {
        console.log(
          ">>> CourseForm: nextTick executed after fileList update and reassign."
        );
        console.log(
          ">>> CourseForm: Current fileList.value after nextTick:",
          fileList.value
        ); // 再次檢查 fileList.value 的值
      });
    }
  } else {
    console.error(
      ">>> CourseForm: Image upload failed - Invalid response format or missing 'url' data.",
      response
    );
    ElMessage.error(
      `${uploadFile.name} 上傳失敗：後端響應無效或缺少圖片 URL 資訊 (缺少 'url' 屬性)。`
    );
    const index = fileList.findIndex((f) => f.uid === uploadFile.uid);
    if (index > -1) {
      fileList.splice(index, 1);
    }
  }
};
// ====== END: 添加圖片處理相關的數據和方法 ======

// 移除圖片時觸發
// uploadFile: 當前移除的檔案信息
// fileList: 移除後的剩餘檔案列表 (ElUpload 自動更新後的列表)
const handleRemove = (uploadFile, fileList) => {
  console.log(
    ">>> CourseForm: handleRemove executed for file:",
    uploadFile.name
  );
  // 根據檔案的唯一標識 (uid 或其他屬性，例如從後端返回的圖片 URL 或 ID)
  // 在 form.value.images 中找到並移除對應的圖片資料
  // 注意：這裡的 fileList 參數是 ElUpload 內部更新後的列表，通常用於同步 form.value.images
  const index = form.value.images.findIndex(
    (img) =>
      (img.id && uploadFile.id && img.id === uploadFile.id) || // 優先根據 ID 匹配
      (img.imageUrl && uploadFile.url && img.imageUrl === uploadFile.url) || // 根據 URL 匹配 (fallback)
      (img.uid && uploadFile.uid && img.uid === uploadFile.uid) // 如果圖片對象有 uid 也可以用 uid 匹配
  );

  if (index > -1) {
    const removedImage = form.value.images.splice(index, 1)[0]; // 從用於提交的 form 數據中移除
    console.log(
      ">>> CourseForm: Removed image from form.images:",
      removedImage
    );
    // logger.info(`圖片 ${uploadFile.name} 已從列表中移除。`); // 如果沒有 logger，請替換
  } else {
    console.warn(
      ">>> CourseForm: Could not find image in form.images to remove for file:",
      uploadFile.name
    );
  }
  // 注意：這裡不需要顯式修改 fileList.value，因為 ElUpload 會通過 v-model 自動更新
};

// 在 beforeUpload 函數中加入更多日誌
const beforeUpload = (rawFile) => {
  console.log(">>> CourseForm: beforeUpload executed for file:", rawFile.name);
  const isImage = rawFile.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("只能上傳圖片檔案!");
    console.log(">>> CourseForm: beforeUpload failed: Not an image.");
    return false; // <-- 如果這裡返回 false，預覽和上傳都會中止
  }
  const isLt5M = rawFile.size / 1024 / 1024 < 5; // 範例：限制大小在 5MB 以下
  if (!isLt5M) {
    ElMessage.error("圖片檔案大小不能超過 5MB!");
    console.log(">>> CourseForm: beforeUpload failed: File too large.");
    return false; // <-- 如果這裡返回 false，預覽和上傳都會中止
  }
  console.log(">>> CourseForm: beforeUpload passed.");
  return true; // 返回 true 繼續上傳和預覽
};

const resetForm = () => {
  console.log(">>> CourseForm: resetForm executed.");
  form.value = {
    name: "",
    description: "",
    dayOfWeek: null,
    startTime: null,
    duration: 60,
    maxCapacity: 10,
    coachId: null,
    offersTrialOption: false,
    maxTrialCapacity: null,
    images: [], // <<<< 重置時清空圖片列表 >>>>
  };
  fileList.value = []; // <<<< 重置時清空 ElUpload 的檔案列表 >>>>
  if (courseFormRef.value) {
    courseFormRef.value.resetFields();
  }
};

const rules = reactive({
  // ... 原有的驗證規則
  name: [{ required: true, message: "請輸入課程名稱", trigger: "blur" }],
  description: [],
  dayOfWeek: [
    { required: true, message: "請選擇星期", trigger: "change" },
    { type: "number", message: "星期格式不正確", trigger: "change" },
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined) {
          callback(new Error("請選擇星期"));
        } else if (typeof value !== "number" || value < 0 || value > 6) {
          callback(new Error("星期範圍不正確 (0-6)"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  startTime: [{ required: true, message: "請選擇開始時間", trigger: "change" }],
  duration: [
    { required: true, message: "請輸入時長（分鐘）", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === "") {
          callback(new Error("請輸入時長（分鐘）"));
        } else if (typeof value !== "number" || isNaN(value)) {
          callback(new Error("時長必須是有效的數字"));
        } else if (value < 1) {
          callback(new Error("時長必須大於 0"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  maxCapacity: [
    { required: true, message: "請輸入課程人數", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === "") {
          callback(new Error("請輸入課程人數"));
        } else if (typeof value !== "number" || isNaN(value)) {
          callback(new Error("課程人數必須是有效的數字"));
        } else if (value < 1) {
          callback(new Error("課程人數必須大於 0"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  coachId: [
    { required: true, message: "請選擇教練", trigger: "change" },
    { type: "number", message: "教練編號格式不正確", trigger: "change" },
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === "") {
          callback(new Error("請選擇教練"));
        } else if (typeof value !== "number") {
          callback(new Error("教練編號格式不正確"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  maxTrialCapacity: [
    {
      validator: (rule, value, callback) => {
        if (form.value.offersTrialOption) {
          if (value === null || value === undefined || value === "") {
            callback(new Error("請輸入體驗課程人數"));
          } else if (typeof value !== "number" || isNaN(value) || value < 0) {
            callback(new Error("體驗課程人數必須是大於等於 0 的數字"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  // 您可能需要為圖片列表添加驗證規則，例如至少上傳一張圖片
  // images: [{ required: true, message: "請上傳至少一張課程圖片", trigger: "change" }], // 範例，需要根據實際情況調整驗證邏輯
});

const courseFormRef = ref(null);
const coaches = ref([]);
const fetchingCoaches = ref(false);

const fetchCoaches = async () => {
  console.log(">>> CourseForm: fetchCoaches executed.");
  fetchingCoaches.value = true;
  try {
    const res = await axios.get("/api/users/coaches");
    const coachList = res.data.data || res.data;
    coaches.value = Array.isArray(coachList) ? coachList : [];
    console.log(
      ">>> CourseForm: Coaches fetched successfully.",
      coaches.value.length,
      "coaches found."
    );
  } catch (error) {
    coaches.value = [];
    handleApiError(error, "獲取教練列表失敗");
    console.error(">>> CourseForm: Error fetching coaches:", error);
  } finally {
    fetchingCoaches.value = false;
  }
};

// 當 courseId 改變時，獲取課程詳情並填充表單（包括圖片）
const fetchCourse = async (id) => {
  console.log(">>> CourseForm: fetchCourse executed for ID:", id);
  if (id === null || id === undefined) {
    resetForm(); // 如果沒有 ID，重置表單
    console.log(
      ">>> CourseForm: courseId is null or undefined, resetting form."
    );
    return;
  }
  try {
    const response = await axios.get(`/api/courses/${id}`);
    const courseData = response.data.data || response.data;
    console.log(
      ">>> CourseForm: Course data fetched for ID",
      id,
      ":",
      courseData
    );

    if (!courseData || typeof courseData !== "object") {
      ElMessage.error("獲取課程詳情數據失敗。");
      console.error(
        ">>> CourseForm: Failed to fetch course details - invalid data format."
      );
      return;
    }

    nextTick(() => {
      form.value = {
        id: courseData.id, // 添加 ID
        name: courseData.name || "",
        description: courseData.description || "",
        dayOfWeek: courseData.dayOfWeek ?? null,
        startTime: courseData.startTime ?? null, // 確保格式匹配 ElTimePicker value-format
        duration: courseData.duration ?? 60,
        maxCapacity: courseData.maxCapacity ?? 10,
        coachId: courseData.coachId ?? null,
        offersTrialOption: courseData.offersTrialOption ?? false,
        maxTrialCapacity: courseData.maxTrialCapacity ?? null,
        images: courseData.images || [], // 將後端圖片數據賦值給 form.images
      };
      console.log(">>> CourseForm: Form data populated:", form.value);

      // 將後端返回的圖片數據轉換為 ElUpload 的 file-list 格式以顯示預覽
      // ElUpload 的 file-list 每個物件通常需要 name, url, status (設置為 'success'), uid
      // 在 fetchCourse 函數中
      // 在 fetchCourse 函數中
      fileList.value = form.value.images.map((img) => {
        let directImageUrl = img.imageUrl;

        // 簡單判斷是否為 Imgur 頁面 URL，並嘗試轉換
        if (
          typeof img.imageUrl === "string" &&
          img.imageUrl.startsWith("https://imgur.com/")
        ) {
          // 提取 Imgur ID，例如從 "https://imgur.com/esVHLFd" 中提取 "esVHLFd"
          const imgurId = img.imageUrl.split("/").pop();
          if (imgurId) {
            // 嘗試構建可能的直接 URL，這裡假設是 .jpg，可能需要根據實際情況調整
            directImageUrl = `https://i.imgur.com/${imgurId}.jpg`; // <-- 嘗試 .jpg
            // 或者您可以嘗試其他常見副檔名如 .png
            // 注意：這裡無法百分之百確定正確副檔名，可能需要後端提供或進行額外檢查
          }
        }
        // 如果 img.imageUrl 本身就是其他有效的圖片 URL，則保持原樣

        // console.log(`>>> CourseForm: Converting Imgur URL. Original: ${img.imageUrl}, Converted: ${directImageUrl}`); // 偵錯用

        return {
          name: `image_${img.id || Date.now()}`,
          url: directImageUrl, // <--- 使用轉換或原有的 URL
          status: "success",
          uid: img.id || Date.now(),
          id: img.id,
          imageOrder: img.imageOrder,
        };
      });

      // 您也需要在 handleUploadSuccess 中對後端返回的圖片 URL 做類似的處理

      console.log(
        ">>> CourseForm: fileList populated from images:",
        fileList.value
      );
    });
  } catch (error) {
    handleApiError(error, "獲取課程資訊失敗");
    console.error(">>> CourseForm: Error fetching course:", error);
    // 如果獲取失敗，清空表單和圖片列表
    resetForm();
  }
};

watch(
  () => props.courseId,
  (newCourseId) => {
    console.log(">>> CourseForm: courseId prop changed:", newCourseId);
    if (newCourseId !== null && newCourseId !== undefined) {
      fetchCourse(newCourseId);
    } else {
      resetForm();
    }
  },
  { immediate: true } // 組件載入時立即執行一次
);

const handleApiError = (error, defaultMessage) => {
  console.error(">>> CourseForm: handleApiError executed:", error);
  const errorMessage =
    error.response?.data?.message ||
    error.message ||
    defaultMessage + "，請檢查網絡連接或服務器。";
  ElMessage.error(errorMessage);
};

onMounted(() => {
  console.log(">>> CourseForm: onMounted executed.");
  fetchCoaches();
  // 如果是編輯模式，watch 已經會觸發 fetchCourse
  // 如果是新增模式，resetForm 會被呼叫，不需要額外獲取課程詳情
});

const emit = defineEmits(["submit-success", "cancel"]);

// 定義 validateForm 方法
const validateForm = async () => {
  console.log(">>> CourseForm: validateForm executed");
  if (!courseFormRef.value) {
    console.warn(">>> CourseForm: courseFormRef 未初始化。");
    return false;
  }
  try {
    const isValid = await courseFormRef.value.validate();
    console.log(">>> CourseForm: Element Plus 表單驗證結果:", isValid);
    return isValid;
  } catch (error) {
    console.error(">>> CourseForm: 表單驗證失敗:", error);
    return false;
  }
};

// 定義 submitForm 方法
const submitForm = async () => {
  console.log(">>> CourseForm: submitForm executed");
  // 提交前再次進行表單驗證
  const isValid = await validateForm();
  if (!isValid) {
    console.warn(">>> CourseForm: 表單驗證失敗，無法提交。");
    ElMessage.warning("請檢查表單中的錯誤。");
    return; // 如果驗證失敗，中止提交
  }

  const payload = {
    // 編輯模式下包含 ID，新增模式下不包含
    ...(isEdit.value && { id: props.courseId }),
    ...form.value, // startTime 確保格式正確
    startTime: form.value.startTime,
    // maxTrialCapacity 如果不提供體驗選項，後端期望為 null
    maxTrialCapacity: form.value.offersTrialOption
      ? form.value.maxTrialCapacity
      : null,
    // 確保 images 列表包含在 payload 中並格式正確
    // 只傳遞後端所需的圖片信息 (id, imageUrl, imageOrder)
    images: form.value.images.map((img) => ({
      id: img.id, // 編輯時保留 id，新增時可能為 null
      imageUrl: img.imageUrl,
      imageOrder: img.imageOrder, // 使用前端維護的排序
    })),
  };

  try {
    console.log(">>> CourseForm: Submitting form with payload:", payload);
    let response;
    if (isEdit.value) {
      response = await axios.put(`/api/courses/${props.courseId}`, payload);
      ElMessage.success("課程更新成功！");
      console.log(">>> CourseForm: Update successful.");
    } else {
      response = await axios.post("/api/courses", payload);
      ElMessage.success("課程新增成功！");
      console.log(
        ">>> CourseForm: Create successful, response:",
        response.data
      );
    }
    console.log(">>> CourseForm: Emitting submit-success event.");
    emit("submit-success", response.data); // 觸發提交成功事件，並傳遞響應數據
  } catch (error) {
    handleApiError(error, isEdit.value ? "課程更新失敗" : "課程新增失敗");
    console.error(">>> CourseForm: Submission API error:", error);
  }
};

// 暴露方法和數據給父組件使用
defineExpose({
  courseFormRef, // 暴露表單的 ref
  form, // 暴露 form 數據
  validateForm, // 暴露 validateForm 方法
  submitForm, // 暴露 submitForm 方法
  resetForm, // 暴露 resetForm 方法
  // 其他需要暴露的方法...
});
</script>

<style scoped>
h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.el-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fff;
}

/* ElUpload 相關樣式調整，使其更緊湊 */
:deep(.el-upload--picture-card) {
  --el-upload-picture-card-size: 100px;
  width: 100px;
  height: 100px;
  line-height: 100px;
}
:deep(.el-upload-list--picture-card .el-upload-list__item) {
  --el-upload-picture-card-size: 100px;
  width: 100px;
  height: 100px;
  margin: 0 8px 8px 0;
}
/* 清除 ElUpload 列表的浮動 */
:deep(.el-upload-list--picture-card) {
  line-height: normal;
}

/* 驗證錯誤樣式 */
.el-form-item.is-error .el-upload--picture-card {
  border-color: var(--el-color-danger);
}
</style>
