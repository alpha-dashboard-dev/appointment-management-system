<template>
  <div class="ams-page">
    <div class="d-flex align-items-center justify-content-between">
      <h2 class="mb-0">My Appointments</h2>
      <router-link to="/client/book" class="btn btn-ams">+ Book New</router-link>
    </div>
    <div class="d-flex gap-2">
      <select v-model="statusFilter" @change="fetchList" class="form-select" style="max-width:200px">
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
    <div class="card shadow-sm border-0">
      <div class="card-body p-0 overflow-auto">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Appointment Code</th>
              <th>Business Name</th>
              <th>Start Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th class="pe-3" style="width:200px">Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="appt in appointments" :key="appt.appointment_code">
              <td class="ps-3"><code>{{ appt.appointment_code }}</code></td>
              <td>{{appt.business_name}}</td>
              <td>{{ formatDate(appt.appointment_start_date) }}</td>
              <td>{{ formatTime(appt.start_time) }}</td>
              <td>{{ formatTime(appt.end_time) }}</td>
              <td><span :class="['ams-badge', appt.status]">{{ appt.status }}</span></td>
              <td class="pe-3">
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <button class="dropdown-item" @click="openView(appt)">
                        <i class="bi bi-eye me-2"></i>
                        View
                      </button>
                    </li>
                    <li v-if="appt.status === 'rescheduled'">
                      <button class="dropdown-item" @click="respondReschedule(appt, 'accepted')">
                        <i class="bi bi-check2-circle me-2"></i>
                        Accept
                      </button>
                    </li>
                    <li v-if="appt.status === 'rescheduled'">
                      <button class="dropdown-item text-danger" @click="respondReschedule(appt, 'rejected')">
                        <i class="bi bi-x-circle me-2"></i>
                        Reject
                      </button>
                    </li>
                    <li v-if="appt.status === 'pending'">
                      <button class="dropdown-item text-danger" @click="cancelAppt(appt)">
                        <i class="bi bi-x-circle me-2"></i>
                        Cancel
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="appointments.length === 0"><td colspan="6" class="text-center text-muted py-4">No appointments found</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- VIEW MODAL -->
    <div v-if="showViewModal && selected" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Appointment Details</h5>
            <button type="button" class="btn-close" @click="showViewModal = false"></button>
          </div>
          <div class="modal-body">
            <dl class="row">
<!--              <dt class="col-5 text-muted">Appointment Code</dt><dd class="col-7"><code>{{ selected.appointment_code }}</code></dd>-->
              <dt class="col-5 text-muted">Buisness Name</dt><dd class="col-7">{{ selected.business_name }}</dd>
              <dt class="col-5 text-muted">Status</dt><dd class="col-7"><span :class="['ams-badge', selected.status]">{{ selected.status }}</span></dd>
              <dt class="col-5 text-muted">Start Date</dt><dd class="col-7">{{ formatDate(selected.appointment_start_date) }}</dd>
              <dt class="col-5 text-muted">Start Time</dt><dd class="col-7">{{ formatTime(selected.start_time) }}</dd>
              <dt class="col-5 text-muted">End Time</dt><dd class="col-7">{{ formatTime(selected.end_time) }}</dd>
              <dt class="col-5 text-muted">Location</dt><dd class="col-7">{{ selected.location_address ?? '—' }}</dd>
              <dt class="col-5 text-muted">Notes</dt><dd class="col-7">{{ selected.notes ?? '—' }}</dd>
            </dl>

            <!-- Reschedule offer -->
            <div v-if="selected.status === 'rescheduled' && selected.reschedule_offer" class="alert" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px">
              <div class="fw-bold text-primary mb-2">📅 Reschedule Offer</div>
              <dl class="row mb-2">
                <dt class="col-5 text-muted">New Date</dt><dd class="col-7">{{ selected.reschedule_offer.appointment_start_date?.split('T')[0] ?? '—' }}</dd>
                <dt class="col-5 text-muted">New Start</dt><dd class="col-7">{{ selected.reschedule_offer.start_time ?? '—' }}</dd>
                <dt class="col-5 text-muted">New End</dt><dd class="col-7">{{ selected.reschedule_offer.end_time ?? '—' }}</dd>
              </dl>
              <div class="d-flex gap-2">
                <button class="btn btn-success btn-sm" @click="respondReschedule(selected, 'accepted'); showViewModal = false">Accept Offer</button>
                <button class="btn btn-outline-danger btn-sm" @click="respondReschedule(selected, 'rejected'); showViewModal = false">Reject Offer</button>
              </div>
            </div>

            <!-- Charges -->
            <div v-if="modalCharges.length" class="mt-3">
              <div class="fw-bold text-dark mb-2">💳 Charges</div>
              <dl class="row">
                <template v-for="ch in modalCharges" :key="ch.charge_code">
                  <dt class="col-7">{{ ch.name || ch.charge_code }}</dt>
                  <dd class="col-5 text-end fw-semibold text-primary">{{ ch.charge_value }} / {{ ch.charge_uom }}</dd>
                </template>
              </dl>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showViewModal = false">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import formatDate from "../../utils/formatDate.js";
import formatTime from "../../utils/formatTime.js";

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
    const params = {
      include: "business,services.service,location"
    }
    if (statusFilter.value) params.status = statusFilter.value
    const res = await api.get('/appointments/get-all-appointments', { params })
    appointments.value = (res.data.data || []).map(
        (appointments) => ({
          ...appointments,
          business_name: appointments.business?.name || '',
          location_address: appointments.location?.address + " " + appointments.location?.street + " " + appointments.location?.city|| '',
          // service_name: appointments.service?.name || '',
        })
    )
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load Appointments'
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
    await api.patch(`/appointments/respond-to-reschedule/${appt.appointment_code}`, { action })
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
    const res = await api.get(`/appointments/get-appointment-charges/${appt.appointment_code}`)
    modalCharges.value = res.data.data || []
  } catch (_) {}
}

onMounted(fetchList)
</script>


