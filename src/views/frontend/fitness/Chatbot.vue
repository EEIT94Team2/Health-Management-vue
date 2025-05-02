<template>
  <div class="chatbot-container" :class="{ 'is-open': isOpen }">
    <div class="chat-header" @click="toggleChatbot">
      <el-icon><ChatDotSquare /></el-icon> <span class="title">健身助手</span>
      <button v-if="isOpen" class="close-button" @click.stop="toggleChatbot">
        X
      </button>
    </div>

    <div v-if="isOpen" class="chat-log" ref="chatLog">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="`message ${message.sender}`"
      >
        <span class="sender-label">
          {{ message.sender === "user" ? "你" : "健身助手" }}:
        </span>
        <span class="message-text">{{ message.text }}</span>
      </div>
      <div v-if="isLoading" class="loading-indicator">載入中...</div>
    </div>

    <div v-if="isOpen" class="suggestion-buttons">
      <button @click="sendMessage('我的進度')">我的進度</button>
      <button @click="sendMessage('體重變化')">體重變化</button>
      <button @click="sendMessage('我的目標')">我的目標</button>
      <button @click="sendMessage('給我建議')">給我建議</button>
      <button @click="sendMessage('什麼是 體脂率')">什麼是 體脂率</button>
      <button @click="sendMessage('你能給我客製化的健身菜單嗎?')">
        AI 菜單
      </button>
    </div>

    <div v-if="isOpen" class="input-area">
      <input
        type="text"
        v-model="newMessage"
        @keyup.enter="handleSendMessage"
        placeholder="在這裡輸入你的問題"
      />
      <button @click="handleSendMessage">發送</button>
    </div>

    <div v-else class="chatbot-trigger" @click="toggleChatbot">
      <el-icon style="margin-right: 5px; font-size: 24px"
        ><ChatDotSquare
      /></el-icon>
      <span class="trigger-text"> 健身助手</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { ChatDotSquare } from "@element-plus/icons-vue";
import { ElIcon } from "element-plus";

// --- State ---
const isOpen = ref(false);
const messages = ref([]);
const newMessage = ref("");
const isLoading = ref(false);
const chatLog = ref(null);
const authStore = useAuthStore();
const token = computed(() => authStore.getToken);
const userId = computed(() => authStore.userInfo?.id);

// --- Chatbot UI ---
const toggleChatbot = () => {
  isOpen.value = !isOpen.value;
};

const scrollToBottom = () => {
  if (chatLog.value) {
    chatLog.value.scrollTop = chatLog.value.scrollHeight;
  }
};

onMounted(() => {
  nextTick(scrollToBottom);
});

watch(
  () => messages.value,
  () => {
    nextTick(() => nextTick(scrollToBottom));
  },
  { deep: true }
);

// --- Message Handling ---
const handleSendMessage = () => {
  const message = newMessage.value.trim();
  if (message) {
    sendMessage(message);
    newMessage.value = "";
  }
};

const sendMessage = async (message) => {
  messages.value.push({ sender: "user", text: message });
  isLoading.value = true;
  try {
    let chatbotResponse = "";
    if (isPredefinedMessage(message)) {
      chatbotResponse = await processUserMessage(message);
    } else {
      chatbotResponse = await sendMessageToGemini(message);
    }
    messages.value.push({ sender: "bot", text: chatbotResponse });
  } catch (error) {
    messages.value.push({
      sender: "bot",
      text: error.message || "抱歉，發生了一些問題，請稍後再試。",
    });
  } finally {
    isLoading.value = false;
  }
};

const isPredefinedMessage = (message) => {
  const predefinedMessages = [
    "我的進度",
    "體重變化",
    "我的目標",
    "給我建議",
    "什麼是 體脂率",
  ];
  return predefinedMessages.some((m) => message.includes(m));
};

const sendMessageToGemini = async (message) => {
  try {
    // 確保 message 不為 null
    const userPrompt = message || "";

    const { data } = await axios.post(
      `http://localhost:8080/api/users/${userId.value}/recommendations/chat`,
      {
        prompt: userPrompt,
      },
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Gemini API 錯誤:", error);
    return "系統錯誤，請稍後再試。";
  }
};

// --- 回應邏輯處理 ---
const processUserMessage = async (message) => {
  if (message.includes("我的進度")) return getProgressSummary();
  if (message.includes("體重變化")) return getWeightChange();
  if (message.includes("我的目標")) return getGoals();
  if (
    message.includes("給我建議") ||
    message.includes("如何改進") ||
    message.includes("下一步")
  )
    return getRecommendations();
  if (message.includes("什麼是")) return defineTerm(message);
  return (
    "你好！你可以問我以下問題：\n" +
    "- 我的進度\n" +
    "- 體重變化\n" +
    "- 我的目標\n" +
    "- 給我建議\n" +
    "- 什麼是 [名詞]（例如：什麼是 體脂率）\n"
  );
};

// --- API 呼叫 ---
const apiCall = async (url, options = {}) => {
  try {
    const response = await axios(url, options);
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`伺服器錯誤 (${response.status})`);
    }
  } catch (error) {
    console.error("API 錯誤:", error);
    throw new Error("資料取得失敗，請稍後再試。");
  }
};

