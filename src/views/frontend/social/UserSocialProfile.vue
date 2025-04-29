<template>
    <div class="profile-container">
      <!-- 預留大頭貼 -->
      <div class="avatar-placeholder">📷</div>
  
      <!-- 使用者名稱 -->
      <h1 class="profile-username">{{ user.name }}</h1>
  
      <!-- 心情輸入 -->
      <div class="user-info">
        <el-input
          v-model="user.mood"
          type="textarea"
          placeholder="💬 今天的心情..."
          class="mood-input"
          :rows="2"
        />
      </div>
  
      <!-- 操作按鈕 -->
<div class="action-buttons">
  <el-button class="action-button" @click="post">📝 貼文</el-button>

  <!-- 🎯 好友按鈕：有待處理邀請時顯示 Badge，否則正常顯示 -->
  <el-badge :value="pendingInvites" class="mr-2" v-if="pendingInvites > 0">
    <el-button class="action-button" @click="loadFriendData">
      <i class="ri-user-heart-line"></i> 👯好友
    </el-button>
  </el-badge>
  <el-button v-else class="action-button" @click="loadFriendData">
    <i class="ri-user-heart-line"></i> 👯好友
  </el-button>
 <!-- 訓練邀請 -->
 <el-badge :value="pendingTraining" class="mr-2" v-if="pendingTraining > 0">
</el-badge>
 
<!-- 💪 訓練邀請通知 -->
<el-badge :value="pendingTrainingCount" class="mr-2" v-if="pendingTrainingCount > 0">
  <el-button class="action-button" @click="showTrainingNoticeDialog = true">💪 訓練邀請通知</el-button>
</el-badge>
<el-button v-else class="action-button" @click="showTrainingNoticeDialog = true">
  💪 訓練邀請通知
</el-button>
<el-dialog v-model="showTrainingNoticeDialog" title="📩 訓練邀請通知" width="500px" center>
  <ul v-if="receivedTraining.length > 0">
    <li v-for="invite in receivedTraining" :key="invite.id" class="friend-invite-item">
  <div class="invite-info">
    <div class="friend-avatar">{{ invite.senderName?.charAt(0) || '?' }}</div>
    <div class="invite-details">
      <div class="friend-name">{{ invite.senderName || '未知使用者' }}</div>
      <div class="invite-msg">📨 {{ invite.message || '（無訊息）' }}</div>
    </div>
    <div class="invite-actions">
      <el-button size="small" type="success" @click="respondToInvite(invite.id, 'accepted')">接受</el-button>
      <el-button size="small" type="danger" @click="respondToInvite(invite.id, 'rejected')">拒絕</el-button>
    </div>
  </div>
</li>
  </ul>
  <div v-else>目前沒有新的訓練邀請通知。</div>
</el-dialog>
<el-button @click="loadSentTraining">📤 我發送的訓練邀請</el-button>
<el-dialog v-model="showSentTrainingDialog" title="📤 我發送的邀請">
  <ul class="sent-training-list">
    <li v-for="invite in sentTraining" :key="invite.id">
      <p :class="['invite-status-text', invite.status]">💪 你邀請了 {{ invite.receiverName }}：狀態是 {{ statusText(invite.status) }}</p>
    </li>
  </ul>
</el-dialog>
  <el-button class="action-button" @click="openFavorites">⭐ 收藏</el-button>
