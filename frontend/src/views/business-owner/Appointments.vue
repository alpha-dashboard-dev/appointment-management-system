<template>
  <div class="ams-page">
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Appointments</h2>
        <p class="text-muted small mb-0">Manage appointment requests for your business</p>
      </div>
      <router-link to="/business/appointments/create" class="btn btn-ams">+ New Appointment</router-link>
    </div>

    <!-- FILTERS -->
    <div class="d-flex gap-2 flex-wrap">
      <select v-model="statusFilter" class="form-select" style="max-width:180px">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="rescheduled">Rescheduled</option>
        <option value="completed">Completed</option>
        <option value="canceled">Canceled</option>
      </select>
      <input v-model="search" class="form-control" style="max-width:260px" placeholder="Search by code..." />
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body p-0 overflow-auto">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Code</th><th>Date</th><th>Start</th><th>End</th><th>Location</th><th>Status</th><th class="pe-3" style="width:280px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appt in filteredAppointments" :key="appt.appointment_code">
              <td class="ps-3"><code>{{ appt.appointment_code }}</code></td>
              <td>{{ appt.appointment_start_date }}</td>
              <td>{{ appt.start_time }}</td>
              <td>{{ appt.end_time }}</td>
              <td>{{ appt.location_code || '—' }}</td>
              <td><span :class="['ams-badge', appt.status]">{{ appt.status }}</span></td>
              <td class="pe-3">
                <button class="btn btn-sm btn-outline-secondary me-1" @click="openDetails(appt)">View</button>
                <button v-if="appt.status === 'pending'" class="btn btn-sm btn-success me-1" @click="changeStatus(appt, 'approved')">Approve</button>
                <button v-if="appt.status === 'approved'" class="btn btn-sm btn-outline-info me-1" @click="changeStatus(appt, 'in_progress')">Start</button>
                <button v-if="appt.status === 'in_progress'" class="btn btn-sm btn-success me-1" @click="changeStatus(appt, 'completed')">Complete</button>
                <button v-if="['pending','approved'].includes(appt.status)" class="btn btn-sm btn-outline-primary me-1" @click="openReschedule(appt)">Reschedule</button>
                <button v-if="['pending','approved'].includes(appt.status)" class="btn btn-sm btn-outline-danger" @click="changeStatus(appt, 'rejected')">Reject</button>
              </td>
            </tr>
            <tr v-if="filteredAppointments.length === 0">
              <td colspan="7" class="text-center text-muted py-4">No appointments found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- DETAILS MODAL -->
    <div v-if="showDetails" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Appointment Details</h5>
            <button type="button" class="btn-close" @click="showDetails = false"></button>
          </div>
          <div class="modal-body" v-if="selected">
            <dl class="row mb-3">
              <dt class="col-5 text-muted">Code</dt><dd class="col-7"><code>{{ selected.appointment_code }}</code></dd>
              <dt class="col-5 text-muted">Business</dt><dd class="col-7">{{ selected.business_code }}</dd>
              <dt class="col-5 text-muted">Date</dt><dd class="col-7">{{ selected.appointment_start_date }}</dd>
              <dt class="col-5 text-muted">Start Time</dt><dd class="col-7">{{ selected.start_time }}</dd>
              <dt class="col-5 text-muted">End Time</dt><dd class="col-7">{{ selected.end_time }}</dd>
              <dt class="col-5 text-muted">Location</dt><dd class="col-7">{{ selected.location_code || '—' }}</dd>
              <dt class="col-5 text-muted">Status</dt><dd class="col-7"><span :class="['ams-badge', selected.status]">{{ selected.status }}</span></dd>
              <template v-if="selected.notes"><dt class="col-5 text-muted">Notes</dt><dd class="col-7">{{ selected.notes }}</dd></template>
            </dl>
            <hr class="my-2" />
            <div class="fw-semibold mb-2" style="font-size:13px">History</div>
            <div v-if="historyLoading" class="text-muted small text-center py-2">Loading...</div>
            <ul v-else-if="appointmentHistory.length" class="list-unstyled mb-0">
              <li v-for="h in appointmentHistory" :key="h.id" class="d-flex gap-2 align-items-center mb-1 flex-wrap">
                <span class="text-muted" style="font-size:11px;min-width:80px">{{ h.created_at?.split('T')[0] }}</span>
                <span :class="['ams-badge', h.action]">{{ h.action }}</span>
                <span class="text-muted small">by {{ h.changed_by || '—' }}</span>
              </li>
            </ul>
            <p v-else class="text-muted small mb-0">No history yet</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDetails = false">Close</button>
            <button v-if="selected?.status === 'pending'" class="btn btn-success" @click="changeStatus(selected, 'approved'); showDetails = false">Approve</button>
            <button v-if="selected?.status === 'pending'" class="btn btn-danger" @click="changeStatus(selected, 'rejected'); showDetails = false">Reject</button>
          </div>
        </div>
      </div>
    </div>

    <!-- RESCHEDULE MODAL -->
    <div v-if="showReschedule" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reschedule Appointment</h5>
            <button type="button" class="btn-close" @click="showReschedule = false"></button>
          </div>
          <form @submit.prevent="submitReschedule">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-6">
                  <label class="form-label fw-semibold">New Start Date *</label>
                  <input type="date" v-model="rescheduleForm.appointment_start_date" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">New End Date *</label>
                  <input type="date" v-model="rescheduleForm.appointment_end_date" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">Start Time *</label>
                  <input type="time" v-model="rescheduleForm.start_time" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">End Time *</label>
                  <input type="time" v-model="rescheduleForm.end_time" class="form-control" required />
                </div>
              </div>
              <div class="mt-3">
                <label class="form-label fw-semibold">Reason</label>
                <textarea v-model="rescheduleForm.reason" class="form-control" rows="3" placeholder="Reason for reschedule"></textarea>
              </div>
              <p v-if="rescheduleError" class="text-danger small mt-2 mb-0">{{ rescheduleError }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showReschedule = false">Cancel</button>
              <button type="submit" class="btn btn-ams" :disabled="saving">{{ saving ? 'Saving...' : 'Submit Reschedule' }}</button>
            </div>
          </form>
        </div>
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
const historyLoading = ref(false)
const appointmentHistory = ref([])

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

async function openDetails(appt) {
  selected.value = appt
  appointmentHistory.value = []
  showDetails.value = true
  historyLoading.value = true
  try {
    const res = await api.get(`/appointments/${appt.appointment_code}/history`)
    appointmentHistory.value = res.data.data || []
  } catch (_) {
  } finally {
    historyLoading.value = false
  }
}

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


