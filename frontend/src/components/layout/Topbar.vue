<template>
  <div class="layout">

    <!-- SIDEBAR -->
    <Sidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />

    <!-- MAIN AREA -->
    <div class="main">

      <!-- TOPBAR -->
      <Topbar @toggleSidebar="toggleSidebar" />

      <!-- PAGE CONTENT -->
      <div class="content">
        <router-view />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'

const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  background: #f1f5f9;
}


/* MAIN WRAPPER */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* CONTENT AREA */
.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>