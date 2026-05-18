<script setup lang="ts">
// StatCard — a metric summary card shown on the dashboard.
// Displays an icon, a numeric value, and an optional trend indicator.
defineProps<{
  title: string              // metric label (e.g. 'Total Appointments')
  value: string | number     // the main numeric or text value to display prominently
  subtitle?: string          // secondary descriptor shown below the value
  icon: string               // SVG path string for the icon
  iconBg?: string            // Tailwind background class for the icon container
  trend?: { value: string; up: boolean }  // optional trend arrow + percentage text
}>()
</script>

<template>
  <div class="card flex items-center gap-4">
    <div :class="['w-14 h-14 rounded-xl flex items-center justify-center shrink-0', iconBg || 'bg-indigo-100']">
      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"
           :class="iconBg ? 'text-white' : 'text-indigo-600'">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="icon"/>
      </svg>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm text-gray-500 truncate">{{ title }}</p>
      <p class="text-2xl font-bold text-gray-800 leading-tight">{{ value }}</p>
      <div v-if="trend" class="flex items-center gap-1 mt-0.5">
        <svg class="w-3.5 h-3.5" :class="trend.up ? 'text-green-500' : 'text-red-500'"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                :d="trend.up ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'"/>
        </svg>
        <span class="text-xs font-medium" :class="trend.up ? 'text-green-600' : 'text-red-600'">
          {{ trend.value }}
        </span>
        <span v-if="subtitle" class="text-xs text-gray-400">{{ subtitle }}</span>
      </div>
      <p v-else-if="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
    </div>
  </div>
</template>
