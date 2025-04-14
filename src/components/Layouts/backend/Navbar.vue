<template>
    <div class="navbar">
      <div class="hamburger-container" @click="toggleSidebar">
        <svg
          :class="{'is-active': isSidebarCollapsed}"
          class="hamburger"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          width="24" height="24" >
          <path fill="currentColor" d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z" />
        </svg>
      </div>
      <h2>{{ title }}</h2>
      <div class="user-info">
        <el-dropdown trigger="click">
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-icon><UserFilled /></el-icon>
                <span>使用者：{{ loggedInAccount }}</span>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-icon><UserFilled /></el-icon>
                <span>暱稱：{{ loggedInNickname }}</span>
              </el-dropdown-item>
              <el-dropdown-item divided @click="logout">
                <el-icon><SwitchButton /></el-icon>
                <span>登出</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
          <el-avatar :src="userAvatarUrl" :icon="UserFilled" class="user-avatar" />
        </el-dropdown>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import { ElAvatar, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from "element-plus";
  import { UserFilled, SwitchButton } from "@element-plus/icons-vue";
  import { useAuthStore } from "@/stores/auth";
  
  // 导入图片
  import userAvatarImg from "@/assets/images/user.jpg";
  
  const router = useRouter();
  const authStore = useAuthStore();
  const emit = defineEmits(['toggle-sidebar']);
  
  const props = defineProps({
    title: {
      type: String,
      default: "後端管理系統",
    },
  });
  
  const loggedInAccount = ref("admin");
  const loggedInNickname = ref("哈囉");
  const userAvatarUrl = ref(userAvatarImg);
  const isSidebarCollapsed = ref(false);
  
  const logout = () => {
    console.log("登出");
    authStore.logout();
  };
  
  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
    emit('toggle-sidebar', isSidebarCollapsed.value);
  };
  </script>
  
  <style lang="scss" scoped>
  .navbar {
    height: 60px;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center; /* 上下置中 */
    padding: 0 20px;
    /* 將子元素靠左排列 */
    justify-content: flex-start;
  
    > * {
      display: flex;
      align-items: center;
      height: 100%;
    }
  
    .left-items {
      display: flex;
      align-items: center;
    }
  
    .hamburger-container {
      display: flex; /* 啟用 Flexbox */
      align-items: center; /* 垂直置中 */
      justify-content: center; /* 水平置中容器內的圖示 */
      margin-right: -5px;
      cursor: pointer;
      width: 24px; /* 與 SVG 的 width 對應 */
      height: 24px; /* 與 SVG 的 height 對應 */
    }
  
    .hamburger {
      display: inline-block;
      vertical-align: middle;
      width: 100%; /* 讓 SVG 填充容器 */
      height: 100%; /* 讓 SVG 填充容器 */
      cursor: pointer;
      transition: transform 0.3s;
    }
  
    .hamburger.is-active {
      transform: rotate(180deg); /* 如果你需要 Hamburger 切換時有旋轉動畫 */
    }
  
    h2 {
      margin-left: 20px;
      margin-right: 20px; /* 增加與 nav-links 的間距 */
    }
  
    .nav-links {
      display: flex;
      gap: 20px;
      /* 不需要 margin-left，因為 flex-start 會靠左 */
      span {
        cursor: pointer;
        font-weight: bold;
      }
    }
  
    .user-info {
      margin-left: auto; /* 將 user-info 推向右側 */
      .el-dropdown {
        margin-left: 15px;
        margin-top: -9px;
      }
  
      .user-avatar {
        width: 50px;
        height: 50px;
      }
    }
  }
  </style>