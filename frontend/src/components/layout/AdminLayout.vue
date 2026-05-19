<template>
  <div class="layout">
    <Sidebar />
    <div class="main">
      <Topbar />
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
</script>

<style scoped>
.layout {
  display: flex;
}

.main {
  flex: 1;
  background: #f1f5f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  padding: 20px;
  flex: 1;
}
</style>
