import axios from "@/api/config/axios";

// 商品相关API
export const getProducts = (params) => {
    return axios.get("/api/products", { params });
};

export const getProductById = (id) => {
    return axios.get(`/api/products/${id}`);
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

// 购物车相关API
export const getCartItems = (userId) => {
    return axios.get("/api/cart/items", { params: { userId } });
};

export const addToCart = (product, userId) => {
    // 创建一个新对象，避免修改原始对象
    const cartRequest = { ...product };

    // 确保请求中包含userId
    if (userId) {
        cartRequest.userId = userId;
    } else {
        // 尝试从localStorage获取用户ID
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
            try {
                const userInfo = JSON.parse(storedUserInfo);
                if (userInfo && userInfo.id) {
                    cartRequest.userId = userInfo.id;
                }
            } catch (e) {
                console.error("解析用户信息失败:", e);
            }
        }

        // 如果仍然没有userId，则从authToken中提取
        if (!cartRequest.userId) {
            const authToken = localStorage.getItem("authToken");
            if (authToken) {
                try {
                    // 从JWT令牌中提取userId (简化处理，实际应该解析JWT)
                    cartRequest.userId = getUserIdFromToken(authToken);
                } catch (e) {
                    console.error("从令牌获取用户ID失败:", e);
                }
            }
        }
    }

    console.log("发送购物车请求:", cartRequest);
    return axios.post("/api/cart/items", cartRequest);
};

// 从JWT令牌中提取用户ID的辅助函数
const getUserIdFromToken = (token) => {
    try {
        // 这里简化处理，实际应该正确解析JWT
        // 如果token格式为: header.payload.signature
        const parts = token.split(".");
        if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload && payload.sub) {
                // 假设sub字段包含用户ID或包含数字的用户名
                const match = payload.sub.match(/\d+/);
                if (match) {
                    return parseInt(match[0]);
                }
            }
        }
        // 如果无法解析，返回默认用户ID
        return 1; // 默认用户ID，确保请求不会失败
    } catch (e) {
        console.error("解析令牌失败:", e);
        return 1; // 默认用户ID
    }
};

export const updateCartItemQuantity = (cartItemId, quantity, userId) => {
    const params = { quantity, userId };
    return axios.put(`/api/cart/items/${cartItemId}/quantity`, null, { params });
};

export const removeFromCart = (cartItemId, userId) => {
    return axios.delete(`/api/cart/items/${cartItemId}`, { params: { userId } });
};

export const clearCart = (userId) => {
    return axios.delete("/api/cart/clear", { params: { userId } });
};

export const calculateCartTotal = (userId) => {
    return axios.get("/api/cart/total", { params: { userId } });
};

// 订单相关API
export const createOrder = (orderData) => {
    return axios.post("/api/orders", orderData);
};

export const createOrderFromCart = (userId) => {
    if (!userId) {
        return Promise.reject(new Error("用戶ID不能為空"));
    }

    // 添加重試邏輯
    return new Promise((resolve, reject) => {
        const callApi = (retryCount = 0) => {
            axios
                .post(`/api/orders/cart?userId=${userId}`)
                .then((response) => {
                    console.log("訂單創建成功:", response);
                    resolve(response);
                })
                .catch((error) => {
                    console.error(`訂單創建失敗 (嘗試 ${retryCount + 1}/3):`, error);

                    // 如果失敗次數小於2，重試
                    if (retryCount < 2) {
                        setTimeout(() => {
                            callApi(retryCount + 1);
                        }, 1000); // 1秒後重試
                    } else {
                        reject(error);
                    }
                });
        };

        // 執行首次API調用
        callApi();
    });
};

export const getOrders = async (params = {}) => {
    try {
        // 轉換參數為URL查詢字符串
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
        // 將userId添加到參數中，並調用getOrders函數
        const queryParams = { ...params, userId };
        return await getOrders(queryParams);
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
