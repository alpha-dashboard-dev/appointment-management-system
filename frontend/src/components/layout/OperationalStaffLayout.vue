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
  '/operations/pending': 'Pending Appointments',
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
.layout {
  display: flex;
}

/* Sidebar */
.sidebar {
  width: 260px;
  height: 100vh;
  background: #0f172a;
  color: white;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  transition: 0.3s;
  overflow-y: auto;
}

.sidebar.collapsed {
  width: 72px;
}

/* Logo */
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-weight: 700;
  font-size: 15px;
  border-bottom: 1px solid #1e293b;
  flex-shrink: 0;
}

.toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
}

/* Menu */
.menu {
  padding: 10px 8px;
  flex: 1;
  overflow-y: auto;
}

.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 6px;
  text-decoration: none;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}

.item:hover,
.item.router-link-active {
  background: #1e293b;
  color: white;
}

/* Icons */
.icon {
  font-size: 16px;
  flex-shrink: 0;
  width: 22px;
  text-align: center;
}

/* Group */
.group {
  margin-bottom: 2px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}

.group-title:hover {
  background: #1e293b;
  color: white;
}

.arrow {
  font-size: 16px;
  margin-left: auto;
  transition: transform 0.2s;
}

.arrow.rotated {
  transform: rotate(90deg);
}

/* Submenu */
.submenu {
  padding-left: 32px;
}

.sub-item {
  display: block;
  padding: 7px 10px;
  border-radius: 5px;
  text-decoration: none;
  color: #64748b;
  font-size: 12px;
  transition: all 0.15s;
}

.sub-item:hover,
.sub-item.router-link-active {
  color: white;
  background: #1e293b;
}

/* Logout Section */
.logout-section {
  padding: 12px 8px;
  border-top: 1px solid #1e293b;
}

.user-info {
  padding: 8px 10px 6px;
}

.user-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  display: block;
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border-radius: 6px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.logout-btn:hover {
  background: #1e293b;
  color: #f87171;
}

/* Main Content */
.main {
  flex: 1;
  background: #f1f5f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Topbar */
.topbar {
  height: 60px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

/* Page Content */
.content {
  padding: 20px;
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
    width: 260px;
  }

  .main {
    width: 100%;
  }

  .topbar {
    padding: 0 16px;
  }

  .content {
    padding: 16px;
  }
}
</style>