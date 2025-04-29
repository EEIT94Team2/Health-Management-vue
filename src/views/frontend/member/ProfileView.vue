<template>
  <div class="profile-view">
    <div class="profile-container">
      <div class="page-header">
        <h1>會員中心</h1>
      </div>

      <el-card class="points-card">
        <div class="points-content">
          <div class="points-icon">
            <i class="el-icon-medal"></i>
          </div>
          <div class="points-info">
            <h2>會員點數</h2>
            <div class="points-value">{{ userInfo.userPoints || 0 }}</div>
            <p>累積點數可兌換優惠或課程</p>
          </div>
        </div>
      </el-card>

      <el-card class="achievements-card">
        <template #header>
          <div class="card-header">
            <h2>我的獎章</h2>
          </div>
        </template>
        <div v-if="loadingAchievements" class="loading-container">
          <el-skeleton animated :rows="2" />
        </div>
        <div v-else-if="errorAchievements" class="error-message">
          {{ errorAchievements }}
        </div>
        <div v-else class="achievements-list">
          <div
            v-for="achievement in userAchievements"
            :key="achievement.achievementId"
            class="achievement-item"
            :title="achievement.title"
          >
            <el-tooltip
              placement="bottom"
              :content="`${achievement.title} - ${
                achievement.description || '無描述'
              }`"
            >
              <img
                :src="getAchievementImage(achievement.achievementType)"
                :alt="achievement.title"
                class="achievement-image"
                @mouseover="hoveredAchievement = achievement"
                @mouseleave="hoveredAchievement = null"
              />
            </el-tooltip>
          </div>
          <div v-if="userAchievements.length === 0" class="no-achievements">
            <el-empty description="尚未獲得任何獎章"></el-empty>
          </div>
        </div>
      </el-card>

      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <h2>個人資料</h2>
          </div>
        </template>
        <div v-if="loading" class="loading-container">
          <el-skeleton animated :rows="6" />
        </div>
        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>
        <div v-else>
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-position="top"
            class="profile-form"
          >
            <el-form-item label="姓名" prop="name">
              <el-input
                v-model="profileForm.name"
                placeholder="請輸入您的姓名"
              />
            </el-form-item>

            <el-form-item label="電子郵件" prop="email">
              <el-input
                v-model="profileForm.email"
                placeholder="請輸入您的電子郵件"
              />
            </el-form-item>

            <el-form-item label="性別" prop="gender">
              <el-radio-group v-model="profileForm.gender">
                <el-radio label="M">男</el-radio>
                <el-radio label="F">女</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="個人簡介" prop="bio">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                :rows="4"
                placeholder="介紹一下您自己..."
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="updateProfile"
                :loading="updating"
                class="update-btn"
              >
                更新資料
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>

      <el-card class="password-card">
        <template #header>
          <div class="card-header">
            <h2>修改密碼</h2>
          </div>
        </template>
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-position="top"
          class="password-form"
        >
          <el-form-item label="目前密碼" prop="currentPassword">
            <el-input
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="請輸入目前的密碼"
              show-password
            />
          </el-form-item>

          <el-form-item label="新密碼" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="請輸入新密碼"
              show-password
            />
          </el-form-item>

          <el-form-item label="確認新密碼" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="請再次輸入新密碼"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="updatePassword"
              :loading="updatingPassword"
              class="update-btn"
            >
              更新密碼
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

// 用戶資訊與狀態
const userInfo = computed(() => authStore.getUserInfo || {});
const userId = computed(() => {
  // 優先從 userInfo 獲取 id 或 userId
  if (userInfo.value?.id) return userInfo.value.id;
  if (userInfo.value?.userId) return userInfo.value.userId;
  
  // 其次從 localStorage 獲取
  const localUserId = localStorage.getItem("userId");
  if (localUserId) return Number(localUserId);
  
  return null;
});
const loading = ref(false);
const error = ref(null);
const updating = ref(false);
const updatingPassword = ref(false);

// 表單引用
const profileFormRef = ref(null);
const passwordFormRef = ref(null);

// 個人資料表單
const profileForm = reactive({
  name: "",
  email: "",
  gender: "M",
  bio: "",
});

// 密碼修改表單
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 個人資料驗證規則
const profileRules = {
  name: [
    { required: true, message: "請輸入姓名", trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "姓名長度必須在 2 到 50 個字符之間",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "請輸入電子郵件", trigger: "blur" },
    { type: "email", message: "請輸入有效的電子郵件格式", trigger: "blur" },
  ],
  gender: [{ required: true, message: "請選擇性別", trigger: "change" }],
};

// 密碼驗證規則
const passwordRules = {
  currentPassword: [
    { required: true, message: "請輸入目前密碼", trigger: "blur" },
    { min: 6, message: "密碼長度至少為 6 個字符", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "請輸入新密碼", trigger: "blur" },

    { min: 8, message: "密碼長度至少為 8 個字符", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (!/[A-Z]/.test(value)) {
          callback(new Error("密碼必須包含至少一個大寫字母"));
        } else if (!/[a-z]/.test(value)) {
          callback(new Error("密碼必須包含至少一個小寫字母"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, message: "請確認新密碼", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (!/[A-Z]/.test(value)) {
          callback(new Error("密碼必須包含至少一個大寫字母"));
        } else if (!/[a-z]/.test(value)) {
          callback(new Error("密碼必須包含至少一個小寫字母"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, message: "請確認新密碼", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("兩次輸入的密碼不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 獎章相關的變數
const userAchievements = ref([]);
const loadingAchievements = ref(false);
const errorAchievements = ref(null);
const hoveredAchievement = ref(null);

// 獲取用戶資料
const fetchUserProfile = async () => {
  loading.value = true;
  error.value = null;

  try {
    // 從localStorage獲取認證token
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("您尚未登入，請先登入");
    }
    
    // 設置axios請求頭帶上token
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    // 使用/api/users/userinfo端點獲取當前登入用戶的信息
    const response = await axios.get(`/api/users/userinfo`);

    if (response.data && response.data.success) {
      const userData = response.data.data;

      // 更新表單數據
      profileForm.name = userData.name || "";
      profileForm.email = userData.email || "";
      profileForm.gender = userData.gender || "M";
      profileForm.bio = userData.bio || "";
      
      // 將用戶ID存儲到localStorage
      if (userData.userId) {
        localStorage.setItem("userId", userData.userId.toString());
      }
      
      // 更新store中的用戶信息
      authStore.setUserInfo(userData);
      
      // 如果沒有userInfo中沒有id，但有userId，則使用userId
      if (!userInfo.value?.id && userData.userId) {
        // 更新userId計算屬性所依賴的數據
        const updatedUserInfo = { ...userInfo.value, id: userData.userId };
        authStore.setUserInfo(updatedUserInfo);
      }
    } else {
      throw new Error(response.data?.message || "獲取用戶資料失敗");
    }
  } catch (err) {
    console.error("獲取用戶資料失敗", err);
    error.value = err.message || "無法獲取用戶資料";
  } finally {
    loading.value = false;
  }
};

// 更新個人資料
const updateProfile = async () => {
  if (!profileFormRef.value) return;

  await profileFormRef.value.validate(async (valid) => {
    if (!valid) return;

    updating.value = true;

    try {
      // 使用新的api/users/profile端點
      const updateData = {
        email: profileForm.email, // 必須提供郵箱進行身份識別
        name: profileForm.name,
        gender: profileForm.gender,
        bio: profileForm.bio,
      };

      // 不再需要userId和認證令牌
      const response = await axios.put(
        "/api/users/profile",
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        ElMessage.success("個人資料更新成功！");

        // 更新 store 中的用戶信息
        const userData = response.data.data;
        authStore.$patch({ userInfo: userData });
        
        // 更新localStorage中的用戶信息
        localStorage.setItem("userInfo", JSON.stringify(userData));
      } else {
        throw new Error(response.data?.message || "更新失敗");
      }
    } catch (err) {
      console.error("更新個人資料失敗", err);
      ElMessage.error(err.response?.data?.message || "更新個人資料失敗");
    } finally {
      updating.value = false;
    }
  });
};

// 更新密碼
const updatePassword = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return;

    updatingPassword.value = true;

    try {
      // 使用新的profile端點更新密碼
      const updateData = {
        email: profileForm.email, // 必須提供郵箱進行身份識別
        password: passwordForm.newPassword,
        oldPassword: passwordForm.currentPassword,
      };

      // 發送更新請求，不需要驗證令牌
      const response = await axios.put(
        "/api/users/profile",
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        ElMessage.success("密碼更新成功！");

        // 清空密碼表單
        passwordForm.currentPassword = "";
        passwordForm.newPassword = "";
        passwordForm.confirmPassword = "";

        // 重置表單驗證
        passwordFormRef.value.resetFields();
      } else {
        throw new Error(response.data?.message || "更新密碼失敗");
      }
    } catch (err) {
      console.error("更新密碼失敗", err);
      ElMessage.error(err.response?.data?.message || "更新密碼失敗");
    } finally {
      updatingPassword.value = false;
    }
  });
};

// 獲取用戶獎章
const fetchUserAchievements = async () => {
  // 獲取用戶ID，先檢查userId計算屬性
  const currentUserId = userId.value;
  
  // 如果還沒有用戶ID，可能是因為資料還沒加載完成，暫時不獲取獎章
  if (!currentUserId) {
    console.log("等待用戶ID加載完成");
    // 稍後再嘗試
    setTimeout(() => {
      if (userId.value) {
        fetchUserAchievements();
      }
    }, 1000);
    return;
  }

  loadingAchievements.value = true;
  errorAchievements.value = null;

  try {
    // 從localStorage獲取認證token
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("您尚未登入，請先登入");
    }
    
    // 設置axios請求頭帶上token
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    const response = await axios.get(
      `/api/tracking/achievements/user/${currentUserId}`
    );

    if (response.data) {
      // 直接判斷 response.data 是否存在
      userAchievements.value = response.data;
    } else {
      throw new Error("獲取用戶獎章失敗，後端響應無數據");
    }
  } catch (err) {
    console.error("獲取用戶獎章失敗", err);
    errorAchievements.value = err.message || "無法獲取用戶獎章";
  } finally {
    loadingAchievements.value = false;
  }
};

// 根據獎章類型獲取圖片
const getAchievementImage = (achievementType) => {
  switch (achievementType) {
    case "FIRST_WORKOUT":
      return "http://localhost:8080/static-images/1_workouts.png";
    case "5_WORKOUTS":
      return "http://localhost:8080/static-images/5_workouts.png";
    case "10_WORKOUTS":
      return "http://localhost:8080/static-images/10_workouts.png";
    case "25_WORKOUTS":
      return "http://localhost:8080/static-images/25_workouts.png";
    case "50_WORKOUTS":
      return "http://localhost:8080/static-images/50_workouts.png";
    case "ULTIMATE_FITNESS":
      return "http://localhost:8080/static-images/ULTIMATE_FITNESS.png";
    case "LOGIN_1_DAY":
      return "http://localhost:8080/static-images/LOGIN_1_DAY.png";
    case "LOGIN_3_DAYS":
      return "http://localhost:8080/static-images/LOGIN_3_DAYS.png";
    case "LOGIN_7_DAYS":
      return "http://localhost:8080/static-images/LOGIN_7_DAYS.png";
    case "LOGIN_30_DAYS":
      return "http://localhost:8080/static-images/LOGIN_30_DAYS.png";
    case "LOGIN_90_DAYS":
      return "http://localhost:8080/static-images/LOGIN_90_DAYS.png";
    case "EARLY_BIRD":
      return "http://localhost:8080/static-images/EARLY_BIRD.png";
    case "WEEKLY_WARRIOR":
      return "http://localhost:8080/static-images/WEEKLY_WARRIOR.png";
    case "GOAL_CREATED":
      return "http://localhost:8080/static-images/GOAL_CREATED.png";
    case "GOAL_COMPLETED_1":
      return "http://localhost:8080/static-images/GOAL_COMPLETED_1.png";
    case "GOAL_COMPLETED_5":
      return "http://localhost:8080/static-images/GOAL_COMPLETED_5.png";
    case "GOAL_COMPLETED_10":
      return "http://localhost:8080/static-images/GOAL_COMPLETED_10.png";
    case "GOAL_COMPLETED_25":
      return "http://localhost:8080/static-images/GOAL_COMPLETED_25.png";
    case "FIRST_BODY_DATA":
      return "http://localhost:8080/static-images/FIRST_BODY_DATA.png";
    case "10_BODY_DATA":
      return "http://localhost:8080/static-images/10_BODY_DATA.png";
    case "25_BODY_DATA":
      return "http://localhost:8080/static-images/25_BODY_DATA.png";
    case "FIRST_DIET_LOG":
      return "http://localhost:8080/static-images/FIRST_DIET_LOG.png";
    case "10_DIET_LOGS":
      return "http://localhost:8080/static-images/10_DIET_LOGS.png";
    case "25_DIET_LOGS":
      return "http://localhost:8080/static-images/25_DIET_LOGS.png";
    case "FIRST_POST":
      return "http://localhost:8080/static-images/FIRST_POST.png";
    case "5_POSTS":
      return "http://localhost:8080/static-images/5_POSTS.png";
    case "10_POSTS":
      return "http://localhost:8080/static-images/10_POSTS.png";
    case "FIRST_COMMENT":
      return "http://localhost:8080/static-images/FIRST_COMMENT.png";
    case "5_COMMENTS":
      return "http://localhost:8080/static-images/5_COMMENTS.png";
    case "10_COMMENTS":
      return "http://localhost:8080/static-images/10_COMMENTS.png";
    case "SOCIAL_BUTTERFLY":
      return "http://localhost:8080/static-images/SOCIAL_BUTTERFLY.png";
    default:
      return ""; // 如果有未知的獎章類型，返回空字串或一個預設圖片路徑
  }
};

// 頁面加載時獲取用戶資料和獎章
onMounted(async () => {
  try {
    // 先獲取用戶個人資料
    await fetchUserProfile();
    
    // 然後獲取獎章資料
    fetchUserAchievements();
  } catch (error) {
    console.error("頁面初始化失敗", error);
  }
});
</script>

<style lang="scss" scoped>
.profile-view {
  min-height: 100vh;
  padding: 100px 0 50px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;

  h1 {
    font-size: 2.5rem;
    color: var(--text-primary);
    margin-bottom: 10px;
  }
}

.el-card {
  margin-bottom: 30px;
  border-radius: 12px;
  background-color: var(--card-bg);
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

  &.points-card {
    background: linear-gradient(135deg, #10202b, #234567);
    color: #fff;
  }

  :deep(.el-card__header) {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  :deep(.el-card__body) {
    padding: 25px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-primary);
  }
}

.points-content {
  display: flex;
  align-items: center;

  .points-icon {
    font-size: 3rem;
    margin-right: 20px;
    color: var(--highlight-color);
  }

  .points-info {
    h2 {
      margin: 0 0 5px;
      font-size: 1.2rem;
    }

    .points-value {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 5px;
      color: var(--highlight-color);
    }

    p {
      margin: 0;
      opacity: 0.8;
    }
  }
}

.profile-form,
.password-form {
  .el-form-item {
    margin-bottom: 25px;
  }

  :deep(.el-form-item__label) {
    padding-bottom: 8px;
    font-size: 1rem;
    color: var(--text-primary);
  }

  :deep(.el-input__inner) {
    background-color: #fff !important;
    border: 1px solid var(--highlight-color);
    color: #333;
    height: 50px;
    border-radius: 8px;
    padding-left: 15px;
  }

  :deep(.el-textarea__inner) {
    background-color: #fff !important;
    border: 1px solid var(--highlight-color);
    color: #333;
    border-radius: 8px;
    padding: 12px 15px;
  }

  /* 去掉輸入框周圍的白色背景 */
  :deep(.el-input) {
    background-color: transparent !important;
  }

  :deep(.el-input__wrapper) {
    background-color: #fff !important;
    box-shadow: 0 0 0 1px var(--highlight-color) !important;
    padding: 0;
  }

  :deep(.el-textarea__wrapper) {
    background-color: #fff !important;
    box-shadow: 0 0 0 1px var(--highlight-color) !important;
    padding: 0;
  }

  :deep(.el-input__inner:focus),
  :deep(.el-textarea__inner:focus) {
    border-color: var(--highlight-color);
    box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
  }

  :deep(.el-radio__label) {
    color: var(--text-primary);
  }

  :deep(.el-radio__input.is-checked .el-radio__inner) {
    background-color: var(--highlight-color);
    border-color: var(--highlight-color);
  }

  :deep(.el-radio__input.is-checked + .el-radio__label) {
    color: var(--highlight-color);
  }
}

.update-btn {
  width: 100%;
  height: 44px;
  font-size: 1rem;
  background-color: var(--highlight-color);
  border: none;

  &:hover,
  &:focus {
    background-color: darken(#43a478, 10%);
  }
}

.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  padding: 20px;
}

.achievements-card {
  margin-bottom: 30px;
  border-radius: 12px;
  background-color: var(--card-bg);
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

  :deep(.el-card__header) {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  :deep(.el-card__body) {
    padding: 25px;
  }
}

.achievements-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.achievement-item {
  width: 50px; /* 調整獎章圖片大小 */
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  position: relative; /* 為了 el-tooltip 的定位 */
}

.achievement-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-achievements {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
}

@media (max-width: 767px) {
  .profile-container {
    padding: 0 15px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .points-content {
    flex-direction: column;
    text-align: center;

    .points-icon {
      margin-right: 0;
      margin-bottom: 15px;
    }
  }
}
</style>
