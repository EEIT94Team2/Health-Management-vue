import axios from "@/api/config/axios";

// 配置請求攔截器，添加統一的錯誤處理
axios.interceptors.request.use(
    (config) => {
        // 檢查是否有token需要添加
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error("請求發送失敗:", error);
        return Promise.reject(error);
    }
);

// 配置響應攔截器，添加統一的錯誤處理
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        let errorMessage = "請求失敗，請稍後再試";

        if (error.response) {
            // 服務器返回了錯誤響應
            const status = error.response.status;

            switch (status) {
                case 401:
                    errorMessage = "未授權，請重新登入";
                    // 可以在這裡自動重定向到登入頁
                    break;
                case 403:
                    errorMessage = "拒絕訪問，權限不足";
                    break;
                case 404:
                    errorMessage = "請求的資源不存在";
                    break;
                case 500:
                    errorMessage = "伺服器內部錯誤";
                    break;
                default:
                    // 嘗試從響應中獲取錯誤消息
                    if (error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
            }

            console.error(`API錯誤 (${status}):`, errorMessage, error.config?.url);
        } else if (error.request) {
            // 請求已發送但沒有收到響應
            errorMessage = "伺服器無響應，請檢查網絡連接";
            console.error("無響應錯誤:", error.request);
        } else {
            // 請求配置時發生錯誤
            errorMessage = error.message || "請求錯誤";
            console.error("請求錯誤:", error.message);
        }

        // 統一添加錯誤信息到錯誤對象
        error.displayMessage = errorMessage;

        return Promise.reject(error);
    }
);

// 商品相关API
export const getProducts = (params) => {
    return axios.get("/api/products", { params });
};

export const getProductById = (id) => {
    if (!id) {
        console.error("無法獲取商品：ID為空");
        return Promise.reject(new Error("商品ID不能為空"));
    }

    return axios.get(`/api/products/${id}`).catch((error) => {
        console.error(`獲取商品ID:${id}的詳情失敗:`, error);
        throw error;
    });
};

export const createProduct = (product) => {
    return axios.post("/api/products", product);
};

export const updateProduct = (id, product) => {
    return axios.put(`/api/products/${id}`, product);
};

export const deleteProduct = (id) => {
    return axios.delete(`/api/products/${id}`);
};

export const searchProducts = (keyword) => {
    return axios.get(`/api/products/search?keyword=${keyword}`);
};

export const getProductsByPriceRange = (minPrice, maxPrice) => {
    return axios.get(`/api/products/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`);
};

// 獲取用戶ID - 更全面的身份驗證檢查
const getUserId = () => {
    // 嘗試從多個源獲取用戶ID
    try {
        // 1. 檢查直接保存的userId
        const directUserId = localStorage.getItem("userId");
        if (directUserId) {
            console.log("從直接保存的userId獲取到用戶ID:", directUserId);
            return directUserId;
        }

        // 2. 檢查userInfo
        const userInfoJson = localStorage.getItem("userInfo");
        if (userInfoJson) {
            try {
                const userInfo = JSON.parse(userInfoJson);
                if (userInfo && userInfo.id) {
                    console.log("從userInfo獲取到用戶ID:", userInfo.id);
                    return userInfo.id;
                }
            } catch (parseError) {
                console.error("解析userInfo時出錯:", parseError);
                // 繼續嘗試其他方法
            }
        }

        // 3. 檢查authUser
        const authUserJson = localStorage.getItem("authUser");
        if (authUserJson) {
            try {
                const authUser = JSON.parse(authUserJson);
                if (authUser && authUser.id) {
                    console.log("從authUser獲取到用戶ID:", authUser.id);
                    return authUser.id;
                }
            } catch (parseError) {
                console.error("解析authUser時出錯:", parseError);
                // 繼續嘗試其他方法
            }
        }

        // 4. 檢查JWT token
        const authToken = localStorage.getItem("authToken");
        if (authToken) {
            try {
                // 嘗試從JWT token中解析用戶ID
                const payload = JSON.parse(atob(authToken.split(".")[1]));
                if (payload) {
                    if (payload.userId) {
                        console.log("從authToken獲取到用戶ID:", payload.userId);
                        return payload.userId;
                    }
                    if (payload.sub) {
                        console.log("從authToken的sub欄位獲取到用戶ID:", payload.sub);
                        return payload.sub;
                    }
                }
            } catch (tokenError) {
                console.error("解析authToken時出錯:", tokenError);
                // 繼續嘗試其他方法
            }
        }

        // 5. 檢查普通token
        const token = localStorage.getItem("token");
        if (token) {
            try {
                // 嘗試從JWT token中解析用戶ID
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload) {
                    if (payload.userId) {
                        console.log("從token獲取到用戶ID:", payload.userId);
                        return payload.userId;
                    }
                    if (payload.sub) {
                        console.log("從token的sub欄位獲取到用戶ID:", payload.sub);
                        return payload.sub;
                    }
                }
            } catch (tokenError) {
                console.error("解析token時出錯:", tokenError);
                // 繼續嘗試其他方法
            }
        }

        // 6. 檢查Pinia store
        if (window.$pinia) {
            try {
                const authStore = window.$pinia.state.value.auth;
                if (authStore && authStore.userInfo && authStore.userInfo.id) {
                    console.log("從Pinia store獲取到用戶ID:", authStore.userInfo.id);
                    return authStore.userInfo.id;
                }
            } catch (storeError) {
                console.error("訪問Pinia store時出錯:", storeError);
            }
        }

        // 7. 檢查Vuex store
        if (window.$store) {
            try {
                const userInfo = window.$store.state.auth.userInfo;
                if (userInfo && userInfo.id) {
                    console.log("從Vuex store獲取到用戶ID:", userInfo.id);
                    return userInfo.id;
                }
            } catch (storeError) {
                console.error("訪問Vuex store時出錯:", storeError);
            }
        }

        // 檢查開發環境
        if (process.env.NODE_ENV === "development") {
            console.warn("開發環境中，未能獲取用戶ID，嘗試使用測試用戶ID");
            return getTestUserId();
        }

        console.warn("未能獲取用戶ID，用戶可能未登入");
        return null;
    } catch (error) {
        console.error("獲取用戶ID時出錯:", error);
        return null;
    }
};

