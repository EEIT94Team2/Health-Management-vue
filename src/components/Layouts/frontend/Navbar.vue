<template>
  <div
    class="sidebar-trigger"
    v-if="isHomepage"
    @mouseenter="openSidebar"
    @mouseleave="closeSidebarWithDelay"
  >
    <i class="bi bi-justify-left"></i>
  </div>

  <div class="header-right">
    <div class="header-buttons" v-if="!isAuthenticated">
      <el-button size="medium" @click="handleLogin">登入</el-button>
      <el-button type="primary" size="medium" @click="handleRegister">
        免費註冊
      </el-button>
    </div>

    <div
      class="user-dropdown"
      v-else
      @mouseenter="userMenuOpen = true"
      @mouseleave="userMenuOpen = false"
    >
      <div class="user-dropdown-toggle">
        <img src="@/assets/images/user.jpg" alt="User" class="user-avatar" />
        <span class="user-name" :title="userInfo?.name">{{ displayName }}</span>
        <span class="arrow" :class="{ open: userMenuOpen }">▼</span>
      </div>
      <ul class="dropdown" :class="{ show: userMenuOpen }">
        <li @click="userMenuOpen = false">
          <router-link to="/user/profile">會員中心</router-link>
        </li>
        <li @click="userMenuOpen = false">
          <router-link to="/user/courses">我的課程</router-link>
        </li>
        <li @click="userMenuOpen = false">
          <router-link to="/shop/orders">我的訂單</router-link>
        </li>
        <li @click="userMenuOpen = false">
          <router-link to="/shop/cart">購物車</router-link>
        </li>
        <li @click="userMenuOpen = false">
          <router-link to="/user/fitness">健身成效</router-link>
        </li>
        <li @click="userMenuOpen = false">
          <router-link to="/social/UserSocialProfile">我的檔案</router-link>
        </li>
        <li @click="userMenuOpen = false">
          <a href="#" @click.prevent="handleLogout">登出</a>
        </li>
      </ul>
    </div>
  </div>

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
                  <a href="#" @click.prevent="handleNavClick(child, menu)">
                    {{ child.label }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>

  <div
    class="sidebar"
    :class="{ open: isSidebarOpen }"
    @mouseleave="closeSidebar"
    @mouseenter="cancelClose"
  >
    <nav class="sidebar-nav">
      <ul>
        <li
          v-for="menu in sidebarMenus"
          :key="menu.label"
          class="nav-item-sidebar"
        >
          <a
            href="#"
            @click.prevent="menu.hash ? handleSidebarNavClick(menu) : null"
          >
            <i :class="menu.icon"></i>
            {{ menu.label }}
          </a>
        </li>
      </ul>
    </nav>
  </div>

  <div
    class="sidebar-overlay"
    :class="{ show: isSidebarOpen }"
    @click="closeSidebar"
  ></div>
</template>

<script setup>
// ... (script setup 其他部分保持不變) ...

import { reactive, ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// --- Sidebar 狀態和懸停邏輯 ---
const isSidebarOpen = ref(false);
const sidebarCloseTimeout = ref(null);

const openSidebar = () => {
  clearTimeout(sidebarCloseTimeout.value);
  isSidebarOpen.value = true;
};

const closeSidebar = () => {
  clearTimeout(sidebarCloseTimeout.value);
  isSidebarOpen.value = false;
};

const closeSidebarWithDelay = () => {
  sidebarCloseTimeout.value = setTimeout(() => {
    closeSidebar();
  }, 200);
};

const cancelClose = () => {
  clearTimeout(sidebarCloseTimeout.value);
};

// 側邊欄選單數據 (這部分保持不變)
const sidebarMenus = ref([
  { label: "熱門課程", hash: "#courses", icon: "bi bi-fire" },
  { label: "精選商品", hash: "#products", icon: "bi bi-cart-fill" },
  { label: "健康管理", hash: "#features", icon: "bi bi-heart-fill" },
  { label: "社群論壇", hash: "#social", icon: "bi bi-chat-dots-fill" },
  { label: "聯絡我們", hash: "#contact", icon: "bi bi-telephone-fill" },
  { label: "免費體驗", hash: "#contact", icon: "bi bi-star-fill" },
]);

// 處理側邊欄導航項目的點擊事件 (這部分保持不變，它已經會關閉 sidebar)
const handleSidebarNavClick = (item) => {
  if (item.hash) {
    const hash = item.hash;
    closeSidebar();
    if (isHomepage.value) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      setTimeout(() => {
        router.push({ path: "/", hash });
      }, 300);
    }
  }
};

// --- 現有的 Navbar 邏輯 (認證、Logo、主導航、按鈕) ---

const isAuthenticated = computed(() => authStore.isAuthenticated);
const userInfo = computed(() => {
  console.log("Current userInfo in Navbar:", authStore.getUserInfo);
  return authStore.getUserInfo;
});
const userMenuOpen = ref(false);

const displayName = computed(() => {
  const userName = localStorage.getItem("userName");
  const info = userInfo.value;
  console.log("顯示名稱計算:", {
    localStorage_userName: userName,
    authStore_name: info?.name,
    authStore_info: info,
  });
  return userName || info?.name || "用戶";
});

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      await refreshUserName();
    } catch (error) {
      console.error("刷新用戶名稱失敗:", error);
    }
  }
});

