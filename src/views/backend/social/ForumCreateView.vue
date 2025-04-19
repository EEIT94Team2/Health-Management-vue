<template>
    <div class="view-container">
      <h1>發表新文章</h1>
  
      <el-form label-position="top" :model="form" class="form-box">
        <el-form-item label="文章標題">
          <el-input v-model="form.title" placeholder="請輸入標題" />
        </el-form-item>
  
        <el-form-item label="文章分類">
          <el-select v-model="form.category" placeholder="請選擇分類">
            <el-option label="動機" value="motivation" />
            <el-option label="營養" value="nutrition" />
            <el-option label="健身" value="fitness" />
            <el-option label="食譜" value="recipe" />
            <el-option label="問題" value="question" />
          </el-select>
        </el-form-item>
  
        <el-form-item label="文章內容">
          <el-input
            type="textarea"
            v-model="form.content"
            :rows="6"
            placeholder="請輸入文章內容"
          />
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
      router.push("/backpage/social/posts");
    } catch (error) {
      console.error("發文失敗", error);
      ElMessage.error("發文失敗，請檢查內容或重新登入");
    }
  };
  </script>
  
  <style scoped>
  .view-container {
    padding: 20px;
    max-width: 700px;
    margin: 0 auto;
  }
  .form-box {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  </style>
  