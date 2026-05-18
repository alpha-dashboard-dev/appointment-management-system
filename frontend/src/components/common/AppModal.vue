<script setup lang="ts">
// AppModal — reusable modal dialog.
// Uses Vue's <teleport> to render outside the current DOM tree (directly in <body>)
// so it is never clipped by an ancestor with overflow:hidden.
// Slots: default (body content), footer (action buttons).
defineProps<{
  isOpen: boolean  // controls visibility
  title: string    // shown in the modal header
  size?: 'sm' | 'md' | 'lg' | 'xl'  // constrains the panel's max-width
}>()
defineEmits<{ close: [] }>()
</script>

<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
        <!-- Panel -->
        <div
          :class="['relative bg-white rounded-xl shadow-2xl w-full flex flex-col max-h-[90vh]',
                   size === 'sm' ? 'max-w-md' :
                   size === 'lg' ? 'max-w-2xl' :
                   size === 'xl' ? 'max-w-4xl' : 'max-w-lg']"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <h3 class="text-base font-semibold text-gray-800">{{ title }}</h3>
            <button @click="$emit('close')" class="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <!-- Body -->
          <div class="overflow-y-auto flex-1 px-6 py-5">
            <slot />
          </div>
          <!-- Footer -->
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97); }
</style>