</div>
  
      <!-- 貼文載入中 -->
      <div v-if="isLoading" style="text-align: center; margin-top: 20px;">🚀 載入中...</div>
  
      <!-- 顯示貼文 -->
      <div v-if="showPosts && posts.length" class="user-posts">
        <h2 class="posts-title">📝 我的貼文</h2>
        <ul>
          <li v-for="p in posts" :key="p.id" class="post-item">
            <div class="post-left">
              <strong>{{ p.title }}</strong>
              <span class="post-category">（{{ categoryMap[p.category] || p.category }}）</span>
              <p class="post-content">{{ p.content }}</p>
            </div>
            <div class="post-right">
              <div>👍 {{ p.likeCount || 0 }}</div>
              <div>💬 {{ p.commentCount || 0 }}</div>
              <div class="post-actions">
                <el-button text size="small" @click="editPost(p)">✏️</el-button>
                
              </div>
            </div>
          </li>
        </ul>
      </div>
          <!-- 我的收藏 -->
    <div v-if="showFavorites && favoritePosts.length" class="user-posts">
      <h2 class="posts-title">⭐ 我的收藏</h2>
      <ul>
        <li v-for="p in favoritePosts" :key="p.id" class="post-item">
          <div class="post-left">
            <strong>{{ p.title }}</strong>
            <span class="post-category">（{{ categoryMap[p.category] || p.category }}）</span>
            <p class="post-content">{{ p.content }}</p>
          </div>
        </li>
      </ul>
    </div>

      <!-- ✏️ 編輯貼文 Dialog -->
      <el-dialog v-model="editDialogVisible" title="編輯貼文" width="500px" center>
        <el-form label-position="top">
          <el-form-item label="標題">
            <el-input v-model="editForm.title" />
          </el-form-item>
          <el-form-item label="內容">
            <el-input type="textarea" :rows="5" v-model="editForm.content" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">儲存</el-button>
        </template>
      </el-dialog>
    </div>
   <!-- 好友清單 Dialog -->
   <el-dialog v-model="showFriendDialog" title="好友清單" width="500px" class="friend-dialog">
      <div>
        <div class="friend-section-title">📨 收到的邀請</div>
        <ul v-if="receivedInvites.length">
  <li v-for="invite in receivedInvites" :key="invite.id" class="friend-invite-item">
    <div class="invite-info">
      <div class="friend-avatar">{{ invite.inviterName?.charAt(0) || '?' }}</div>
      <div class="invite-details">
        <div class="friend-name">{{ invite.inviterName || '未知使用者' }}</div>
        <div class="invite-actions">
          <el-button size="small" type="success" @click="acceptInvite(invite.id)">接受</el-button>
          <el-button size="small" type="danger" @click="rejectInvite(invite.id)">拒絕</el-button>
        </div>
      </div>
    </div>
  </li>
</ul>
        <p v-else>目前沒有收到邀請</p>

      <div class="friend-section-title">👯 我的好友</div>
      <ul>
        <li v-for="f in myFriends" :key="f.friendId" class="friend-item">
  <div class="friend-avatar">{{ f.friendName?.charAt(0) || "?" }}</div>
  <div class="friend-info">
    <div class="friend-name">{{ f.friendName }}</div>
    <el-button size="small" type="primary" class="invite-btn" @click="openTrainingDialog(f)">
      💪 邀請訓練
    </el-button>
    <el-button size="small" type="danger" class="remove-btn" @click="removeFriend(f.friendId)">
          ❌ 刪除
        </el-button>
  </div>
</li>
      </ul>
      </div>

</el-dialog>

<!-- 訓練邀請 -->
<el-dialog v-model="showTrainingDialog" title="發送訓練邀請" width="500px" center>
  <div class="user-popup-content">
    <p>發送給：<strong>{{ selectedFriend?.friendName }}</strong></p>
    <el-input
      type="textarea"
      v-model="trainingMessage"
      placeholder="請輸入邀請內容..."
      rows="4"
    />
    <div class="popup-actions">
      <el-button type="primary" @click="sendTrainingInvitation">送出邀請</el-button>
      <el-button @click="showTrainingDialog = false">取消</el-button>
    </div>
  </div>
</el-dialog>
  </template>
  
  <script setup>
  import { reactive, ref, watch, onMounted } from 'vue'
  import axios from 'axios'
  import { ElMessage } from 'element-plus'
  
// 取得登入使用者
const userInfo = JSON.parse(localStorage.getItem('userInfo'))
const user = reactive({
  name: userInfo?.name || '訪客',
  mood: ''
})

// 產生專屬 key：userMood_阿達、userMood_小明
const moodKey = `userMood_${user.name}`

// 讀取該使用者的心情
onMounted(() => {
  const savedMood = localStorage.getItem(moodKey)
  if (savedMood) user.mood = savedMood
})

