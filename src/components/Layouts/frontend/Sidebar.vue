<template>
  <div class="sidebar-trigger">
    <i class="bi bi-justify-left"></i>
  </div>
  <div class="sidebar">
    <nav class="main-nav">
      <ul>
        <li v-for="menu in menus" :key="menu.label" class="nav-item">
          <a href="#" @click.prevent="menu.hash ? handleNavClick(menu) : null">
            <i :class="menu.icon"></i>
            {{ menu.label }}
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, computed } from "vue";

const router = useRouter();
const route = useRoute();

const isHomepage = computed(() => route.path === "/");

const menus = ref([
  { label: "熱門課程", hash: "#courses", icon: "bi bi-fire" },
  { label: "精選商品", hash: "#products", icon: "bi bi-cart-fill" },
  { label: "健康管理", hash: "#features", icon: "bi bi-heart-fill" },
  { label: "社群論壇", hash: "#social", icon: "bi bi-chat-dots-fill" },
  { label: "聯絡我們", hash: "#contact", icon: "bi bi-telephone-fill" },
  { label: "免費體驗", hash: "#contact", icon: "bi bi-star-fill" },
]);

const handleNavClick = (item) => {
  if (item.hash) {
    const hash = item.hash;
    if (isHomepage.value) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push({ path: "/", hash });
    }
  }
};
</script>

<style lang="scss" scoped>
@use "sass:color";

.sidebar-trigger {
  position: fixed;
  top: 18px;
  left: 70px;
  background: rgba(#10202b, 50%);
  color: #fff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease-in-out; /* 添加 transform 的 transition */
  font-size: 2rem; /* 調整觸發圖示大小 */

  &:hover {
    background: color.adjust(rgba(#10202b, 0.85), $lightness: -10%);
    transform: rotate(180deg); /* 滑鼠滑過時旋轉 180 度 */
  }

  i {
    font-size: 1.5rem; /* 調整箭頭圖示大小 */
  }
}

.sidebar {
  position: fixed;
  top: 70px;
  left: -180px;
  min-width: 180px;
  width: auto;
  max-width: 280px;
  height: calc(100vh - 70px);
  background: rgba(#10202b, 60%);
  color: #fff;
  z-index: 1000;
  transition: left 0.3s ease-in-out;
  padding: 20px 25px;
  white-space: nowrap;
  box-shadow: 2px 0 6px rgba(#000000, 0.2);
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;

  i {
    font-size: 1.2rem; /* 調整側邊欄內圖示大小 */
    margin-right: 8px; /* 調整圖示與文字間距 */
  }
}

.sidebar-trigger:hover + .sidebar {
  left: 0;
}

.sidebar:hover {
  left: 0;
}

.main-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nav-item a {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.05rem;
  color: #f5f5f5;
  text-decoration: none;
  transition: all 0.3s ease;
  padding-top: 10px; /* 嘗試這個數值，你可以根據需要調整 */
}

.main-nav ul li.nav-item:first-child a {
  margin-top: 20px; /* 嘗試這個數值 */
  padding-top: 35px; /* 你之前設定的 padding-top 可以保留 */
}

.nav-item a:hover {
  color: var(--highlight-color);
  transform: translateX(3px);
}
</style>
