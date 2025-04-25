<template>
  <div class="view-container">
    <h2 class="page-title">📝 發表新文章</h2>

    <el-form label-position="top" :model="form" class="form-box">
      <el-form-item label="文章標題">
        <input v-model="form.title" placeholder="請輸入標題" class="custom-input" />
      </el-form-item>

      <el-form-item label="文章分類">
        <select v-model="form.category" class="custom-select">
          <option disabled value="">請選擇分類</option>
          <option value="motivation">動機</option>
          <option value="nutrition">營養</option>
          <option value="fitness">健身</option>
          <option value="recipe">食譜</option>
          <option value="question">問題</option>
        </select>
      </el-form-item>

      <el-form-item label="文章內容">
        <textarea
          v-model="form.content"
          rows="6"
          placeholder="請輸入文章內容"
          class="custom-textarea"
        ></textarea>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="createPost">發表文章</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

const form = reactive({
  title: "",
  content: "",
  category: "",
});

const createPost = async () => {
  try {
    await axios.post("/api/posts", form);
    ElMessage.success("發文成功");
    router.push("/social/forum");
  } catch (error) {
    console.error("發文失敗", error);
    ElMessage.error("發文失敗，請檢查內容或重新登入");
  }
};
</script>

<style>
.view-container {
  padding: 20px;
  max-width: 700px;
  margin: 100px auto;
  background-color: #1e1e2f;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.4);
  color: #fff;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #4caf50;
  font-weight: bold;
}

.form-box {
  background-color: #2c2c3e;
  padding: 24px;
  border-radius: 12px;
}

.custom-input,
.custom-textarea,
.custom-select {
  background-color: #2c3e50;
  color: #fff;
  border-radius: 6px;
  padding: 6px 10px;
  border: 1px solid #444;
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
}

.custom-textarea {
  resize: vertical;
}

/* Label */
.el-form-item__label {
  color: #fff;
  font-weight: bold;
}

/* 發表文章按鈕綠色 */
.el-button--primary {
  background-color: #2ecc71;
  border-color: #27ae60;
  color: white;
}
.el-button--primary:hover {
  background-color: #27ae60;
}
</style>
