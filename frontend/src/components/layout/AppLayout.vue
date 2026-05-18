<script setup lang="ts">
// AppLayout — the main authenticated shell.
// Composes the sidebar, header, and page content area.
// All protected routes are rendered inside this layout via <router-view />.
import AppSidebar from './AppSidebar.vue'
import AppHeader  from './AppHeader.vue'
import ToastNotification from '@/components/common/ToastNotification.vue'
</script>

<template>
  <!-- Full-viewport flex container: sidebar on the left, header + content on the right -->
  <div class="flex h-screen overflow-hidden" style="background-color: #f3f4f8;">
    <!-- Fixed-width collapsible navigation sidebar -->
    <AppSidebar />
    <!-- Right column: sticky header above a scrollable main area -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <AppHeader />
      <!-- Scrollable page content rendered by the current route -->
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
  <!-- Toast notifications are teleported to <body> and rendered above everything -->
  <ToastNotification />
</template>