// 用於測試環境或開發環境的測試用戶ID
const getTestUserId = () => {
    // 只在開發環境中使用，生產環境應返回null
    if (process.env.NODE_ENV === "development") {
        return 1; // 開發測試用戶ID
    }
    return null;
};

// 购物车相关API
export const getCartItems = () => {
    const userId = getUserId() || getTestUserId();

    if (!userId) {
        console.warn("未能獲取用戶ID，將嘗試獲取訪客購物車或返回空數據");
    }

    return axios.get("/api/cart/items", { params: { userId } });
};

export const addItemToCart = (cartRequest) => {
    // 确保请求中包含userId
    if (!cartRequest.userId) {
        const userId = getUserId();
        if (!userId) {
            return Promise.reject(new Error("用戶未登入，無法添加到購物車"));
        }
        cartRequest.userId = userId;
    }

    // 確保productId和quantity存在
    if (!cartRequest.productId) {
        return Promise.reject(new Error("商品ID不能為空"));
    }

    if (!cartRequest.quantity || cartRequest.quantity <= 0) {
        cartRequest.quantity = 1; // 預設數量為1
    }

    return axios.post("/api/cart/items", cartRequest);
};

export const updateCartItemQuantity = (cartRequest) => {
    if (!cartRequest || !cartRequest.cartItemId) {
        return Promise.reject(new Error("購物車項目ID不能為空"));
    }

    if (!cartRequest.quantity || cartRequest.quantity <= 0) {
        return Promise.reject(new Error("數量必須大於0"));
    }

    const userId = getUserId();
    if (!userId) {
        return Promise.reject(new Error("用戶未登入，無法更新購物車"));
    }

    return axios.put(`/api/cart/items/${cartRequest.cartItemId}/quantity`, null, {
        params: { quantity: cartRequest.quantity, userId },
    });
};

export const removeFromCart = (cartRequest) => {
    if (!cartRequest || !cartRequest.cartItemId) {
        return Promise.reject(new Error("購物車項目ID不能為空"));
    }

    const userId = getUserId();
    if (!userId) {
        return Promise.reject(new Error("用戶未登入，無法移除商品"));
    }

    return axios.delete(`/api/cart/items/${cartRequest.cartItemId}`, {
        params: { userId },
    });
};

export const clearCart = () => {
    const userId = getUserId();
    if (!userId) {
        return Promise.reject(new Error("用戶未登入，無法清空購物車"));
    }

    return axios.delete("/api/cart/clear", {
        params: { userId },
    });
};

export const calculateCartTotal = () => {
    const userId = getUserId();
    return axios.get("/api/cart/total", {
        params: { userId },
    });
};

// 订单相关API
export const createOrder = (orderData) => {
    // 确保订单数据中包含userId
    if (!orderData.userId) {
        orderData.userId = getUserId();
    }

    console.log("創建訂單，數據:", orderData);
    return axios.post("/api/orders", orderData);
};