const refreshUserName = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await axios.get("/api/users/userinfo");
    if (response.data && response.data.data && response.data.data.name) {
      const apiUser = response.data.data;
      localStorage.setItem("userName", apiUser.name);
      if (userInfo.value) {
        const updatedInfo = { ...userInfo.value, name: apiUser.name };
        localStorage.setItem("userInfo", JSON.stringify(updatedInfo));
        authStore.setUserInfo(updatedInfo);
      }
      console.log("成功刷新用戶名稱:", apiUser.name);
    }
  } catch (error) {
    console.error("獲取用戶名稱失敗:", error);
    if (error.response && error.response.status === 401) {
      authStore.logout();
      router.push("/user/login");
    }
  }
};

const isHomepage = computed(() => route.path === "/");

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
  userMenuOpen.value = false; // 在登出操作前關閉下拉選單
  authStore.logout();
  setTimeout(() => {
    window.location.href = "/";
  }, 100);
};

// 主導航選單數據 (這部分保持不變，但注意 open 屬性用於控制子選單)
const menus = reactive([
  {
    label: "課程專區",
    children: [{ label: "課程列表", path: "/courses" }],
    open: false, // 控制這個選單的子選單是否顯示
  },
  {
    label: "商城",
    children: [
      { label: "商品列表", path: "/shop/products" },
      { label: "購物車", path: "/shop/cart" },
      { label: "我的訂單", path: "/shop/orders" },
    ],
    open: false, // 控制這個選單的子選單是否顯示
  },
  {
    label: "追蹤成效",
    children: [
      {
        label: "身體數據",
        hash: "/user/fitness?tab=body-data",
        selector: "a[href='/user/fitness?tab=body-data']",
      },
      {
        label: "運動紀錄",
        hash: "/user/fitness?tab=workout-records",
        selector: "a[href='/user/fitness?tab=workout-records']",
      },
      {
        label: "飲食追蹤",
        hash: "/user/fitness?tab=diet-records",
        selector: "a[href='/user/fitness?tab=diet-records']",
      },
      {
        label: "目標設定",
        hash: "/user/fitness?tab=goals-progress",
        selector: "a[href='/user/fitness?tab=goals-progress']",
      },
      {
        label: "概覽",
        hash: "/user/fitness?tab=overview",
        selector: "a[href='/user/fitness?tab=overview']",
      },
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
    open: false, // 控制這個選單的子選單是否顯示
  },
]);

const filteredMenus = computed(() => menus);

// 處理主導航項目的點擊事件 (修改此函式以關閉父級選單的子選單)
const handleNavClick = (menuItem, parentMenu = null) => {
  if (menuItem.path) {
    router.push(menuItem.path); // 導航到指定路徑
  } else if (menuItem.hash) {
    // 在首頁滾動到指定 hash 或導航到首頁並帶上 hash
    if (isHomepage.value) {
      const element = document.querySelector(menuItem.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push({ path: "/", hash: menuItem.hash });
    }
  }

  // --- 添加這裡的邏輯來關閉父級選單的子選單 ---
  // 如果點擊的是子選單項目 (parentMenu 不為 null 且其 open 屬性為 true)
  if (parentMenu && parentMenu.open) {
    parentMenu.open = false; // 將父級選單項目的 open 設為 false，關閉子選單
  }
  // 如果點擊的是頂級選單項目且它有子選單 (menuItem 有 children 且其 open 屬性為 true)，
  // 通常點擊頂級帶下拉的選單時是為了打開子選單，所以這裡通常不需要關閉。
  // 如果你需要點擊頂級選單也關閉子選單，可以在這裡添加判斷：
  // else if (menuItem.children && menuItem.open) {
  //   menuItem.open = false;
  // }
  // 但根據常見的下拉選單行為，只點擊子選單時關閉父級選單是更直觀的。
};
</script>

<style lang="scss" scoped>
@use "sass:color";

/* 設定根元素的 CSS 變數 */
:root {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --highlight-color: #10b981; /* 主題高亮色 */
  --highlight-hover: #059669; /* 主題高亮色懸停狀態 */
  --border-color: #374151;
  --card-bg: #1e293b;
  --success-light: #ecfdf5;
  --success-dark: #065f46;
}

/* 導航欄樣式 (保持不變) */
.main-header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
  background-image: linear-gradient(to bottom, #10202b 100%);
  backdrop-filter: blur(10px);
  padding: 15px 0; // Header 的垂直內邊距
  display: flex; // 使 container 居中
  justify-content: center; // 使 container 居中
  align-items: center; // 使 container 垂直居中 (雖然 container 通常 full height 了)
}

.container {
  width: 100%;
  max-width: 1200px;
  // margin: 0 auto; // 這裡不需要 auto margin 了，由父元素 main-header 的 flex 居中
  padding: 0 20px;
  height: 100%; // 佔滿 main-header 的高度
  display: flex; // 使 header-content 佔滿 container
  align-items: center; // 使 header-content 垂直居中
}

/* header-content 現在只包含 Logo 和 Nav，並控制它們的 Flexbox 佈局 */
.header-content {
  display: flex;
  align-items: center;
  // 平均分配空間
  justify-content: space-around; // 或者使用 space-around
  width: 100%; // 佔滿 container 的寬度
  height: 100%; // 佔滿 container 的高度
  // gap 也可以用在這裡控制 logo 和 main-nav 的間距，但 justify-content 已經處理了間距分配
  // gap: 30px;
}

/* 左側容器 (移除，其內容 sidebar-trigger 已移到 header 外部) */
// .header-left { ... }

/* 中間容器 (移除，其內容已移到 header-content 內部) */
// .header-center { ... }

/* 右側容器 (移到 header 外部，保持固定定位樣式) */
.header-right {
  position: fixed; // 固定定位
  top: 25px; // 與左側 trigger 相同的垂直位置
  right: 70px; // <-- 將這裡的值從 20px 改為 70px
  z-index: 1010; // 確保在 Navbar 及 Sidebar 上方
  display: flex; // 保持內部 flex 排列
  align-items: center; // 內部垂直居中
  gap: 10px; // 內部按鈕間距
}

/* --- Sidebar Trigger 樣式 (固定在左上角) --- */
.sidebar-trigger {
  position: fixed;
  top: 20px; /* 定位在頂部左側附近 */
  left: 50px;
  background: rgba(#10202b, 50%);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1010; /* 較高的 z-index，確保在頂部 */
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease-in-out;
  font-size: 1.5rem;

  &:hover {
    background: color.adjust(rgba(#10202b, 0.85), $lightness: -10%);
    transform: rotate(180deg);
  }

  i {
    font-size: 1.2rem;
  }
}

/* --- Sidebar 樣式 (固定定位，預設隱藏在螢幕外，當有 .open class 時顯示) --- */
.sidebar {
  position: fixed;
  top: 0; /* 從視窗頂部開始 */
  left: -250px; /* 隱藏在螢幕左側。請同時調整 width 和 left 的數值。 */
  width: 250px; /* 側邊欄的固定寬度 */
  height: 100vh; /* 全視窗高度 */
  background: rgba(#10202b, 20%); /* 背景顏色和透明度 */
  color: #fff;
  z-index: 1005; /* 在內容上方，觸發器/使用者區塊/遮罩下方 */
  transition: left 0.3s ease-in-out; /* 平滑滑動的過渡動畫 */
  padding: 80px 25px 20px; /* 頂部內邊距用於避開固定 Header，加上水平和底部內邊距 */
  white-space: nowrap; /* 防止選單項目換行 */
  box-shadow: 2px 0 6px rgba(#000000, 0.2); /* 右側邊緣的陰影 */
  border-bottom-right-radius: 8px; /* 圓角 (可選) */
  overflow-y: auto; /* 如果內容垂直溢出則顯示捲軸 */
  box-sizing: border-box; /* 將內邊距包含在元素的總寬度內 */

  /* --- 控制側邊欄打開的狀態 Class --- */
  &.open {
    left: 0; /* 當有 'open' class 時，側邊欄滑入視圖 */
  }

  i {
    font-size: 1.2rem; /* 側邊欄連結內的圖示大小 */
    margin-right: 8px; /* 圖示與文字之間的間距 */
  }
}

/* --- Sidebar 遮罩層樣式 (固定定位，預設隱藏，當有 .show class 時顯示且可點擊) --- */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色 */
  z-index: 1004; /* 在側邊欄下方，主要內容上方 */
  opacity: 0; /* 預設隱藏 */
  pointer-events: none; /* 隱藏時不阻止點擊 */
  transition: opacity 0.3s ease; /* 透明度平滑過渡 */

  &.show {
    opacity: 1; /* 當有 .show class 時顯示 */
    pointer-events: auto; /* 顯示時阻止點擊內容 */
  }
}

/* --- Sidebar 導航樣式 --- */
.sidebar-nav ul {
  list-style: none;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px; /* 選單項目之間的間距 */
}

.nav-item-sidebar a {
  display: flex;
  align-items: center;
  gap: 12px; /* 側邊欄內圖示與文字之間的間距 */
  font-size: 1.05rem;
  color: #f5f5f5; /* 文字顏色 */
  text-decoration: none;
  transition: all 0.3s ease; /* 懸停效果的平滑過渡 */
}

.nav-item-sidebar a {
  // 對應原來的 .nav-item a
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.05rem;
  color: #f5f5f5;
  text-decoration: none;
  transition: all 0.3s ease;
  padding-top: 10px; /* 使用原 Sidebar 的 padding-top */
}

/* 注意：原 Sidebar 的這條規則是針對 .main-nav 裡面的第一個 .nav-item */
/* 如果 Sidebar 的第一個導航項不需要特殊的 margin/padding，可以移除這條 */
/* 如果需要，請確認 .sidebar-nav ul li.nav-item-sidebar:first-child a 是否適用您的結構 */
/* 暫時保留並修改選擇器 */
.sidebar-nav ul li.nav-item-sidebar:first-child a {
  // 對應原來的 .main-nav ul li.nav-item:first-child a
  margin-top: 20px; /* 使用原 Sidebar 的 margin-top */
  // padding-top: 35px; /* 原 Sidebar 中這條重複設定了 padding-top，保留上面 10px 即可或根據需要調整 */
}

.nav-item-sidebar a:hover {
  // 對應原來的 .nav-item a:hover
  color: var(
    --highlight-color,
    #43a478
  ); /* Use a CSS variable if defined, fallback to green */
  transform: translateX(3px);
}

/* --- Existing Navbar Logo/Nav/Button/User Styles (保留) --- */
// Logo 樣式，現在它在 header-content 裡
.logo a {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  font-family: Inter, sans-serif;
  transition: color 0.3s;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;

  .logo-icon {
    height: 40px;
    width: auto;
  }

  .subtitle {
    position: absolute;
    top: 1em;
    right: -8em; // 這個 right 值現在是相對於 logo a 本身，不是 header-content
    font-size: 1rem;
    font-weight: 400;
    margin-top: 0;
    white-space: nowrap;
    color: #ccc;
  }

  &:hover {
    color: #43a478;
  }
}

// 主要導航樣式，現在它在 header-content 裡
.main-nav {
  display: flex; // 保持 main-nav 自身是 flex 容器
  // flex-grow: 1; /* 移除 flex-grow，讓 justify-content: space-evenly 分配空間 */
  // justify-content: center; /* 保持 main-nav 內部 ul 的居中 */

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
        min-width: 170px;
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

/* --- 按鈕樣式修改: 設定顏色為主題色 (修正 Sass color.adjust 錯誤) --- */
/* 目標是 header-buttons 容器內的 el-button (預設樣式) */
.header-buttons .el-button {
  color: var(--highlight-color, #43a478); /* 文字顏色 */
  border-color: var(--highlight-color, #43a478); /* 邊框顏色 */
  background-color: rgb(255, 255, 255);
  transition: all 0.3s ease; /* 添加過渡效果 */

  &:hover,
  &:focus {
    color: #fff; /* 懸停時文字變白 */
    // 修正 Sass 錯誤：直接使用顏色碼 #10b981 進行 adjust
    background-color: color.adjust(
      #10b981,
      $lightness: -10%
    ); /* 懸停時背景色 */
    border-color: color.adjust(#10b981, $lightness: -10%); /* 懸停時邊框色 */
  }
  &:active {
    // 修正 Sass 錯誤：直接使用顏色碼 #10b981 進行 adjust
    background-color: color.adjust(
      #10b981,
      $lightness: -20%
    ); /* 點擊時背景色更深 */
    border-color: color.adjust(
      #10b981,
      $lightness: -20%
    ); /* 點擊時邊框色更深 */
    color: #fff; /* 確保文字顏色 */
  }
}

/* 目標是 header-buttons 容器內的 el-button--primary (主要樣式) */
.header-buttons .el-button--primary {
  background-color: var(--highlight-color, #10b981); /* 背景顏色 */
  border-color: var(--highlight-color, #10b981); /* 邊框顏色 */
  color: var(--text-primary, #fff); /* 文字顏色通常為白色以確保對比 */
  transition: all 0.3s ease; /* 添加過渡效果 */

  &:hover,
  &:focus {
    // 修正 Sass 錯誤：直接使用顏色碼 #10b981 進行 adjust
    background-color: color.adjust(
      #10b981,
      $lightness: -10%
    ); /* 懸停時背景色變深 */
    border-color: color.adjust(
      #10b981,
      $lightness: -10%
    ); /* 懸停時邊框色變深 */
    color: var(--text-primary, #fff); /* 確保文字顏色 */
  }
  &:active {
    // 修正 Sass 錯誤：直接使用顏色碼 #10b981 進行 adjust
    background-color: color.adjust(
      #10b981,
      $lightness: -20%
    ); /* 點擊時背景色更深 */
    border-color: color.adjust(
      #10b981,
      $lightness: -20%
    ); /* 點擊時邊框色更深 */
    color: var(--text-primary, #fff); /* 確保文字顏色 */
  }
}

// 用戶下拉容器樣式 (已移到 header 外部，保持內部 flex 排列)
.user-dropdown {
  position: relative;
  flex-shrink: 0;

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

  .dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: #1e293b;
    border-radius: 6px;
    padding: 10px 0;
    min-width: 130px;
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

/* --- 小螢幕媒體查詢 --- */
@media (max-width: 768px) {
  /* 調整 Logo 大小並隱藏副標題 */
  .logo a {
    font-size: 1.5rem;
    .subtitle {
      display: none;
    }
  }

  /* 在小螢幕下隱藏主導航 (側邊欄成為主要導航) */
  .main-nav {
    display: none;
  }

  /* 調整 Header 內容佈局 */
  .header-content {
    justify-content: center; /* 主導航隱藏時 Logo 居中 */
    gap: 0; /* 移除間距 */
  }

  /* 調整小螢幕下觸發器和右側區塊的固定定位 */
  .sidebar-trigger {
    left: 10px;
    top: 15px;
    width: 35px; /* 觸發器稍微小一點 */
    height: 35px;
    font-size: 1.3rem; /* 調整圖示大小 */
    i {
      font-size: 1rem;
    }
  }

  .header-right {
    right: 10px;
    top: 15px;
    gap: 5px;
  }

  /* 調整小螢幕下側邊欄的寬度/位置 */
  .sidebar {
    width: 200px; /* 調整側邊欄寬度 */
    left: -200px; /* 根據新寬度隱藏在螢幕外 */
    padding: 60px 15px 20px; /* 調整內邊距以避開 Header */
    &.open {
      left: 0; /* 滑入視圖 */
    }
  }

  /* 調整小螢幕下使用者頭像大小 */
  .user-dropdown .user-dropdown-toggle .user-avatar {
    width: 28px;
    height: 28px;
  }

  /* 調整小螢幕下使用者名稱的顯示/大小 */
  .user-dropdown .user-dropdown-toggle .user-name {
    max-width: 70px; // 減少名稱的最大寬度
  }
}
</style>
