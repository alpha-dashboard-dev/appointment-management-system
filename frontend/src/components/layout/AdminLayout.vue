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
import Sidebar from '@/components/layout/Sidebar.vue'
import Topbar from '@/components/layout/Topbar.vue'
</script>

<style scoped>

.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* MAIN AREA */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0b1220;
}

/* PAGE CONTENT */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f1f5f9;
}

</style>