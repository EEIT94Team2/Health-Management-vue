// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import axios from "axios";

// ✅ 樣式引入
import "element-plus/dist/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/assets/styles/index.scss"; // SCSS 共用樣式

// ✅ Axios 全域配置
axios.defaults.baseURL = "http://localhost:8080"; // 後端 API
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

// ✅ 請求攔截器：加上 Authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 響應攔截器：處理 401 錯誤
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userInfo");
      router.push("/member/login");
    }
    return Promise.reject(error);
  }
);

// ✅ 初始化 Vue 應用
const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(ElementPlus);

// ✅ 註冊 Element Plus Icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// ✅ 自動恢復 token（頁面刷新時）
const token = localStorage.getItem("authToken");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

app.mount("#app");
