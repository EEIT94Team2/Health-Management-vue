<template>
    <router-view />
</template>

<script setup>
import { RouterView } from "vue-router";
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

onMounted(() => {
    // 應用啟動時檢查是否有token並恢復登錄狀態
    authStore.autoLogin();
});
</script>
