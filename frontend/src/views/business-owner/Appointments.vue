<template>
  <div class="page">
    <div class="header">
      <div>
        <h2>Appointments</h2>
        <p class="sub">Manage appointment requests for your business</p>
      </div>
      <router-link to="/business/appointments/create" class="btn">+ New Appointment</router-link>
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
        <option value="canceled">Canceled</option>
      </select>
      <input v-model="search" placeholder="Search by code..." />
    </div>

    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Code</th><th>Date</th><th>Start</th><th>End</th><th>Location</th><th>Status</th><th width="260">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appt in filteredAppointments" :key="appt.appointment_code">
            <td><code>{{ appt.appointment_code }}</code></td>
            <td>{{ appt.appointment_start_date }}</td>
            <td>{{ appt.start_time }}</td>
            <td>{{ appt.end_time }}</td>
            <td>{{ appt.location_code || '—' }}</td>
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
          <div class="detail-row"><span>Code</span><code>{{ selected.appointment_code }}</code></div>
          <div class="detail-row"><span>Business</span><span>{{ selected.business_code }}</span></div>
          <div class="detail-row"><span>Date</span><span>{{ selected.appointment_start_date }}</span></div>
          <div class="detail-row"><span>Start Time</span><span>{{ selected.start_time }}</span></div>
          <div class="detail-row"><span>End Time</span><span>{{ selected.end_time }}</span></div>
          <div class="detail-row"><span>Location</span><span>{{ selected.location_code || '—' }}</span></div>
          <div class="detail-row"><span>Status</span><span :class="['badge', selected.status]">{{ selected.status }}</span></div>
          <div v-if="selected.notes" class="detail-row"><span>Notes</span><span>{{ selected.notes }}</span></div>
        </div>
        <div class="modal-actions">
          <button v-if="selected?.status === 'pending'" class="approve-btn" @click="changeStatus(selected, 'approved'); showDetails = false">Approve</button>
          <button v-if="selected?.status === 'pending'" class="reject-btn" @click="changeStatus(selected, 'rejected'); showDetails = false">Reject</button>
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
            <label>New Start Date *</label>
            <input type="date" v-model="rescheduleForm.appointment_start_date" required />
          </div>
          <div class="field">
            <label>New End Date *</label>
            <input type="date" v-model="rescheduleForm.appointment_end_date" required />
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
            <textarea v-model="rescheduleForm.reason" rows="3" placeholder="Reason for reschedule"></textarea>
          </div>
          <p v-if="rescheduleError" class="error-msg">{{ rescheduleError }}</p>
          <button type="submit" class="submit-btn" :disabled="saving">{{ saving ? 'Saving...' : 'Submit Reschedule' }}</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'

const authStore = useAuthStore()
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
  appointment_start_date: '',
  appointment_end_date: '',
  start_time: '',
  end_time: '',
  reason: '',
})

const filteredAppointments = computed(() => {
  return appointments.value.filter(a => {
    const matchSearch = !search.value || (a.appointment_code || '').toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !statusFilter.value || a.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

async function fetchAppointments() {
  loading.value = true
  error.value = ''
  try {
    const biz = authStore.user?.business_code
    const res = await api.get('/appointments', { params: biz ? { business_code: biz } : {} })
    appointments.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load appointments'
  } finally {
    loading.value = false
  }
}

function openDetails(appt) { selected.value = appt; showDetails.value = true }

function openReschedule(appt) {
  selected.value = appt
  rescheduleForm.appointment_start_date = appt.appointment_start_date || ''
  rescheduleForm.appointment_end_date = appt.appointment_end_date || ''
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
.header { display: flex; align-items: center; justify-content: space-between; }
.header h2 { margin: 0; color: #1e293b; }
.sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }
.filters { display: flex; gap: 12px; flex-wrap: wrap; }
.filters select, .filters input { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; min-width: 160px; }
.btn { background: #0f172a; color: white; border: none; padding: 9px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; text-decoration: none; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
.badge.pending { background: #fef9c3; color: #854d0e; }
.badge.approved { background: #dcfce7; color: #166534; }
.badge.rejected { background: #fee2e2; color: #991b1b; }
.badge.completed { background: #dbeafe; color: #1e40af; }
.badge.canceled { background: #f1f5f9; color: #475569; }
.badge.rescheduled { background: #ede9fe; color: #5b21b6; }
.view-btn { background: #f1f5f9; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 3px; }
.approve-btn { background: #dcfce7; color: #166534; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 3px; }
.reschedule-btn { background: #ede9fe; color: #5b21b6; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 3px; }
.reject-btn { background: #fee2e2; color: #dc2626; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 10px; padding: 24px; width: 480px; max-width: 90%; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.details { display: flex; flex-direction: column; gap: 10px; }
.detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
.detail-row span:first-child { font-weight: 600; color: #374151; }
.modal-actions { display: flex; gap: 10px; margin-top: 16px; }
.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field select, .field textarea { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; font-family: inherit; }
.submit-btn { background: #0f172a; color: white; border: none; padding: 10px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
