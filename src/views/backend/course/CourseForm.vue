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
} from "element-plus";
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
});

const resetForm = () => {
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
  };
  if (courseFormRef.value) {
    courseFormRef.value.resetFields();
  }
};

const rules = reactive({
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
});

const courseFormRef = ref(null);
const coaches = ref([]);
const fetchingCoaches = ref(false);

const fetchCoaches = async () => {
  fetchingCoaches.value = true;
  try {
    const res = await axios.get("/api/users/coaches");
    const coachList = res.data.data || res.data;
    coaches.value = Array.isArray(coachList) ? coachList : [];
  } catch (error) {
    coaches.value = [];
  } finally {
    fetchingCoaches.value = false;
  }
};

const fetchCourse = async (id) => {
  if (id === null || id === undefined) {
    return;
  }
  try {
    const response = await axios.get(`/api/courses/${id}`);
    const courseData = response.data.data || response.data;

    if (!courseData || typeof courseData !== "object") {
      ElMessage.error("獲取課程詳情數據失敗。");
      return;
    }

    nextTick(() => {
      form.value = {
        name: courseData.name || "",
        description: courseData.description || "",
        dayOfWeek: courseData.dayOfWeek ?? null,
        startTime: courseData.startTime ?? null,
        duration: courseData.duration ?? 60,
        maxCapacity: courseData.maxCapacity ?? 10,
        coachId: courseData.coachId ?? null,
        offersTrialOption: courseData.offersTrialOption ?? false,
        maxTrialCapacity: courseData.maxTrialCapacity ?? null,
      };
    });
  } catch (error) {
    handleApiError(error, "獲取課程資訊失敗");
  }
};

watch(
  () => props.courseId,
  (newCourseId) => {
    if (newCourseId !== null && newCourseId !== undefined) {
      fetchCourse(newCourseId);
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const handleApiError = (error, defaultMessage) => {
  const errorMessage =
    error.response?.data?.message ||
    error.message ||
    defaultMessage + "，請檢查網絡連接或服務器。";
  ElMessage.error(errorMessage);
};

onMounted(() => {
  fetchCoaches();
});

defineExpose({
  courseFormRef,
  form,
  validateForm: async () => {
    if (!courseFormRef.value) {
      return false;
    }
    try {
      const isValid = await courseFormRef.value.validate();
      return isValid;
    } catch (error) {
      return false;
    }
  },
  submitForm: async () => {
    const payload = {
      ...form.value,
      startTime: form.value.startTime,
      maxTrialCapacity: form.value.offersTrialOption
        ? form.value.maxTrialCapacity
        : null,
    };

    try {
      let response;
      if (isEdit.value) {
        response = await axios.put(`/api/courses/${props.courseId}`, payload);
        ElMessage.success("課程更新成功！");
      } else {
        response = await axios.post("/api/courses", payload);
        ElMessage.success("課程新增成功！");
      }
      emit("submit-success");
    } catch (error) {
      handleApiError(error, "課程提交失敗");
    }
  },
  resetForm,
});

const emit = defineEmits(["submit-success", "cancel"]);
</script>

<style scoped>
h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.el-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fff;
}
</style>
