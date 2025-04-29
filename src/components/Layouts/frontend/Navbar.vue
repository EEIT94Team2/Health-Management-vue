<template>
<<<<<<< HEAD
    <header class="main-header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <router-link to="/" @click="handleLogoClick">
                        <img src="@/assets/images/logo.png" alt="Logo" class="logo-icon" />
                        享健你
                        <span class="subtitle">遇見更好的自己</span>
                    </router-link>
                </div>
                <nav class="main-nav">
                    <ul>
                        <li
                            v-for="menu in filteredMenus"
                            :key="menu.label"
                            class="nav-item"
                            @mouseenter="menu.open = true"
                            @mouseleave="menu.open = false"
                        >
                            <a href="#" @click.prevent="menu.hash ? handleNavClick(menu) : null">
                                {{ menu.label }}
                                <span class="arrow" :class="{ open: menu.open }">▼</span>
                            </a>
                            <ul
                                v-if="menu.children"
                                class="dropdown horizontal"
                                :class="{ show: menu.open }"
                            >
                                <li v-for="child in menu.children" :key="child.label">
                                    <a href="#" @click.prevent="handleNavClick(child)">
                                        {{ child.label }}
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </nav>
                <!-- 未登錄 -->
                <div class="header-buttons" v-if="!isAuthenticated">
                    <el-button size="medium" @click="handleLogin">登入</el-button>
                    <el-button type="primary" size="medium" @click="handleRegister">
                        免費註冊
                    </el-button>
                </div>

                <!-- 已登錄 -->
                <div
                    class="user-dropdown"
                    v-else
                    @mouseenter="userMenuOpen = true"
                    @mouseleave="userMenuOpen = false"
                >
                    <div class="user-dropdown-toggle">
                        <img src="@/assets/images/user.jpg" alt="User" class="user-avatar" />
                        {{ displayName }}
                        <span class="arrow" :class="{ open: userMenuOpen }">▼</span>
                    </div>
                    <ul class="dropdown" :class="{ show: userMenuOpen }">
                        <li><router-link to="/user/profile">會員中心</router-link></li>
                        <li><router-link to="/user/courses">我的課程</router-link></li>
                        <li><router-link to="/shop/orders">我的訂單</router-link></li>
                        <li><router-link to="/shop/cart">購物車</router-link></li>
                        <li><router-link to="/user/fitness">健身成效</router-link></li>
                        <li><router-link to="/user/profile">我的檔案</router-link></li>
                        <li><a href="#" @click.prevent="handleLogout">登出</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </header>
