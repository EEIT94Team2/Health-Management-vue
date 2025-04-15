// src/components/layout/MainHeader.vue
<template>
  <header class="main-header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <router-link to="/" @click.prevent="scrollToTop">享健你，遇見更好的自己</router-link>
        </div>
        <nav class="main-nav">
          <ul>
            <li><a href="#membership">會員中心</a></li>
            <li><a href="#courses">課程查詢</a></li>
            <li><a href="#products">購物商城</a></li>
            <li><a href="#features">健康管理</a></li>
            <li><a href="#social">社群論壇</a></li>
            <li><a href="#contact">聯絡我們</a></li>
          </ul>
        </nav>
        <div class="header-buttons">
          <el-button size="medium">登入</el-button>
          <el-button type="primary" size="medium" @click="scrollToContact">免費體驗</el-button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'MainHeader',
  setup() {
    const router = useRouter();

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToContact = () => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return {
      scrollToTop,
      scrollToContact,
      router
    };
  },
};
</script>

<style scoped>
.main-header {
  position: fixed; /* 導覽列固定在頂部 */
  top: 0;
  left: 0;
  z-index: 1000;
  background-image: linear-gradient(to bottom, #10202B 100%); /* 調整顏色和透明度 */
  backdrop-filter: blur(10px);
  padding: 15px 0;
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo a {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
}

.logo a:hover {
  color: #42b883;
}

.main-nav ul {
  display: flex;
  list-style: none;
  gap: 30px;
  padding: 0;
  margin: 0;
  align-items: center;
}

.main-nav a {
  color: #f5f5f5;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s;
}

.main-nav a:hover {
  color: #42b883;
}

.header-buttons {
  display: flex;
  gap: 10px;

  .el-button {
    border-radius: 25px;
  }
}
</style>
