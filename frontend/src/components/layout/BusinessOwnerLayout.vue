<template>
  <div class="layout">
    <aside :class="['sidebar', { collapsed }]">
      <div class="logo">
        <span v-if="!collapsed">Business Portal</span>
        <button class="toggle" @click="collapsed = !collapsed">☰</button>
      </div>

      <nav class="menu">
        <router-link to="/business/dashboard" class="item">
          <i class="bi bi-speedometer2 icon"></i>
          <span v-if="!collapsed">Dashboard</span>
        </router-link>

        <!-- APPOINTMENTS -->
        <div class="group">
          <div class="group-title" @click="toggle('app')">
            <i class="bi bi-calendar-check icon"></i>
            <span v-if="!collapsed">Appointments</span>
            <i v-if="!collapsed" class="arrow" :class="{ rotated: open.app }">›</i>
          </div>
          <div v-show="open.app && !collapsed" class="submenu">
            <router-link to="/business/appointments" class="sub-item">All Requests</router-link>
            <router-link to="/business/appointments/create" class="sub-item">New Request</router-link>
          </div>
        </div>

        <!-- SERVICES -->
        <div class="group">
          <div class="group-title" @click="toggle('svc')">
            <i class="bi bi-clipboard-pulse icon"></i>
            <span v-if="!collapsed">Services</span>
            <i v-if="!collapsed" class="arrow" :class="{ rotated: open.svc }">›</i>
          </div>
          <div v-show="open.svc && !collapsed" class="submenu">
            <router-link to="/business/services" class="sub-item">All Services</router-link>
            <router-link to="/business/services/create" class="sub-item">New Service</router-link>
          </div>
        </div>

        <!-- LOCATIONS -->
        <div class="group">
          <div class="group-title" @click="toggle('loc')">
            <i class="bi bi-geo-alt icon"></i>
            <span v-if="!collapsed">Locations</span>
            <i v-if="!collapsed" class="arrow" :class="{ rotated: open.loc }">›</i>
          </div>
          <div v-show="open.loc && !collapsed" class="submenu">
            <router-link to="/business/locations" class="sub-item">All Locations</router-link>
            <router-link to="/business/locations/create" class="sub-item">New Location</router-link>
            <router-link to="/business/location-services" class="sub-item">Location Services</router-link>
          </div>
        </div>

        <!-- STAFF (USERS) -->
        <div class="group">
          <div class="group-title" @click="toggle('staff')">
            <i class="bi bi-person icon"></i>
            <span v-if="!collapsed">Staff</span>
            <i v-if="!collapsed" class="arrow" :class="{ rotated: open.staff }">›</i>
          </div>
          <div v-show="open.staff && !collapsed" class="submenu">
            <router-link to="/business/staff" class="sub-item">All Staff</router-link>
            <router-link to="/business/staff/create" class="sub-item">Add Staff</router-link>
          </div>
        </div>

        <!-- CLIENTS -->
        <div class="group">
          <div class="group-title" @click="toggle('client')">
            <i class="bi bi-people icon"></i>
            <span v-if="!collapsed">Clients</span>
            <i v-if="!collapsed" class="arrow" :class="{ rotated: open.client }">›</i>
          </div>
          <div v-show="open.client && !collapsed" class="submenu">
            <router-link to="/business/clients" class="sub-item">All Clients</router-link>
            <router-link to="/business/clients/create" class="sub-item">Add Client</router-link>
          </div>
        </div>

        <!-- SCHEDULES -->
        <router-link to="/business/schedules" class="item">
          <i class="bi bi-calendar3 icon"></i>
          <span v-if="!collapsed">Schedules</span>
        </router-link>

        <!-- CHARGES -->
        <router-link to="/business/charges" class="item">
          <i class="bi bi-cash-coin icon"></i>
          <span v-if="!collapsed">Charges</span>
        </router-link>

        <!-- INVOICES -->
        <router-link to="/business/invoices" class="item">
          <i class="bi bi-receipt icon"></i>
          <span v-if="!collapsed">Invoices</span>
        </router-link>
      </nav>