=======
  <header class="main-header">
    <div class="container">
      <div class="header-content">
        <div
          class="logo"
          @mouseenter="swapLogo(true)"
          @mouseleave="swapLogo(false)"
        >
          <router-link to="/" @click="handleLogoClick">
            <img :src="logoSrc" alt="Logo" class="logo-icon" />
            享健你
            <span class="subtitle">遇見更好的自己</span>
          </router-link>
        </div>

        <nav class="main-nav">
          <ul>
            <li
              v-for="menu in filteredMenus"
              :key="menu.label"
              class="nav-item"
              @mouseenter="menu.open = true"
              @mouseleave="menu.open = false"
            >
              <a
                href="#"
                @click.prevent="menu.hash ? handleNavClick(menu) : null"
              >
                {{ menu.label }}
                <span class="arrow" :class="{ open: menu.open }">▼</span>
              </a>
              <ul
                v-if="menu.children"
                class="dropdown horizontal"
                :class="{ show: menu.open }"
              >
                <li v-for="child in menu.children" :key="child.label">
                  <a href="#" @click.prevent="handleNavClick(child)">
                    {{ child.label }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        <!-- 未登錄 -->
        <div class="header-buttons" v-if="!isAuthenticated">
          <el-button size="medium" @click="handleLogin">登入</el-button>
          <el-button type="primary" size="medium" @click="handleRegister">
            免費註冊
          </el-button>
        </div>

        <!-- 已登錄 -->
        <div
          class="user-dropdown"
          v-else
          @mouseenter="userMenuOpen = true"
          @mouseleave="userMenuOpen = false"
        >
          <div class="user-dropdown-toggle">
            <img
              src="@/assets/images/user.jpg"
              alt="User"
              class="user-avatar"
            />
            <span class="user-name" :title="userInfo?.name">{{
              displayName
            }}</span>
            <span class="arrow" :class="{ open: userMenuOpen }">▼</span>
          </div>
          <ul class="dropdown" :class="{ show: userMenuOpen }">
            <li><router-link to="/user/profile">會員中心</router-link></li>
            <li><router-link to="/user/courses">我的課程</router-link></li>
            <li><router-link to="/shop/orders">我的訂單</router-link></li>
            <li><router-link to="/shop/cart">購物車</router-link></li>
            <li><router-link to="/user/fitness">健身成效</router-link></li>
            <li><router-link to="/user/profile">我的檔案</router-link></li>
            <li><a href="#" @click.prevent="handleLogout">登出</a></li>
          </ul>
        </div>
      </div>
    </div>
  </header>
>>>>>>> 4bc1a29974629ba9f3034902c9a20dd05f82418b
</template>
    
<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 用户登录状态
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userInfo = computed(() => {
  console.log("Current userInfo in Navbar:", authStore.getUserInfo);
  return authStore.getUserInfo;
});
const userMenuOpen = ref(false);

// 計算顯示名稱
const displayName = computed(() => {
  // 直接從localStorage中獲取userName，這樣即使authStore中的userInfo不完整也能正確顯示
  const userName = localStorage.getItem("userName");

  // 獲取authStore中的用戶信息作為備選
  const info = userInfo.value;

  // 輸出調試信息
  console.log("顯示名稱計算:", {
    localStorage_userName: userName,
    authStore_name: info?.name,
    authStore_info: info,
  });

  // 優先使用localStorage中的userName，然後是authStore中的name，最後使用默認值
  return userName || info?.name || "用戶";
});

// 在組件掛載時獲取最新用戶信息
onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      await refreshUserName();
    } catch (error) {
      console.error("刷新用戶名稱失敗:", error);
    }
  }
});

// 刷新用戶名稱
const refreshUserName = async () => {
  try {
    // 確認有token
    const token = localStorage.getItem("authToken");
    if (!token) return;

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await axios.get("/api/users/userinfo");

    if (response.data && response.data.data && response.data.data.name) {
      const apiUser = response.data.data;

      // 更新 localStorage
      localStorage.setItem("userName", apiUser.name);

      // 更新 userInfo
      if (userInfo.value) {
        const updatedInfo = { ...userInfo.value, name: apiUser.name };
        localStorage.setItem("userInfo", JSON.stringify(updatedInfo));
        authStore.setUserInfo(updatedInfo);
      }

      console.log("成功刷新用戶名稱:", apiUser.name);
    }
  } catch (error) {
    console.error("獲取用戶名稱失敗:", error);
  }
};

const isHomepage = computed(() => route.path === "/");

// Logo 圖片路徑
const logoDefault = new URL("@/assets/images/logo.png", import.meta.url).href;
const logoHover = new URL("@/assets/images/logoup.png", import.meta.url).href;

const logoSrc = ref(logoDefault);

const swapLogo = (hovering) => {
  logoSrc.value = hovering ? logoHover : logoDefault;
};

