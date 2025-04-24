<template>
  <div class="view-container">
    <h1>論壇文章列表</h1>

<!-- 🔍 主題篩選 -->
<div class="category-tabs">
  <el-button
    v-for="cat in categories"
    :key="cat.value"
    :class="['custom-button', { active: selectedCategory === cat.value }]"
    size="small"
    @click="selectCategory(cat.value)"
  >
    {{ cat.label }}
  </el-button>
</div>

    <!-- 🔍 查詢欄位 -->
    <div class="search-box">
  <el-input
    v-model="searchTitle"
    placeholder="搜尋文章標題..."
    clearable
    class="search-input"
  />
  <el-input
    v-model="searchComment"
    placeholder="搜尋留言內容..."
    clearable
    class="search-input"
  />
</div>

<!-- 📌 發表文章 + 排序選單 同一列 -->
<div class="action-bar">
  <!-- 左邊按鈕 -->
  <el-button type="success" @click="goToCreatePost" class="post-button">
    ➕ 發表文章
  </el-button>

  <!-- 右邊排序 -->
  <div class="sort-box">
    <label for="sortType">排序依據：</label>
    <select id="sortType" v-model="sortType">
      <option value="newest">最新</option>
      <option value="mostViewed">最熱門</option>
      <option value="mostCommented">最多留言</option>
    </select>
  </div>
</div>
    <!-- 每篇文章卡片+分頁 -->
    <div class="post-card" v-for="post in pagedPosts" :key="post.id">
      <div class="view-count">👀 {{ post.viewCount || 0 }}</div>
      <div class="post-header">
        <strong class="post-title">{{ post.title }}</strong>
        <div class="post-meta-right">
          <span>📌 {{ categoryMap[post.category] }}</span>
          <span class="action-button" @click="showUserPopup(post.user)">🧑‍💻 {{ post.user?.name }}
        </span>
          <span>📅 {{ formatDate(post.createdAt) }}</span>
        </div>
      </div>

  <div class="post-body" @click="toggleExpand(post.id)">
    {{ expandedPosts[post.id] ? post.content : post.content.slice(0, 100) + (post.content.length > 100 ? '...' : '') }}
  </div>

      <!-- 🔸 上方：統計 -->
<div class="post-stats">
  <span class="likes-count">👍 {{ post.likeCount }} </span>
</div>

<!-- 🔸 下方：功能按鈕列 -->
<div class="post-actions">
  <span
    class="action-button"
    :class="{ active: post.liked }"
    @click="toggleLike(post)"
  >
    {{ post.liked ? "收回👍" : "👍讚" }}
  </span>

  <span
    class="action-button"
    @click.stop="toggleComment(post.id)"
  >
    💬 留言（{{ post.commentCount || 0 }}）
  </span>

  <!-- 收藏按鈕 -->
<span
  class="action-button favorite-button"
  @click="toggleFavorite(post)"
>
  {{ post.favorited ? "💚 已收藏" : "⭐ 收藏" }}
</span>
</div>

      <!-- 🔸 留言區 -->
      <div class="comment-box" v-if="activePostId === post.id">
        
        <template v-if="comments[post.id]">
          <ul v-if="filteredComments(post.id).length" :key="activePostId">
            <li
              v-for="comment in filteredComments(post.id)"
              :key="comment.id"
              class="comment-item"
            >
              <div class="left">
                <strong>{{ comment.user?.name || "未知使用者" }}：</strong>
                <span v-if="editingCommentId !== comment.id">{{ comment.text }}</span>
                <el-input
                  v-else
                  v-model="editedCommentContent"
                  size="small"
                  class="inline-edit-input"
                />
              </div>
              <div class="right" v-if="comment.user?.name === currentUser.name">
  <!-- 編輯：鉛筆 -->
  <el-button text size="small" @click="startEdit(comment)" v-if="editingCommentId !== comment.id" class="icon-button edit">
    ✏️
  </el-button>

  <!-- 儲存：OK -->
  <el-button text size="small" @click="submitEdit(comment.id)" v-if="editingCommentId === comment.id" class="icon-button save">
    ✅
  </el-button>

  <!-- 刪除：叉叉 -->
  <el-button text size="small" type="danger" @click="deleteComment(comment.id)" class="icon-button delete">
    ❌
  </el-button>
</div>
            </li>
          </ul>
          <div v-else>尚無留言</div>
        </template>
        <div v-else>無留言</div>

        <el-input
          type="textarea"
          v-model="newComments[post.id]"
          placeholder="輸入留言內容"
          :rows="2"
          class="mt-2"
        />
        <el-button type="primary" size="small" class="mt-1" @click="submitComment(post.id)">
          發表留言
        </el-button>
      </div>
    </div>

    <!-- 🔁 分頁元件：total 改為 sortedPosts 長度 ✅ -->
    <div class="pagination-box">
      <el-pagination
        class="custom-pagination"
        layout="prev, pager, next"
        :total="sortedPosts.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        background
        small
      />
    </div>
  </div>
  <!-- 👤 發文者資訊彈窗 -->
