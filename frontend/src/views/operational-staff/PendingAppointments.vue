<template>
  <div class="page">
    <div class="header"><h2>Pending Requests</h2></div>
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <table v-else class="table">
        <thead><tr><th>Code</th><th>Date</th><th>Start</th><th>End</th><th>Location</th><th width="220">Actions</th></tr></thead>
        <tbody>
          <tr v-for="appt in appointments" :key="appt.appointment_code">
            <td><code>{{ appt.appointment_code }}</code></td>
            <td>{{ appt.appointment_start_date?.split('T')[0] ?? '—' }}</td>
            <td>{{ appt.start_time ?? '—' }}</td>
            <td>{{ appt.end_time ?? '—' }}</td>
            <td>{{ appt.location_code ?? '—' }}</td>
            <td>
              <button class="assign-btn" @click="openAssignModal(appt)">Assign Staff</button>
              <button class="approve-btn" @click="changeStatus(appt, 'approved')">Approve</button>
              <button class="reject-btn" @click="changeStatus(appt, 'rejected')">Reject</button>
            </td>
          </tr>
          <tr v-if="appointments.length === 0"><td colspan="6" class="empty">No pending requests</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ASSIGN STAFF MODAL -->
    <div v-if="showAssignModal && assignAppt" class="modal-overlay" @click.self="closeAssignModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Assign Service Staff</h3>
          <button class="close" @click="closeAssignModal">✕</button>
        </div>
        <p class="modal-sub">Appointment: <code>{{ assignAppt.appointment_code }}</code></p>

        <div v-if="staffLoading" class="loading">Loading staff...</div>
        <div v-else-if="!staffList.length" class="empty">No service staff found in your business</div>
        <div v-else class="staff-list">
          <div
            v-for="s in staffList"
            :key="s.user_code"
            class="staff-item"
            :class="{ selected: selectedStaff === s.user_code }"
            @click="selectedStaff = s.user_code"
          >
            <div class="staff-name">{{ s.first_name }} {{ s.last_name }}</div>
            <div class="staff-meta">{{ s.user_code }}</div>
          </div>
        </div>

        <p v-if="assignError" class="error-msg">{{ assignError }}</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeAssignModal">Cancel</button>
          <button class="save-btn" :disabled="!selectedStaff || assigning" @click="assignStaff">
            {{ assigning ? 'Assigning...' : 'Assign' }}
          </button>
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

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header h2 { margin: 0; color: #1e293b; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 4px 0; }
.assign-btn { background: #e0e7ff; color: #3730a3; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.approve-btn { background: #dcfce7; color: #166534; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.reject-btn { background: #fee2e2; color: #dc2626; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 10px; padding: 24px; width: 460px; max-width: 92%; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.modal-sub { margin: 0 0 14px; font-size: 13px; color: #64748b; }
.staff-list { display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto; margin-bottom: 12px; }
.staff-item { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; cursor: pointer; transition: background 0.15s; }
.staff-item:hover { background: #f8fafc; }
.staff-item.selected { border-color: #6366f1; background: #eff0ff; }
.staff-name { font-size: 14px; font-weight: 600; color: #1e293b; }
.staff-meta { font-size: 12px; color: #64748b; margin-top: 2px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 12px; }
.cancel-btn { padding: 8px 16px; border-radius: 6px; background: #f1f5f9; color: #374151; border: none; font-size: 14px; cursor: pointer; }
.save-btn { background: #6366f1; color: white; border: none; padding: 8px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