const handleLogoClick = (event) => {
  if (isHomepage.value) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const handleLogin = () => {
  router.push("/user/login");
};

const handleRegister = () => {
  router.push("/user/register");
};

const handleLogout = () => {
  authStore.logout();
  // 強制頁面刷新以確保UI更新正確
  setTimeout(() => {
    window.location.href = "/";
  }, 100);
};

const menus = reactive([
  {
    label: "課程專區",
    children: [{ label: "課程列表", path: "/courses" }],
    open: false,
  },
  {
    label: "商城",
    children: [
      { label: "商品列表", path: "/shop/products" },
      { label: "購物車", path: "/shop/cart" },
      { label: "我的訂單", path: "/shop/orders" },
    ],
    open: false,
  },
  {
    label: "追蹤成效",
    children: [
      { label: "運動紀錄管理", hash: "#workout-tracking" },
      { label: "身體數據管理", hash: "#body-data" },
      { label: "報告與數據分析", hash: "#report" },
    ],
    open: false,
  },
  {
    label: "社群論壇",
    children: [
      { label: "論壇首頁", path: "/social/forumhome" },
      { label: "文章列表", path: "/social/forum" },
      { label: "發表文章", path: "/social/forumcreate" },
      { label: "尋找夥伴", path: "/social/partner" },
      { label: "個人檔案", path: "/social/UserSocialProfile" },
    ],
    open: false,
  },
]);

// 过滤掉会员中心菜单
const filteredMenus = computed(() => menus);

const handleNavClick = (menuItem) => {
  if (menuItem.path) {
    router.push(menuItem.path);
  } else if (menuItem.hash) {
    if (isHomepage.value) {
      const element = document.querySelector(menuItem.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push({ path: "/", hash: menuItem.hash });
    }
  }
};
</script>

<style lang="scss" scoped>
/* 導航欄樣式 */
.main-header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
  background-image: linear-gradient(to bottom, #10202b 100%);
  backdrop-filter: blur(10px);
  padding: 15px 0;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo a {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  font-family: Inter, sans-serif;
  transition: color 0.3s;
  position: relative; /* 讓子元素可以相對於它定位 */
  display: flex;
  align-items: center;
  gap: 10px;

  .logo-icon {
    height: 40px;
    width: auto;
  }

  .subtitle {
    position: absolute; /* 使用絕對定位 */
    top: 1.2em; /* 向上移動，你可以調整這個值 */
    right: -8em; /* 向右移動，你可以調整這個值 */
    font-size: 0.8rem;
    font-weight: 400;
    margin-top: 0; /* 移除之前的上邊距 */
    white-space: nowrap; /* 防止副標題文字換行 */
    color: #ccc; /* 設定為淺灰色，你可以調整這個顏色值 */
  }

  &:hover {
    color: #43a478;
  }
}

.main-nav {
  display: flex;

  ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;

    li.nav-item {
      position: relative;
      margin: 0 15px;

      a {
        color: #f5f5f5;
        text-decoration: none;
        padding: 8px 12px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: color 0.3s, background-color 0.3s;
        font-size: 1.1rem;

        .arrow {
          font-size: 0.75rem;
          transition: transform 0.3s ease;

          &.open {
            transform: rotate(180deg);
          }
        }

        &:hover {
          color: #43a478;
          background-color: rgba(67, 164, 120, 0.1);
        }
      }

      .dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        background-color: #1e293b;
        border-radius: 6px;
        padding: 10px 0;
        min-width: 200px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        opacity: 0;
        pointer-events: none;
        transform: translateY(10px);
        transition: opacity 0.3s, transform 0.3s;
        z-index: 100;

        &.show {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }

        &.horizontal {
          display: flex;
          flex-direction: column;
        }

        li {
          margin: 0;

          a {
            padding: 8px 20px;
            display: block;
            color: #f5f5f5;
            text-decoration: none;
            font-size: 1rem;
            transition: color 0.3s, background-color 0.3s;

            &:hover {
              color: #43a478;
              background-color: rgba(67, 164, 120, 0.1);
            }
          }
        }
      }
    }
  }
}

.header-buttons {
  display: flex;
  gap: 10px;
}

/* 用戶下拉菜單樣式 */
.user-dropdown {
  position: relative;

  .user-dropdown-toggle {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #f5f5f5;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.3s;

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    &:hover {
      background-color: rgba(67, 164, 120, 0.1);
    }

    .arrow {
      font-size: 0.75rem;
      transition: transform 0.3s ease;

      &.open {
        transform: rotate(180deg);
      }
    }
  }

  .dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: #1e293b;
    border-radius: 6px;
    padding: 10px 0;
    min-width: 180px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    opacity: 0;
    pointer-events: none;
    transform: translateY(10px);
    transition: opacity 0.3s, transform 0.3s;
    z-index: 100;
    list-style: none;
    margin: 0;

    &.show {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    li {
      a {
        padding: 8px 20px;
        display: block;
        color: #f5f5f5;
        text-decoration: none;
        transition: color 0.3s, background-color 0.3s;

        &:hover {
          color: #43a478;
          background-color: rgba(67, 164, 120, 0.1);
        }
      }
    }
  }
}

/* 用戶下拉菜單樣式 */
.user-dropdown {
  position: relative;

  .user-dropdown-toggle {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #f5f5f5;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.3s;

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-name {
      max-width: 100px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }

    &:hover {
      background-color: rgba(67, 164, 120, 0.1);
    }
  }
}

@media (max-width: 768px) {
  .logo a {
    font-size: 1.5rem;

    .subtitle {
      display: none;
    }
  }
}
</style>
