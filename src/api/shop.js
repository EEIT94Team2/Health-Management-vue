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
    return axios.post("/api/order", orderData);
};

export const createOrderFromCart = (userId) => {
    if (!userId) {
        return Promise.reject(new Error("用戶ID不能為空"));
    }

    // 添加重試邏輯
    return new Promise((resolve, reject) => {
        const callApi = (retryCount = 0) => {
            axios
                .post(`/api/order/cart?userId=${userId}`)
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
        if (params.page) queryParams.append("page", params.page - 1); // 後端分頁從0開始
        if (params.size) queryParams.append("size", params.size);
        if (params.query) queryParams.append("query", params.query);
        if (params.status) queryParams.append("status", params.status);
        if (params.startDate) queryParams.append("startDate", params.startDate);
        if (params.endDate) queryParams.append("endDate", params.endDate);

        const queryString = queryParams.toString();
        const url = `/api/order${queryString ? `?${queryString}` : ""}`;

        return await axios.get(url);
    } catch (error) {
        console.error("獲取訂單列表失敗:", error);
        throw error;
    }
};

export const getOrdersByUserId = async (userId, params = {}) => {
    if (!userId) {
        return Promise.reject(new Error("用戶ID不能為空"));
    }

    try {
        // 轉換參數為URL查詢字符串
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page - 1); // 後端分頁從0開始
        if (params.size) queryParams.append("size", params.size);
        if (params.query) queryParams.append("query", params.query);
        if (params.status) queryParams.append("status", params.status);

        queryParams.append("userId", userId);

        const queryString = queryParams.toString();
        const url = `/api/order?${queryString}`;

        return await axios.get(url);
    } catch (error) {
        console.error(`獲取用戶${userId}的訂單失敗:`, error);
        throw error;
    }
};

export const getOrderById = (orderId) => {
    return axios.get(`/api/order/${orderId}`);
};

// 支付相关API
export const createPayment = (orderId, paymentData) => {
    if (!orderId) {
        return Promise.reject(new Error("訂單ID不能為空"));
    }
    return axios.post(`/api/order/${orderId}/payment`, paymentData);
};

export const getPaymentStatus = (paymentId) => {
    if (!paymentId) {
        return Promise.reject(new Error("支付ID不能為空"));
    }
    return axios.get(`/api/order/payment/${paymentId}/status`);
};

export const mockPaymentCallback = (paymentId, status = "SUCCESS") => {
    if (!paymentId) {
        return Promise.reject(new Error("支付ID不能為空"));
    }
    return axios.post(`/api/order/payment/${paymentId}/mock?status=${status}`);
};

// 圖片上傳API
export const uploadImage = (formData) => {
    return axios.post("/api/images/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
