<template>
  <aside :class="['sidebar', { collapsed }]">

    <!-- Logo -->
    <div class="logo">
      <span v-if="!collapsed">AMS PORTAL</span>
      <button class="toggle" @click="collapsed = !collapsed">☰</button>
    </div>

    <!-- Menu -->
    <nav class="menu">

      <!-- DASHBOARD -->
      <router-link to="/dashboard" class="item">
        <i class="icon">📊</i>
        <span v-if="!collapsed">Dashboard</span>
      </router-link>

      <!-- ORGANIZATIONS -->
      <div class="group">
        <div
            class="group-title"
            @click="handleGroupClick('org', '/organizations')"
        >
          <i class="icon">🏢</i>

          <span v-if="!collapsed">Organizations</span>

          <i
              v-if="!collapsed"
              class="arrow"
              :class="{ rotated: open.org }"
          >
            ›
          </i>
        </div>

        <div v-show="open.org && !collapsed" class="submenu">
          <router-link to="/organizations" class="sub-item">
            All Organizations
          </router-link>

          <router-link to="/organizations/create" class="sub-item">
            New Organization
          </router-link>
        </div>
      </div>

      <!-- BUSINESSES -->
      <div class="group">
        <div
            class="group-title"
            @click="handleGroupClick('biz', '/businesses')"
        >
          <i class="icon">🏪</i>

          <span v-if="!collapsed">Businesses</span>

          <i
              v-if="!collapsed"
              class="arrow"
              :class="{ rotated: open.biz }"
          >
            ›
          </i>
        </div>

        <div v-show="open.biz && !collapsed" class="submenu">
          <router-link to="/businesses" class="sub-item">
            All Businesses
          </router-link>

          <router-link to="/businesses/create" class="sub-item">
            New Business
          </router-link>
        </div>
      </div>

      <!-- CLIENTS -->
      <div class="group">
        <div
            class="group-title"
            @click="handleGroupClick('client', '/clients')"
        >
          <i class="icon">👥</i>

          <span v-if="!collapsed">Clients</span>

          <i
              v-if="!collapsed"
              class="arrow"
              :class="{ rotated: open.client }"
          >
            ›
          </i>
        </div>

        <div v-show="open.client && !collapsed" class="submenu">
          <router-link to="/clients" class="sub-item">
            All Clients
          </router-link>

          <router-link to="/clients/create" class="sub-item">
            New Client
          </router-link>
        </div>
      </div>

      <!-- APPOINTMENTS -->
      <div class="group">
        <div
            class="group-title"
            @click="handleGroupClick('app', '/appointments')"
        >
          <i class="icon">📅</i>

          <span v-if="!collapsed">Appointments</span>

          <i
              v-if="!collapsed"
              class="arrow"
              :class="{ rotated: open.app }"
          >
            ›
          </i>
        </div>

        <div v-show="open.app && !collapsed" class="submenu">
          <router-link to="/appointments" class="sub-item">
            All Appointments
          </router-link>

          <router-link to="/appointments/create" class="sub-item">
            New Appointment
          </router-link>
        </div>
      </div>

      <!-- SERVICES -->
      <div class="group">
        <div
            class="group-title"
            @click="handleGroupClick('svc', '/services')"
        >
          <i class="icon">⚕️</i>

          <span v-if="!collapsed">Services</span>

          <i
              v-if="!collapsed"
              class="arrow"
              :class="{ rotated: open.svc }"
          >
            ›
          </i>
        </div>

        <div v-show="open.svc && !collapsed" class="submenu">
          <router-link to="/services" class="sub-item">
            All Services
          </router-link>

          <router-link to="/services/create" class="sub-item">
            New Service
          </router-link>
        </div>
      </div>

      <!-- LOCATIONS -->
      <div class="group">
        <div class="group-title" @click="handleGroupClick('loc', '/locations')">
          <i class="icon">📍</i>

          <span v-if="!collapsed">Locations</span>

          <i
              v-if="!collapsed"
              class="arrow"
              :class="{ rotated: open.loc }"
          >
            ›
          </i>
        </div>

        <div v-show="open.loc && !collapsed" class="submenu">
          <router-link to="/locations" class="sub-item">
            All Locations
          </router-link>

          <router-link to="/locations/create" class="sub-item">
            New Location
          </router-link>

          <router-link to="/location-services" class="sub-item">
            Location Services
          </router-link>
        </div>
      </div>

      <!-- SCHEDULES -->
      <router-link to="/schedules" class="item">
        <i class="icon">🗓️</i>
        <span v-if="!collapsed">Schedules</span>
      </router-link>

      <!-- CHARGES -->
      <router-link to="/charges" class="item">
        <i class="icon">💰</i>
        <span v-if="!collapsed">Charges</span>
      </router-link>

      <!-- INVOICES -->
      <router-link to="/invoices" class="item">
        <i class="icon">🧾</i>
        <span v-if="!collapsed">Invoices</span>
      </router-link>

      <!-- USERS -->
      <div class="group">
        <div
            class="group-title"
            @click="handleGroupClick('usr', '/users')"
        >
          <i class="icon">👤</i>

          <span v-if="!collapsed">Users</span>

          <i
              v-if="!collapsed"
              class="arrow"
              :class="{ rotated: open.usr }"
          >
            ›
          </i>
        </div>

        <div v-show="open.usr && !collapsed" class="submenu">
          <router-link to="/users" class="sub-item">
            All Users
          </router-link>

          <router-link to="/users/create" class="sub-item">
            New User
          </router-link>
        </div>
      </div>

    </nav>

    <!-- LOGOUT -->
    <div class="logout-section">
      <button class="logout-btn" @click="handleLogout">
        <i class="icon">🚪</i>
        <span v-if="!collapsed">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const collapsed = ref(false)

const open = reactive({
  org: false,
  biz: false,
  app: false,
  client: false,
  svc: false,
  loc: false,
  usr: false,
})

function toggle(key) {
  open[key] = !open[key]
}

function handleGroupClick(key, route) {
  if (collapsed.value) {
    router.push(route)
  } else {
    toggle(key)
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: #1e293b;
  color: white;
  transition: 0.3s;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  overflow-y: auto;
}

.sidebar.collapsed {
  width: 72px;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-weight: 700;
  font-size: 16px;
  border-bottom: 1px solid #334155;
  flex-shrink: 0;
}

.toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
}

.menu {
  padding: 10px 8px;
  overflow-y: auto;
  flex: 1;
}

.item,
.group-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  cursor: pointer;
  border-radius: 6px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s, color 0.2s;
}

.item:hover,
.group-title:hover {
  background: #334155;
  color: white;
}

/* Submenu */
.submenu {
  margin-left: 25px;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
}

.sub-item {
  padding: 8px;
  font-size: 13px;
  color: #94a3b8;
  text-decoration: none;
}

.sub-item:hover {
  color: white;
}

/* Icons */
.icon {
  width: 20px;
  text-align: center;
}

.arrow {
  margin-left: auto;
  transition: transform 0.2s;
  display: inline-block;
}

.arrow.rotated {
  transform: rotate(90deg);
}

.item.router-link-active {
  background: #334155;
  color: white;
}

.sub-item.router-link-active {
  color: white;
  font-weight: 600;
}

.logout-section {
  padding: 10px 8px;
  border-top: 1px solid #334155;
  flex-shrink: 0;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 9px 10px;
  border-radius: 6px;
  font-size: 14px;
  transition: background 0.2s, color 0.2s;
}

.logout-btn:hover {
  background: #ef4444;
  color: white;
}
</style>