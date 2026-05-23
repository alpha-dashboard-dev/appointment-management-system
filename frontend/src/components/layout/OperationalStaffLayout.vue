<template>
  <div class="layout">
    <aside :class="['sidebar', { collapsed }]">
      <div class="logo">
        <span v-if="!collapsed">Operations</span>
        <button class="toggle" @click="collapsed = !collapsed">☰</button>
      </div>

      <nav class="menu">
        <router-link to="/operations/dashboard" class="item">
          <i class="icon">📊</i>
          <span v-if="!collapsed">Dashboard</span>
        </router-link>

        <!-- APPOINTMENTS -->
        <div class="group">
          <div class="group-title" @click="toggle('app')">
            <i class="icon">📅</i>
            <span v-if="!collapsed">Appointments</span>
            <i v-if="!collapsed" class="arrow" :class="{ rotated: open.app }">›</i>
          </div>
          <div v-show="open.app && !collapsed" class="submenu">
            <router-link to="/operations/appointments" class="sub-item">All Requests</router-link>
            <router-link to="/operations/appointments/pending" class="sub-item">Pending Requests</router-link>
          </div>
        </div>

        <!-- SCHEDULES / AVAILABILITY -->
        <div class="group">
          <div class="group-title" @click="toggle('sched')">
            <i class="icon">🗓️</i>
            <span v-if="!collapsed">Schedules</span>
            <i v-if="!collapsed" class="arrow" :class="{ rotated: open.sched }">›</i>
          </div>
          <div v-show="open.sched && !collapsed" class="submenu">
            <router-link to="/operations/schedules" class="sub-item">Staff Schedules</router-link>
            <router-link to="/operations/availability" class="sub-item">Check Availability</router-link>
          </div>
        </div>

        <!-- CLIENTS -->
        <div class="group">
          <div class="group-title" @click="toggle('client')">
            <i class="icon">👥</i>
            <span v-if="!collapsed">Clients</span>
            <i v-if="!collapsed" class="arrow" :class="{ rotated: open.client }">›</i>
          </div>
          <div v-show="open.client && !collapsed" class="submenu">
            <router-link to="/operations/clients" class="sub-item">All Clients</router-link>
          </div>
        </div>
      </nav>

      <div class="logout-section">
        <div v-if="!collapsed" class="user-info">
          <span class="user-name">{{ authStore.user?.name || authStore.user?.email }}</span>
          <span class="user-role">Operational Staff</span>
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
        <div class="topbar-right">
          <span class="tb-name">{{ authStore.user?.name || authStore.user?.email }}</span>
          <span class="tb-role">Operational Staff</span>
        </div>
      </header>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const collapsed = ref(false)

const open = reactive({ app: false, sched: false, client: false })
function toggle(key) { open[key] = !open[key] }

const titleMap = {
  '/operations/dashboard': 'Dashboard',
  '/operations/appointments': 'Appointments',
  '/operations/appointments/pending': 'Pending Appointments',
  '/operations/schedules': 'Staff Schedules',
  '/operations/availability': 'Check Staff Availability',
  '/operations/clients': 'Clients',
}
const pageTitle = computed(() => titleMap[route.path] || 'Operations')

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout { display: flex; }
.sidebar { width: 260px; height: 100vh; background: #1e293b; color: white; display: flex; flex-direction: column; position: sticky; top: 0; transition: 0.3s; overflow-y: auto; }
.sidebar.collapsed { width: 72px; }
.logo { height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-weight: 700; font-size: 15px; border-bottom: 1px solid #334155; flex-shrink: 0; }
.toggle { background: none; border: none; color: white; cursor: pointer; font-size: 18px; }
.menu { padding: 10px 8px; flex: 1; overflow-y: auto; }
.item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 6px; text-decoration: none; color: #94a3b8; font-size: 13px; font-weight: 500; transition: all 0.15s; }
.item:hover, .item.router-link-active { background: #334155; color: white; }
.icon { font-size: 16px; flex-shrink: 0; width: 22px; text-align: center; }
.group { margin-bottom: 2px; }
.group-title { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 6px; cursor: pointer; color: #94a3b8; font-size: 13px; font-weight: 500; transition: all 0.15s; }
.group-title:hover { background: #334155; color: white; }
.arrow { font-size: 16px; margin-left: auto; transition: transform 0.2s; }
.arrow.rotated { transform: rotate(90deg); }
.submenu { padding-left: 32px; }
.sub-item { display: block; padding: 7px 10px; border-radius: 5px; text-decoration: none; color: #94a3b8; font-size: 12px; transition: all 0.15s; }
.sub-item:hover, .sub-item.router-link-active { color: white; background: #334155; }
.logout-section { padding: 12px 8px; border-top: 1px solid #334155; }
.user-info { padding: 8px 10px 6px; }
.user-name { display: block; font-size: 13px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { display: block; font-size: 11px; color: #94a3b8; margin-top: 2px; }
.logout-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border-radius: 6px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 13px; transition: all 0.15s; }
.logout-btn:hover { background: #334155; color: #f87171; }
.main { flex: 1; background: #f1f5f9; min-height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
.topbar { height: 60px; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; border-bottom: 1px solid #e2e8f0; flex-shrink: 0; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; color: #1e293b; }
.topbar-right { display: flex; flex-direction: column; align-items: flex-end; }
.tb-name { font-size: 14px; font-weight: 600; color: #1e293b; }
.tb-role { font-size: 12px; color: #64748b; text-transform: capitalize; }
.content { padding: 20px; flex: 1; }
</style>
