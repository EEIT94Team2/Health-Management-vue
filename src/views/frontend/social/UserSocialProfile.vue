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
        <el-button class="action-button" @click="addFriend">👥 好友</el-button>
        <el-button class="action-button" @click="inviteTraining">💪 訓練邀請</el-button>
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
  const addFriend = () => {
    ElMessage.info('🚧 加好友功能尚未實作')
  }
  const inviteTraining = () => {
    ElMessage.info('🚧 訓練邀請功能尚未實作')
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
    gap: 10px;
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
/* 🔧 Dialog 彈窗外觀 */
:deep(.el-dialog) {
  background-color: #2c3e50;
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  color: #fff;
}

/* 標題置中 + 顏色 */
:deep(.el-dialog__title) {
  text-align: center;
  font-size: 22px;
  color: #4caf50;
  font-weight: bold;
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
  </style>
  