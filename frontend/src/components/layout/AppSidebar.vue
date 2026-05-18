<script setup lang="ts">
// AppSidebar — collapsible navigation sidebar.
// Renders grouped nav items from the `nav` config array and highlights the active route.
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
// Controls whether the sidebar is shown in narrow (icon-only) or full (icon + label) mode
const collapsed = ref(false)

// Each nav item has a display label, a target route, and an SVG path for its icon.
interface NavItem {
  label: string
  to?: string
  icon: string
  children?: NavItem[]
}

// Nav items are grouped under labelled sections for visual organisation.
interface NavGroup {
  group: string
  items: NavItem[]
}

// Navigation config — add/remove items here to change what appears in the sidebar.
const nav: NavGroup[] = [
  {
    group: 'Main',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    ],
  },
  {
    group: 'Management',
    items: [
      { label: 'Organizations', to: '/organizations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { label: 'Businesses', to: '/businesses', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Appointments', to: '/appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { label: 'Schedules', to: '/schedules', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },
  {
    group: 'People',
    items: [
      { label: 'Users', to: '/users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      { label: 'Clients', to: '/clients', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ],
  },
  {
    group: 'Catalog',
    items: [
      { label: 'Services', to: '/services', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { label: 'Locations', to: '/locations', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
      { label: 'Charges', to: '/charges', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },
  {
    group: 'Finance',
    items: [
      { label: 'Invoices', to: '/invoices', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'User Abilities', to: '/user-abilities', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    ],
  },
]

// Returns true when the given route path matches the current page,
// used to apply the active highlight style to nav links.
function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <aside
    :class="['flex flex-col h-screen sticky top-0 transition-all duration-300 overflow-hidden shrink-0',
             collapsed ? 'w-16' : 'w-64']"
    style="background-color: #1a1f3e;"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-5 py-5 border-b border-white/10">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
           style="background-color: #2e37a4;">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
      <span v-if="!collapsed" class="text-white font-semibold text-base truncate">AMS Admin</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto py-3 px-2">
      <template v-for="group in nav" :key="group.group">
        <!-- Group label -->
        <p v-if="!collapsed"
           class="px-3 pt-4 pb-1.5 text-xs font-semibold uppercase tracking-wider"
           style="color: #6b7dba;">
          {{ group.group }}
        </p>
        <div v-else class="my-1 border-t border-white/10" />

        <!-- Items -->
        <router-link
          v-for="item in group.items"
          :key="item.label"
          :to="item.to || '#'"
          :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5',
                   isActive(item.to || '')
                     ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5']"
          :style="isActive(item.to || '') ? 'background-color: #2e37a4;' : ''"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="item.icon"/>
          </svg>
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </router-link>
      </template>
    </nav>

    <!-- Collapse toggle -->
    <button
      @click="collapsed = !collapsed"
      class="flex items-center justify-center gap-2 px-4 py-4 border-t border-white/10 text-gray-400 hover:text-white transition-colors text-sm"
    >
      <svg class="w-4 h-4 transition-transform" :class="collapsed ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
      </svg>
      <span v-if="!collapsed" class="text-xs">Collapse</span>
    </button>
  </aside>
</template>