export const createOrderFromCart = () => {
    const userId = getUserId();
    if (!userId) {
        console.error("創建訂單失敗: 未找到用戶ID");
        return Promise.reject(new Error("用戶未登入，無法創建訂單"));
    }

    // 檢查身份驗證
    const authToken = localStorage.getItem("authToken");
    const token = localStorage.getItem("token");
    const hasUserInfo = !!localStorage.getItem("userInfo");
    const hasAuthUser = !!localStorage.getItem("authUser");

    console.log("從購物車創建訂單，用戶ID:", userId, "身份驗證狀態:", {
        hasAuthToken: !!authToken,
        hasToken: !!token,
        hasUserInfo,
        hasAuthUser,
    });

    // 構建請求頭
    const headers = {};

    // 添加可用的身份驗證token
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    } else if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // 添加重试逻辑
    return new Promise((resolve, reject) => {
        const callApi = (retryCount = 0) => {
            // 記錄請求URL和參數
            const url = `/api/orders/cart`;
            const params = { userId };
            console.log(`發送請求: ${url}，參數:`, params, `嘗試次數: ${retryCount + 1}/3`);

            axios
                .post(url, null, {
                    params,
                    headers,
                })
                .then((response) => {
                    console.log("订单创建成功，响应数据:", response);

                    // 验证响应数据格式
                    if (!response || !response.data) {
                        console.error("API响应无效，缺少数据:", response);
                        reject(new Error("服务器响应无效，请稍后再试"));
                        return;
                    }

                    // 记录响应数据结构以便于调试
                    console.log("响应数据结构:", {
                        hasData: !!response.data,
                        dataType: typeof response.data,
                        isObject: typeof response.data === "object",
                        hasId: response.data && response.data.id,
                        hasOrderId: response.data && response.data.orderId,
                        nestedData: response.data && response.data.data,
                        responseKeys: response.data ? Object.keys(response.data) : [],
                    });

                    resolve(response);
                })
                .catch((error) => {
                    console.error(`订单创建失败 (尝试 ${retryCount + 1}/3):`, error);

                    // 记录详细的错误信息
                    if (error.response) {
                        console.error("错误状态码:", error.response.status);
                        console.error("错误响应数据:", error.response.data);
                        console.error("错误响应头:", error.response.headers);
                    } else if (error.request) {
                        console.error("无响应错误，请求已发送但未收到响应:", error.request);
                    } else {
                        console.error("请求配置错误:", error.message);
                    }
                    console.error("请求配置:", error.config);

                    // 如果是網絡錯誤或服務器錯誤，嘗試重試
                    const shouldRetry = error.response
                        ? error.response.status >= 500 // 服務器錯誤
                        : true; // 網絡錯誤

                    // 如果失败次数小于2且應該重試，重試
                    if (retryCount < 2 && shouldRetry) {
                        setTimeout(() => {
                            callApi(retryCount + 1);
                        }, 1000); // 1秒后重试
                    } else {
                        // 添加更多錯誤信息
                        let errorMsg = "創建訂單失敗";
                        if (error.response && error.response.data && error.response.data.message) {
                            errorMsg = error.response.data.message;
                        } else if (error.message) {
                            errorMsg = error.message;
                        }

                        const enhancedError = new Error(errorMsg);
                        enhancedError.originalError = error;
                        enhancedError.displayMessage = errorMsg;

                        reject(enhancedError);
                    }
                });
        };

        // 执行首次API调用
        callApi();
    });
};

export const getOrders = async (params = {}) => {
    try {
        // 转換參數為URL查詢字符串
        const queryParams = new URLSearchParams();

        // 分頁參數處理 - 後端分頁從0開始，但前端從1開始
        if (params.page !== undefined) {
            const pageIndex = Math.max(0, (parseInt(params.page) || 1) - 1);
            queryParams.append("page", pageIndex.toString());
        }

        if (params.size !== undefined) {
            queryParams.append("size", params.size.toString());
        }

        // 搜索條件和過濾條件
        if (params.query && params.query.trim()) {
            queryParams.append("query", params.query.trim());
        }

        if (params.status && params.status.trim()) {
            queryParams.append("status", params.status.trim());
        }

        // 日期範圍
        if (params.startDate) {
            queryParams.append("startDate", params.startDate);
        }

        if (params.endDate) {
            queryParams.append("endDate", params.endDate);
        }

        // 用戶ID過濾
        if (params.userId) {
            queryParams.append("userId", params.userId.toString());
        }

        const queryString = queryParams.toString();
        const url = `/api/orders${queryString ? `?${queryString}` : ""}`;

        console.log("發送訂單查詢請求:", url);
        return await axios.get(url);
    } catch (error) {
        console.error("獲取訂單列表失敗:", error, "參數:", params);
        throw error;
    }
};

