<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }" v-if="isVisible">
    <div class="sidebar-header">
      <img :src="sidebarLogo" class="header-logo-icon" alt="Header Logo" />
      <span class="logo-text">{{ title }}</span>
    </div>
    <el-menu
      router
      default-active="$route.path"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      :collapse="isCollapsed"
      @select="handleSelect"
    >
      <el-menu-item index="/backpage/dashboard">
        <el-icon><HomeFilled /></el-icon>
        <span>首頁</span>
      </el-menu-item>

      <el-sub-menu index="member">
        <template #title>
          <el-icon><User /></el-icon>
          <span>會員中心</span>
        </template>
        <el-menu-item index="/backpage/member/register">
          <span>會員註冊</span>
        </el-menu-item>
        <el-menu-item index="/backpage/member/profile">
          <span>會員資料</span>
        </el-menu-item>

        <el-menu-item
          index="/backpage/member/management"
          v-if="userRole === 'admin'"
        >
          <span>會員總管</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="courses">
        <template #title>
          <el-icon><Calendar /></el-icon>
          <span>課程管理</span>
        </template>
        <el-menu-item index="/backpage/courses">
          <span>課程列表</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu v-if="checkPermission(['admin', 'shop'])" index="shop">
        <template #title>
          <el-icon>
            <Shop />
          </el-icon>
          <span>商城管理</span>
        </template>

        <el-menu-item
          index="/backpage/shop/products"
          :class="{ 'is-active': activePath === '/backpage/shop/products' }"
        >
          <el-icon>
            <Goods />
          </el-icon>
          <span>商品列表</span>
        </el-menu-item>

        <el-menu-item
          v-if="userRole === 'admin'"
          index="/backpage/shop/product-admin"
          :class="{
            'is-active': activePath === '/backpage/shop/product-admin',
          }"
        >
          <el-icon>
            <Setting />
          </el-icon>
          <span>商品管理後台</span>
        </el-menu-item>

        <el-menu-item
          index="/backpage/shop/cart"
          :class="{ 'is-active': activePath === '/backpage/shop/cart' }"
        >
          <el-icon>
            <ShoppingCart />
          </el-icon>
          <span>購物車管理</span>
        </el-menu-item>

        <el-menu-item
          index="/backpage/shop/orders"
          :class="{ 'is-active': activePath === '/backpage/shop/orders' }"
        >
          <el-icon>
            <Document />
          </el-icon>
          <span>訂單管理</span>
        </el-menu-item>

        <el-menu-item
          v-if="userRole === 'admin'"
          index="/backpage/shop/checkout"
          :class="{ 'is-active': activePath === '/backpage/shop/checkout' }"
        >
          <el-icon>
            <Money />
          </el-icon>
          <span>模擬支付</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="fitness">
        <template #title>
          <el-icon><Histogram /></el-icon>
          <span>追蹤成效</span>
        </template>
        <el-menu-item
          index="/backpage/fitness/admin/workouts"
          v-if="userRole === 'admin'"
        >
          <span>運動紀錄管理</span>
        </el-menu-item>
        <el-menu-item
          index="/backpage/fitness/admin/body"
          v-if="userRole === 'admin'"
        >
          <span>身體數據管理</span>
        </el-menu-item>
        <el-menu-item
          index="/backpage/fitness/admin/diet"
          v-if="userRole === 'admin'"
        >
          <span>飲食數據管理</span>
        </el-menu-item>
        <el-menu-item
          index="/backpage/fitness/admin/goals"
          v-if="userRole === 'admin'"
        >
          <span>目標設定管理</span>
        </el-menu-item>
        <el-menu-item
          index="/backpage/fitness/admin/reports"
          v-if="userRole === 'admin'"
        >
          <span>報告與數據分析</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="social">
        <template #title>
          <el-icon><ChatSquare /></el-icon>
          <span>論壇</span>
        </template>
        <el-menu-item index="/backpage/social/home">
          <span>論壇首頁</span>
        </el-menu-item>
        <el-menu-item index="/backpage/social/posts">
          <span>文章列表</span>
        </el-menu-item>
        <el-menu-item index="/backpage/social/create">
          <span>發表文章</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  HomeFilled,
  Calendar,
  User,
  ShoppingCart,
  ChatSquare,
  Histogram,
  Shop,
  Goods,
  Document,
  Money,
  Setting,
} from "@element-plus/icons-vue";
import sidebarLogoImage from "@/assets/images/logo.png"; // 導入你的 Logo 圖示
import { useAuthStore } from "@/stores/auth"; // 引入 authStore

