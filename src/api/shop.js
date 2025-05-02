import axios from "@/api/config/axios";
import { useAuthStore } from "@/stores/auth";

// 標準DTO類型定義
// 這些類型有助於確保前後端數據格式一致
const DTOTemplates = {
    // 訂單DTO模板
    Order: {
        userId: null,
        orderItems: [],
        totalAmount: 0,
        shippingAddress: {
            recipientName: "",
            phoneNumber: "",
            address: "",
            city: "",
            zipCode: "",
            country: "Taiwan",
        },
        paymentMethod: "CREDIT_CARD",
        status: "PENDING",
        orderNote: "",
    },

    // 購物車結算DTO模板
    CartCheckout: {
        userId: null,
        shippingInfo: {
            name: "",
            phone: "",
            address: "",
            city: "",
            zipCode: "",
            country: "Taiwan",
        },
        paymentType: "CREDIT_CARD",
        note: "",
    },
};

// 建立一個DTO實例的輔助函數
const createDTO = (template, data) => {
    // 使用深拷貝避免修改模板
    const dto = JSON.parse(JSON.stringify(template));

    // 合併數據
    if (data) {
        Object.keys(data).forEach((key) => {
            if (typeof data[key] === "object" && data[key] !== null && dto[key] !== undefined) {
                // 如果是對象屬性且兩邊都存在，則遞歸合併
                dto[key] = { ...dto[key], ...data[key] };
            } else {
                // 否則直接替換
                dto[key] = data[key];
            }
        });
    }

    return dto;
};

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
export const getCartItems = (providedUserId = null) => {
    // 1. 首先嘗試使用提供的用戶ID
    let userId = providedUserId;

    // 2. 如果沒有提供，嘗試通過getUserId函數獲取
    if (!userId) {
        userId = getUserId();
    }

    // 3. 如果仍然沒有，嘗試從authStore直接獲取
    if (!userId) {
        try {
            const authStore = useAuthStore();
            if (authStore && authStore.userInfo && authStore.userInfo.id) {
                userId = authStore.userInfo.id;
                console.log("從authStore獲取用戶ID:", userId);
            }
        } catch (e) {
            console.error("從authStore獲取用戶ID失敗:", e);
        }
    }

    // 4. 如果前面的方法都失敗，嘗試使用測試用戶ID
    if (!userId) {
        userId = getTestUserId();
        console.warn("使用測試用戶ID:", userId);
    }

    // 5. 如果仍然沒有，使用默認值1
    if (!userId) {
        userId = 1;
        console.warn("無法獲取有效用戶ID，使用默認ID=1");
    }

    console.log("最終使用的用戶ID:", userId);

    // 嘗試從本地存儲讀取購物車緩存
    const tryLoadLocalCart = () => {
        try {
            const localCart = localStorage.getItem("cart");
            if (localCart) {
                const parsedCart = JSON.parse(localCart);
                if (Array.isArray(parsedCart) && parsedCart.length > 0) {
                    console.log("從本地存儲加載購物車:", parsedCart.length, "個商品");
                    return { data: parsedCart };
                }
            }
        } catch (e) {
            console.error("讀取本地購物車失敗:", e);
        }
        return null;
    };

    // 實現帶有本地緩存回退的API調用
    return axios
        .get("/api/cart/items", { params: { userId } })
        .then((response) => {
            // 檢查響應是否有效
            if (response && response.data) {
                // 檢查數據是否為數組
                let cartItems;
                if (Array.isArray(response.data)) {
                    cartItems = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    cartItems = response.data.data;
                } else if (response.data.content && Array.isArray(response.data.content)) {
                    cartItems = response.data.content;
                } else {
                    // 無法從響應中獲取數組
                    console.warn("API響應格式不符合預期:", response.data);
                    cartItems = [];
                }

                // 檢查是否為空數組
                if (cartItems.length === 0) {
                    console.log("API返回空購物車，檢查本地存儲");
                    const localCart = tryLoadLocalCart();
                    if (localCart) {
                        console.log("使用本地緩存的購物車數據");
                        return localCart;
                    }
                } else {
                    // 如果獲取到有效數據，保存到本地緩存
                    try {
                        localStorage.setItem("cart", JSON.stringify(cartItems));
                        console.log("購物車數據已保存到本地緩存");
                    } catch (e) {
                        console.error("保存購物車到本地存儲失敗:", e);
                    }
                }

                return response;
            } else {
                console.warn("API響應缺少數據");
                throw new Error("API響應無效");
            }
        })
        .catch((error) => {
            console.error("獲取購物車失敗:", error);
            // 嘗試從本地緩存獲取
            const localCart = tryLoadLocalCart();
            if (localCart) {
                console.log("由於API錯誤，使用本地緩存的購物車數據");
                return localCart;
            }
            throw error;
        });
};

