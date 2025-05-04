<template>
  <el-dialog
    :model-value="visible"
    :title="course?.name + ' 體驗預約'"
    @close="handleCancel"
    width="30%"
    destroy-on-close
  >
    <div v-if="course">
      <p><strong>教練：</strong>{{ course.coachName }}</p>
      <p>
        <strong>時間：</strong>{{ formatDayOfWeek(course.dayOfWeek) }}
        {{ course.startTime }}
      </p>
      <p>
        <strong>剩餘名額：</strong
        >{{ course.maxTrialCapacity - course.bookedTrialCount }}
      </p>

      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="預約姓名" prop="bookingName">
          <el-input
            v-model="form.bookingName"
            :placeholder="isAuthenticated ? '' : '請輸入姓名'"
            :disabled="isAuthenticated && userInfo && userInfo.name"
          />
        </el-form-item>

        <el-form-item label="聯絡信箱" prop="bookingEmail">
          <el-input
            v-model="form.bookingEmail"
            :placeholder="isAuthenticated ? '' : '請輸入信箱'"
            :disabled="isAuthenticated && userInfo && userInfo.email"
          />
        </el-form-item>
        <el-form-item label="聯絡電話" prop="bookingPhone">
          <el-input v-model="form.bookingPhone" placeholder="請輸入電話" />
        </el-form-item>

        <el-form-item label="預約日期" prop="bookingDate">
          <el-date-picker
            v-model="form.bookingDate"
            type="date"
            placeholder="選擇預約日期"
            :disabled-date="disableInvalidDates"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>

      <div style="text-align: right; margin-top: 20px">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="submitBooking">確認預約</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from "vue"; // === 引入 watch ===
import { ElMessage } from "element-plus";
import axios from "axios";

const props = defineProps({
  visible: Boolean,
  course: Object,
  isAuthenticated: Boolean, // === 新增 prop: 認證狀態 ===
  userInfo: Object, // === 新增 prop: 使用者資訊物件 ===
});

// === 修正: 發出的事件改為只 emit close 和 booking-success ===
const emit = defineEmits(["close", "booking-success"]);
// =========================================================

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const formRef = ref(null);
const form = ref({
  bookingName: "",
  bookingEmail: "",
  bookingPhone: "",
  bookingDate: null,
});

// === 根據 isAuthenticated 動態生成驗證規則 ===
const rules = ref({}); // 初始化為空對象，將在 watch 中填充

watch(
  [() => props.visible, () => props.isAuthenticated, () => props.userInfo],
  ([isVisible, isAuth, userInfo]) => {
    if (isVisible) {
      // 只有在 Modal 顯示時才填充表單和規則
      // 初始化表單數據
      form.value.bookingName =
        isAuth && userInfo && userInfo.name ? userInfo.name : "";
      form.value.bookingEmail =
        isAuth && userInfo && userInfo.email ? userInfo.email : "";
      form.value.bookingPhone = ""; // 電話通常不預填充，除非你的 userInfo 裡有

      // 設置驗證規則
      rules.value = {
        bookingName: [
          { required: true, message: "請輸入姓名", trigger: "blur" },
        ],
        // === 信箱欄位只有在未登入時是必填 ===
        bookingEmail: [
          { required: !isAuth, message: "請輸入聯絡信箱", trigger: "blur" },
          // 如果信箱是必填 (未登入時)，則也需要驗證格式
          {
            type: "email",
            message: "請輸入有效的信箱格式",
            trigger: ["blur", "change"],
            // 只有在信箱有值且未登入時才觸發格式驗證
            // 或者更簡單，required 為 false 時，即使有值也不會觸發格式驗證 (Element Plus 行為)
            // 如果 required 為 true，則一定觸發格式驗證
          },
        ].filter((rule) => (isAuth ? rule.required === false : true)), // 過濾掉登入時非必填的規則
        // =======================================
        bookingPhone: [
          { required: true, message: "請輸入聯絡電話", trigger: "blur" },
        ],
        bookingDate: [
          { required: true, message: "請選擇預約日期", trigger: "change" },
        ],
      };

      // 如果是已登入且信箱被禁用，可能需要手動觸發一下驗證，確保表單狀態正確（可選）
      // nextTick(() => {
      //     if (formRef.value && isAuth && userInfo && userInfo.email) {
      //          formRef.value.validateField('bookingEmail', () => null); // 驗證通過，不顯示錯誤
      //     }
      // });
    } else {
      // Modal 關閉時，重置表單狀態，避免下次打開顯示舊數據或驗證錯誤
      resetForm();
    }
  },
  { immediate: true }
); // 在元件首次渲染時立即執行一次 watch

// 重置表單方法
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  // 手動清空表單數據
  form.value.bookingName = "";
  form.value.bookingEmail = "";
  form.value.bookingPhone = "";
  form.value.bookingDate = null;
};
// ============================================

const disableInvalidDates = (date) => {
  if (!props.course) return false;
  // 將資料庫的 0-6 (Sun-Sat) 轉換為 JavaScript 的 getDay() (0-6, Sun-Sat)
  const targetDay = props.course.dayOfWeek;
  // 確保 dayOfWeek 是有效數字，且在 0-6 範圍內
  if (typeof targetDay !== "number" || targetDay < 0 || targetDay > 6) {
    console.warn("無效的 course.dayOfWeek:", targetDay);
    return false; // 如果 dayOfWeek 無效，不禁用任何日期
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // 禁用過去的日期 (包括今天之前)
  if (date < today) {
    return true;
  }
  return date.getDay() !== targetDay;
};

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
  // 確保 dayOfWeek 是有效數字且在索引範圍內
  if (typeof dayOfWeek === "number" && dayOfWeek >= 0 && dayOfWeek <= 6) {
    return days[dayOfWeek];
  }
  return "未知";
};