<el-dialog v-model="userDialogVisible" title="發文者資訊" width="400px" center>
  <div class="user-popup-content">
    <div class="avatar">{{ selectedUser?.name?.charAt(0) }}</div>
    <h3>{{ selectedUser?.name }}</h3>
    <div class="user-mood"> {{ authorMood }}</div>
    <div class="popup-actions">
      <el-button @click="sendFriendRequest">➕ 加好友</el-button>
      <el-button @click="sendTrainingInvite">💪 訓練邀請</el-button>
    </div>
  </div>
</el-dialog>



</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { useRouter } from 'vue-router';

const posts = ref([]);
const comments = reactive({});
const newComments = reactive({});
const activePostId = ref(null);
const editingCommentId = ref(null);
const editedCommentContent = ref("");
const userInfoStr = localStorage.getItem("userInfo");
const currentUser = reactive(userInfoStr ? JSON.parse(userInfoStr) : { name: "" });

const searchTitle = ref("");
const searchComment = ref("");
const viewedPosts = reactive({});
// 🔹 追蹤哪些文章展開了
const expandedPosts = reactive({});

// 主題分類
const categories = [
  { label: "全部", value: "all" },
  { label: "健身", value: "fitness" },
  { label: "營養", value: "nutrition" },
  { label: "食譜", value: "recipe" },
  { label: "動機", value: "motivation" },
  { label: "問題", value: "question" },
];
const categoryMap = {
  fitness: "健身",
  nutrition: "營養",
  recipe: "食譜",
  motivation: "動機",
  question: "問題",
};
const selectedCategory = ref("all");
const pageSize = 10;
const currentPage = ref(1);

// 發表文章
const router = useRouter();
const goToCreatePost = () => {
  router.push('/social/forumcreate');
};

// 交流
const userDialogVisible = ref(false)
const selectedUser = ref(null)
const authorMood = ref("")

const showUserPopup = async (user) => {
  selectedUser.value = user
  userDialogVisible.value = true

  // ⏬ 顯示心情（前端模擬）
  try {
    const moodKey = `userMood_${user.name}`
    const mood = localStorage.getItem(moodKey)
    authorMood.value = mood || "這位使用者尚未留下心情"
  } catch (err) {
    authorMood.value = "無法載入心情資料"
  }
}

