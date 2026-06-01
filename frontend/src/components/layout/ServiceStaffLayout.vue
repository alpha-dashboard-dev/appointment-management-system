<template>
  <div class="layout">
    <aside :class="['sidebar', { collapsed }]">
      <div class="logo">
        <span v-if="!collapsed">Service Staff Portal</span>
        <button class="toggle" @click="collapsed = !collapsed">☰</button>
      </div>

      <nav class="menu">
        <router-link to="/staff/dashboard" class="item">
          <i class="bi bi-speedometer2 icon"></i>
          <span v-if="!collapsed">Dashboard</span>
        </router-link>

        <router-link to="/staff/schedule" class="item">
          <i class="bi bi-calendar3 icon"></i>
          <span v-if="!collapsed">My Schedule</span>
        </router-link>

        <router-link to="/staff/appointments" class="item">
          <i class="bi bi-calendar-check icon"></i>
          <span v-if="!collapsed">My Appointments</span>
        </router-link>
      </nav>

    </aside>

    <div class="main">
      <Topbar />
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
import Topbar from "./Topbar.vue";

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const collapsed = ref(false)

const titleMap = {
  '/staff/dashboard': 'Dashboard',
  '/staff/schedule': 'My Schedule',
  '/staff/appointments': 'My Appointments',
}
// const pageTitle = computed(() => titleMap[route.path] || 'Staff Portal')

</script>

<style scoped>
.layout { display: flex; }
.sidebar { width: 260px; height: 100vh; background: #1e293b; color: white; display: flex; flex-direction: column; position: sticky; top: 0; transition: 0.3s; overflow-y: auto; }
.sidebar.collapsed { width: 72px; }
.logo { height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-weight: 700; font-size: 15px; border-bottom: 1px solid #334155; flex-shrink: 0; }
.toggle { background: none; border: none; color: white; cursor: pointer; font-size: 18px; }
.menu { padding: 10px 8px; flex: 1; }
.item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 6px; text-decoration: none; color: #94a3b8; font-size: 13px; font-weight: 500; transition: all 0.15s; }
.item:hover, .item.router-link-active { background: #334155; color: white; }
.icon { font-size: 16px; flex-shrink: 0; width: 22px; text-align: center; }
.logout-section { padding: 12px 8px; border-top: 1px solid #334155; }
.user-info { padding: 8px 10px 6px; }
.user-name { display: block; font-size: 13px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { display: block; font-size: 11px; color: #94a3b8; margin-top: 2px; }
.logout-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border-radius: 6px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 13px; transition: all 0.15s; }
.logout-btn:hover { background: #334155; color: #f87171; }
.main { flex: 1; background: var(--color-bg); min-height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
.topbar { height: 60px; background: var(--color-nav, white); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; border-bottom: 1px solid var(--color-border); flex-shrink: 0; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; color: var(--color-text); }
.topbar-right { display: flex; flex-direction: column; align-items: flex-end; }
.tb-name { font-size: 14px; font-weight: 600; color: var(--color-text); }
.tb-role { font-size: 12px; color: var(--color-muted); text-transform: capitalize; }
.content { padding: 20px; flex: 1; background: var(--color-bg); }
</style>
