<template>
  <div class="container-fluid py-4">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h4 class="fw-bold mb-0">Notifications</h4>
      <button v-if="notifications.length" class="btn btn-sm btn-outline-secondary" @click="clearAll">
        Clear All
      </button>
    </div>

    <div v-if="!notifications.length" class="text-center py-5 text-muted">
      <i class="bi bi-bell-slash fs-1 d-block mb-3 opacity-50"></i>
      <p class="mb-0">No notifications</p>
    </div>

    <div v-else class="list-group">
      <div
        v-for="item in notifications"
        :key="item.id"
        class="list-group-item list-group-item-action d-flex gap-3 py-3"
        :class="{ 'border-start border-primary border-3': item.unread }"
      >
        <div class="flex-shrink-0 mt-1">
          <i class="bi bi-bell fs-5 text-primary"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-start">
            <p class="mb-1 fw-semibold">
              {{ item.title }}
              <span v-if="item.unread" class="badge bg-primary ms-1 rounded-pill" style="font-size:10px">New</span>
            </p>
            <small class="text-muted text-nowrap ms-2">{{ item.time }}</small>
          </div>
          <p class="mb-0 text-muted" style="font-size:13px">{{ item.message }}</p>
        </div>
        <button class="btn-close btn-sm align-self-start mt-1" @click="dismiss(item.id)" title="Dismiss"></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const notifications = ref([
  { id: 1, title: 'New Appointment', message: 'Ali booked an appointment.', time: '2 min ago', unread: true },
  { id: 2, title: 'Reminder', message: '3 pending appointments need your attention.', time: '15 min ago', unread: true },
  { id: 3, title: 'Organization Updated', message: 'Organization details were modified.', time: '30 min ago', unread: false },
  { id: 4, title: 'System Alert', message: 'Backup completed successfully.', time: '1 hr ago', unread: false },
])

function dismiss(id) {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

function clearAll() {
  notifications.value = []
}
</script>
