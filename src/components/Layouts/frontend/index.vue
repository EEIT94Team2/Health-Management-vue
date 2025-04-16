<template>
  <div class="frontend-layout">
    <NavBar />
    <router-view />
    <Footer />
    <BackToTop />
  </div>
</template>

<script setup>
import NavBar from '@/components/Layouts/frontend/Navbar.vue'
import Footer from '@/components/Layouts/frontend/Footer.vue'
import BackToTop from '@/components/Layouts/frontend/BackToTop.vue'
</script>

<style lang="scss">
@use '@/assets/styles/index' as *;
</style>
