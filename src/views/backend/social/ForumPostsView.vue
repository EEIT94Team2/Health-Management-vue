<template>
    <div class="view-container">
      <h1>論壇文章列表</h1>
  
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
  
      <!-- 🔍 查詢欄位 -->
      <div class="search-box">
        <el-input v-model="searchTitle" placeholder="搜尋文章標題..." class="mr-2" clearable />
        <el-input v-model="searchComment" placeholder="搜尋留言內容..." clearable />
      </div>
  
      <!-- 展開文章 -->
      <el-collapse accordion v-model="activePostId">
        <el-collapse-item
          v-for="post in filteredAndPagedPosts"
          :key="post.id"
          :name="post.id"
        >
          <template #title>
            <strong>{{ post.title }}</strong>
            <span style="margin-left: 10px; color: gray">｜{{ post.category }}｜by {{ post.user?.name }}</span>
          </template>
  
          <div class="post-content">
            <p>{{ post.content }}</p>
  
            <!-- 留言區 -->
            <div class="comment-box">
              <h4>留言</h4>
              <template v-if="comments[post.id]">
                <ul v-if="filteredComments(post.id).length">
                  <li v-for="comment in filteredComments(post.id)" :key="comment.id" class="comment-item">
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
                      <el-button text size="small" @click="startEdit(comment)" v-if="editingCommentId !== comment.id">編輯</el-button>
                      <el-button text size="small" @click="submitEdit(comment.id)" v-if="editingCommentId === comment.id">儲存</el-button>
                      <el-button text size="small" type="danger" @click="deleteComment(comment.id)">刪除</el-button>
                    </div>
                  </li>
                </ul>
                <div v-else>沒有符合搜尋條件的留言</div>
              </template>
              <div v-else>尚無留言</div>
  
              <el-input
                type="textarea"
                v-model="newComments[post.id]"
                placeholder="輸入留言內容"
                :rows="2"
                class="mt-2"
              />
              <el-button type="primary" size="small" class="mt-1" @click="submitComment(post.id)">發表留言</el-button>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
  
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
  import { ElMessage } from "element-plus";
  
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
  
  // ✅ 分類與分頁設定
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
  
  // 主題篩選後的文章
  const filteredPosts = computed(() => {
    return posts.value
      .filter((p) => selectedCategory.value === "all" || p.category === selectedCategory.value)
      .filter((p) => p.title.includes(searchTitle.value.trim()));
  });
  
  // 分頁文章
  const filteredAndPagedPosts = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    return filteredPosts.value.slice(start, end);
  });
  
  // 留言過濾
  const filteredComments = (postId) => {
    const list = comments[postId] || [];
    const keyword = searchComment.value.trim();
    if (!keyword) return list;
    return list.filter((c) => c.text?.includes(keyword));
  };
  
  const loadPosts = async () => {
    try {
      const res = await axios.get("/api/posts");
      posts.value = res.data;
    } catch (err) {
      ElMessage.error("文章載入失敗");
    }
  };
  
  // ⛳ 載入留言
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
    // ⛳ 發送留言
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
      // ⛳ 編輯留言
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
      // ⛳ 刪除留言
    await axios.delete(`/api/comments/${commentId}`);
      ElMessage.success("留言刪除成功");
      await loadComments(activePostId.value);
    } catch (err) {
      ElMessage.error("刪除失敗");
    }
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
    max-width: 900px;
    margin: 0 auto;
  }
  .category-tabs {
    margin-bottom: 20px;
  }
  .search-box {
    display: flex;
    margin-bottom: 20px;
  }
  .post-content {
    margin-top: 10px;
    padding: 10px 0;
    border-top: 1px solid #ccc;
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
  </style>