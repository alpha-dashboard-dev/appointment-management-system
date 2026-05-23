<template>
  <div class="page">
    <div class="header">
      <h2>My Appointments</h2>
      <router-link to="/client/book" class="book-btn">+ Book New</router-link>
    </div>
    <div class="filters">
      <select v-model="statusFilter" @change="fetchList">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="rescheduled">Rescheduled</option>
        <option value="rejected">Rejected</option>
        <option value="canceled">Canceled</option>
      </select>
    </div>
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <table v-else class="table">
        <thead><tr><th>Code</th><th>Date</th><th>Start</th><th>End</th><th>Status</th><th width="160">Actions</th></tr></thead>
        <tbody>
          <tr v-for="appt in appointments" :key="appt.appointment_code">
            <td><code>{{ appt.appointment_code }}</code></td>
            <td>{{ appt.appointment_start_date?.split('T')[0] ?? '—' }}</td>
            <td>{{ appt.start_time ?? '—' }}</td>
            <td>{{ appt.end_time ?? '—' }}</td>
            <td><span :class="['badge', appt.status]">{{ appt.status }}</span></td>
            <td>
              <button v-if="appt.status === 'rescheduled'" class="accept-btn" @click="respondReschedule(appt, 'accepted')">Accept</button>
              <button v-if="appt.status === 'rescheduled'" class="decline-btn" @click="respondReschedule(appt, 'rejected')">Reject</button>
              <button v-if="appt.status === 'pending'" class="cancel-btn" @click="cancelAppt(appt)">Cancel</button>
              <button class="view-btn" @click="openView(appt)">View</button>
            </td>
          </tr>
          <tr v-if="appointments.length === 0"><td colspan="6" class="empty">No appointments found</td></tr>
        </tbody>
      </table>
    </div>

    <!-- VIEW MODAL -->
    <div v-if="showViewModal && selected" class="modal-overlay" @click.self="showViewModal = false">
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

        <!-- Reschedule offer -->
        <div v-if="selected.status === 'rescheduled' && selected.reschedule_offer" class="reschedule-offer">
          <div class="offer-title">📅 Reschedule Offer</div>
          <div class="d-row"><span>New Date</span><span>{{ selected.reschedule_offer.appointment_start_date?.split('T')[0] ?? '—' }}</span></div>
          <div class="d-row"><span>New Start</span><span>{{ selected.reschedule_offer.start_time ?? '—' }}</span></div>
          <div class="d-row"><span>New End</span><span>{{ selected.reschedule_offer.end_time ?? '—' }}</span></div>
          <div class="offer-actions">
            <button class="accept-btn" @click="respondReschedule(selected, 'accepted'); showViewModal = false">Accept Offer</button>
            <button class="decline-btn" @click="respondReschedule(selected, 'rejected'); showViewModal = false">Reject Offer</button>
          </div>
        </div>

        <!-- Charges -->
        <div v-if="modalCharges.length" class="charges-section">
          <div class="charges-title">💳 Charges</div>
          <div class="d-row" v-for="ch in modalCharges" :key="ch.charge_code">
            <span>{{ ch.charge_name || ch.charge_code }}</span>
            <span class="charge-val">{{ ch.charge_value }} / {{ ch.charge_uom }}</span>
          </div>
        </div>

        <button class="close-modal-btn" @click="showViewModal = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const appointments = ref([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('')
const showViewModal = ref(false)
const selected = ref(null)
const modalCharges = ref([])

async function fetchList() {
  loading.value = true
  error.value = ''
  try {
    const params = {}
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
    await fetchList()
  } catch (_) {}
}

async function respondReschedule(appt, action) {
  try {
    await api.patch(`/appointments/${appt.appointment_code}/reschedule/respond`, { action })
    await fetchList()
  } catch (err) {
    alert(err.response?.data?.message || 'Action failed')
  }
}

async function openView(appt) {
  selected.value = appt
  modalCharges.value = []
  showViewModal.value = true
  try {
    const res = await api.get(`/appointments/${appt.appointment_code}/charges`)
    modalCharges.value = res.data.data || []
  } catch (_) {}
}

onMounted(fetchList)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; align-items: center; justify-content: space-between; }
.header h2 { margin: 0; color: #1e293b; }
.book-btn { background: #6366f1; color: white; text-decoration: none; padding: 9px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; }
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
.badge.rescheduled { background: #e0e7ff; color: #3730a3; }
.badge.rejected, .badge.canceled { background: #fee2e2; color: #991b1b; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.accept-btn { background: #dcfce7; color: #166534; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.decline-btn { background: #fee2e2; color: #dc2626; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.cancel-btn { background: #f1f5f9; color: #475569; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.view-btn { background: #e0e7ff; color: #3730a3; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 10px; padding: 24px; width: 460px; max-width: 92%; max-height: 85vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.detail-grid { display: flex; flex-direction: column; gap: 2px; }
.d-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
.reschedule-offer { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin-top: 14px; }
.offer-title { font-weight: 700; font-size: 13px; color: #1d4ed8; margin-bottom: 8px; }
.offer-actions { display: flex; gap: 8px; margin-top: 12px; }
.offer-actions .accept-btn, .offer-actions .decline-btn { padding: 7px 14px; font-size: 13px; }
.charges-section { margin-top: 14px; border-top: 1px solid #f1f5f9; padding-top: 12px; }
.charges-title { font-weight: 700; font-size: 13px; color: #1e293b; margin-bottom: 8px; }
.charge-val { font-weight: 600; color: #6366f1; }
.close-modal-btn { width: 100%; margin-top: 16px; background: #6366f1; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; }
</style>
