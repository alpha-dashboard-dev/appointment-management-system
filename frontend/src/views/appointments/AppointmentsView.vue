<script setup lang="ts">
// AppointmentsView — the core booking management page.
// Supports full CRUD plus domain-specific actions: status changes, rescheduling,
// and viewing the audit history of a specific appointment.
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import AppModal from '@/components/common/AppModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { appointmentApi } from '@/api/appointment.api'
import { businessApi } from '@/api/business.api'
import { locationApi } from '@/api/location.api'
import { useToast } from '@/composables/useToast'
import type { Appointment, Business, Location } from '@/types'

const { success, error } = useToast()
const appointments = ref<Appointment[]>([])
const businesses   = ref<Business[]>([])
const locations    = ref<Location[]>([])
const loading      = ref(true)
const search       = ref('')
const statusFilter = ref('')
const modal        = ref(false)
const isEdit       = ref(false)
const saving       = ref(false)
const historyModal = ref(false)
const history      = ref<any[]>([])
const statusModal  = ref(false)
const targetCode   = ref('')
const newStatus    = ref('')

const STATUSES = ['pending','confirmed','cancelled','completed','rescheduled']

const form = ref({
  business_code: '', appointment_start_date: '', appointment_end_date: '',
  start_time: '09:00', end_time: '10:00', location_code: '', notes: '', status: 'pending', user_role: '',
})

async function loadData() {
  loading.value = true
  try {
    const [aRes, bRes, lRes] = await Promise.all([
      appointmentApi.getAll(), businessApi.getAll(), locationApi.getAll(),
    ])
    appointments.value = aRes.data?.data ?? aRes.data ?? []
    businesses.value   = bRes.data?.data ?? bRes.data ?? []
    locations.value    = lRes.data?.data ?? lRes.data ?? []
  } catch { error('Failed to load data') }
  finally { loading.value = false }
}

onMounted(loadData)

function openCreate() {
  isEdit.value = false
  form.value = { business_code: '', appointment_start_date: '', appointment_end_date: '', start_time: '09:00', end_time: '10:00', location_code: '', notes: '', status: 'pending', user_role: '' }
  modal.value = true
}

function openEdit(a: Appointment) {
  isEdit.value = true
  targetCode.value = a.appointment_code
  form.value = {
    business_code: a.business_code, appointment_start_date: a.appointment_start_date,
    appointment_end_date: a.appointment_end_date, start_time: a.start_time, end_time: a.end_time,
    location_code: a.location_code || '', notes: a.notes || '', status: a.status, user_role: '',
  }
  modal.value = true
}

function openStatusChange(a: Appointment) {
  targetCode.value = a.appointment_code
  newStatus.value  = a.status
  statusModal.value = true
}

async function openHistory(a: Appointment) {
  try {
    const res = await appointmentApi.getHistory(a.appointment_code)
    history.value = res.data?.data ?? res.data ?? []
    historyModal.value = true
  } catch { error('Failed to load history') }
}

async function save() {
  if (!form.value.appointment_start_date) { error('Start date is required'); return }
  saving.value = true
  try {
    if (isEdit.value) {
      await appointmentApi.update(targetCode.value, form.value)
      success('Appointment updated')
    } else {
      await appointmentApi.create(form.value)
      success('Appointment created')
    }
    modal.value = false; loadData()
  } catch (err: any) {
    error(err?.response?.data?.message || 'Operation failed')
  } finally { saving.value = false }
}

async function saveStatus() {
  try {
    await appointmentApi.changeStatus(targetCode.value, newStatus.value)
    success('Status updated')
    statusModal.value = false; loadData()
  } catch (err: any) {
    error(err?.response?.data?.message || 'Failed to update status')
  }
}

const filtered = () => appointments.value.filter(a => {
  const matchSearch = a.appointment_code.toLowerCase().includes(search.value.toLowerCase()) || (a.notes || '').toLowerCase().includes(search.value.toLowerCase())
  const matchStatus = !statusFilter.value || a.status === statusFilter.value
  return matchSearch && matchStatus
})

function bizName(code: string) {
  return businesses.value.find(b => b.business_code === code)?.name || code
}

