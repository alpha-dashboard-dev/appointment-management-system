<template>
  <header class="topbar">
    <div class="topbar-left">
      <h3 class="page-title">{{ pageTitle }}</h3>
    </div>
    <div class="topbar-right">
      <span class="user-name">{{ authStore.user?.name || authStore.user?.email || 'Admin' }}</span>
      <span class="user-role">{{ authStore.user?.user_type || 'admin' }}</span>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  const map = {
    '/dashboard': 'Dashboard',
    '/organizations': 'Organizations',
    '/organizations/create': 'New Organization',
    '/businesses': 'Businesses',
    '/businesses/create': 'New Business',
    '/clients': 'Clients',
    '/clients/create': 'New Client',
    '/appointments': 'Appointments',
    '/appointments/create': 'New Appointment',
    '/services': 'Services',
    '/services/create': 'New Service',
    '/locations': 'Locations',
    '/locations/create': 'New Location',
    '/schedules': 'Schedules',
    '/charges': 'Charges',
    '/invoices': 'Invoices',
    '/users': 'Users',
    '/users/create': 'New User',
  }
  return map[route.path] || 'AMS Portal'
})
</script>

<style scoped>
.topbar {
  height: 60px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.topbar-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.user-role {
  font-size: 12px;
  color: #64748b;
  text-transform: capitalize;
}
</style>
