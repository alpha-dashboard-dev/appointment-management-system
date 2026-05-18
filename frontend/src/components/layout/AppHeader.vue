<script setup lang="ts">
// AppHeader — sticky top bar shown on every authenticated page.
// Displays the current page title, a breadcrumb, a notification bell, and the user menu.
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route  = useRoute()
const router = useRouter()
const { user, logout } = useAuth()

// Derive a human-readable page title from the current route path
const title = computed(() => {
  const map: Record<string, string> = {
    '/dashboard':     'Dashboard',
    '/organizations': 'Organizations',
    '/businesses':    'Businesses',
    '/users':         'Users',
    '/clients':       'Clients',
    '/services':      'Services',
    '/locations':     'Locations',
    '/schedules':     'Schedules',
    '/appointments':  'Appointments',
    '/charges':       'Charges',
    '/invoices':      'Invoices',
    '/user-abilities':'User Abilities',
  }
  return map[route.path] || 'Dashboard'
})

// Log the user out and redirect to the login page
async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-6 h-16 shrink-0">
    <!-- Page title -->
    <div>
      <h1 class="text-lg font-semibold text-gray-800">{{ title }}</h1>
      <p class="text-xs text-gray-400">
        <span class="hover:text-gray-600 cursor-pointer" @click="router.push('/dashboard')">Home</span>
        <span class="mx-1">/</span>
        <span class="text-gray-600">{{ title }}</span>
      </p>
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-3">
      <!-- Notification bell -->
      <button class="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
      </button>

      <!-- User menu -->
      <div class="flex items-center gap-2 pl-3 border-l border-gray-200">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
             style="background-color: #2e37a4;">
          {{ user?.user_type?.charAt(0).toUpperCase() || 'A' }}
        </div>
        <div class="hidden sm:block">
          <p class="text-sm font-medium text-gray-700 leading-tight">{{ user?.user_type?.replace(/_/g, ' ') || 'Admin' }}</p>
          <p class="text-xs text-gray-400 leading-tight">{{ user?.user_code || '' }}</p>
        </div>
        <button
          @click="handleLogout"
          title="Logout"
          class="ml-2 p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
