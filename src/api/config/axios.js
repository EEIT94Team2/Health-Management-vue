import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import router from "@/router";

// 創建 axios 實例
const instance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 請求攔截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// 響應攔截器
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("Response error:", error);

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data || {};
      
      switch (status) {
        case 401:
          // 未授權，清除 token 並跳轉到登錄頁面
          const authStore = useAuthStore();
          authStore.logout();
          router.push({
            path: "/backpage/member/login",
            query: { redirect: router.currentRoute.value.fullPath }
          });
          break;
        case 403:
          // 無權限訪問，跳轉到403頁面
          router.push({
            path: "/error/403",
            query: {
              message: errorData.message || "您沒有權限訪問該資源",
              code: errorData.code || "ERR_BAD_REQUEST"
            }
          });
          break;
        case 404:
          // 資源不存在
          console.error("Resource not found:", error.response.data);
          break;
        case 500:
          // 服務器錯誤
          console.error("Server Error:", error.response.data);
          break;
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default instance;