export const getOrdersByUserId = async (userId, params = {}) => {
    if (!userId) {
        return Promise.reject(new Error("用戶ID不能為空"));
    }

    try {
        // 這裡直接使用用戶ID來獲取訂單，不使用getOrders函數
        console.log(`正在獲取用戶${userId}的訂單`);
        const url = `/api/orders/user/${userId}`;
        return await axios.get(url);
    } catch (error) {
        console.error(`獲取用戶${userId}的訂單失敗:`, error);
        throw error;
    }
};

export const getOrderById = async (orderId) => {
    if (!orderId) {
        console.error("訂單ID不能為空");
        return Promise.reject(new Error("訂單ID不能為空"));
    }

    try {
        console.log(`正在獲取訂單詳情，ID: ${orderId}`);
        const url = `/api/orders/${orderId}`;
        return await axios.get(url);
    } catch (error) {
        console.error(`獲取訂單 ${orderId} 詳情失敗:`, error);
        throw error;
    }
};

// 支付相关API
export const createPayment = (orderId, paymentData) => {
    if (!orderId) {
        return Promise.reject(new Error("訂單ID不能為空"));
    }
    return axios.post(`/api/orders/${orderId}/payment`, paymentData);
};

export const getPaymentStatus = (paymentId) => {
    if (!paymentId) {
        return Promise.reject(new Error("支付ID不能為空"));
    }
    return axios.get(`/api/orders/payment/${paymentId}/status`);
};

export const mockPaymentCallback = (paymentId, status = "SUCCESS") => {
    if (!paymentId) {
        return Promise.reject(new Error("支付ID不能為空"));
    }
    return axios.post(`/api/orders/payment/${paymentId}/mock?status=${status}`);
};

// 藍新金流相關API
export const createNewebpayPayment = (orderId, paymentData) => {
    if (!orderId) {
        return Promise.reject(new Error("訂單ID不能為空"));
    }
    return axios.post(`/api/newebpay/orders/${orderId}/payment`, paymentData);
};

export const getNewebpayPaymentStatus = (orderId) => {
    if (!orderId) {
        return Promise.reject(new Error("訂單ID不能為空"));
    }
    return axios.get(`/api/newebpay/orders/${orderId}/payment/status`);
};

export const mockNewebpayCallback = (orderId, status = "SUCCESS") => {
    if (!orderId) {
        return Promise.reject(new Error("訂單ID不能為空"));
    }
    return axios.post(`/api/newebpay/orders/${orderId}/mock?status=${status}`);
};

// 圖片上傳API
export const uploadImage = (formData) => {
    return axios.post("/api/images/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// 為購物車項目獲取最新的商品信息
export const fetchProductForCartItem = async (item) => {
    if (!item) return null;

    // 如果購物車項目已有product屬性且完整，直接返回
    if (item.product && item.product.id && item.product.name) {
        return item.product;
    }

    // 確定要查詢的商品ID
    const productId = item.productId || (item.product ? item.product.id : null);

    if (!productId) {
        console.warn("購物車項目缺少商品ID，無法獲取商品信息");
        return null;
    }

    try {
        console.log(`正在為購物車項目獲取商品ID:${productId}的詳情`);
        const response = await getProductById(productId);

        if (response && response.data) {
            let productData = null;

            // 處理不同的回應格式
            if (response.data.data) {
                productData = response.data.data;
            } else {
                productData = response.data;
            }

            // 更新購物車項目的product屬性
            if (item.product) {
                // 合併現有product與新獲取的數據
                Object.assign(item.product, productData);
            } else {
                // 創建新的product對象
                item.product = productData;
            }

            return item.product;
        }
    } catch (error) {
        console.error(`獲取購物車商品ID:${productId}的詳情失敗:`, error);
        return null;
    }
};

// 訂單取消API
export const cancelOrder = async (orderId) => {
    if (!orderId) {
        console.error("訂單ID不能為空");
        return Promise.reject(new Error("訂單ID不能為空"));
    }

    try {
        console.log(`正在取消訂單，ID: ${orderId}`);
        const userId = getUserId();
        if (!userId) {
            return Promise.reject(new Error("用戶未登入，無法取消訂單"));
        }

        const url = `/api/orders/${orderId}/cancel`;
        return await axios.post(url, null, {
            params: { userId },
        });
    } catch (error) {
        console.error(`取消訂單 ${orderId} 失敗:`, error);
        throw error;
    }
};
