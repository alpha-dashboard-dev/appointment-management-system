// useToast composable — lightweight notification system.
// Maintains a module-level array of active toasts so the same list is shared
// between the component that triggers a toast and <ToastNotification /> that renders them.
import { ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

// Module-level singleton — all callers see the same toast list
const toasts = ref<Toast[]>([])
let nextId = 1 // simple auto-increment ID for keying list items

export function useToast() {
  // Add a toast and schedule its automatic removal after `duration` ms
  function show(message: string, type: Toast['type'] = 'info', duration = 3500) {
    const id = nextId++
    toasts.value.push({ id, type, message })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  // Convenience helpers — each maps to a semantic toast type
  const success = (msg: string) => show(msg, 'success')
  const error   = (msg: string) => show(msg, 'error')
  const warning = (msg: string) => show(msg, 'warning')
  const info    = (msg: string) => show(msg, 'info')

  // Manually dismiss a specific toast (e.g. when user clicks the ✕ button)
  function remove(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, success, error, warning, info, remove }
}
