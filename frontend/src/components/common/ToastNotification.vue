<script setup lang="ts">
// ToastNotification — renders the global toast queue managed by useToast.
// This component is mounted once inside AppLayout and listens to the shared
// `toasts` ref, so any component that calls useToast() can trigger a notification here.
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()

// SVG icon paths keyed by toast type
const icons: Record<string, string> = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error:   'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  info:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

const colors: Record<string, string> = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error:   'bg-red-50 border-red-400 text-red-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  info:    'bg-blue-50 border-blue-400 text-blue-800',
}

const iconColors: Record<string, string> = {
  success: 'text-green-500',
  error:   'text-red-500',
  warning: 'text-yellow-500',
  info:    'text-blue-500',
}
</script>

<template>
  <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 min-w-72 max-w-sm">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['flex items-start gap-3 p-4 rounded-lg border shadow-lg', colors[toast.type]]"
      >
        <svg class="w-5 h-5 mt-0.5 shrink-0" :class="iconColors[toast.type]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons[toast.type]"/>
        </svg>
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button @click="remove(toast.id)" class="opacity-60 hover:opacity-100 transition-opacity">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(2rem); }
.toast-leave-to   { opacity: 0; transform: translateX(2rem); }
</style>
