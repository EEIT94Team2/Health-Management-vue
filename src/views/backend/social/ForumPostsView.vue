<template>
  <div class="view-container">
    <h2>論壇文章管理</h2>

    <!-- 🔍 主題篩選 -->
    <div class="category-tabs">
      <el-button
        v-for="cat in categories"
        :key="cat.value"
        :type="cat.value === selectedCategory ? 'primary' : 'default'"
        size="small"
        @click="selectCategory(cat.value)"
      >
        {{ cat.label }}
      </el-button>
    </div>
    <!-- 放在 <template> 的 container 最外層 -->
<div class="notification-wrapper">
  <el-button type="warning" icon="Bell" @click="showNotifications = !showNotifications">
    檢舉通知
  </el-button>

  <div v-if="showNotifications" class="notification-dropdown">
    <p>🔔 使用者 Tim 檢舉留言不當內容</p>
    <p>🔔 使用者 Sabrina 檢舉文章違規</p>
    <p>🔔 使用者 Amy 檢舉留言不當內容</p>
    <p>🔔 使用者 John 檢舉留言不當內容</p>
    <p>🔔 使用者 Mark 檢舉文章違規</p>
    <p>🔔 使用者 Mary 檢舉留言不當內容</p>
  </div>
</div>

    <el-select v-model="sortOption" placeholder="排序方式" size="small" class="sort-select">
  <el-option label="最新" value="newest" />
  <el-option label="最多點閱" value="viewCount" />
  <el-option label="最多按讚" value="likeCount" />
</el-select>
    <!-- 🔍 查詢欄位 -->
    <div class="search-box">
      <el-input v-model="searchTitle" placeholder="搜尋文章標題..." class="mr-2" clearable />
      <el-input v-model="searchComment" placeholder="搜尋留言內容..." clearable />
    </div>

    <el-table
  :data="sortedAndPagedPosts"
  style="width: 100%"
  stripe
  border
  row-key="id"
  @expand-change="onExpandChange"
>
  <!-- 展開列 -->
  <el-table-column type="expand">
    <template #default="{ row }">
      <div class="post-content">
        <p>{{ row.content }}</p>

        <div class="comment-box">
          <h4>留言</h4>
          <template v-if="comments[row.id]">
            <ul v-if="filteredComments(row.id).length">
              <li v-for="comment in filteredComments(row.id)" :key="comment.id" class="comment-item">
                <div class="left">
                  <strong>{{ comment.user?.name || '未知使用者' }}：</strong>
                  <span v-if="editingCommentId !== comment.id">{{ comment.text }}</span>
                  <el-input v-else v-model="editedCommentContent" size="small" class="inline-edit-input" />
                </div>
                <div class="right">
                  <template v-if="comment.user?.name === currentUser.name">
                    <el-button text size="small" @click="startEdit(comment)" v-if="editingCommentId !== comment.id">編輯</el-button>
                    <el-button text size="small" @click="submitEdit(comment.id)" v-if="editingCommentId === comment.id">儲存</el-button>
                    <el-button text size="small" type="danger" @click="deleteComment(comment.id)">刪除</el-button>
                  </template>
                  <el-button text size="small" type="warning" @click="warnComment(comment.id)">⚠️ 警告</el-button>
                </div>
              </li>
            </ul>
            <div v-else>沒有符合搜尋條件的留言</div>
          </template>
          <div v-else>尚無留言</div>

          <el-input type="textarea" v-model="newComments[row.id]" placeholder="輸入留言內容" :rows="2" class="mt-2" />
          <el-button type="primary" size="small" class="mt-1" @click="submitComment(row.id)">發表留言</el-button>
        </div>
      </div>
    </template>
  </el-table-column>

  <!-- 主題欄位 -->
  <el-table-column label="主題" min-width="300">
    <template #default="{ row }">
      
        <strong>{{ row.title }}</strong>
        <span v-if="row.category">
          （{{ categoryMap[row.category] || row.category }}）
        </span>
     
    </template>
  </el-table-column>

  <!-- 作者 -->
  <el-table-column label="作者" width="120">
    <template #default="{ row }">
      {{ row.user?.name || '未知使用者' }}
    </template>
  </el-table-column>

  <!-- 按讚 / 點閱 -->
  <el-table-column label="👍 / 👁️" width="100">
    <template #default="{ row }">
      {{ row.likeCount || 0 }} / {{ row.viewCount || 0 }}
    </template>
  </el-table-column>

  <!-- 最後更新 -->
  <el-table-column label="更新時間" width="180">
    <template #default="{ row }">
      {{ new Date(row.updatedAt).toLocaleString() }}
    </template>
  </el-table-column>

  <!-- 操作 -->
  <el-table-column label="操作" width="160">
    <template #default="{ row }">
      <el-button text size="small" type="danger" @click="deletePost(row.id)">刪除</el-button>
      <el-button text size="small" type="warning" @click="warnPost(row.id)">⚠️ 警告</el-button>
    </template>
  </el-table-column>
</el-table>


    <!-- 分頁功能 -->
    <div class="pagination-box">
      <el-pagination
        layout="prev, pager, next"
        :total="filteredPosts.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        background
        small
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";

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

const filteredPosts = computed(() => {
  return posts.value
    .filter((p) => selectedCategory.value === "all" || p.category === selectedCategory.value)
    .filter((p) => p.title.includes(searchTitle.value.trim()));
});

const sortedAndPagedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return sortedPosts.value.slice(start, end);
});

// 下拉選單
const sortOption = ref("newest");
const sortedPosts = computed(() => {
  let list = filteredPosts.value.slice(); // ✅ 先複製原本的 filteredPosts 結果

  if (sortOption.value === "viewCount") {
    list.sort((a, b) => b.viewCount - a.viewCount);
  } else if (sortOption.value === "likeCount") {
    list.sort((a, b) => b.likeCount - a.likeCount);
  } else {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 預設：最新
  }

  return list;
});

// 檢舉
const showNotifications = ref(false);
const reportVisible = ref(false);
const reports = ref([
  { id: 1, message: "使用者 John 檢舉留言不當內容" },
  { id: 2, message: "使用者 Mary 檢舉文章違規" },
]);

const filteredComments = (postId) => {
  const list = comments[postId] || [];
  const keyword = searchComment.value.trim();
  if (!keyword) return list;
  return list.filter((c) => c.text?.includes(keyword));
};
const onExpandChange = async (row, expandedRows) => {
  if (expandedRows.includes(row)) {
    if (!comments[row.id]) {
      await loadComments(row.id);
    }
  }
};

const loadPosts = async () => {
  try {
    const res = await axios.get("/api/posts");
    posts.value = res.data;
  } catch (err) {
    ElMessage.error("文章載入失敗");
  }
};

const loadComments = async (postId) => {
  try {
    const res = await axios.get(`api/comments/post/${postId}`);
    comments[postId] = res.data;
  } catch (err) {
    ElMessage.error("留言載入失敗");
  }
};

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
  } catch (err) {
    ElMessage.error("留言失敗");
  }
};

const startEdit = (comment) => {
  editingCommentId.value = comment.id;
  editedCommentContent.value = comment.text || "";
};

const submitEdit = async (commentId) => {
  try {
    await axios.put(`/api/comments/${commentId}`, {
      content: editedCommentContent.value,
    });
    ElMessage.success("留言更新成功");
    editingCommentId.value = null;
    editedCommentContent.value = "";
    await loadComments(activePostId.value);
  } catch (err) {
    ElMessage.error("更新失敗");
  }
};

const deleteComment = async (commentId) => {
  try {
    await axios.delete(`/api/comments/${commentId}`);
    ElMessage.success("留言刪除成功");
    await loadComments(activePostId.value);
  } catch (err) {
    ElMessage.error("刪除失敗");
  }
};

const deletePost = async (postId) => {
  try {
    await ElMessageBox.confirm("確定要刪除這篇文章嗎？", "提醒", { type: "warning" });
    await axios.delete(`/api/posts/${postId}`);
    ElMessage.success("文章已刪除");
    await loadPosts();
  } catch (err) {
    if (err !== "cancel") ElMessage.error("刪除失敗");
  }
};

const togglePost = async (postId) => {
  activePostId.value = activePostId.value === postId ? null : postId;
  if (activePostId.value && !comments[postId]) {
    await loadComments(postId);
  }
};

const warnPost = (postId) => {
  ElMessageBox.alert(`警告!!${postId}請注意論壇規章 `, "⚠️ 警告!!", { type: "warning" });
};

const warnComment = (commentId) => {
  ElMessageBox.alert(`警告!!${commentId}請注意論壇規章`, "⚠️ 警告!!", { type: "warning" });
};

const selectCategory = (cat) => {
  selectedCategory.value = cat;
  currentPage.value = 1;
};

watch(activePostId, async (postId) => {
  if (postId && !comments[postId]) {
    await loadComments(postId);
  }
});

onMounted(loadPosts);
</script>

<style scoped>
.view-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}
.category-tabs {
  margin-bottom: 20px;
}
.search-box {
  display: flex;
  margin-bottom: 20px;
}
.mr-2 {
  margin-right: 10px;
}
.pagination-box {
  text-align: center;
  margin-top: 20px;
}

/* 展開留言區塊 */
.el-table__expanded-cell {
  padding: 20px !important;
  background-color: #fafafa;
  overflow: visible;
}

/* 留言整體外觀 */
.post-content {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  overflow-x: auto;
}

/* 留言列表容器 */
.comment-box {
  margin-top: 15px;
}

/* 單筆留言彈性排版 */
.comment-item {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
  padding: 6px 0;
}

/* 左邊留言內容 */
.comment-item .left {
  flex: 1 1 auto;
  word-break: break-word;
  min-width: 200px;
}

/* 右邊按鈕列，保證不被壓扁 */
.comment-item .right {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
  min-width: 140px;
}

/* 編輯留言欄 */
.inline-edit-input {
  width: 100%;
  max-width: 600px;
}

/* 新留言輸入區 */
.el-input.mt-2 {
  width: 100%;
  max-width: 600px;
}
.notification-wrapper {
  position: absolute;
  top: 80px;
  right: 100px;
  z-index: 999;
}

.notification-wrapper .el-button {
  background-color: red;
  color: white;
  border: none;
}

.notification-dropdown {
  margin-top: 10px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 12px;
  width: 260px;
  font-size: 14px;
}
/* 排序下拉選單靠左且寬度適中 */
.sort-select {
  width: 150px;
  margin-right: 10px;
}

/* 通知下拉視窗 */
.notification-dropdown {
  position: absolute;
  top: 50px;
  right: 30px;
  width: 250px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 10px;
}
</style>
