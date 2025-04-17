<template>
  <header class="main-header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
         <router-link to="/" @click="handleLogoClick">
          <img src="@/assets/images/logo.png" alt="Logo" class="logo-icon">
          享健你
          <span class="subtitle">遇見更好的自己</span>
          </router-link>
        </div>
        <nav class="main-nav">
        <ul>
          <li
            v-for="menu in menus"
            :key="menu.label"
            class="nav-item"
            @mouseenter="menu.open = true"
            @mouseleave="menu.open = false">
            <a href="#" @click.prevent="menu.hash ? handleNavClick(menu) : null">
              {{ menu.label }}
              <span class="arrow" :class="{ open: menu.open }">▼</span>
            </a>
            <ul v-if="menu.children" class="dropdown horizontal" :class="{ show: menu.open }">
              <li v-for="child in menu.children" :key="child.label">
                <a href="#" @click.prevent="handleNavClick(child)">
                  {{ child.label }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
        <div class="header-buttons">
          <el-button size="medium" @click="handleLogin">登入</el-button> <el-button type="primary" size="medium" @click="handleRegister">免費註冊</el-button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const isHomepage = computed(() => route.path === '/')

const handleLogoClick = (event) => {
  if (isHomepage.value) {
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleLogin = () => {
  router.push('/user/login')
}

const handleRegister = () => {
  router.push('/user/register')
}

const menus = reactive([
  {
    label: '會員中心',
    children: [
      { label: '會員註冊', hash: '#register' },
      { label: '會員資料', hash: '#profile' },
      { label: '會員總管', hash: '#member-admin' },
    ],
    open: false,
  },
  {
    label: '課程管理',
    children: [
      { label: '課程列表', hash: '#courses' },
    ],
    open: false,
  },
  {
    label: '商城',
    children: [
      { label: '商品列表', path: '/shop/products' },
      { label: '購物車', path: '/shop/cart' },
      { label: '我的訂單', path: '/shop/orders' },
    ],
    open: false,
  },
  {
    label: '追蹤成效',
    children: [
      { label: '運動紀錄管理', hash: '#workout-tracking' },
      { label: '身體數據管理', hash: '#body-data' },
      { label: '報告與數據分析', hash: '#report' },
    ],
    open: false,
  },
  {
    label: '社群論壇',
    children: [
      { label: '論壇首頁', hash: '#forum-home' },
      { label: '文章列表', hash: '#articles' },
      { label: '發表文章', hash: '#post' },
    ],
    open: false,
  },
]);

</script>

<style lang="scss" scoped>
/* 導航欄樣式 */
.main-header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
  background-image: linear-gradient(to bottom, #10202B 100%);
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
}

.logo router-link {
  display: flex; /* 確保圖片和文字在一行 */
  align-items: center; /* 垂直居中對齊圖片和文字 */
  text-decoration: none; /* 移除連結的底線 */
  color: inherit; /* 繼承父元素的顏色 */
}

.logo-icon {
  width: 30px; /* 設定圖片的寬度，你可以根據需要調整 */
  height: auto; /* 保持圖片的原始比例 */
  margin-right: 5px; /* 設定圖片和文字之間的間距 */
  vertical-align: middle; /* 讓圖片和文字垂直居中對齊 */
  margin-bottom: 7px;
}

.logo a:hover {
  color: var(--highlight-color);
}

.main-nav ul {
  display: flex;
  list-style: none;
  gap: 30px;
  margin: 0;
  padding: 0;
  align-items: center;
}

.main-nav a {
  color: #f5f5f5;
  text-decoration: none;
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.3s;
}

.main-nav a:hover {
  color: var(--highlight-color);
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.el-button {
  background-color: transparent;
  color: #f5f5f5;
  border: 1px solid var(--highlight-color);
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;

  &:hover {
    background-color: rgba(67, 164, 120, 0.1);
    color: #8dfac9;
    border-color: var(--highlight-color);
  }
}

.el-button--primary {
  background-color: var(--highlight-color);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #368e68;
  }
}

.nav-item {
  position: relative;

  a {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #f5f5f5;
    text-decoration: none;
    font-size: 1rem;
    cursor: pointer;

    .arrow {
      font-size: 0.75rem;
      transition: transform 0.3s ease;

      &.open {
        transform: rotate(180deg); // 旋轉箭頭
      }
    }
  }

  .dropdown.horizontal {
    position: absolute;
    top: 100%;
    left: 0;
    display: flex;
    gap: 20px;
    background: transparent;
    padding: 10px 0;
    list-style: none;
    z-index: 1001;

    opacity: 0;
    transform: translateY(-10px);
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.3s ease;

    &.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    li {
      a {
        color: #f5f5f5;
        text-decoration: none;
        white-space: nowrap;

        &:hover {
          color: var(--highlight-color);
        }
      }
    }
  }
}

</style>