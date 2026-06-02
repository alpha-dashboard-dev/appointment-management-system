<template>
  <div class="ams-page">

    <!-- HEADER -->
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Appointments</h2>
        <p class="text-muted small mb-0">Manage all appointment requests</p>
      </div>
      <router-link to="/appointments/create" class="btn btn-ams">+ New Appointment</router-link>
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
      <input v-model="search" class="form-control" style="max-width:260px" placeholder="Search by code or client..." />
    </div>

    <!-- TABLE CARD -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0 overflow-auto">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0 align-middle">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Appointment Code</th>
              <th>Business Code</th>
              <th>Notes</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>Status</th>
              <th class="pe-3 text-center" style="min-width:220px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appt in filteredAppointments" :key="appt.appointment_code">
              <td class="ps-3"><code>{{ appt.appointment_code }}</code></td>
              <td>{{ appt.business_code || '—' }}</td>
              <td>{{ appt.notes || '—' }}</td>
              <td>{{ formatDate(appt.appointment_start_date) }}</td>
              <td>{{ formatTime(appt.start_time) }}</td>
              <td><span :class="['ams-badge', appt.status]">{{ appt.status }}</span></td>
              <td class="pe-3 text-center">
                <div class="d-flex justify-content-center">
                  <div class="dropdown">
                    <button
                      class="btn btn-sm btn-secondary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      :aria-expanded="openDropdownCode === appt.appointment_code"
                      @click.stop="toggleActionDropdown(appt.appointment_code)"
                    >
                      Actions
                    </button>
                    <ul class="dropdown-menu" :class="{ show: openDropdownCode === appt.appointment_code }">
                      <li><button class="dropdown-item" type="button" @click="openDetails(appt); closeActionDropdown()">View</button></li>
                      <li v-if="appt.status === 'pending'"><button class="dropdown-item" type="button" @click="openApprovalDialog(appt); closeActionDropdown()">Approve</button></li>
                      <li v-if="appt.status === 'approved'"><button class="dropdown-item" type="button" @click="changeStatus(appt, 'in_progress'); closeActionDropdown()">Start</button></li>
                      <li v-if="appt.status === 'in_progress'"><button class="dropdown-item" type="button" @click="changeStatus(appt, 'completed'); closeActionDropdown()">Complete</button></li>
                      <li v-if="['pending','approved'].includes(appt.status)"><button class="dropdown-item" type="button" @click="openReschedule(appt); closeActionDropdown()">Reschedule</button></li>
                      <li v-if="['pending','approved'].includes(appt.status)"><button class="dropdown-item text-danger" type="button" @click="changeStatus(appt, 'rejected'); closeActionDropdown()">Reject</button></li>
                      <li v-if="['pending','approved'].includes(appt.status)"><button class="dropdown-item" type="button" @click="changeStatus(appt, 'canceled'); closeActionDropdown()">Cancel</button></li>
                    </ul>
                  </div>
                </div>
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
              <dt class="col-5 text-muted">Appointment Code</dt>
              <dd class="col-7"><code>{{ selected.appointment_code }}</code></dd>
              <dt class="col-5 text-muted">Business Code</dt>
              <dd class="col-7"><code>{{ selected.business_code }}</code></dd>
              <dt class="col-5 text-muted">Start Date</dt>
              <dd class="col-7">{{ formatDate(selected.appointment_start_date) }}</dd>
              <dt class="col-5 text-muted">End Date</dt>
              <dd class="col-7">{{ formatDate(selected.appointment_end_date) }}</dd>
              <dt class="col-5 text-muted">Start Time</dt>
              <dd class="col-7">{{ formatTime(selected.start_time) }}</dd>
              <dt class="col-5 text-muted">End Time</dt>
              <dd class="col-7">{{ formatTime(selected.end_time) }}</dd>
              <dt class="col-5 text-muted">Status</dt>
              <dd class="col-7"><span :class="['ams-badge', selected.status]">{{ selected.status }}</span></dd>
              <template v-if="selected.notes">
                <dt class="col-5 text-muted">Notes</dt>
                <dd class="col-7">{{ selected.notes }}</dd>
              </template>
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
                <textarea v-model="rescheduleForm.reason" class="form-control" placeholder="Reason for reschedule" rows="3"></textarea>
              </div>
              <p v-if="rescheduleError" class="text-danger small mt-2 mb-0">{{ rescheduleError }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showReschedule = false">Cancel</button>
              <button type="submit" class="btn btn-ams" :disabled="saving">{{ saving ? 'Sending...' : 'Submit Reschedule' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- APPROVAL FLOW MODAL -->
    <div v-if="showApproval" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Approve Appointment &mdash; Staff Availability</h5>
            <button type="button" class="btn-close" @click="closeApprovalDialog"></button>
          </div>
          <div class="modal-body">

            <!-- Appointment summary -->
            <div class="bg-light rounded p-3 mb-3 d-flex flex-wrap gap-3" v-if="selected">
              <div><span class="text-muted small">Appointment Code</span><div><code>{{ selected.appointment_code }}</code></div></div>
              <div><span class="text-muted small">Start Date</span><div>{{ formatDate(selected.appointment_start_date) }}</div></div>
              <div><span class="text-muted small">Time</span><div>{{ formatTime(selected.start_time) }} – {{ formatTime(selected.end_time) }}</div></div>
              <div><span class="text-muted small">Location Code</span><div>{{ selected.location_code || '—' }}</div></div>
            </div>

            <!-- Loading -->
            <div v-if="availabilityLoading" class="text-center text-muted py-4">
              <div class="spinner-border spinner-border-sm me-2"></div> Checking staff availability…
            </div>

            <!-- Error -->
            <div v-else-if="availabilityError" class="alert alert-warning py-2 mb-3">{{ availabilityError }}</div>

            <!-- Staff available -->
            <template v-else-if="!showRescheduleInApproval">
              <div v-if="availableStaff.length > 0">
                <p class="fw-semibold mb-2">Available staff for this slot:</p>
                <div class="list-group mb-3">
                  <label
                    v-for="s in availableStaff"
                    :key="s.user_code"
                    class="list-group-item list-group-item-action d-flex align-items-center gap-3 cursor-pointer"
                    :class="{ active: selectedStaff === s.user_code }"
                    @click="selectedStaff = s.user_code"
                  >
                    <input type="radio" :value="s.user_code" v-model="selectedStaff" class="form-check-input mt-0" />
                    <div>
                      <div class="fw-semibold">{{ s.user_name || s.user_code }}</div>
                      <small class="text-muted">{{ s.working_days }} &bull; {{ s.start_time }}–{{ s.end_time }}</small>
                    </div>
                  </label>
                </div>
                <p v-if="approvalError" class="text-danger small mb-2">{{ approvalError }}</p>
              </div>

              <!-- No staff available -->
              <div v-else class="alert alert-warning d-flex align-items-start gap-2 mb-3">
                <span class="fs-5">&#9888;</span>
                <div>
                  <strong>No staff available</strong> for this date and time slot.
                  <br>You can send a reschedule request to the client with a new date &amp; time.
                </div>
              </div>
            </template>

            <!-- Reschedule sub-form (shown when no staff OR user clicked "Send Reschedule") -->
            <template v-if="showRescheduleInApproval">
              <div class="alert alert-info py-2 mb-3">
                Fill in a new date &amp; time to propose to the client.
              </div>
              <div class="row g-3">
                <div class="col-6">
                  <label class="form-label fw-semibold">New Start Date *</label>
                  <input type="date" v-model="approvalRescheduleForm.appointment_start_date" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">New End Date *</label>
                  <input type="date" v-model="approvalRescheduleForm.appointment_end_date" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">Start Time *</label>
                  <input type="time" v-model="approvalRescheduleForm.start_time" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">End Time *</label>
                  <input type="time" v-model="approvalRescheduleForm.end_time" class="form-control" required />
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold">Reason / Notes</label>
                  <textarea v-model="approvalRescheduleForm.notes" class="form-control" rows="2" placeholder="Reason for rescheduling…"></textarea>
                </div>
              </div>
              <p v-if="approvalError" class="text-danger small mt-2 mb-0">{{ approvalError }}</p>
            </template>

          </div>
          <div class="modal-footer gap-2">
            <button type="button" class="btn btn-secondary" @click="closeApprovalDialog">Cancel</button>

            <!-- When staff is available and one is selected: Approve -->
            <button
              v-if="!showRescheduleInApproval && availableStaff.length > 0"
              class="btn btn-success"
              :disabled="!selectedStaff || approvalSaving"
              @click="submitApproveWithStaff"
            >{{ approvalSaving ? 'Approving…' : 'Approve & Assign Staff' }}</button>

            <!-- When staff is available: option to reschedule instead -->
            <button
              v-if="!showRescheduleInApproval && availableStaff.length > 0 && !availabilityLoading && !availabilityError"
              class="btn btn-outline-primary"
              @click="showRescheduleInApproval = true"
            >Send Reschedule Request Instead</button>

            <!-- When no staff: primary action is reschedule -->
            <button
              v-if="!showRescheduleInApproval && availableStaff.length === 0 && !availabilityLoading && !availabilityError"
              class="btn btn-primary"
              @click="showRescheduleInApproval = true"
            >Send Reschedule Request to Client</button>

            <!-- Back button when reschedule form is open -->
            <button
              v-if="showRescheduleInApproval"
              class="btn btn-outline-secondary"
              @click="showRescheduleInApproval = false"
            >&#8592; Back</button>

            <!-- Submit reschedule -->
            <button
              v-if="showRescheduleInApproval"
              class="btn btn-primary"
              :disabled="approvalSaving"
              @click="submitApprovalReschedule"
            >{{ approvalSaving ? 'Sending…' : 'Send Reschedule Request' }}</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import api from '@/utils/api'
import formatTime from "../../utils/formatTime.js";
import formatDate from "../../utils/formatDate.js";

const appointments = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const rescheduleError = ref('')

const search = ref('')
const statusFilter = ref('')
const openDropdownCode = ref('')

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

// ─── Approval Flow ────────────────────────────────────────────────────────────

const showApproval = ref(false)
const availabilityLoading = ref(false)
const availabilityError = ref('')
const availableStaff = ref([])
const selectedStaff = ref('')
const approvalSaving = ref(false)
const approvalError = ref('')
const showRescheduleInApproval = ref(false)

const approvalRescheduleForm = reactive({
  appointment_start_date: '',
  appointment_end_date: '',
  start_time: '',
  end_time: '',
  notes: '',
})

async function openApprovalDialog(appt) {
  selected.value = appt
  showApproval.value = true
  availabilityError.value = ''
  availableStaff.value = []
  selectedStaff.value = ''
  approvalError.value = ''
  showRescheduleInApproval.value = false
  approvalRescheduleForm.appointment_start_date = appt.appointment_start_date || ''
  approvalRescheduleForm.appointment_end_date = appt.appointment_end_date || ''
  approvalRescheduleForm.start_time = appt.start_time || ''
  approvalRescheduleForm.end_time = appt.end_time || ''
  approvalRescheduleForm.notes = ''

  availabilityLoading.value = true
  try {
    const res = await api.get(`/appointments/${appt.appointment_code}/availability`)
    availableStaff.value = res.data.data?.available_staff || []
  } catch (err) {
    availabilityError.value = err.response?.data?.message || 'Could not check availability'
  } finally {
    availabilityLoading.value = false
  }
}

function closeApprovalDialog() {
  showApproval.value = false
  showRescheduleInApproval.value = false
  approvalError.value = ''
}

async function submitApproveWithStaff() {
  if (!selectedStaff.value) return
  approvalSaving.value = true
  approvalError.value = ''
  try {
    await api.post(`/appointments/${selected.value.appointment_code}/approve`, { staff_code: selectedStaff.value })
    showApproval.value = false
    await fetchAppointments()
  } catch (err) {
    approvalError.value = err.response?.data?.message || 'Approval failed'
  } finally {
    approvalSaving.value = false
  }
}

async function submitApprovalReschedule() {
  if (!approvalRescheduleForm.appointment_start_date || !approvalRescheduleForm.start_time || !approvalRescheduleForm.end_time) {
    approvalError.value = 'Please fill in the new date and times'
    return
  }
  approvalSaving.value = true
  approvalError.value = ''
  try {
    await api.post(`/appointments/${selected.value.appointment_code}/reschedule`, approvalRescheduleForm)
    showApproval.value = false
    await fetchAppointments()
  } catch (err) {
    approvalError.value = err.response?.data?.message || 'Reschedule request failed'
  } finally {
    approvalSaving.value = false
  }
}

function toggleActionDropdown(appointmentCode) {
  openDropdownCode.value = openDropdownCode.value === appointmentCode ? '' : appointmentCode
}

function closeActionDropdown() {
  openDropdownCode.value = ''
}

onMounted(fetchAppointments)
</script>

<style scoped>
.dropdown-menu {
  min-width: 180px;
}
</style>


