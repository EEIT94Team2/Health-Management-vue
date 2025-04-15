<template>
    <div class="app-wrapper" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
        <Sidebar
            @update-title="handleTitleUpdate"
            :is-visible="true"
            :is-collapsed="isSidebarCollapsed"
            :userRole="userRole"
        />
        <div class="main-container">
            <Navbar :title="navbarTitle" @toggle-sidebar="handleSidebarToggle" />
            <AppMain>
                <router-view />
            </AppMain>
            <Footer />
        </div>
    </div>
</template>

<script setup>
import Sidebar from "./Sidebar.vue";
import Navbar from "./Navbar.vue";
import AppMain from "./AppMain.vue";
import Footer from "./Footer.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const isSidebarCollapsed = ref(false);
const navbarTitle = ref("後端管理系統");
const userRole = ref("");
const router = useRouter();

onMounted(() => {
    userRole.value = localStorage.getItem("userRole") || "";
});

const handleTitleUpdate = (title) => {
    navbarTitle.value = title;
};

const handleSidebarToggle = (collapsed) => {
    isSidebarCollapsed.value = collapsed;
};
</script>

<style lang="scss" scoped>
.app-wrapper {
    display: flex;
    flex-direction: column; /* 垂直方向 */
    height: 100vh;
    width: 100vw;
    transition: margin-left 0.3s ease-in-out;
}

.sidebar {
    height: 100%; /* 相對於 app-wrapper 的高度 */
    transition: width 0.3s ease-in-out;
    width: 200px;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 30; /* 確保在 Footer 之上 */
}

.main-container {
    flex-grow: 1; /* 佔據剩餘空間 */
    margin-left: 200px;
    transition: margin-left 0.3s ease-in-out;
    display: flex;
    flex-direction: column; /* 內部垂直方向 */
    overflow-y: auto; /* 如果 main content 需要內部滾動 */
}

.app-wrapper.sidebar-collapsed {
    .sidebar {
        width: 64px;
    }
    .main-container {
        margin-left: 64px;
    }
}

.footer {
    height: 30px; /* 與 Footer 組件中的高度一致 */
    border-top: 1px solid #e9e9e9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    background-color: #fff;
    box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
    /* 固定在底部 */
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 20; /* 確保在主要內容之上，但在 Sidebar 之下 */
}

.app-main {
    flex-grow: 1; /* 讓 AppMain 佔據 main-container 的剩餘空間 */
    padding-bottom: 50px; /* 預留 footer 的高度，避免內容被遮擋 */
}
</style>
