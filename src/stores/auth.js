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

                    // 確保清除之前的狀態
                    this.resetAuthState();

                    // 設置新狀態
                    this.token = token;
                    this.userRole = role;
                    this.userInfo = user;

                    // 保存到localStorage
                    localStorage.setItem("authToken", token);
                    localStorage.setItem("userRole", role);

                    if (user) {
                        localStorage.setItem("userName", user.name);
                        localStorage.setItem("userInfo", JSON.stringify(user));
                    }

                    // 設置axios默認頭部帶上token
                    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                    
                    // 登錄成功後，主動獲取最新的用戶信息
                    try {
                        await this.refreshUserInfo();
                    } catch (refreshError) {
                        console.error("登錄後刷新用戶信息失敗:", refreshError);
                    }

                    return { success: true };
                }

                return {
                    success: false,
                    message: response.data.message || "登入失敗",
                };
            } catch (error) {
                // 發生錯誤時確保清除不完整的狀態
                this.resetAuthState();
                
                return {
                    success: false,
                    message: error.response?.data?.message || "登入失敗，請檢查網絡連接",
                };
            }
        },

        logout() {
            // 清除state和localStorage
            this.resetAuthState();

            // 嘗試重定向到登入頁，使用try-catch避免可能的導航錯誤
            try {
                router.push("/");
            } catch (error) {
                console.error("登出重定向失敗:", error);
                // 備用方案：直接刷新頁面
                window.location.href = "/";
            }
        },

        // 統一的清除認證狀態的方法
        resetAuthState() {
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
        },

        autoLogin() {
            const token = localStorage.getItem("authToken");
            const userInfoStr = localStorage.getItem("userInfo");
            const userRole = localStorage.getItem("userRole");
            const userName = localStorage.getItem("userName");
            
            if (token) {
                // 更新內存中的state
                this.token = token;
                
                // 設置axios默認頭部帶上token
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                
                // 如果有角色資訊，也更新它
                if (userRole) {
                    this.userRole = userRole;
                }
                
                // 如果有用戶資訊，也更新它
                if (userInfoStr) {
                    try {
                        let userInfo = JSON.parse(userInfoStr);
                        
                        // 確保 name 字段存在並優先使用 localStorage 中的 userName
                        if (userName) {
                            userInfo.name = userName;
                        } else if (!userInfo.name && userInfo.email) {
                            // 如果沒有 name 則生成一個，不使用 email
                            userInfo.name = 'User_' + userInfo.id;
                            
                            // 保存回 localStorage 以確保一致性
                            localStorage.setItem("userName", userInfo.name);
                            localStorage.setItem("userInfo", JSON.stringify(userInfo));
                        }
                        
                        this.userInfo = userInfo;
                        console.log('自動登錄後的用戶信息:', this.userInfo);
                        
                        // 嘗試從API獲取更新的用戶信息
                        this.refreshUserInfo();
                    } catch (e) {
                        console.error("解析自動登錄用戶信息失敗", e);
                    }
                } else {
                    // 如果沒有userInfo但有token，嘗試從API獲取用戶信息
                    this.refreshUserInfo();
                }
                
                return true; // 返回登錄成功的標誌
            }
            
            return false; // 返回登錄失敗的標誌
        },
        
        // 新增方法：從API刷新用戶信息
        async refreshUserInfo() {
            try {
                const response = await axios.get('/api/users/userinfo');
                if (response.data && response.data.data) {
                    const apiUser = response.data.data;
                    const userInfo = {
                        id: apiUser.id,
                        email: apiUser.email,
                        name: apiUser.name,
                        role: apiUser.role
                    };
                    
                    // 更新本地存儲和狀態
                    localStorage.setItem('userName', userInfo.name);
                    localStorage.setItem("userInfo", JSON.stringify(userInfo));
                    this.userInfo = userInfo;
                    
                    console.log('已從API刷新用戶信息:', userInfo);
                }
            } catch (error) {
                console.error('無法從API刷新用戶信息:', error);
            }
        },

        setToken(token) {
            if (token) {
                this.token = token;
                // 設置axios默認頭部帶上token
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            }
        },

        setRole(role) {
            if (role) {
                this.userRole = role;
            }
        },

        setUserInfo(userInfo) {
            if (userInfo) {
                console.log('Setting userInfo in authStore:', userInfo);
                
                // 確保名稱字段存在
                if (!userInfo.name && userInfo.id) {
                    // 不再使用User_前綴，使用實際姓名或友好顯示名稱
                    userInfo.name = userInfo.realName || '會員_' + userInfo.id;
                    console.log('Generated friendly name for user:', userInfo.name);
                }
                
                // 總是保存或更新 userName 到 localStorage
                if (userInfo.name) {
                    localStorage.setItem("userName", userInfo.name);
                }
                
                // 確保創建新對象，避免引用問題
                this.userInfo = { ...userInfo };
                
                // 確保更新到 localStorage
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                
                // 打印設置後的狀態
                console.log('UserInfo after setting:', this.userInfo);
            }
        },
    },
});
