<template>
  <div>
    <h1>我的獎章</h1>
    <div class="achievement-list">
      <div
        v-for="achievement in userAchievements"
        :key="achievement.achievementId"
        class="achievement-item"
      >
        <div class="achievement-icon">
          <img
            :src="getAchievementIcon(achievement)"
            alt="獎章圖示"
            width="80"
            height="80"
          />
        </div>
        <div class="achievement-details">
          <h3>{{ achievement.title }}</h3>
          <p>{{ achievement.description }}</p>
          <small>獲得日期：{{ formatDate(achievement.achievedDate) }}</small>
        </div>
      </div>
      <p v-if="userAchievements.length === 0">您還沒有獲得任何獎章。</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios"; // 確保您已安裝 axios

export default {
  setup() {
    const userAchievements = ref([]);
    const userId = ref(null); // 假設您有辦法獲取當前登入的用戶 ID

    onMounted(async () => {
      // 假設您的用戶 ID 儲存在某個地方 (例如 Vuex, Pinia, localStorage 等)
      // 這裡僅為範例，您需要根據您的實際情況獲取 userId
      userId.value = 123; // 替換為實際的用戶 ID

      if (userId.value) {
        try {
          const response = await axios.get(
            `/api/tracking/achievements/user/${userId.value}`
          );
          userAchievements.value = response.data;
        } catch (error) {
          console.error("獲取用戶獎章失敗:", error);
          // 處理錯誤，例如顯示錯誤訊息
        }
      }
    });

    // 根據獎章資訊返回對應的圖示 URL
    const getAchievementIcon = (achievement) => {
      // 這裡您可以根據 achievement.title 或 achievement.achievementType 返回不同的圖片路徑
      if (achievement.title === "運動大師") {
        return "/images/master.png";
      } else if (achievement.title === "持之以恆") {
        return "/images/persistent.png";
      } else {
        return "/images/default_badge.png";
      }
    };

    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString(); // 可以根據需要調整格式
    };

    // 可選：分享獎章功能
    // const shareAchievement = (achievement) => {
    //   // 實作分享邏輯
    //   console.log('分享獎章:', achievement.title);
    // };

    return {
      userAchievements,
      getAchievementIcon,
      formatDate,
      // shareAchievement,
    };
  },
};
</script>

<style scoped>
.achievement-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.achievement-item {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.achievement-icon {
  margin-right: 15px;
}

.achievement-details {
  flex-grow: 1;
}

.achievement-details h3 {
  margin-top: 0;
  margin-bottom: 5px;
}

.achievement-details small {
  color: #777;
}
</style>
