// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "@/assets/styles/index.scss";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
// 全局引入Bootstrap Icons
import "bootstrap-icons/font/bootstrap-icons.css";


// 配置axios默認設置
axios.defaults.baseURL = "http://localhost:8080"; // 後端API基礎URL
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.withCredentials = true; // 允許跨域請求帶上憑證

// 添加請求攔截器
axios.interceptors.request.use(
    (config) => {
        // 從localStorage獲取token
        const token = localStorage.getItem("authToken");
        // 如果token存在，則添加到請求頭
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 添加響應攔截器
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 如果返回401未授權錯誤，則清除token並重定向到登入頁
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userInfo");
            router.push("/member/login");
        }
        return Promise.reject(error);
    }
);

// 創建pinia實例
const pinia = createPinia();

const app = createApp(App);

app.use(router);
app.use(pinia);
app.use(ElementPlus);

// 初始化時自動從localStorage恢復token
const token = localStorage.getItem("authToken");
if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

app.mount("#app");