export const addItemToCart = (cartRequest) => {
    // 使用與getCartItems相同的邏輯獲取用戶ID
    if (!cartRequest.userId) {
        let userId = null;

        // 嘗試從authStore獲取
        try {
            const authStore = useAuthStore();
            if (authStore && authStore.userInfo && authStore.userInfo.id) {
                userId = authStore.userInfo.id;
            }
        } catch (e) {
            console.error("從authStore獲取用戶ID失敗:", e);
        }

        // 嘗試從其他地方獲取
        if (!userId) {
            userId = getUserId();
        }

        // 如果仍然沒有，使用測試用戶ID或默認值
        if (!userId) {
            userId = getTestUserId() || 1;
        }

        cartRequest.userId = userId;
        console.log("添加到購物車，使用用戶ID:", userId);
    }

    // 確保productId和quantity存在
    if (!cartRequest.productId) {
        return Promise.reject(new Error("商品ID不能為空"));
    }

    if (!cartRequest.quantity || cartRequest.quantity <= 0) {
        cartRequest.quantity = 1; // 預設數量為1
    }

    // 保存購物車操作到本地，以便在API失敗時使用
    const saveToLocalCart = async (productId, quantity) => {
        try {
            // 獲取商品詳情
            const productResponse = await getProductById(productId);
            if (!productResponse || !productResponse.data) {
                console.warn("無法獲取商品詳情，本地緩存可能不完整");
                return;
            }

            const product = productResponse.data;

            // 獲取當前本地購物車
            let localCart = [];
            try {
                const savedCart = localStorage.getItem("cart");
                if (savedCart) {
                    localCart = JSON.parse(savedCart);
                }
            } catch (e) {
                console.error("讀取本地購物車失敗:", e);
            }

            // 檢查商品是否已在購物車中
            const existingItemIndex = localCart.findIndex(
                (item) =>
                    item.productId === productId || (item.product && item.product.id === productId)
            );

            if (existingItemIndex >= 0) {
                // 更新數量
                localCart[existingItemIndex].quantity += quantity;
            } else {
                // 添加新商品
                const newItem = {
                    id: Date.now(), // 臨時ID
                    productId,
                    quantity,
                    product,
                };
                localCart.push(newItem);
            }

            // 保存更新後的購物車
            localStorage.setItem("cart", JSON.stringify(localCart));
            console.log("商品已添加到本地購物車緩存");
        } catch (e) {
            console.error("保存到本地購物車失敗:", e);
        }
    };

    // 調用API並處理結果
    return axios
        .post("/api/cart/items", cartRequest)
        .then((response) => {
            // API成功，更新本地緩存
            saveToLocalCart(cartRequest.productId, cartRequest.quantity);
            return response;
        })
        .catch(async (error) => {
            console.error("添加到購物車API失敗:", error);

            // API失敗，僅保存到本地
            await saveToLocalCart(cartRequest.productId, cartRequest.quantity);

            // 創建一個模擬成功的響應
            const mockResponse = {
                data: {
                    success: true,
                    message: "商品已添加到本地購物車",
                    data: {},
                },
                status: 200,
                statusText: "OK (Local)",
                headers: {},
                config: {},
                isLocalFallback: true, // 標記為本地回退
            };

            return mockResponse;
        });
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

    // 使用useAuthStore从Pinia获取用户ID
    const authStore = useAuthStore();
    const userId = authStore.userInfo?.id || getUserId();

    if (!userId) {
        return Promise.reject(new Error("用戶未登入，無法移除商品"));
    }

    return axios.delete(`/api/cart/items/${cartRequest.cartItemId}`, {
        params: { userId },
    });
};

