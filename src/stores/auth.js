import { defineStore } from "pinia";
import axios from "axios";
import router from "../router";

export const useAuthStore = defineStore("auth", {
    state: () => {
        // 安全解析用戶信息
        const userInfoStr = localStorage.getItem("userInfo");
        let userInfo = null;
        try {
            if (userInfoStr) {
                userInfo = JSON.parse(userInfoStr);
            }
        } catch (e) {
            console.error("解析用戶信息失敗", e);
            // 如果解析失敗，清除可能損壞的數據
            localStorage.removeItem("userInfo");
        }

        return {
            token: localStorage.getItem("authToken") || null,
            userRole: localStorage.getItem("userRole") || null,
            userInfo: userInfo,
        };
    },

    getters: {
        isAuthenticated: (state) => !!state.token,
        getToken: (state) => state.token,
        getUserRole: (state) => state.userRole,
        getUserInfo: (state) => state.userInfo,
    },

    actions: {
        async login(credentials) {
            try {
                const response = await axios.post("/api/auth/login", credentials);

                if (response.data && response.data.success) {
                    const { token, role, user } = response.data.data;

                    this.token = token;
                    this.userRole = role;
                    this.userInfo = user;

                    localStorage.setItem("authToken", token);
                    localStorage.setItem("userRole", role);

                    if (user) {
                        localStorage.setItem("userInfo", JSON.stringify(user));
                    }

                    // 設置axios默認頭部帶上token
                    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                    return { success: true };
                }

                return {
                    success: false,
                    message: response.data.message || "登入失敗",
                };
            } catch (error) {
                return {
                    success: false,
                    message: error.response?.data?.message || "登入失敗，請檢查網絡連接",
                };
            }
        },

        logout() {
            // 清除state
            this.token = null;
            this.userRole = null;
            this.userInfo = null;

            // 清除localStorage
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userInfo");

            // 清除axios頭部token
            delete axios.defaults.headers.common["Authorization"];

            // 重定向到登入頁
            router.push("/backpage/member/login");
        },

        autoLogin() {
            const token = localStorage.getItem("authToken");
            if (token) {
                // 自動設置axios頭部帶上token
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            }
        },
    },
});
