<template>
  <div class="layout">
    <aside :class="['sidebar', { collapsed }]">
      <div class="logo">
        <span v-if="!collapsed">Staff Portal</span>
        <button class="toggle" @click="collapsed = !collapsed">☰</button>
      </div>

      <nav class="menu">
        <router-link to="/staff/dashboard" class="item">
          <i class="icon">📊</i>
          <span v-if="!collapsed">Dashboard</span>
        </router-link>

        <router-link to="/staff/schedule" class="item">
          <i class="icon">🗓️</i>
          <span v-if="!collapsed">My Schedule</span>
        </router-link>

        <router-link to="/staff/appointments" class="item">
          <i class="icon">📅</i>
          <span v-if="!collapsed">My Appointments</span>
        </router-link>
      </nav>

      <div class="logout-section">
        <div v-if="!collapsed" class="user-info">
          <span class="user-name">{{ authStore.user?.name || authStore.user?.email }}</span>
          <span class="user-role">Service Staff</span>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <i class="icon">🚪</i>
          <span v-if="!collapsed">Logout</span>
        </button>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <h3 class="page-title">{{ pageTitle }}</h3>
      </header>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const collapsed = ref(false)

const titleMap = {
  '/staff/dashboard': 'Dashboard',
  '/staff/schedule': 'My Schedule',
  '/staff/appointments': 'My Appointments',
}
const pageTitle = computed(() => titleMap[route.path] || 'Staff Portal')

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout { display: flex; }
.sidebar { width: 240px; height: 100vh; background: #1e3a5f; color: white; display: flex; flex-direction: column; position: sticky; top: 0; transition: 0.3s; overflow-y: auto; }
.sidebar.collapsed { width: 72px; }
.logo { height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-weight: 700; font-size: 15px; border-bottom: 1px solid #2d4a6f; flex-shrink: 0; }
.toggle { background: none; border: none; color: white; cursor: pointer; font-size: 18px; }
.menu { padding: 10px 8px; flex: 1; }
.item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 6px; text-decoration: none; color: #93c5fd; font-size: 13px; font-weight: 500; transition: all 0.15s; }
.item:hover, .item.router-link-active { background: #2d4a6f; color: white; }
.icon { font-size: 16px; flex-shrink: 0; width: 22px; text-align: center; }
.logout-section { padding: 12px 8px; border-top: 1px solid #2d4a6f; }
.user-info { padding: 8px 10px 6px; }
.user-name { display: block; font-size: 13px; font-weight: 600; color: #dbeafe; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { display: block; font-size: 11px; color: #93c5fd; margin-top: 2px; }
.logout-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border-radius: 6px; background: none; border: none; color: #93c5fd; cursor: pointer; font-size: 13px; transition: all 0.15s; }
.logout-btn:hover { background: #2d4a6f; color: #f87171; }
.main { flex: 1; background: #eff6ff; min-height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
.topbar { height: 60px; background: white; display: flex; align-items: center; padding: 0 24px; border-bottom: 1px solid #e2e8f0; flex-shrink: 0; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; color: #1e293b; }
.content { padding: 20px; flex: 1; }
</style>
