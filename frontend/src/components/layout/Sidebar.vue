<template>
  <aside :class="['sidebar', { collapsed }]">

    <!-- Logo -->
    <div class="logo">
      <span v-if="!collapsed">AMS PORTAL</span>
      <span v-else>AA</span>

      <button class="toggle" @click="collapsed = !collapsed">
        ☰
      </button>
    </div>

    <!-- Menu -->
    <nav class="menu">

      <!-- DASHBOARD -->
      <router-link to="/dashboard" class="item">
        <i class="icon">📊</i>
        <span v-if="!collapsed">Dashboard</span>
      </router-link>

      <!-- ORGANIZATION -->
      <div class="group">
        <div class="group-title" @click="toggle('org')">
          <i class="icon">🏢</i>
          <span v-if="!collapsed">Organization</span>
          <i v-if="!collapsed" class="arrow">⌄</i>
        </div>

        <div v-show="open.org" class="submenu">
          <router-link to="/organizations" class="sub-item">
            All Organizations
          </router-link>
          <router-link to="/organizations/create" class="sub-item">
            Create Organization
          </router-link>
        </div>
      </div>

      <!-- BUSINESS -->
      <div class="group">
        <div class="group-title" @click="toggle('biz')">
          <i class="icon">🏪</i>
          <span v-if="!collapsed">Business</span>
          <i v-if="!collapsed" class="arrow">⌄</i>
        </div>

        <div v-show="open.biz" class="submenu">
          <router-link to="/businesses" class="sub-item">Businesses</router-link>
          <router-link to="/business/services" class="sub-item">Services</router-link>
          <router-link to="/business/locations" class="sub-item">Locations</router-link>
          <router-link to="/business/staff" class="sub-item">Staff</router-link>
        </div>
      </div>

      <!-- APPOINTMENTS -->
      <div class="group">
        <div class="group-title" @click="toggle('app')">
          <i class="icon">📅</i>
          <span v-if="!collapsed">Appointments</span>
          <i v-if="!collapsed" class="arrow">⌄</i>
        </div>

        <div v-show="open.app" class="submenu">
          <router-link to="/appointments" class="sub-item">All Appointments</router-link>
          <router-link to="/appointments/pending" class="sub-item">Pending</router-link>
          <router-link to="/appointments/calendar" class="sub-item">Calendar</router-link>
        </div>
      </div>

      <!-- USERS -->
      <router-link to="/users" class="item">
        <i class="icon">👤</i>
        <span v-if="!collapsed">Users</span>
      </router-link>

    </nav>
  </aside>
</template>

<script setup>
import { reactive, ref } from 'vue'

const collapsed = ref(false)

const open = reactive({
  org: true,
  biz: false,
  app: false,
})

function toggle(key) {
  open[key] = !open[key]
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
}

.sidebar.collapsed {
  width: 80px;
}

/* Logo */
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  font-weight: bold;
  border-bottom: 1px solid #334155;
}

.toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

/* Menu */
.menu {
  padding: 10px;
  overflow-y: auto;
}

.item,
.group-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  border-radius: 6px;
  color: #cbd5e1;
  text-decoration: none;
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
}
</style>