const router = useRouter();
const route = useRoute();
const emit = defineEmits(["update-title"]);
const props = defineProps({
  title: {
    type: String,
    default: "你今天健了嗎",
  },
  logo: {
    type: String,
    default: null,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  isCollapsed: {
    // 接收來自父組件的縮放狀態
    type: Boolean,
    default: false,
  },
});

const sidebarLogo = ref(sidebarLogoImage); // 將導入的圖示路徑设置為 ref
const authStore = useAuthStore(); // 取得 authStore 實例
const userRole = computed(() => authStore.userRole); // 使用 computed 獲取響應式的 userRole

// 添加權限檢查函数 (使用 computed 的 userRole)
const checkPermission = (roles) => {
  return roles.includes(userRole.value);
};

// onMounted 中不需要再直接獲取 localStorage 中的 userRole
// 因為 authStore 會管理並且是響應式的

const activePath = computed(() => {
  return route.path;
});

const handleSelect = (index, indexPath) => {
  let title = "後端管理系統";
  switch (index) {
    case "/backpage/dashboard":
      title = "首頁";
      break;
    case "/backpage/member/login":
      title = "會員登入";
      break;
    case "/backpage/member/register":
      title = "會員註冊";
      break;
    case "/backpage/member/profile":
      title = "會員資料";
      break;
    case "/backpage/member/management":
      title = "會員總管";
      break;
    case "/backpage/courses":
      title = "課程列表";
      break;
    case "/backpage/shop/products":
      title = "商品列表";
      break;
    case "/backpage/shop/cart":
      title = "購物車管理";
      break;
    case "/backpage/shop/orders":
      title = "訂單管理";
      break;
    case "/backpage/shop/checkout":
      title = "模擬支付";
      break;
    case "/backpage/fitness/admin/workouts":
      title = "運動紀錄管理";
      break;
    case "/backpage/fitness/admin/body":
      title = "身體數據管理";
      break;
    case "/backpage/fitness/admin/diet":
      title = "飲食數據管理";
      break;
    case "/backpage/fitness/admin/goals":
      title = "目標設定與進度監控";
      break;
    case "/backpage/social/home":
      title = "論壇首頁";
      break;
    case "/backpage/social/posts":
      title = "文章列表";
      break;
    case "/backpage/social/create":
      title = "發表文章";
      break;
    default:
      title = "後端管理系統";
      break;
  }
  emit("update-title", title);
};
</script>

<style lang="scss" scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  background-color: #304156;
  color: #bfcbd9;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease-in-out;

  &.collapsed {
    width: 64px;

    .sidebar-header {
      display: flex;
      justify-content: center; /* 水平居中 logo icon */
      align-items: center; /* 垂直居中 logo icon */
      height: 56px; /* 預設 el-menu-item 的高度 */
      padding: 0;

      .logo-text {
        display: none;
      }
      .logo-image {
        display: none; /* 收縮時隱藏大的 logo */
        margin-right: 0;
      }
      .header-logo-icon {
        display: block;
        width: 24px; /* 調整為與 icon 相近的大小 */
        height: 24px;
        margin-right: 0; /* 移除文字間距 */
      }
    }

    .el-menu {
      width: 64px;
      .el-menu-item,
      .el-sub-menu__title {
        overflow: hidden;
        height: 56px; /* 確保與 header 高度一致 */
        display: flex;
        justify-content: center;
        align-items: center;

        span {
          width: 0;
          opacity: 0;
          display: inline-block;
          transition: opacity 0.3s, width 0.3s;
        }
        .el-icon {
          margin-right: 0;
          justify-content: center;
          display: flex;
          font-size: 20px; /* 調整 icon 大小，可根據實際情況調整 */
        }
      }

      .el-sub-menu__title .el-icon-arrow {
        display: none;
      }
    }
  }

  &:not(.collapsed) {
    .el-menu-item,
    .el-sub-menu__title {
      span {
        width: auto;
        opacity: 1;
      }
    }
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  transition: all 0.3s ease-in-out;
}

.logo-image {
  height: 30px;
  margin-right: 10px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
}

.header-logo-icon {
  height: 24px; /* 調整 Logo 圖示大小 */
  width: auto;
  margin-right: 10px; /* 調整 Logo 圖示與文字間距 */
}

.el-menu {
  border-right: none;
  flex-grow: 1;
}
</style>