export const clearCart = (providedUserId = null) => {
    // 採用與getCartItems相同的邏輯獲取用戶ID
    let userId = providedUserId;

    if (!userId) {
        userId = getUserId();
    }

    if (!userId) {
        try {
            const authStore = useAuthStore();
            if (authStore && authStore.userInfo && authStore.userInfo.id) {
                userId = authStore.userInfo.id;
            }
        } catch (e) {
            console.error("從authStore獲取用戶ID失敗:", e);
        }
    }

    if (!userId) {
        userId = getTestUserId();
    }

    if (!userId) {
        userId = 1;
        console.warn("無法獲取有效用戶ID，使用默認ID=1");
    }

    console.log("清空購物車，使用用戶ID:", userId);

    return axios.delete(`/api/cart/clear?userId=${userId}`);
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

export const createOrderFromCart = async (providedUserId = null) => {
    // 採用與getCartItems相同的邏輯獲取用戶ID
    let userId = providedUserId;

    if (!userId) {
        userId = getUserId();
    }

    if (!userId) {
        try {
            const authStore = useAuthStore();
            if (authStore && authStore.userInfo && authStore.userInfo.id) {
                userId = authStore.userInfo.id;
                console.log("從authStore獲取用戶ID:", userId);
            }
        } catch (e) {
            console.error("從authStore獲取用戶ID失敗:", e);
        }
    }

    if (!userId) {
        userId = getTestUserId();
    }

    if (!userId) {
        userId = 1;
        console.warn("無法獲取有效用戶ID，使用默認ID=1");
    }

    console.log("從購物車創建訂單，使用用戶ID:", userId);

    // 獲取用戶信息 - 從localStorage或其他可用源
    const getUserInfo = () => {
        try {
            const userName = localStorage.getItem("userName") || "";
            const userPhone = localStorage.getItem("userPhone") || "";
            const userAddress = localStorage.getItem("userAddress") || "";
            const userCity = localStorage.getItem("userCity") || "";
            const userZipCode = localStorage.getItem("userZipCode") || "";

            // 嘗試從authStore獲取更多信息
            try {
                const authStore = useAuthStore();
                if (authStore && authStore.userInfo) {
                    return {
                        name: authStore.userInfo.name || userName || "用戶",
                        phone: authStore.userInfo.phone || userPhone || "",
                        address: authStore.userInfo.address || userAddress || "",
                        city: authStore.userInfo.city || userCity || "",
                        zipCode: authStore.userInfo.zipCode || userZipCode || "",
                        country: "Taiwan",
                    };
                }
            } catch (e) {
                console.error("獲取authStore用戶信息失敗", e);
            }

            return {
                name: userName || "用戶",
                phone: userPhone || "",
                address: userAddress || "",
                city: userCity || "",
                zipCode: userZipCode || "",
                country: "Taiwan",
            };
        } catch (e) {
            console.error("獲取用戶信息失敗", e);
            return {
                name: "用戶",
                phone: "",
                address: "",
                city: "",
                zipCode: "",
                country: "Taiwan",
            };
        }
    };

    try {
        // 1. 獲取購物車數據
        console.log("正在獲取購物車項目...");
        const cartResponse = await getCartItems(userId);
        let cartItems = [];

        if (cartResponse && cartResponse.data) {
            if (Array.isArray(cartResponse.data)) {
                cartItems = cartResponse.data;
            } else if (cartResponse.data.data && Array.isArray(cartResponse.data.data)) {
                cartItems = cartResponse.data.data;
            } else if (cartResponse.data.content && Array.isArray(cartResponse.data.content)) {
                cartItems = cartResponse.data.content;
            }
        }

        console.log("獲取到的購物車數據:", cartItems);

        if (!cartItems || cartItems.length === 0) {
            console.error("購物車是空的，無法創建訂單");
            throw new Error("購物車是空的，請先添加商品");
        }

        // 2. 獲取用戶信息
        const userInfo = getUserInfo();

        // 3. 使用專門的Spring Boot訂單創建函數
        console.log("使用Spring Boot訂單創建函數...");
        return await createSpringBootOrder(userId, cartItems, userInfo);
    } catch (error) {
        console.error("購物車結算失敗:", error);
        throw error;
    }
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

// 專門處理Spring Boot格式訂單的創建
export const createSpringBootOrder = async (userId, cartItems, shippingInfo) => {
    console.log("嘗試創建Spring Boot格式訂單...");
    console.log("用戶ID:", userId);
    console.log("購物車項目:", cartItems);

    if (!cartItems || cartItems.length === 0) {
        throw new Error("購物車是空的，無法創建訂單");
    }

    // 轉換購物車項目為標準訂單項目格式
    const orderItemDTOs = [];
    let totalAmount = 0;

    for (const item of cartItems) {
        const productId = item.productId || (item.product ? item.product.id : null);
        if (!productId) {
            console.warn("跳過無效的購物車項目:", item);
            continue;
        }

        const quantity = parseInt(item.quantity) || 1;
        const unitPrice = parseFloat(item.product?.price) || parseFloat(item.unitPrice) || 0;
        const subtotal = unitPrice * quantity;

        // 確保所有數值都是有效的數字
        if (isNaN(productId) || isNaN(quantity) || isNaN(unitPrice) || isNaN(subtotal)) {
            console.warn("項目包含無效數值，跳過:", {
                productId,
                quantity,
                unitPrice,
                subtotal,
            });
            continue;
        }

        // 添加必要的字段
        const orderItem = {
            productId: productId,
            quantity: quantity,
            unitPrice: unitPrice,
            subtotal: subtotal,
            productName: item.product?.name || item.productName || "商品",
            // 添加所有可能的關鍵字段
            id: null, // 新訂單項目沒有ID
            orderId: null, // 將由後端設置
            productImage: item.product?.image || "",
            status: "PENDING",
        };

        orderItemDTOs.push(orderItem);
        totalAmount += subtotal;
    }

    if (orderItemDTOs.length === 0) {
        throw new Error("無法創建有效的訂單項目");
    }

    // 構建完整的Spring Boot訂單DTO
    const orderDTO = {
        id: null, // 新訂單沒有ID
        userId: userId,
        orderNumber: `ORD${Date.now()}`, // 臨時訂單編號
        orderDate: new Date().toISOString(),
        orderItems: orderItemDTOs,
        orderItemsJson: JSON.stringify(orderItemDTOs), // 同時提供JSON字符串版本
        totalAmount: totalAmount,
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentMethod: "CREDIT_CARD",
        shippingAddress: {
            id: null, // 新地址沒有ID
            userId: userId,
            recipientName: shippingInfo?.name || "收件人",
            phoneNumber: shippingInfo?.phone || "",
            address: shippingInfo?.address || "",
            city: shippingInfo?.city || "",
            zipCode: shippingInfo?.zipCode || "",
            country: shippingInfo?.country || "Taiwan",
            isDefault: true,
        },
        shippingAddressJson: JSON.stringify({
            // 同時提供JSON字符串版本
            recipientName: shippingInfo?.name || "收件人",
            phoneNumber: shippingInfo?.phone || "",
            address: shippingInfo?.address || "",
            city: shippingInfo?.city || "",
            zipCode: shippingInfo?.zipCode || "",
            country: shippingInfo?.country || "Taiwan",
        }),
        orderNote: "從購物車創建的訂單",
    };

    console.log("完整的訂單DTO:", orderDTO);

    // 嘗試不同的請求格式
    try {
        // 1. 標準Spring Boot格式
        console.log("嘗試標準Spring Boot訂單格式...");
        const response = await axios.post("/api/orders", orderDTO);
        return response;
    } catch (error) {
        console.error("標準格式失敗:", error.response?.data || error.message);

        try {
            // 2. 簡化格式 - 使用items代替orderItems
            console.log("嘗試使用items字段...");
            const simplifiedDTO = {
                ...orderDTO,
                items: orderItemDTOs,
            };
            delete simplifiedDTO.orderItems;

            const response = await axios.post("/api/orders", simplifiedDTO);
            return response;
        } catch (error2) {
            console.error("簡化格式失敗:", error2.response?.data || error2.message);

            try {
                // 3. 直接從購物車創建
                console.log("嘗試從購物車直接創建...");
                const response = await axios.post(`/api/cart/${userId}/checkout`, {
                    shippingAddress: orderDTO.shippingAddress,
                    paymentMethod: orderDTO.paymentMethod,
                });
                return response;
            } catch (error3) {
                console.error("從購物車創建失敗:", error3.response?.data || error3.message);
                throw new Error(
                    "無法創建訂單: " + (error3.response?.data?.message || error3.message)
                );
            }
        }
    }
};
