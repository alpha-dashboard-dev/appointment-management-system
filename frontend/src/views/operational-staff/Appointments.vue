<template>
  <div class="page">
    <div class="header">
      <div><h2>All Appointments</h2></div>
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
        <option value="rescheduled">Rescheduled</option>
      </select>
    </div>
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <table v-else class="table">
        <thead><tr><th>Code</th><th>Date</th><th>Start</th><th>End</th><th>Status</th><th width="180">Actions</th></tr></thead>
        <tbody>
          <tr v-for="appt in appointments" :key="appt.appointment_code">
            <td><code>{{ appt.appointment_code }}</code></td>
            <td>{{ appt.appointment_start_date?.split('T')[0] ?? '—' }}</td>
            <td>{{ appt.start_time ?? '—' }}</td>
            <td>{{ appt.end_time ?? '—' }}</td>
            <td><span :class="['badge', appt.status]">{{ appt.status }}</span></td>
            <td>
              <button v-if="appt.status === 'pending'" class="approve-btn" @click="changeStatus(appt, 'approved')">Approve</button>
              <button v-if="appt.status === 'pending'" class="reject-btn" @click="changeStatus(appt, 'rejected')">Reject</button>
              <button v-if="['approved','in_progress'].includes(appt.status)" class="reschedule-btn" @click="openReschedule(appt)">Reschedule</button>
              <button v-if="['approved','pending'].includes(appt.status)" class="cancel-btn" @click="changeStatus(appt, 'canceled')">Cancel</button>
            </td>
          </tr>
          <tr v-if="appointments.length === 0"><td colspan="6" class="empty">No appointments found</td></tr>
        </tbody>
      </table>
    </div>

    <!-- RESCHEDULE MODAL -->
    <div v-if="showReschedule && rescheduleAppt" class="modal-overlay">
      <div class="modal">
        <div class="modal-header"><h3>Reschedule Appointment</h3><button class="close" @click="showReschedule = false">✕</button></div>
        <form class="form" @submit.prevent="submitReschedule">
          <div class="field"><label>New Start Date *</label><input v-model="rsForm.appointment_start_date" type="date" required /></div>
          <div class="field"><label>New End Date</label><input v-model="rsForm.appointment_end_date" type="date" /></div>
          <div class="field"><label>New Start Time</label><input v-model="rsForm.start_time" type="time" /></div>
          <div class="field"><label>New End Time</label><input v-model="rsForm.end_time" type="time" /></div>
          <div class="field"><label>Reason</label><textarea v-model="rsForm.reason" rows="2"></textarea></div>
          <p v-if="rsError" class="error-msg">{{ rsError }}</p>
          <button type="submit" class="save-btn" :disabled="rsSaving">{{ rsSaving ? 'Saving...' : 'Reschedule' }}</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'

const authStore = useAuthStore()
const appointments = ref([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('')

const showReschedule = ref(false)
const rescheduleAppt = ref(null)
const rsForm = reactive({ appointment_start_date: '', appointment_end_date: '', start_time: '', end_time: '', reason: '' })
const rsError = ref('')
const rsSaving = ref(false)

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

async function changeStatus(appt, status) {
  try {
    await api.patch(`/appointments/${appt.appointment_code}/status`, { status })
    await fetch()
  } catch (_) {}
}

function openReschedule(appt) {
  rescheduleAppt.value = appt
  Object.assign(rsForm, { appointment_start_date: '', appointment_end_date: '', start_time: '', end_time: '', reason: '' })
  rsError.value = ''
  showReschedule.value = true
}

async function submitReschedule() {
  rsSaving.value = true
  rsError.value = ''
  try {
    const payload = {}
    if (rsForm.appointment_start_date) payload.appointment_start_date = rsForm.appointment_start_date
    if (rsForm.appointment_end_date) payload.appointment_end_date = rsForm.appointment_end_date
    if (rsForm.start_time) payload.start_time = rsForm.start_time
    if (rsForm.end_time) payload.end_time = rsForm.end_time
    if (rsForm.reason) payload.reason = rsForm.reason
    await api.post(`/appointments/${rescheduleAppt.value.appointment_code}/reschedule`, payload)
    showReschedule.value = false
    await fetch()
  } catch (err) {
    rsError.value = err.response?.data?.message || 'Reschedule failed'
  } finally {
    rsSaving.value = false
  }
}

onMounted(fetch)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; align-items: center; justify-content: space-between; }
.header h2 { margin: 0; color: #1e293b; }
.filters { display: flex; gap: 12px; }
.filters select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; min-width: 160px; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.badge.pending { background: #fef3c7; color: #92400e; }
.badge.approved { background: #dcfce7; color: #166534; }
.badge.in_progress { background: #dbeafe; color: #1d4ed8; }
.badge.completed { background: #d1fae5; color: #065f46; }
.badge.rejected { background: #fee2e2; color: #991b1b; }
.badge.canceled { background: #f1f5f9; color: #475569; }
.badge.rescheduled { background: #fce7f3; color: #9d174d; }
.approve-btn { background: #dcfce7; color: #166534; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.reject-btn { background: #fee2e2; color: #dc2626; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.reschedule-btn { background: #e0e7ff; color: #3730a3; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.cancel-btn { background: #f1f5f9; color: #475569; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 10px; padding: 24px; width: 440px; max-width: 90%; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field textarea { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; font-family: inherit; }
.save-btn { background: #064e3b; color: white; border: none; padding: 10px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
