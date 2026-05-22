<template>
  <div class="page">
    <div class="header">
      <h2>My Appointments</h2>
      <router-link to="/client/book" class="book-btn">+ Book New</router-link>
    </div>
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
        <thead><tr><th>Code</th><th>Date</th><th>Start</th><th>End</th><th>Status</th><th width="100">Actions</th></tr></thead>
        <tbody>
          <tr v-for="appt in appointments" :key="appt.appointment_code">
            <td><code>{{ appt.appointment_code }}</code></td>
            <td>{{ appt.appointment_start_date?.split('T')[0] ?? '—' }}</td>
            <td>{{ appt.start_time ?? '—' }}</td>
            <td>{{ appt.end_time ?? '—' }}</td>
            <td><span :class="['badge', appt.status]">{{ appt.status }}</span></td>
            <td>
              <button v-if="appt.status === 'pending'" class="cancel-btn" @click="cancelAppt(appt)">Cancel</button>
              <button class="view-btn" @click="openView(appt)">View</button>
            </td>
          </tr>
          <tr v-if="appointments.length === 0"><td colspan="6" class="empty">No appointments found</td></tr>
        </tbody>
      </table>
    </div>

    <!-- VIEW MODAL -->
    <div v-if="showViewModal && selected" class="modal-overlay">
      <div class="modal">
        <div class="modal-header"><h3>Appointment Details</h3><button class="close" @click="showViewModal = false">✕</button></div>
        <div class="detail-grid">
          <div class="d-row"><span>Code</span><code>{{ selected.appointment_code }}</code></div>
          <div class="d-row"><span>Status</span><span :class="['badge', selected.status]">{{ selected.status }}</span></div>
          <div class="d-row"><span>Date</span><span>{{ selected.appointment_start_date?.split('T')[0] ?? '—' }}</span></div>
          <div class="d-row"><span>Start Time</span><span>{{ selected.start_time ?? '—' }}</span></div>
          <div class="d-row"><span>End Time</span><span>{{ selected.end_time ?? '—' }}</span></div>
          <div class="d-row"><span>Location</span><span>{{ selected.location_code ?? '—' }}</span></div>
          <div class="d-row"><span>Notes</span><span>{{ selected.notes ?? '—' }}</span></div>
        </div>
        <button class="close-modal-btn" @click="showViewModal = false">Close</button>
      </div>
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
const showViewModal = ref(false)
const selected = ref(null)

async function fetch() {
  loading.value = true
  error.value = ''
  try {
    const clientCode = authStore.user?.client_code
    const params = {}
    if (clientCode) params.client_code = clientCode
    if (statusFilter.value) params.status = statusFilter.value
    const res = await api.get('/appointments', { params })
    appointments.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}

async function cancelAppt(appt) {
  try {
    await api.patch(`/appointments/${appt.appointment_code}/status`, { status: 'canceled' })
    await fetch()
  } catch (_) {}
}

function openView(appt) { selected.value = appt; showViewModal.value = true }

onMounted(fetch)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; align-items: center; justify-content: space-between; }
.header h2 { margin: 0; color: #1e293b; }
.book-btn { background: #7c3aed; color: white; text-decoration: none; padding: 9px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; }
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
.cancel-btn { background: #fee2e2; color: #dc2626; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.view-btn { background: #ede9fe; color: #5b21b6; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 10px; padding: 24px; width: 440px; max-width: 90%; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.detail-grid { display: flex; flex-direction: column; gap: 8px; }
.d-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
.close-modal-btn { width: 100%; margin-top: 16px; background: #7c3aed; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; }
</style>