// --- 回應函數 ---
const getProgressSummary = async () => {
  const data = await apiCall(
    `/api/tracking/exercise-records/overview/user/${userId.value}?timeRange=week`,
    {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    }
  );
  return `你本週訓練了 ${data.workoutCount} 次，總運動時長為 ${data.totalWorkoutTime} 分鐘。`;
};

const getWeightChange = async () => {
  const data = await apiCall(
    `/api/tracking/body-metrics/user/${userId.value}`,
    {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    }
  );
  if (!data?.length) return "你沒有體重記錄。";

  data.sort((a, b) => new Date(a.dateRecorded) - new Date(b.dateRecorded));
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const recent = data.filter(
    (item) => new Date(item.dateRecorded) >= oneMonthAgo
  );

  if (recent.length > 1) {
    const change = recent[recent.length - 1].weight - recent[0].weight;
    const trend = change > 0 ? "增加" : change < 0 ? "減少" : "沒有變化";
    return `你最近一個月體重 ${trend} 了 ${Math.abs(change).toFixed(1)} 公斤。`;
  } else {
    return "你最近一個月沒有足夠的體重紀錄。";
  }
};

const getGoals = async () => {
  const data = await apiCall(
    `/api/tracking/fitnessgoals/user/${userId.value}`,
    {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    }
  );
  const goals = data?.content?.filter((g) => g.status === "進行中") || [];
  if (!goals.length) return "你目前沒有進行中的目標。";
  return (
    "你目前進行中的目標有：\n" +
    goals
      .map(
        (g) => `- ${g.goalType}：目標 ${g.targetValue || ""} ${g.unit || ""}`
      )
      .join("\n")
  );
};

const getRecommendations = async () => {
  try {
    const { data } = await axios.get(
      `/api/users/${userId.value}/recommendations`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (!data || data.length === 0) {
      return "請確保你有設定健身目標與近期紀錄，我會根據資料提供建議。";
    }

    return data.map((rec) => `${rec.type}: ${rec.content}`).join("\n\n");
  } catch (error) {
    console.error("取得建議失敗:", error);
    return "請確保你有設定健身目標與近期紀錄，我會根據資料提供建議。";
  }
};

const defineTerm = async (message) => {
  const term = message.replace("什麼是", "").trim();
  const definitions = {
    體脂率: "體脂率是指體重中脂肪所占的比例，能夠反映身體組成健康狀況。",
    BMI: "BMI 是身體質量指數，用體重(公斤)除以身高(公尺)平方所得，可判斷肥胖與否。",
  };
  return definitions[term] || `目前無法提供「${term}」的定義。`;
};
</script>

<style scoped>
.chatbot-container {
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-width: 350px;
  width: 90%;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  box-shadow: 0 2px 10px #2f3f50;
  transition: height 0.3s ease-in-out;
  height: auto;
  font-size: 1.3em;
}

.chatbot-container:not(.is-open) {
  height: 50px;
  overflow: hidden;
}

.chat-header {
  background-color: #55aa77;
  color: #2f3f50;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.chat-header .title {
  font-weight: bold;
}

.chat-header .close-button {
  background: none;
  border: none;
  color: #2f3f50;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
  font-size: 1.2em;
}

.chat-log {
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
  background-color: #ffffff;
  position: relative;
  overflow-y: auto;
  height: 500px;
  max-height: 400px;
}

.message {
  padding: 8px;
  margin-bottom: 5px;
  border-radius: 5px;
}

.user {
  background-color: #e0fae8;
  align-self: flex-end;
}

.bot {
  background-color: #f9f9f9;
  align-self: flex-start;
}

.sender-label {
  font-weight: bold;
  margin-right: 5px;
  color: #2f3f50;
  white-space: pre-wrap;
}

.message-text {
  color: #212529;
  white-space: pre-wrap;
  resize: none;
  overflow: hidden;
  min-height: 40px;
}

.loading-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  text-align: center;
  padding: 8px;
  font-style: italic;
  font-size: 0.8em;
  color: #6c757d;
}

.input-area {
  display: flex;
  padding: 10px;
  border: none;
  background-color: #55aa77;
}

.input-area input {
  flex-grow: 1;
  padding: 8px;
  border: none;
  border-radius: 3px;
  margin-right: 5px;
  outline: none;
  color: #79acdf;
}

.input-area button {
  padding: 8px 15px;
  background-color: #28274a;
  color: #55aa77;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
  width: 80px;
}

.input-area button:hover {
  background-color: #15bdda;
}

.chatbot-trigger {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background-color: #55aa77;
  color: #2f3f50;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
}

.suggestion-buttons {
  padding: 10px;
  background-color: #f9f9f9;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.suggestion-buttons button {
  padding: 8px 12px;
  border: #28274a solid 1px;
  border-radius: 5px;
  background-color: white;
  color: #28274a;
  cursor: pointer;
  font-size: 0.9em;
}

.suggestion-buttons button:hover {
  background-color: #e0f7fa;
}
</style>
