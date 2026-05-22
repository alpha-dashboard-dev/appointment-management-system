<template>
  <div class="page">
    <div class="header"><h2>My Appointments</h2></div>
    <div class="filters">
      <select v-model="statusFilter" @change="fetch">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="rejected">Rejected</option>
        <option value="canceled">Canceled</option>
      </select>
    </div>
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <table v-else class="table">
        <thead><tr><th>Code</th><th>Date</th><th>Start</th><th>End</th><th>Location</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="appt in appointments" :key="appt.appointment_code">
            <td><code>{{ appt.appointment_code }}</code></td>
            <td>{{ appt.appointment_start_date?.split('T')[0] ?? '—' }}</td>
            <td>{{ appt.start_time ?? '—' }}</td>
            <td>{{ appt.end_time ?? '—' }}</td>
            <td>{{ appt.location_code ?? '—' }}</td>
            <td><span :class="['badge', appt.status]">{{ appt.status }}</span></td>
          </tr>
          <tr v-if="appointments.length === 0"><td colspan="6" class="empty">No appointments found</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'

const authStore = useAuthStore()
const appointments = ref([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('')

async function fetch() {
  loading.value = true
  error.value = ''
  try {
    const biz = authStore.user?.business_code
    const params = {}
    if (biz) params.business_code = biz
    if (statusFilter.value) params.status = statusFilter.value
    const res = await api.get('/appointments', { params })
    appointments.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}

onMounted(fetch)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header h2 { margin: 0; color: #1e293b; }
.filters { display: flex; gap: 12px; }
.filters select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; min-width: 160px; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; }
.badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.badge.pending { background: #fef3c7; color: #92400e; }
.badge.approved { background: #dcfce7; color: #166534; }
.badge.in_progress { background: #dbeafe; color: #1d4ed8; }
.badge.completed { background: #d1fae5; color: #065f46; }
.badge.rejected, .badge.canceled { background: #fee2e2; color: #991b1b; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
</style>