// === 修正 handleCancel 方法，只 emit close ===
const handleCancel = () => {
  console.log("預約體驗操作已取消。");
  // ElMessage.info("已取消預約體驗操作。"); // 取消時不顯示 info 訊息，只由父組件關閉彈窗
  emit("close"); // 通知父元件關閉彈窗
};
// ===========================================

const submitBooking = () => {
  formRef.value.validate(async (valid) => {
    // 在提交前，如果已登入，確保使用 userInfo 中的信箱，並讓驗證通過
    if (props.isAuthenticated && props.userInfo && props.userInfo.email) {
      form.value.bookingEmail = props.userInfo.email;
      // 如果信箱是禁用狀態，Element Plus 可能不會自動驗證，這裡確保邏輯上是有效的
      const isEmailValidForAuthenticated = props.userInfo.email && true; // 假設只要有信箱就視為有效
      if (
        !valid &&
        formRef.value.fields.find((field) => field.prop === "bookingEmail")
          ?.validateState === "error"
      ) {
        // 如果驗證失敗是因為信箱（在未登入時是必填），但在登入狀態下有信箱，則忽略信箱的驗證錯誤
        valid = Object.keys(formRef.value.fields)
          .filter((prop) => prop !== "bookingEmail")
          .every(
            (prop) =>
              formRef.value.fields.find((field) => field.prop === prop)
                ?.validateState !== "error"
          );
        // 如果除了信箱，其他字段都有效，則視為表單有效
        if (valid && isEmailValidForAuthenticated) {
          valid = true;
        } else if (!isEmailValidForAuthenticated) {
          // 如果已登入但 userInfo 沒有信箱，這是一個異常情況，可能需要提示用戶更新資料
          ElMessage.error("無法獲取您的信箱，請更新您的個人資料。");
          return; // 阻止提交
        }
      }
    }

    if (!valid) {
      console.log("表單驗證失敗。");
      // ElMessage.warning("請檢查表單填寫是否完整和正確。"); // 驗證失敗時不顯示統一警告，讓 Element Plus 自己顯示錯誤提示
      return;
    }

    try {
      console.log("正在提交預約請求:", form.value);
      const response = await axios.post(`${apiBaseUrl}/trial-bookings/book`, {
        courseId: props.course.id,
        bookingName: form.value.bookingName,
        bookingEmail: form.value.bookingEmail, // 使用表單中的信箱值 (已登入時會是 userInfo 的信箱)
        bookingPhone: form.value.bookingPhone,
        bookingDate: form.value.bookingDate,
        // 注意：後端 API 接收的 bookingDate 格式需要與前端 form.value.bookingDate 匹配
        // 我們在 date-picker 上設置了 value-format="YYYY-MM-DD"
      });

      if (response.status === 201) {
        // === 修正：只在這裡顯示預約成功通知 ===
        ElMessage.success("預約成功！");
        console.log("預約成功！");
        // ====================================

        // 發出預約成功事件給父組件，並傳遞課程 ID
        if (props.course && props.course.id) {
          emit("booking-success", props.course.id);
        } else {
          console.warn("無法發出 booking-success 事件，課程物件或 ID 無效。");
        }

        // 預約成功後關閉彈窗，發出 close 事件
        emit("close");
      } else {
        console.warn(
          "預約體驗請求返回非 201 狀態:",
          response.status,
          response.data
        );
        ElMessage.warning(`預約請求異常：狀態碼 ${response.status}`);
        // 即使後端返回非 201，也不需要重新獲取數據，因為沒有預約成功
      }
    } catch (e) {
      console.error("預約體驗請求失敗:", e);
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "預約失敗，請確認資料是否正確或名額已滿";

      // 如果錯誤是 401 未授權，提示登入 (雖然未登入時已經處理跳轉，以防萬一)
      if (e.response && e.response.status === 401 && !props.isAuthenticated) {
        ElMessage.error("請先登入！");
        // 不需要在這裡跳轉，因為觸發打開 Modal 時已經檢查並跳轉了
      } else {
        ElMessage.error(errorMessage);
      }
    }
  });
};

// 元件掛載或 visible 變化時可能需要重置表單狀態，我們使用 watch 來處理
</script>

<style scoped>
.el-form-item {
  margin-bottom: 16px;
}
.el-form-item .el-input.is-disabled .el-input__inner {
  cursor: default;
  background-color: #f5f7fa;
  color: #606266;
}
.el-dialog {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-primary);

  .el-dialog__title {
    color: var(--text-primary);
  }

  .el-form-item__label {
    color: var(--text-primary);
    font-weight: bold;
  }

  .el-input__wrapper {
    background-color: var(--bg-primary) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-color) !important;
  }

  .el-textarea__inner {
    background-color: var(--bg-primary) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-color) !important;
  }

  .el-date-editor.el-input__wrapper {
    background-color: var(--bg-primary) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-color) !important;
  }
  .el-button {
    margin-top: 1rem;
    margin-right: 1rem;
    background-color: #fff;
    color: var(--highlight-color);
    border: 1px solid var(--highlight-color);

    &:hover {
      background-color: var(--highlight-color);
      color: var(--text-primary);
      border-color: var(--highlight-color);
    }

    &:last-child {
      margin-right: 0;
      background-color: var(--highlight-color);
      color: var(--text-primary);
      border: none;

      &:hover {
        background-color: var(--highlight-hover);
        border: none;
      }
    }
  }
}
</style>