function locationName(code?: string) {
  if (!code) return '—'
  const l = locations.value.find(l => l.location_code === code)
  return l ? (l.city || l.location_type || code) : code
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div>
    <PageHeader title="Appointments" subtitle="Manage appointments" action-label="New Appointment" action-icon="M12 4v16m8-8H4" @action="openCreate"/>

    <div class="card">
      <!-- Filters -->
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <div class="relative max-w-xs flex-1">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="search" type="text" placeholder="Search appointments..." class="form-input pl-9"/>
        </div>
        <select v-model="statusFilter" class="form-select w-auto">
          <option value="">All Statuses</option>
          <option v-for="s in STATUSES" :key="s" :value="s" class="capitalize">{{ s }}</option>
        </select>
      </div>

      <!-- Status summary chips -->
      <div class="flex flex-wrap gap-2 mb-4">
        <div v-for="s in STATUSES" :key="s"
             :class="['flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all',
                      statusFilter === s ? 'ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100']"
             :style="statusFilter === s ? 'ring-color: #2e37a4;' : ''"
             @click="statusFilter = statusFilter === s ? '' : s">
          <StatusBadge :status="s" />
          <span class="text-gray-600">({{ appointments.filter(a => a.status === s).length }})</span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Business</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-10 text-gray-400">
                <svg class="w-5 h-5 animate-spin inline mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>Loading...
              </td>
            </tr>
            <tr v-else-if="!filtered().length">
              <td colspan="7" class="text-center py-10 text-gray-400">No appointments found</td>
            </tr>
            <tr v-for="a in filtered()" :key="a.appointment_code">
              <td class="font-mono text-xs text-gray-500">{{ a.appointment_code }}</td>
              <td class="text-gray-700 text-sm">{{ bizName(a.business_code) }}</td>
              <td class="text-gray-700 text-sm">{{ formatDate(a.appointment_start_date) }}</td>
              <td class="text-gray-600 text-sm">{{ a.start_time }} – {{ a.end_time }}</td>
              <td class="text-gray-500 text-sm">{{ locationName(a.location_code) }}</td>
              <td><StatusBadge :status="a.status" /></td>
              <td>
                <div class="flex items-center gap-1.5">
                  <button class="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium" @click="openEdit(a)">Edit</button>
                  <button class="text-xs px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100 font-medium" @click="openStatusChange(a)">Status</button>
                  <button class="text-xs px-2 py-1 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium" @click="openHistory(a)">History</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <AppModal :is-open="modal" :title="isEdit ? 'Edit Appointment' : 'New Appointment'" size="lg" @close="modal = false">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="form-label">Business</label>
          <select v-model="form.business_code" class="form-select">
            <option value="">— Select business —</option>
            <option v-for="b in businesses" :key="b.business_code" :value="b.business_code">{{ b.name }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Start Date <span class="text-red-500">*</span></label>
          <input v-model="form.appointment_start_date" type="date" class="form-input"/>
        </div>
        <div>
          <label class="form-label">End Date</label>
          <input v-model="form.appointment_end_date" type="date" class="form-input"/>
        </div>
        <div>
          <label class="form-label">Start Time</label>
          <input v-model="form.start_time" type="time" class="form-input"/>
        </div>
        <div>
          <label class="form-label">End Time</label>
          <input v-model="form.end_time" type="time" class="form-input"/>
        </div>
        <div>
          <label class="form-label">Location</label>
          <select v-model="form.location_code" class="form-select">
            <option value="">— None —</option>
            <option v-for="l in locations" :key="l.location_code" :value="l.location_code">{{ l.city || l.location_type }} ({{ l.location_code }})</option>
          </select>
        </div>
        <div>
          <label class="form-label">Status</label>
          <select v-model="form.status" class="form-select">
            <option v-for="s in STATUSES" :key="s" :value="s" class="capitalize">{{ s }}</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="form-label">Notes</label>
          <textarea v-model="form.notes" class="form-input" rows="2" placeholder="Additional notes..."></textarea>
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="modal = false">Cancel</button>
        <button class="btn-primary" :disabled="saving" @click="save">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ isEdit ? 'Save Changes' : 'Create Appointment' }}
        </button>
      </template>
    </AppModal>

    <!-- Status Change Modal -->
    <AppModal :is-open="statusModal" title="Change Appointment Status" size="sm" @close="statusModal = false">
      <div>
        <label class="form-label">New Status</label>
        <select v-model="newStatus" class="form-select">
          <option v-for="s in STATUSES" :key="s" :value="s" class="capitalize">{{ s }}</option>
        </select>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="statusModal = false">Cancel</button>
        <button class="btn-primary" @click="saveStatus">Update Status</button>
      </template>
    </AppModal>

    <!-- History Modal -->
    <AppModal :is-open="historyModal" title="Appointment History" size="lg" @close="historyModal = false">
      <div v-if="!history.length" class="py-6 text-center text-gray-400">No history available</div>
      <div v-else class="space-y-3">
        <div v-for="(h, i) in history" :key="i"
             class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
          <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800 capitalize">{{ h.action }}</p>
            <p class="text-xs text-gray-500">by {{ h.changed_by || '—' }}</p>
          </div>
          <span class="text-xs text-gray-400">{{ h.created_at ? new Date(h.created_at).toLocaleString() : '' }}</span>
        </div>
      </div>
    </AppModal>
  </div>
</template>