// 當心情更新時，儲存到各自 key
watch(() => user.mood, (newMood) => {
  localStorage.setItem(moodKey, newMood)
})

  // 分類對照表
  const categoryMap = {
    fitness: "健身",
    nutrition: "營養",
    recipe: "食譜",
    motivation: "動機",
    question: "問題"
  }
  
  // 我的貼文狀態
  const posts = ref([])
  const showPosts = ref(false)
  const isLoading = ref(false)

  // 🔹收藏貼文狀態
const favoritePosts = ref([])
const showFavorites = ref(false)
  
  // 查詢使用者貼文
  const post = async () => {
    try {
      isLoading.value = true
      const token = localStorage.getItem("token")
      const res = await axios.get('/api/posts/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      posts.value = res.data
      showPosts.value = true
    } catch (err) {
      console.error(err)
      ElMessage.error('❌ 載入貼文失敗')
    } finally {
      isLoading.value = false
    }
  }
  const openFavorites = async () => {
  try {
    const token = localStorage.getItem("token")
    const res = await axios.get("/api/favorites/posts", {
      headers: { Authorization: `Bearer ${token}` }
    })
    favoritePosts.value = res.data
    showFavorites.value = true
    showPosts.value = false
  } catch (err) {
    console.error(err)
    ElMessage.error("❌ 載入收藏失敗")
  }
}

// 好友
const pendingInvites = ref(0)
const showFriendsDialog = ref(false)
const receivedInvites = ref([])
const friendList = ref([])
const showFriendDialog = ref(false)
const myFriends = ref([])
const showTrainingListDialog = ref(false)

// 載入好友與邀請資料
const loadFriendData = async () => {
  try {
    const token = localStorage.getItem("token")
    const headers = { Authorization: `Bearer ${token}` }

    const [inviteRes, friendRes] = await Promise.all([
      axios.get("/api/friend-invitations/received", { headers }),
      axios.get("/api/friends", { headers }),
    ])

    receivedInvites.value = inviteRes.data
    myFriends.value = friendRes.data
    showFriendDialog.value = true
  } catch (err) {
    console.error("載入好友資料失敗", err)
    ElMessage.error("載入好友資料失敗")
  }
}
const refreshInviteCount = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("/api/friend-invitations/received", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    pendingInvites.value = res.data.length;
  } catch (err) {
    console.error("更新邀請通知數失敗", err);
  }
};
// 單獨載入好友（非邀請）
const loadFriends = async () => {
  try {
    const token = localStorage.getItem("token")
    const headers = { Authorization: `Bearer ${token}` }

    const res = await axios.get("/api/friends", { headers })
    myFriends.value = res.data
  } catch (err) {
    console.error("取得好友失敗", err)
    ElMessage.error("無法載入好友清單")
  }
}