<!--      <div class="logout-section">-->
<!--        <div v-if="!collapsed" class="user-info">-->
<!--          <span class="user-name">{{ authStore.user?.name || authStore.user?.email }}</span>-->
<!--          <span class="user-role">Business Owner</span>-->
<!--        </div>-->
<!--        <button class="logout-btn" @click="handleLogout">-->
<!--          <i class="bi bi-box-arrow-right icon"></i>-->
<!--          <span v-if="!collapsed">Logout</span>-->
<!--        </button>-->
<!--      </div>-->
    </aside>

    <div class="main">
      <Topbar />
<!--      <header class="topbar">-->
<!--        <h3 class="page-title">{{ pageTitle }}</h3>-->
<!--      </header>-->
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
import Topbar from "./Topbar.vue"

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const collapsed = ref(false)

const open = reactive({ app: false, svc: false, loc: false, staff: false, client: false })
function toggle(key) { open[key] = !open[key] }

const titleMap = {
  '/business/dashboard': 'Dashboard',
  '/business/appointments': 'Appointments',
  '/business/appointments/create': 'New Appointment',
  '/business/services': 'Services',
  '/business/services/create': 'New Service',
  '/business/locations': 'Locations',
  '/business/locations/create': 'New Location',
  '/business/location-services': 'Location Services',
  '/business/staff': 'Staff',
  '/business/staff/create': 'Add Staff',
  '/business/clients': 'Clients',
  '/business/clients/create': 'Add Client',
  '/business/schedules': 'Schedules',
  '/business/charges': 'Charges',
  '/business/invoices': 'Invoices',
}
const pageTitle = computed(() => titleMap[route.path] || 'Business Portal')

// async function handleLogout() {
//   await authStore.logout()
//   router.push('/login')
// }
</script>

<style scoped>
.layout { display: flex; }
.sidebar { width: 260px; height: 100vh; background: #0f172a; color: white; display: flex; flex-direction: column; position: sticky; top: 0; transition: 0.3s; overflow-y: auto; }
.sidebar.collapsed { width: 72px; }
.logo { height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-weight: 700; font-size: 15px; border-bottom: 1px solid #1e293b; flex-shrink: 0; }
.toggle { background: none; border: none; color: white; cursor: pointer; font-size: 18px; }
.menu { padding: 10px 8px; flex: 1; overflow-y: auto; }
.item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 6px; text-decoration: none; color: #94a3b8; font-size: 13px; font-weight: 500; transition: all 0.15s; }
.item:hover, .item.router-link-active { background: #1e293b; color: white; }
.icon { font-size: 16px; flex-shrink: 0; width: 22px; text-align: center; }
.group { margin-bottom: 2px; }
.group-title { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 6px; cursor: pointer; color: #94a3b8; font-size: 13px; font-weight: 500; transition: all 0.15s; }
.group-title:hover { background: #1e293b; color: white; }
.arrow { font-size: 16px; margin-left: auto; transition: transform 0.2s; }
.arrow.rotated { transform: rotate(90deg); }
.submenu { padding-left: 32px; }
.sub-item { display: block; padding: 7px 10px; border-radius: 5px; text-decoration: none; color: #64748b; font-size: 12px; transition: all 0.15s; }
.sub-item:hover, .sub-item.router-link-active { color: white; background: #1e293b; }
.logout-section { padding: 12px 8px; border-top: 1px solid #1e293b; }
.user-info { padding: 8px 10px 6px; }
.user-name { display: block; font-size: 13px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { display: block; font-size: 11px; color: #64748b; margin-top: 2px; }
.logout-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border-radius: 6px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 13px; transition: all 0.15s; }
.logout-btn:hover { background: #1e293b; color: #f87171; }
.main { flex: 1; background: var(--color-bg); min-height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
.topbar { height: 60px; background: var(--color-nav, white); display: flex; align-items: center; padding: 0 24px; border-bottom: 1px solid var(--color-border); flex-shrink: 0; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; color: var(--color-text); }
.content { padding: 20px; flex: 1; background: var(--color-bg); }
</style>
