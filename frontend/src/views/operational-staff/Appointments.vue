<template>
  <div class="ams-page">
    <div class="d-flex align-items-center justify-content-between">
      <div><h2 class="mb-0">All Appointments</h2></div>
    </div>
    <div class="d-flex gap-2">
      <select v-model="statusFilter" @change="fetchList" class="form-select" style="max-width:200px">
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
    <div class="card shadow-sm border-0">
      <div class="card-body p-0 overflow-auto">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Appointment Code</th>
              <th>Start Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th class="pe-3" style="width:360px">Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="appt in appointments" :key="appt.appointment_code">
              <td class="ps-3"><code>{{ appt.appointment_code }}</code></td>
              <td>{{ formatDate(appt.appointment_start_date) }}</td>
              <td>{{ formatTime(appt.start_time) }}</td>
              <td>{{ formatTime(appt.end_time) }}</td>
              <td><span :class="['ams-badge', appt.status]">{{ appt.status }}</span></td>
              <td class="pe-3">
                <button class="btn btn-sm btn-outline-secondary me-1" @click="openDetails(appt)">View</button>
                <button v-if="appt.status === 'pending'" class="btn btn-sm btn-success me-1" @click="openApprovalDialog(appt)">Approve</button>
                <button v-if="appt.status === 'pending'" class="btn btn-sm btn-outline-danger me-1" @click="changeStatus(appt, 'rejected')">Reject</button>
                <button v-if="appt.status === 'approved'" class="btn btn-sm btn-outline-info me-1" @click="changeStatus(appt, 'in_progress')">Start</button>
                <button v-if="appt.status === 'in_progress'" class="btn btn-sm btn-success me-1" @click="changeStatus(appt, 'completed')">Complete</button>
                <button v-if="['pending','approved','in_progress'].includes(appt.status)" class="btn btn-sm btn-outline-primary me-1" @click="openAssign(appt)">Assign</button>
                <button v-if="['approved','in_progress'].includes(appt.status)" class="btn btn-sm btn-outline-warning me-1" @click="openReschedule(appt)">Reschedule</button>
                <button v-if="['approved','pending'].includes(appt.status)" class="btn btn-sm btn-outline-secondary" @click="changeStatus(appt, 'canceled')">Cancel</button>
              </td>
            </tr>
            <tr v-if="appointments.length === 0"><td colspan="6" class="text-center text-muted py-4">No appointments found</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- APPROVAL DIALOG MODAL -->
    <div v-if="showApproval" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Approve Appointment &mdash; Staff Availability</h5>
            <button type="button" class="btn-close" @click="closeApprovalDialog"></button>
          </div>
          <div class="modal-body">
            <div class="bg-light rounded p-3 mb-3 d-flex flex-wrap gap-3" v-if="selected">
              <div><span class="text-muted small">Code</span><div><code>{{ selected.appointment_code }}</code></div></div>
              <div><span class="text-muted small">Date</span><div>{{ selected.appointment_start_date?.split('T')[0] }}</div></div>
              <div><span class="text-muted small">Time</span><div>{{ formatTime(selected.start_time) }} – {{ formatTime(selected.end_time) }}</div></div>
              <div><span class="text-muted small">Location</span><div>{{ selected.location_code || '—' }}</div></div>
            </div>
            <div v-if="availabilityLoading" class="text-center text-muted py-4">
              <div class="spinner-border spinner-border-sm me-2"></div> Checking staff availability…
            </div>
            <div v-else-if="availabilityError" class="alert alert-warning py-2 mb-3">{{ availabilityError }}</div>
            <template v-else-if="!showRescheduleInApproval">
              <div v-if="availableStaff.length > 0">
                <p class="fw-semibold mb-2">Available staff for this slot:</p>
                <div class="list-group mb-3">
                  <label
                    v-for="s in availableStaff" :key="s.user_code"
                    class="list-group-item list-group-item-action d-flex align-items-center gap-3"
                    style="cursor:pointer"
                    :class="{ active: approvalSelectedStaff === s.user_code }"
                    @click="approvalSelectedStaff = s.user_code"
                  >
                    <input type="radio" :value="s.user_code" v-model="approvalSelectedStaff" class="form-check-input mt-0" />
                    <div>
                      <div class="fw-semibold">{{ s.user_name || s.user_code }}</div>
                      <small class="text-muted">{{ s.working_days }} &bull; {{ s.start_time }}–{{ s.end_time }}</small>
                    </div>
                  </label>
                </div>
                <p v-if="approvalError" class="text-danger small mb-2">{{ approvalError }}</p>
              </div>
              <div v-else class="alert alert-warning d-flex align-items-start gap-2 mb-3">
                <span class="fs-5">&#9888;</span>
                <div><strong>No staff available</strong> for this slot.<br>Send a reschedule request to the client.</div>
              </div>
            </template>
            <template v-if="showRescheduleInApproval">
              <div class="alert alert-info py-2 mb-3">Fill in a new date &amp; time to propose to the client.</div>
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
            <button
              v-if="!showRescheduleInApproval && availableStaff.length > 0"
              class="btn btn-success"
              :disabled="!approvalSelectedStaff || approvalSaving"
              @click="submitApproveWithStaff"
            >{{ approvalSaving ? 'Approving…' : 'Approve & Assign Staff' }}</button>
            <button
              v-if="!showRescheduleInApproval && availableStaff.length > 0 && !availabilityLoading && !availabilityError"
              class="btn btn-outline-primary"
              @click="showRescheduleInApproval = true"
            >Send Reschedule Request Instead</button>
            <button
              v-if="!showRescheduleInApproval && availableStaff.length === 0 && !availabilityLoading && !availabilityError"
              class="btn btn-primary"
              @click="showRescheduleInApproval = true"
            >Send Reschedule Request to Client</button>
            <button v-if="showRescheduleInApproval" class="btn btn-outline-secondary" @click="showRescheduleInApproval = false">&#8592; Back</button>
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

    <!-- DETAILS MODAL -->
    <div v-if="showDetails && selected" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Appointment Details</h5>
            <button type="button" class="btn-close" @click="showDetails = false"></button>
          </div>
          <div class="modal-body">
            <dl class="row mb-3">
              <dt class="col-5 text-muted">Code</dt><dd class="col-7"><code>{{ selected.appointment_code }}</code></dd>
              <dt class="col-5 text-muted">Date</dt><dd class="col-7">{{ formatDate(selected.appointment_start_date) }}</dd>
              <dt class="col-5 text-muted">Start Time</dt><dd class="col-7">{{ formatTime(selected.start_time) }}</dd>
              <dt class="col-5 text-muted">End Time</dt><dd class="col-7">{{ formatTime(selected.end_time) }}</dd>
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
          </div>
        </div>
      </div>
    </div>

    <!-- RESCHEDULE MODAL -->
    <div v-if="showReschedule && rescheduleAppt" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
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
                  <input v-model="rsForm.appointment_start_date" type="date" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">New End Date</label>
                  <input v-model="rsForm.appointment_end_date" type="date" class="form-control" />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">New Start Time</label>
                  <input v-model="rsForm.start_time" type="time" class="form-control" />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">New End Time</label>
                  <input v-model="rsForm.end_time" type="time" class="form-control" />
                </div>
              </div>
              <div class="mt-3">
                <label class="form-label fw-semibold">Reason</label>
                <textarea v-model="rsForm.reason" class="form-control" rows="2"></textarea>
              </div>
              <p v-if="rsError" class="text-danger small mt-2 mb-0">{{ rsError }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showReschedule = false">Cancel</button>
              <button type="submit" class="btn btn-ams" :disabled="rsSaving">{{ rsSaving ? 'Saving...' : 'Reschedule' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ASSIGN STAFF MODAL -->
    <div v-if="showAssign && assignAppt" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Assign Service Staff</h5>
            <button type="button" class="btn-close" @click="closeAssign"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted small mb-3">Appointment Code: <code>{{ assignAppt.appointment_code }}</code></p>
            <div v-if="staffLoading" class="text-center text-muted py-3">Loading staff...</div>
            <div v-else-if="!staffList.length" class="text-center text-muted py-3">No service staff found</div>
            <div v-else class="d-flex flex-column gap-2" style="max-height:220px;overflow-y:auto">
              <div
                v-for="s in staffList" :key="s.user_code"
                :class="['staff-item', { selected: selectedStaff === s.user_code }]"
                @click="selectedStaff = s.user_code"
              >
                <div class="fw-semibold">{{ s.name }} </div>
                <div class="text-muted small">{{ s.user_code }}</div>
              </div>
            </div>
            <p v-if="assignError" class="text-danger small mt-2 mb-0">{{ assignError }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAssign">Cancel</button>
            <button class="btn btn-ams" :disabled="!selectedStaff || assigning" @click="assignStaff">{{ assigning ? 'Assigning...' : 'Assign' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'
import formatTime from "../../utils/formatTime.js";
import formatDate from "../../utils/formatDate.js";


const authStore = useAuthStore()
const appointments = ref([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('')

const showDetails = ref(false)
const selected = ref(null)
const historyLoading = ref(false)
const appointmentHistory = ref([])

const showReschedule = ref(false)
const rescheduleAppt = ref(null)
const rsForm = reactive({ appointment_start_date: '', appointment_end_date: '', start_time: '', end_time: '', reason: '' })
const rsError = ref('')
const rsSaving = ref(false)

const showAssign = ref(false)
const assignAppt = ref(null)
const staffList = ref([])
const staffLoading = ref(false)
const selectedStaff = ref('')
const assigning = ref(false)
const assignError = ref('')

// Approval dialog state
const showApproval = ref(false)
const availabilityLoading = ref(false)
const availabilityError = ref('')
const availableStaff = ref([])
const approvalSelectedStaff = ref('')
const approvalSaving = ref(false)
const approvalError = ref('')
const showRescheduleInApproval = ref(false)
const approvalRescheduleForm = reactive({ appointment_start_date: '', appointment_end_date: '', start_time: '', end_time: '', notes: '' })

async function openApprovalDialog(appt) {
  selected.value = appt
  showApproval.value = true
  availabilityError.value = ''
  availableStaff.value = []
  approvalSelectedStaff.value = ''
  approvalError.value = ''
  showRescheduleInApproval.value = false
  Object.assign(approvalRescheduleForm, {
    appointment_start_date: appt.appointment_start_date || '',
    appointment_end_date: appt.appointment_end_date || '',
    start_time: appt.start_time || '',
    end_time: appt.end_time || '',
    notes: '',
  })
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
  if (!approvalSelectedStaff.value) return
  approvalSaving.value = true
  approvalError.value = ''
  try {
    await api.post(`/appointments/${selected.value.appointment_code}/approve`, { staff_code: approvalSelectedStaff.value })
    showApproval.value = false
    await fetchList()
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
    await fetchList()
  } catch (err) {
    approvalError.value = err.response?.data?.message || 'Reschedule request failed'
  } finally {
    approvalSaving.value = false
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

async function fetchList() {
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
    await fetchList()
  } catch (err) {
    alert(err.response?.data?.message || 'Action failed')
  }
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
    await fetchList()
  } catch (err) {
    rsError.value = err.response?.data?.message || 'Reschedule failed'
  } finally {
    rsSaving.value = false
  }
}

async function openAssign(appt) {
  assignAppt.value = appt
  selectedStaff.value = ''
  assignError.value = ''
  showAssign.value = true
  staffLoading.value = true
  try {
    const biz = authStore.user?.business_code
    const res = await api.get('/users/get-users', { params: { business_code: biz, user_type: 'service_staff' } })
    staffList.value = res.data.data || []
  } catch (_) {
    staffList.value = []
  } finally {
    staffLoading.value = false
  }
}

function closeAssign() {
  showAssign.value = false
  assignAppt.value = null
  assignError.value = ''
}

async function assignStaff() {
  assigning.value = true
  assignError.value = ''
  try {
    await api.post(`/appointments/${assignAppt.value.appointment_code}/participants`, {
      user_code: selectedStaff.value,
      user_type: 'service_staff',
      user_role: 'service_staff',
    })
    closeAssign()
  } catch (err) {
    assignError.value = err.response?.data?.message || 'Assignment failed'
  } finally {
    assigning.value = false
  }
}

onMounted(fetchList)
</script>