// 發送好友邀請
const sendFriendRequest = async () => {
  try {
    const token = localStorage.getItem("token")
    await axios.post(`/api/friend-invitations/${selectedUser.value.userId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    ElMessage.success(`已送出好友邀請給 ${selectedUser.value.name}`)
  } catch (err) {
    if (err.response?.status === 400) {
      ElMessage.warning(err.response.data) // 顯示後端回傳的錯誤訊息，例如已邀請
    } else {
      ElMessage.error("發送好友邀請失敗")
    }
    console.error(err)
  }
}

const sendTrainingInvite = () => {
  ElMessage.success(`💪 已送出訓練邀請給 ${selectedUser.value?.name}`)
}


//日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};
// 過濾文章
const filteredPosts = computed(() => {
  return posts.value
    .filter((p) => selectedCategory.value === "all" || p.category === selectedCategory.value)
    .filter((p) => p.title.includes(searchTitle.value.trim()));
});

const filteredAndPagedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredPosts.value.slice(start, start + pageSize);
});

// 留言過濾
const filteredComments = (postId) => {
  const list = comments[postId] || [];
  const keyword = searchComment.value.trim();
  return keyword ? list.filter((c) => c.text?.includes(keyword)) : list;
};
// 排序
const sortType = ref("newest");
const sortedPosts = computed(() => {
  return [...filteredPosts.value].sort((a, b) => {
    if (sortType.value === "mostCommented") {
      return (b.commentCount || 0) - (a.commentCount || 0);
    }
    if (sortType.value === "mostViewed") {
      return (b.viewCount || 0) - (a.viewCount || 0);
    }
    // 預設以建立時間排序（假設有 createdAt 欄位）
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
});
// 載入文章
const loadPosts = async () => {
  try {
    const res = await axios.get("/api/posts");
      // 加入 liked 狀態：每篇文章是否被使用者按讚
      posts.value = res.data.map(p => ({
      ...p,  // 展開原本的文章屬性
      liked: p.liked,  // 是否已按讚
      favorited: p.favorited      // 是否已收藏
    }));
  } catch (err) {
    ElMessage.error("文章載入失敗");
  }
};
//預覽文章
const toggleExpand = async (postId) => {
  expandedPosts[postId] = !expandedPosts[postId];

  // 如果剛剛展開 + 還沒讀過 → 呼叫後端增加瀏覽數
  if (expandedPosts[postId] && !viewedPosts[postId]) {
    try {
      await axios.get(`/api/posts/${postId}`);  // 後端增加瀏覽數
       // 更新前端畫面中的 viewCount
       const post = pagedPosts.value.find(p => p.id === postId);
      if (post) {
        post.viewCount = (post.viewCount || 0) + 1;
      }

      viewedPosts[postId] = true;
    } catch (err) {
      console.error("增加瀏覽數失敗", err);
    }
  }
};

// 載入留言
const loadComments = async (postId) => {
  try {
    const res = await axios.get(`/api/comments/post/${postId}`);
    comments[postId] = res.data;
  } catch {
    ElMessage.error("留言載入失敗");
  }
};

// 新增留言
const submitComment = async (postId) => {
  const content = newComments[postId];
  if (!content || content.trim() === "") {
    ElMessage.warning("請輸入留言內容");
    return;
  }
  try {
    await axios.post(`/api/comments/post/${postId}`, { content });
    ElMessage.success("留言成功");
    newComments[postId] = "";
    await loadComments(postId);
  } catch {
    ElMessage.error("留言失敗");
  }
};

// 編輯留言
const startEdit = (comment) => {
  editingCommentId.value = comment.id;
  editedCommentContent.value = comment.text || "";
};

const submitEdit = async (commentId) => {
  try {
    await axios.put(`/api/comments/${commentId}`, { content: editedCommentContent.value });
    ElMessage.success("留言更新成功");
    editingCommentId.value = null;
    editedCommentContent.value = "";
    await loadComments(activePostId.value);
  } catch {
    ElMessage.error("更新失敗");
  }
};

// 刪除留言
const deleteComment = async (commentId) => {
  try {
    await axios.delete(`/api/comments/${commentId}`);
    ElMessage.success("留言刪除成功");
    await loadComments(activePostId.value);
  } catch {
    ElMessage.error("刪除失敗");
  }
};

// 點擊展開留言
const toggleComment = (postId) => {
  activePostId.value = activePostId.value === postId ? null : postId;
  if (activePostId.value && !comments[postId]) {
    loadComments(postId);
  }
};

// 按讚功能
const toggleLike = async (post) => {
  try {
    if (!post.liked) {
      // 尚未按讚 → 發送 POST 請求
      await axios.post(`/api/posts/${post.id}/like`);
      post.likeCount += 1;
      post.liked = true;
    } else {
      // 已按讚 → 發送 DELETE 請求
      await axios.delete(`/api/posts/${post.id}/like`);
      post.likeCount -= 1;
      post.liked = false;
    }
  } catch (err) {
    ElMessage.error("操作失敗");
  }
};

// 收藏功能
const toggleFavorite = async (post) => {
  try {
    if (!post.favorited) {
      // 尚未收藏 → 發送 POST
      await axios.post(`/api/favorites/${post.id}`);
      post.favorited = true;
      ElMessage.success("已加入收藏");
    } else {
      // 已收藏 → 發送 DELETE
      await axios.delete(`/api/favorites/${post.id}`);
      post.favorited = false;
      ElMessage.success("已取消收藏");
    }
  } catch (err) {
    ElMessage.error("收藏操作失敗");
  }
};

// ✅ 新增 pagedPosts：根據排序後的資料再切分分頁
const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return sortedPosts.value.slice(start, start + pageSize);
});

const selectCategory = (cat) => {
  selectedCategory.value = cat;
  currentPage.value = 1;
};

onMounted(loadPosts);
</script>

<style scoped>
.view-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}
/* 分類 */
.custom-button {
  background-color: #2c3e50;
  border: none;
  color: #fff;
  transition: background-color 0.3s;
  margin-bottom: 4px;
  margin-top: 10px;
  padding: 20px 46.5px;
  font-size: 20px;
  border-radius: 6px;
}

.custom-button:hover {
  background-color: #4caf50;
  color: #fff;
  transform: translateY(-1px);
}
/* 選中的分類保留綠色背景 */
.custom-button.active {
  background-color: #4caf50;
  color: #fff;
}

/* 搜尋 */
.search-box {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  margin: 4px 6px 15px 6px;
}
.search-input :deep(.el-input__wrapper) {
  background-color: #2c3e50;
  border: 1px solid black;
  border-radius: 8px;
  box-shadow: none;
  padding: 4px 12px;
}


.user-mood {
  margin-top: 10px;
  font-size: 16px;
  color: #aaa;
  text-align: center;
}
/* 搜尋文字顏色 */
.search-input :deep(.el-input__inner) {
  color: #fff;
  background-color: transparent;
}
/* 深色留言輸入框樣式 */
:deep(.el-textarea__inner) {
  background-color: #2c3e50;
  color: #fff;
  border: 1px solid #4caf50;
  border-radius: 8px;
  padding: 10px;
  font-size: 15px;
}

/* 發文+排序樣式 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

/* 左側發表文章按鈕 */
.post-button {
  background-color: #444;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
}

/* 右側排序選單樣式 */
.sort-box {
  text-align: right;
  color: #ccc;
}
.sort-box select {
  background-color: #2c3e50;
  color: #fff;
  border-radius: 6px;
  padding: 4px 8px;
  border: 1px solid #444;
}

/* 發表留言按鈕樣式 */
:deep(.el-button--primary) {
  background-color: #4caf50;
  border-color: #4caf50;
  color: #fff;
  font-weight: bold;
  border-radius: 6px;
  padding: 8px 20px;
}

:deep(.el-button--primary:hover) {
  background-color: #43a047;
  border-color: #43a047;
}
.post-card {
  position: relative;
  background: #1f2a3a;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  color: #fff;

  .view-count {
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 10px;
  color: #ccc;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
}

/* 收藏 */
.favorite-button {
  color: #ccc;
  cursor: pointer;
  transition: color 0.3s ease;
}

.favorite-button:hover {
  color: #4caf50; /* 綠色 hover 效果 */
}

.favorite-button.active {
  color: #4caf50; /* 點擊後變綠色 */
}

  /* 高度可變動 */
  overflow: visible;
}
.post-header {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.post-title {
  font-size: 18px;
}
.post-meta {
  color: #aaa;
  font-size: 14px;
  margin-left: 8px;
}
.post-body {
  margin: 10px 0;
  line-height: 1.5;
  color: #ddd;

.post-title {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.post-meta-right {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 14px;
  color: #aaa;
}
   /* 文字自動換行 */
  white-space: normal;
  word-break: break-word;
}
.post-footer {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  color: #ccc;
  font-size: 14px;
}
.like-button {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.like-button:hover {
  color: #4caf50;
}
.comment-box {
  margin-top: 15px;
}
.comment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 10px;
}
/* 共用樣式 */
.icon-button {
  font-size: 16px;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #ccc;
}

/* 按下時縮小一點點 */
.icon-button:active {
  transform: scale(0.95);
}

/* 編輯（鉛筆）hover：綠色 */
.icon-button.edit:hover {
  background-color: #2e7d32;
  color: #fff;
}

/* 儲存（✅）hover：藍色 */
.icon-button.save:hover {
  background-color: #1565c0;
  color: #fff;
}

/* 刪除（❌）hover：紅色 */
.icon-button.delete:hover {
  background-color: #b71c1c;
  color: #fff;
}
.comment-button {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.comment-button:hover {
  color: #4caf50;
}

.inline-edit-input {
  width: 60%;
  margin-left: 10px;
}
.mr-2 {
  margin-right: 10px;
}
.pagination-box {
  text-align: center;
  margin-top: 20px;
}
/* ✅ 修正後的寫法 */
:deep(.custom-pagination .el-pager li) {
  background-color: #2c3e50;
  color: #fff;
  border-radius: 6px;
  padding: 0 10px;
  transition: background-color 0.3s ease;
}

:deep(.custom-pagination .el-pager li:hover) {
  background-color: #4caf50;
  color: #fff;
}

:deep(.custom-pagination .el-pager li.is-active) {
  background-color: #4caf50;
  color: #fff;
}

:deep(.custom-pagination .btn-prev),
:deep(.custom-pagination .btn-next) {
  background-color: #2c3e50;
  color: #fff;
  border-radius: 6px;
}

:deep(.custom-pagination .btn-prev:hover),
:deep(.custom-pagination .btn-next:hover) {
  background-color: #4caf50;
  color: #fff;
}
.post-body {
  cursor: pointer;
}

.post-stats {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #aaa;
  margin-bottom: 8px;
  padding-bottom: 6px;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #2c3e50;
}

.action-button {
  cursor: pointer;
  color: #ccc;
  font-weight: 500;
}

.action-button:hover {
  color: #4caf50;
}

.action-button.active {
  color: #4caf50;
}

</style>


<style>
/* 發文者資訊 */
.el-dialog {
  background-color: #2c3e50;
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  color: #fff;
}
/* 標題 */
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
/* 彈出視窗內的內容樣式 */
.user-popup-content {
  text-align: center;
  color: #fff;
}
.user-popup-content .avatar {
  width: 90px;
  height: 90px;
  background-color: #1f2a3a;
  color: #fff;
  font-size: 36px;
  font-weight: bold;
  margin: 0 auto 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* 心情欄位樣式 */
.user-popup-content .user-mood {
  font-size: 16px;
  color: #ccc;
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}
.user-popup-content .user-mood::before {
  content: "💬";
}
</style>

