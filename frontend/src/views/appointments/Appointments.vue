<template>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <div>
        <h2>Appointments</h2>
        <p class="sub">Manage all appointment requests</p>
      </div>
      <router-link to="/appointments/create" class="btn">+ New Appointment</router-link>
    </div>

    <!-- FILTERS -->
    <div class="filters">
      <select v-model="statusFilter">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="rescheduled">Rescheduled</option>
        <option value="completed">Completed</option>
      </select>
      <input v-model="search" placeholder="Search by code or client..." />
    </div>

    <!-- TABLE CARD -->
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>

      <table v-else class="table">
        <thead>
        <tr>
          <th>Code</th>
          <th>Client</th>
          <th>Service</th>
          <th>Date</th>
          <th>Start Time</th>
          <th>Status</th>
          <th width="240">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="appt in filteredAppointments" :key="appt.appointment_code">
          <td><code>{{ appt.appointment_code }}</code></td>
          <td>{{ appt.client_name || appt.client_code || '—' }}</td>
          <td>{{ appt.service_name || appt.service_code || '—' }}</td>
          <td>{{ appt.appointment_date }}</td>
          <td>{{ appt.start_time }}</td>
          <td><span :class="['badge', appt.status]">{{ appt.status }}</span></td>
          <td>
            <button class="view-btn" @click="openDetails(appt)">View</button>
            <button class="approve-btn" @click="changeStatus(appt, 'approved')" :disabled="appt.status === 'approved'">Approve</button>
            <button class="reschedule-btn" @click="openReschedule(appt)">Reschedule</button>
            <button class="reject-btn" @click="changeStatus(appt, 'rejected')">Reject</button>
          </td>
        </tr>
        <tr v-if="filteredAppointments.length === 0">
          <td colspan="7" class="empty">No appointments found</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- DETAILS MODAL -->
    <div v-if="showDetails" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Appointment Details</h3>
          <button class="close" @click="showDetails = false">✕</button>
        </div>
        <div class="details" v-if="selected">
          <div><strong>Code:</strong> {{ selected.appointment_code }}</div>
          <div><strong>Client:</strong> {{ selected.client_name || selected.client_code }}</div>
          <div><strong>Service:</strong> {{ selected.service_name || selected.service_code }}</div>
          <div><strong>Date:</strong> {{ selected.appointment_date }}</div>
          <div><strong>Start:</strong> {{ selected.start_time }}</div>
          <div><strong>End:</strong> {{ selected.end_time }}</div>
          <div><strong>Status:</strong> <span :class="['badge', selected.status]">{{ selected.status }}</span></div>
          <div v-if="selected.notes"><strong>Notes:</strong> {{ selected.notes }}</div>
        </div>
      </div>
    </div>

    <!-- RESCHEDULE MODAL -->
    <div v-if="showReschedule" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Reschedule Appointment</h3>
          <button class="close" @click="showReschedule = false">✕</button>
        </div>
        <form class="form" @submit.prevent="submitReschedule">
          <div class="field">
            <label>New Date *</label>
            <input type="date" v-model="rescheduleForm.appointment_date" required />
          </div>
          <div class="field">
            <label>Start Time *</label>
            <input type="time" v-model="rescheduleForm.start_time" required />
          </div>
          <div class="field">
            <label>End Time *</label>
            <input type="time" v-model="rescheduleForm.end_time" required />
          </div>
          <div class="field">
            <label>Reason</label>
            <textarea v-model="rescheduleForm.reason" placeholder="Reason for reschedule" rows="3"></textarea>
          </div>
          <p v-if="rescheduleError" class="error-msg">{{ rescheduleError }}</p>
          <button type="submit" class="primary-btn" :disabled="saving">
            {{ saving ? 'Sending...' : 'Submit Reschedule' }}
          </button>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import api from '@/utils/api'

const appointments = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const rescheduleError = ref('')

const search = ref('')
const statusFilter = ref('')

const showDetails = ref(false)
const showReschedule = ref(false)
const selected = ref(null)

const rescheduleForm = reactive({
  appointment_date: '',
  start_time: '',
  end_time: '',
  reason: '',
})

async function fetchAppointments() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/appointments')
    appointments.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load appointments'
  } finally {
    loading.value = false
  }
}

const filteredAppointments = computed(() => {
  return appointments.value.filter(a => {
    const s = search.value.toLowerCase()
    const matchSearch = !s ||
        (a.appointment_code || '').toLowerCase().includes(s) ||
        (a.client_name || '').toLowerCase().includes(s)
    const matchStatus = !statusFilter.value || a.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

function openDetails(appt) {
  selected.value = appt
  showDetails.value = true
}

function openReschedule(appt) {
  selected.value = appt
  rescheduleForm.appointment_date = appt.appointment_date || ''
  rescheduleForm.start_time = appt.start_time || ''
  rescheduleForm.end_time = appt.end_time || ''
  rescheduleForm.reason = ''
  rescheduleError.value = ''
  showReschedule.value = true
}

async function changeStatus(appt, status) {
  try {
    await api.patch(`/appointments/${appt.appointment_code}/status`, { status })
    appt.status = status
  } catch (err) {
    error.value = err.response?.data?.message || 'Status update failed'
  }
}

async function submitReschedule() {
  saving.value = true
  rescheduleError.value = ''
  try {
    await api.post(`/appointments/${selected.value.appointment_code}/reschedule`, rescheduleForm)
    showReschedule.value = false
    await fetchAppointments()
  } catch (err) {
    rescheduleError.value = err.response?.data?.message || 'Reschedule failed'
  } finally {
    saving.value = false
  }
}

onMounted(fetchAppointments)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header h2 { margin: 0; color: #1e293b; }
.sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }

.btn {
  background: #6366f1;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.filters select, .filters input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  min-width: 160px;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow-x: auto;
}

.table { width: 100%; border-collapse: collapse; }
.table th, .table td {
  text-align: left;
  padding: 10px 12px;
  font-size: 13px;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
}
.table th { color: #64748b; font-weight: 600; }

.badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}
.badge.pending    { background: #fef3c7; color: #d97706; }
.badge.approved   { background: #dcfce7; color: #16a34a; }
.badge.rejected   { background: #fee2e2; color: #dc2626; }
.badge.rescheduled { background: #dbeafe; color: #2563eb; }
.badge.completed  { background: #f0fdf4; color: #15803d; }

.view-btn, .approve-btn, .reschedule-btn, .reject-btn {
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  margin-right: 3px;
}
.view-btn       { background: #e0f2fe; color: #0284c7; }
.approve-btn    { background: #dcfce7; color: #16a34a; }
.reschedule-btn { background: #ede9fe; color: #6366f1; }
.reject-btn     { background: #fee2e2; color: #dc2626; }
.approve-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  background: white;
  border-radius: 10px;
  padding: 24px;
  width: 460px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }

.details { display: flex; flex-direction: column; gap: 10px; font-size: 14px; }
.details div { padding: 6px 0; border-bottom: 1px solid #f1f5f9; }

.form { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field textarea {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
}

.primary-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.primary-btn:disabled { opacity: 0.7; cursor: not-allowed; }

code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
</style>
