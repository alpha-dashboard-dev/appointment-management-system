<template>
  <div class="layout">
    <Sidebar />
    <div class="main">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
</script>

<style scoped>
.layout {
  display: flex;
}
.main {
  flex: 1;
  background: #f1f5f9;
  min-height: 100vh;
}
</style>