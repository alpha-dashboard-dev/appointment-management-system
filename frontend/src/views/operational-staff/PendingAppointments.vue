<template>
  <div class="ams-page">
    <div><h2 class="mb-0">Pending Requests</h2></div>
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Appointment Code</th>
              <th>Start ate</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Location</th>
              <th class="pe-3" style="width:240px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appt in appointments" :key="appt.appointment_code">
              <td class="ps-3"><code>{{ appt.appointment_code }}</code></td>
              <td>{{ appt.appointment_start_date?.split('T')[0] ?? '—' }}</td>
              <td>{{ formatTime(appt.start_time) }}</td>
              <td>{{ formatTime(appt.start_time)}}</td>
              <td>{{ appt.location_code ?? '—' }}</td>
              <td class="pe-3">
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <button class="dropdown-item" @click="openAssignModal(appt)">
                        <i class="bi bi-person-plus me-2"></i>
                        Assign Staff
                      </button>
                    </li>
                    <li>
                      <button class="dropdown-item" @click="openApprovalDialog(appt)">
                        <i class="bi bi-check2-circle me-2"></i>
                        Approve
                      </button>
                    </li>
                    <li>
                      <button class="dropdown-item text-danger" @click="changeStatus(appt, 'rejected')">
                        <i class="bi bi-x-circle me-2"></i>
                        Reject
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="appointments.length === 0"><td colspan="6" class="text-center text-muted py-4">No pending requests</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showApproval" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Approve Appointment &mdash; Staff Availability</h5>
            <button type="button" class="btn-close" @click="closeApprovalDialog"></button>
          </div>
          <div class="modal-body">
            <div class="bg-light rounded p-3 mb-3 d-flex flex-wrap gap-3" v-if="approvalAppt">
              <div><span class="text-muted small">Code</span><div><code>{{ approvalAppt.appointment_code }}</code></div></div>
              <div><span class="text-muted small">Date</span><div>{{ approvalAppt.appointment_start_date?.split('T')[0] ?? '—' }}</div></div>
              <div><span class="text-muted small">Time</span><div>{{ formatTime(approvalAppt.start_time) }} – {{ formatTime(approvalAppt.end_time) }}</div></div>
              <div><span class="text-muted small">Location</span><div>{{ approvalAppt.location_code || '—' }}</div></div>
            </div>

            <div v-if="availabilityLoading" class="text-center text-muted py-4">
              <div class="spinner-border spinner-border-sm me-2"></div> Checking staff availability…
            </div>
            <div v-else-if="availabilityError" class="alert alert-warning py-2 mb-3">{{ availabilityError }}</div>
            <template v-else>
              <div v-if="slotAlreadyBooked" class="alert alert-danger py-2 mb-3">
                This slot is already booked.
                <span v-if="conflictingAppointments.length"> Conflicting appointments: {{ conflictingAppointments.join(', ') }}</span>
              </div>

              <div v-if="availableStaff.length > 0" class="mb-3">
                <p class="fw-semibold mb-2">Available staff for this slot:</p>
                <div class="list-group">
                  <label
                    v-for="s in availableStaff" :key="s.user_code"
                    class="list-group-item list-group-item-action d-flex align-items-center gap-3"
                    style="cursor:pointer"
                    :class="{ active: approvalSelectedStaff === s.user_code }"
                    @click="approvalSelectedStaff = s.user_code"
                  >
                    <input type="radio" :value="s.user_code" v-model="approvalSelectedStaff" class="form-check-input mt-0" />
                    <div>
                      <div class="fw-semibold">{{ s.staff_name || s.user_code }}</div>
                      <small class="text-muted">{{ s.working_days }} &bull; {{ formatTime(s.start_time) }}–{{ formatTime(s.end_time) }}</small>
                    </div>
                  </label>
                </div>
              </div>

              <div v-else class="alert alert-warning d-flex align-items-start gap-2 mb-3">
                <span class="fs-5">&#9888;</span>
                <div><strong>No staff available</strong> for this slot.<br>See alternatives below or reject/reschedule.</div>
              </div>

              <div v-if="alternativeTimeSameLocation.length" class="mb-3">
                <div class="fw-semibold mb-2">Other service staff at different time (same location)</div>
                <div class="list-group">
                  <div v-for="s in alternativeTimeSameLocation" :key="`same-${s.user_code}-${s.start_time}-${s.end_time}`" class="list-group-item">
                    <div class="fw-semibold">{{ s.staff_name || s.user_code }}</div>
                    <div class="small text-muted">{{ s.user_code }} &bull; {{ formatTime(s.start_time) }}–{{ formatTime(s.end_time) }}</div>
                  </div>
                </div>
              </div>

              <div v-if="alternativeLocationSameTime.length" class="mb-3">
                <div class="fw-semibold mb-2">Other locations at the same time slot</div>
                <div class="border rounded p-2 mb-2" v-for="loc in alternativeLocationSameTime" :key="`loc-${loc.location_code}`">
                  <div class="small fw-semibold mb-2">Location: {{ loc.location_code }}</div>
                  <div class="list-group">
                    <div v-for="s in loc.staff" :key="`loc-staff-${loc.location_code}-${s.user_code}-${s.start_time}-${s.end_time}`" class="list-group-item">
                      <div class="fw-semibold">{{ s.staff_name || s.user_code }}</div>
                      <div class="small text-muted">{{ s.user_code }} &bull; {{ formatTime(s.start_time) }}–{{ formatTime(s.end_time) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="serviceLocationsAlternatives.length" class="mb-3">
                <div class="fw-semibold mb-2">Selected service available at other locations</div>
                <div class="border rounded p-2 mb-2" v-for="loc in serviceLocationsAlternatives" :key="`svc-${loc.location_code}`">
                  <div class="small fw-semibold">Location: {{ loc.location_code }}</div>
                  <div class="small text-muted mb-2">Services: {{ (loc.matched_service_codes || []).join(', ') || '—' }}</div>
                  <div v-if="loc.available_staff_same_slot?.length" class="mb-2">
                    <div class="small fw-semibold">Available at same slot</div>
                    <div class="list-group">
                      <div v-for="s in loc.available_staff_same_slot" :key="`svc-same-${loc.location_code}-${s.user_code}-${s.start_time}-${s.end_time}`" class="list-group-item">
                        <div class="fw-semibold">{{ s.staff_name || s.user_code }}</div>
                        <div class="small text-muted">{{ s.user_code }} &bull; {{ formatTime(s.start_time) }}–{{ formatTime(s.end_time) }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-if="loc.alternative_staff_time_slots?.length">
                    <div class="small fw-semibold">Alternative time slots</div>
                    <div class="list-group">
                      <div v-for="s in loc.alternative_staff_time_slots" :key="`svc-alt-${loc.location_code}-${s.user_code}-${s.start_time}-${s.end_time}`" class="list-group-item">
                        <div class="fw-semibold">{{ s.staff_name || s.user_code }}</div>
                        <div class="small text-muted">{{ s.user_code }} &bull; {{ formatTime(s.start_time) }}–{{ formatTime(s.end_time) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p v-if="approvalError" class="text-danger small mt-2 mb-0">{{ approvalError }}</p>
            </template>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeApprovalDialog">Cancel</button>
            <button
              class="btn btn-success"
              :disabled="!approvalSelectedStaff || approvalSaving"
              @click="submitApproveWithStaff"
            >{{ approvalSaving ? 'Approving...' : 'Approve & Assign Staff' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ASSIGN STAFF MODAL -->
    <div v-if="showAssignModal && assignAppt" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Assign Service Staff</h5>
            <button type="button" class="btn-close" @click="closeAssignModal"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted small mb-3">Appointment: <code>{{ assignAppt.appointment_code }}</code></p>
            <div v-if="staffLoading" class="text-center text-muted py-3">Loading staff...</div>
            <div v-else-if="!staffList.length" class="text-center text-muted py-3">No service staff found in your business</div>
            <div v-else class="d-flex flex-column gap-2" style="max-height:240px;overflow-y:auto">
              <div
                v-for="s in staffList" :key="s.user_code"
                :class="['staff-item', { selected: selectedStaff === s.user_code }]"
                @click="selectedStaff = s.user_code"
              >
                <div class="fw-semibold">{{ s.first_name }} {{ s.last_name }}</div>
                <div class="text-muted small">{{ s.user_code }}</div>
              </div>
            </div>
            <p v-if="assignError" class="text-danger small mt-2 mb-0">{{ assignError }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAssignModal">Cancel</button>
            <button class="btn btn-ams" :disabled="!selectedStaff || assigning" @click="assignStaff">{{ assigning ? 'Assigning...' : 'Assign' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'
import formatTime from "../../utils/formatTime.js";

const authStore = useAuthStore()
const appointments = ref([])
const loading = ref(true)
const error = ref('')

const showAssignModal = ref(false)
const assignAppt = ref(null)
const staffList = ref([])
const staffLoading = ref(false)
const selectedStaff = ref('')
const assigning = ref(false)
const assignError = ref('')

const showApproval = ref(false)
const approvalAppt = ref(null)
const availabilityLoading = ref(false)
const availabilityError = ref('')
const availableStaff = ref([])
const slotAlreadyBooked = ref(false)
const conflictingAppointments = ref([])
const alternativeTimeSameLocation = ref([])
const alternativeLocationSameTime = ref([])
const serviceLocationsAlternatives = ref([])
const approvalSelectedStaff = ref('')
const approvalSaving = ref(false)
const approvalError = ref('')

async function fetchList() {
  loading.value = true
  error.value = ''
  try {
    const biz = authStore.user?.business_code
    const res = await api.get('/appointments', { params: { ...(biz ? { business_code: biz } : {}), status: 'pending' } })
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

async function openApprovalDialog(appt) {
  approvalAppt.value = appt
  showApproval.value = true
  await loadApprovalAvailability(appt)
}

async function loadApprovalAvailability(appt) {
  availabilityError.value = ''
  availableStaff.value = []
  slotAlreadyBooked.value = false
  conflictingAppointments.value = []
  alternativeTimeSameLocation.value = []
  alternativeLocationSameTime.value = []
  serviceLocationsAlternatives.value = []
  approvalSelectedStaff.value = ''
  approvalError.value = ''

  availabilityLoading.value = true
  try {
    const res = await api.get(`/appointments/${appt.appointment_code}/availability`)
    const payload = res.data.data || {}
    availableStaff.value = payload.available_staff || []
    slotAlreadyBooked.value = Boolean(payload.location_slot_already_booked)
    conflictingAppointments.value = payload.conflicting_appointments || []
    alternativeTimeSameLocation.value = payload.alternatives?.different_time_same_location || []
    alternativeLocationSameTime.value = payload.alternatives?.different_location_same_time || []
    serviceLocationsAlternatives.value = payload.alternatives?.selected_service_other_locations || []
  } catch (err) {
    availabilityError.value = err.response?.data?.message || 'Could not check availability'
  } finally {
    availabilityLoading.value = false
  }
}

function closeApprovalDialog() {
  showApproval.value = false
  approvalAppt.value = null
  approvalError.value = ''
}

async function submitApproveWithStaff() {
  if (!approvalAppt.value || !approvalSelectedStaff.value) return
  approvalSaving.value = true
  approvalError.value = ''
  try {
    await api.post(`/appointments/${approvalAppt.value.appointment_code}/approve`, { staff_code: approvalSelectedStaff.value })
    closeApprovalDialog()
    await fetchList()
  } catch (err) {
    approvalError.value = err.response?.data?.message || 'Approval failed'
    await loadApprovalAvailability(approvalAppt.value)
  } finally {
    approvalSaving.value = false
  }
}

async function openAssignModal(appt) {
  assignAppt.value = appt
  selectedStaff.value = ''
  assignError.value = ''
  showAssignModal.value = true
  staffLoading.value = true
  try {
    const biz = authStore.user?.business_code
    const res = await api.get('/users/get-user', { params: { business_code: biz, user_type: 'service_staff' } })
    staffList.value = res.data.data || []
  } catch (_) {
    staffList.value = []
  } finally {
    staffLoading.value = false
  }
}

function closeAssignModal() {
  showAssignModal.value = false
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
    closeAssignModal()
  } catch (err) {
    const msg = err.response?.data?.message || 'Assignment failed'
    assignError.value = msg
  } finally {
    assigning.value = false
  }
}

onMounted(fetchList)
</script>


