<template>
    <div class="partner-page">
      <h2>尋找運動夥伴</h2>
  
      <!-- 狀態篩選器 -->
      <div class="status-filter">
        <label>顯示狀態：</label>
        <select v-model="statusFilter">
          <option value="">全部</option>
          <option v-for="s in statusList" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
  
      <!-- 好友列表 -->
      <div class="section friend-section">
        <h3>我的好友清單</h3>
        <div v-if="friends.length === 0">尚未新增任何好友</div>
        <div v-else class="friend-list">
          <div v-for="f in filteredFriends" :key="f.friendId" class="friend-card">
            <div class="avatar">{{ f.friendName?.charAt(0) || '?' }}</div>
            <div class="info">
              <div class="name">{{ f.friendName }}</div>
              <div class="status">
  <span v-if="f.status === '線上中'">🟢</span>
  <span v-else-if="f.status === '訓練中'">🟠</span>
  <span v-else>🔴</span>
  {{ f.status }}
</div>
            </div>
            <el-button
              size="small"
              type="success"
              class="invite-btn"
              :disabled="f.inviting"
              @click="inviteTraining(f.friendId)"
            >
              💪 {{ f.inviting ? '已送出' : '邀請訓練' }}
            </el-button>
          </div>
        </div>
      </div>
  
      <!-- 通知列表 -->
      <div class="section invite-section">
        <h3 class="invite-header">
  訓練邀請通知
  <transition name="badge-bounce">
    <span v-if="pendingTrainingCount > 0" class="badge">
      {{ pendingTrainingCount }}
    </span>
  </transition>
</h3>
        <div v-if="invitations.length === 0">尚無邀請</div>
        <div v-else class="invite-list">
          <div v-for="i in invitations" :key="i.id" class="invite-card">
            <div class="avatar">{{ i.senderName?.charAt(0) || '?' }}</div>
            <div class="message">
              {{ i.senderName }}：{{ i.message }}
            </div>
            <div class="actions" v-if="i.status?.toUpperCase() === 'PENDING'">
              <el-button size="small" type="primary" class="accept-btn" @click="respondInvitation(i.id, 'ACCEPTED')">接受</el-button>
              <el-button size="small" type="danger" class="reject-btn" @click="respondInvitation(i.id, 'REJECTED')">拒絕</el-button>
</div>
<div v-else class="response">
  已{{ i.status?.toUpperCase() === 'ACCEPTED' ? '接受' : '拒絕' }}
</div>
          </div>
        </div>
      </div>
    </div>
    
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import axios from 'axios';
  import { ElMessageBox } from 'element-plus';
  
  const friends = ref([]);
  const invitations = ref([]);
  const statusList = ['線上中', '訓練中', '離線'];
  const statusFilter = ref('');
  
  const filteredFriends = computed(() => {
    return friends.value.filter(f => !statusFilter.value || f.status === statusFilter.value);
  });
  
  const loadFriends = async () => {
    const res = await axios.get('/api/friends');
    friends.value = res.data.map(f => ({
      ...f,
      status: statusList[Math.floor(Math.random() * statusList.length)],
      inviting: false,
    }));
  };
  
  const loadInvitations = async () => {
  const res = await axios.get('/api/training-invitations/received');
  invitations.value = res.data;
};
  
  const inviteTraining = async (friendId) => {
    try {
      const friend = friends.value.find(f => f.friendId === friendId);
      const { value: message } = await ElMessageBox.prompt(
  '<strong style="color:#4caf50;">請輸入訓練邀請訊息：</strong>',
  '💪 發送訓練邀請',
  {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '送出',
    cancelButtonText: '取消',
    inputPlaceholder: '今晚 19:00 一起健身！',
    customClass: 'training-prompt'
  }
);
      if (!message) return;
      friend.inviting = true;
      await axios.post('/api/training-invitations/invite', {
  receiverId: friendId,
  message
});
      loadInvitations();
    } catch {}
  };
  
  const respondInvitation = async (id, status) => {
    await axios.put(`/api/training-invitations/respond/${id}?status=${status}`);
    loadInvitations();
  };
  
  onMounted(() => {
    loadFriends();
    loadInvitations();
  });

  const pendingTrainingCount = computed(() =>
  invitations.value.filter(i => i.status === 'PENDING').length
);
  </script>
  
  <style scoped>
  /* 整體容器樣式 */
  .partner-page {
    max-width: 900px;
    margin: auto;
    padding: 100px 24px 24px; /* 上方空間 */
    color: #fff;
  }
  
  /* 區段統一樣式 */
  .section {
    margin-bottom: 40px;
  }
  .friend-section {
    background-color: #1a1a2f;
    padding: 20px;
    border-radius: 12px;
  }
  .invite-section {
    background-color: #1f1f30;
    padding: 20px;
    border-radius: 12px;
  }
  
  /* 狀態篩選器區 */
  .status-filter {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .status-filter select {
    background: #2c2c3e;
    color: #fff;
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #444;
  }
  
  /* 好友與邀請列表 */
  .friend-list, .invite-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  /* 卡片樣式 */
  .friend-card, .invite-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: #29293d;
    border-radius: 12px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }
  
  /* 頭像 */
  .avatar {
    width: 48px;
    height: 48px;
    background-color: #409eff;
    color: white;
    font-size: 20px;
    font-weight: bold;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
  }
  
  /* 使用者資訊 */
  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .name {
    font-weight: bold;
    font-size: 16px;
  }
  .status, .response {
    color: #aaa;
    font-size: 13px;
  }
  .status {
  display: flex;
  align-items: center;
  gap: 6px;
}
/* 主標題效果*/
  .partner-page h2 {
  font-size: 28px;
  font-weight: bold;
  color: #4caf50;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
  margin-bottom: 32px;
}

/* 好友清單 & 訓練通知 */
.partner-page h3 {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16px;
  border-left: 4px solid #4caf50;
  padding-left: 12px;
}

  /* 訊息 */
  .message {
    flex: 1;
    margin-left: 12px;
    color: #ddd;
  }
  
  /* 回覆按鈕區 */
  .actions {
    display: flex;
    gap: 10px;
    margin-left: auto;
  }
  
  /* 邀請按鈕 */
  .invite-btn {
    margin-left: auto;
  }
  .invite-header {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.badge {
  background-color: #f56c6c;
  color: #fff;
  font-size: 13px;
  font-weight: bold;
  border-radius: 50%;
  padding: 4px 8px;
  animation: badge-pulse 1.5s infinite;
}

/* 動畫：微抖動或放大縮小 */
@keyframes badge-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.25);
  }
}

/* Vue transition */
.badge-bounce-enter-active,
.badge-bounce-leave-active {
  transition: transform 0.4s;
}
.badge-bounce-enter-from,
.badge-bounce-leave-to {
  transform: scale(0);
}

.accept-btn {
  background-color: #4caf50 !important;
  color: white !important;
  border: none;
  font-weight: bold;
  transition: 0.2s;
}
.accept-btn:hover {
  background-color: #43a047 !important;
}

.reject-btn {
  background-color: #e53935 !important;
  color: white !important;
  border: none;
  font-weight: bold;
  transition: 0.2s;
}
.reject-btn:hover {
  background-color: #c62828 !important;
}

  </style>
  