// 接受邀請
const acceptInvite = async (id) => {
  try {
    await axios.post(`/api/friend-invitations/${id}/accept`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    ElMessage.success("已接受邀請")
    await loadFriendData()
    await refreshInviteCount()
  } catch (err) {
    console.error("接受邀請失敗", err)
    ElMessage.error("接受失敗")
  }
}

// 拒絕邀請
const rejectInvite = async (id) => {
  try {
    await axios.post(`/api/friend-invitations/${id}/reject`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    ElMessage.info("已拒絕邀請")
    await loadFriendData()
    await refreshInviteCount()
  } catch (err) {
    console.error("拒絕邀請失敗", err)
    ElMessage.error("拒絕失敗")
  }
}
onMounted(() => {
  refreshInviteCount();
});

const removeFriend = async (friendId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`/api/friends/${friendId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    ElMessage.success("✅ 已刪除好友");
    await loadFriendData(); // 重新載入好友
  } catch (err) {
    console.error("刪除好友失敗", err);
    ElMessage.error("❌ 刪除好友失敗");
  }
};
// 訓練邀請
const showTrainingDialog = ref(false)
const pendingTraining = ref(0)
const selectedFriend = ref(null)
const trainingMessage = ref("")
const pendingTrainingCount = ref(0)
const receivedTraining = ref([])
const showTrainingNoticeDialog = ref(false)

const openTrainingDialog = (friend) => {
  selectedFriend.value = friend
  trainingMessage.value = ""
  showTrainingDialog.value = true
}
const sendTrainingInvitation = async () => {
  try {
    const token = localStorage.getItem("token")
    await axios.post("/api/training-invitations/invite", {
  receiverId: selectedFriend.value.friendId,
  message: trainingMessage.value
}, {
  headers: { Authorization: `Bearer ${token}` }
})

    ElMessage.success("邀請已送出 ✅")
    showTrainingDialog.value = false
  } catch (err) {
    console.error(err)
    ElMessage.error("邀請發送失敗")
  }
}
const fetchTrainingInvites = async () => {
  try {
    const token = localStorage.getItem("token")
    const res = await axios.get("/api/training-invitations/received", {
      headers: { Authorization: `Bearer ${token}` }
    })
    receivedTraining.value = res.data
    pendingTrainingCount.value = res.data.length
  } catch (err) {
    console.error("❌ 無法取得訓練邀請通知", err)
  }
}

const respondToInvite = async (id, status) => {
  try {
    const token = localStorage.getItem("token")
    await axios.put(`/api/training-invitations/respond/${id}?status=${status}`, null, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ElMessage.success(status === "accepted" ? "已接受邀請" : "已拒絕邀請")

    // 👉 前端移除該筆通知
    const index = receivedTraining.value.findIndex(invite => invite.id === id)
    if (index !== -1) {
      receivedTraining.value.splice(index, 1)
      pendingTrainingCount.value = receivedTraining.value.length
    }

  } catch (err) {
    console.error(err)
    ElMessage.error("操作失敗")
  }
}

onMounted(() => {
  fetchTrainingInvites()
})
const sentTraining = ref([])
const showSentTrainingDialog = ref(false)
const loadSentTraining = async () => {
  try {
    const token = localStorage.getItem("token")
    const res = await axios.get("/api/training-invitations/sent", {
      headers: { Authorization: `Bearer ${token}` }
    })
    sentTraining.value = res.data
    showSentTrainingDialog.value = true
  } catch (err) {
    ElMessage.error("無法載入發送紀錄")
  }
}
const statusText = (status) => {
  switch (status) {
    case 'accepted':
      return '✅ 已接受'
    case 'rejected':
      return '❌ 已拒絕'
    case 'pending':
    default:
      return '⏳ 等待中'
  }
}
  // 編輯貼文狀態
const editDialogVisible = ref(false);
const editForm = reactive({
  id: null,
  title: '',
  content: '',
  category: ''
});

// 編輯按鈕：開啟 Dialog 並填入資料
const editPost = (post) => {
  editForm.id = post.id;
  editForm.title = post.title;
  editForm.content = post.content;
  editForm.category = post.category;
  editDialogVisible.value = true;
};

// 儲存更新貼文
const submitEdit = async () => {
  try {
    await axios.put(`/api/posts/${editForm.id}`, {
      title: editForm.title,
      content: editForm.content,
      category: editForm.category
    });
    ElMessage.success('貼文已更新 ✅');
    editDialogVisible.value = false;

    // 前端同步更新內容
    const idx = posts.value.findIndex(p => p.id === editForm.id);
    if (idx !== -1) {
      posts.value[idx].title = editForm.title;
      posts.value[idx].content = editForm.content;
    }
  } catch (err) {
    ElMessage.error('更新失敗');
    console.error(err);
  }
};
  </script>
  
  <style scoped>
  .profile-container {
    background: #1f2a3a;
    color: #fff;
    max-width: 600px;
    margin: 100px auto;
    padding: 60px 20px 40px;
    border-radius: 12px;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
  }
  
  /* 大頭貼 */
  .avatar-placeholder {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 2px solid #4caf50;
    background-color: #2c3e50;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: #888;
    transition: 0.3s;
  }
  .avatar-placeholder:hover {
    border-color: #81c784;
    cursor: pointer;
  }
  
  .profile-username {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
    color: #4caf50;
  }
  
  .user-info {
    margin-bottom: 20px;
  }
  
  .mood-input :deep(.el-input__wrapper) {
    background-color: #2c3e50;
    border: 1px solid #444;
    border-radius: 8px;
  }
  .mood-input :deep(.el-input__inner) {
    color: #fff;
    background-color: transparent;
  }
  
  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
  }
  .action-button {
    background-color: #2c3e50;
    color: #fff;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 8px;
    transition: 0.3s;
  }
  .action-button:hover {
    background-color: #4caf50;
    transform: translateY(-1px);
  }
   /* 好友樣式 */
   .friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4caf50;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}
.friend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.friend-name {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}
  /* 🔽 貼文區塊樣式 */
  .user-posts {
    margin-top: 30px;
    background-color: #2c3e50;
    border-radius: 10px;
    padding: 20px;
  }
  .posts-title {
    font-size: 20px;
    color: #4caf50;
    margin-bottom: 10px;
  }
  .post-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background-color: #2c3e50;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid #444;
    color: #ddd;
  }
  .post-left {
    flex: 1;
    max-width: 80%;
  }
  .post-category {
    color: #aaa;
    font-size: 14px;
    margin-left: 6px;
  }
  .post-content {
    margin-top: 8px;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: break-word;
    line-height: 1.5;
  }
  .post-right {
    text-align: right;
    min-width: 70px;
    font-size: 14px;
    color: #ccc;
    line-height: 1.8;
  }
  .post-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

/* 表單項目間距與標籤 */
:deep(.el-form-item) {
  margin-bottom: 18px;
}
:deep(.el-form-item__label) {
  color: #ccc;
  font-size: 16px;
}

/* 輸入框樣式統一 */
:deep(.el-input__wrapper) {
  background-color: #34495e;
  border: 1px solid #555;
  border-radius: 8px;
}
:deep(.el-input__inner) {
  background-color: transparent;
  color: #fff;
}

/* 彈窗底部按鈕 */
:deep(.el-dialog__footer) {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
:deep(.el-button) {
  background-color: #2c3e50;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
}
:deep(.el-button:hover) {
  background-color: #4caf50;
  color: #fff;
}
:deep(.el-textarea__inner),
:deep(.el-input__wrapper) {
  background-color: #2c3e50 !important;
  border: 1px solid #555;
  border-radius: 8px;
  color: #fff;
}
:deep(.el-textarea__inner) {
  padding: 10px 12px;
  font-size: 16px;
  line-height: 1.5;
}
/* 已發送邀請通知樣式 */
.sent-training-list p {
  color: #90caf9; 
  font-size: 16px;
  margin: 8px 0;
}
.invite-status-text {
  font-size: 16px;
  margin: 6px 0;
}
.invite-status-text.accepted {
  color: #4caf50; /* 綠色 */
}
.invite-status-text.rejected {
  color: #f44336; /* 紅色 */
}
.invite-status-text.pending {
  color: #ffc107; /* 黃色 */
}
/* 🔧 Dialog 彈窗外觀 */
:deep(.el-dialog) {
  background-color: #2c3e50;
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  color: #fff;
}

.invite-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.invite-msg {
  color: #ccc;
  font-size: 14px;
  margin-top: 4px;
}
.friend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.friend-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
}

.invite-btn {
  margin-left: auto;
}
.user-popup-content {
  color: #fff; /* 你想要的字體顏色，可自訂 */
  font-size: 16px;
}

.user-popup-content strong {
  color: #4caf50; /* 名字部分加亮綠色 */
}

.user-popup-content .el-textarea__inner {
  background-color: #2c3e50;
  color: #fff;
}
.friend-invite-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.invite-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.friend-avatar {
  width: 40px;
  height: 40px;
  background-color: green;
  color: #fff;
  font-size: 20px;
  border-radius: 50%;
  margin-right: 12px;
}
.invite-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.invite-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
  </style>
  
<style>
/* 針對所有 el-dialog 統一樣式 */
.el-dialog {
  background-color: #2c3e50;
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  color: #fff;
}
.el-dialog__title {
  text-align: center;
  font-size: 22px;
  color: #4caf50;
  font-weight: bold;
}
.el-dialog__footer {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.el-dialog .el-button {
  background-color: #2c3e50;
  color: #fff;
  border: 1px solid #4caf50;
  padding: 8px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.el-dialog .el-button:hover {
  background-color: #4caf50;
  color: #fff;
}

.friend-dialog.el-dialog{
  background-color: #2c3e50;
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  color: #fff;
}

.friend-section-title {
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  border-bottom: 1px solid #4caf50;
  margin: 16px 0 8px;
  padding-bottom: 6px;
}

</style>
