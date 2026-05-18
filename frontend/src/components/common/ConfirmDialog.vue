<script setup lang="ts">
// ConfirmDialog — a focused confirmation prompt with optional danger styling.
// Used before destructive or irreversible actions (e.g. deleting a record).
// Emits 'confirm' when the user accepts, 'cancel' when they dismiss.
defineProps<{
  isOpen: boolean          // controls visibility
  title?: string           // dialog heading (defaults to 'Confirm')
  message: string          // description of the action requiring confirmation
  confirmLabel?: string    // label for the confirm button (defaults to 'Confirm')
  danger?: boolean         // when true, renders the confirm button in red (destructive action)
  loading?: boolean        // disables the confirm button and shows a spinner while in-flight
}>()
defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="$emit('cancel')" />
        <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
          <div class="flex items-center gap-3 mb-4">
            <div :class="['w-10 h-10 rounded-full flex items-center justify-center shrink-0', danger ? 'bg-red-100' : 'bg-blue-100']">
              <svg class="w-5 h-5" :class="danger ? 'text-red-600' : 'text-blue-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900">{{ title || 'Confirm' }}</h3>
              <p class="text-sm text-gray-500 mt-0.5">{{ message }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button class="btn-secondary" @click="$emit('cancel')">Cancel</button>
            <button
              :class="danger ? 'btn-danger' : 'btn-primary'"
              :disabled="loading"
              @click="$emit('confirm')"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ confirmLabel || 'Confirm' }}
            </button>
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
