<template>
  <div class="ams-page">
    <div><h2 class="mb-0">Pending Requests</h2></div>
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr><th class="ps-3">Code</th><th>Date</th><th>Start</th><th>End</th><th>Location</th><th class="pe-3" style="width:240px">Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="appt in appointments" :key="appt.appointment_code">
              <td class="ps-3"><code>{{ appt.appointment_code }}</code></td>
              <td>{{ appt.appointment_start_date?.split('T')[0] ?? '—' }}</td>
              <td>{{ appt.start_time ?? '—' }}</td>
              <td>{{ appt.end_time ?? '—' }}</td>
              <td>{{ appt.location_code ?? '—' }}</td>
              <td class="pe-3">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openAssignModal(appt)">Assign Staff</button>
                <button class="btn btn-sm btn-success me-1" @click="changeStatus(appt, 'approved')">Approve</button>
                <button class="btn btn-sm btn-outline-danger" @click="changeStatus(appt, 'rejected')">Reject</button>
              </td>
            </tr>
            <tr v-if="appointments.length === 0"><td colspan="6" class="text-center text-muted py-4">No pending requests</td></tr>
          </tbody>
        </table>
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


