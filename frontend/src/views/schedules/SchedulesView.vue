<script setup lang="ts">
// SchedulesView — management page for staff availability windows.
// Loads supporting dropdowns (businesses, locations, users) to build the schedule form.
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import AppModal from '@/components/common/AppModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { scheduleApi } from '@/api/schedule.api'
import { businessApi } from '@/api/business.api'
import { locationApi } from '@/api/location.api'
import { userApi } from '@/api/user.api'
import { useToast } from '@/composables/useToast'
import type { Schedule, Business, Location, User } from '@/types'

const { success, error } = useToast()
const schedules  = ref<Schedule[]>([])
const businesses = ref<Business[]>([])
const locations  = ref<Location[]>([])
const users      = ref<User[]>([])
const loading    = ref(true)
const modal      = ref(false)
const isEdit     = ref(false)
const saving     = ref(false)
const deleteConfirm  = ref(false)
const deleteLoading  = ref(false)
const targetId       = ref(0)

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const selectedDays = ref<string[]>([])

const form = ref({
  business_code: '', user_code: '', employee_type: 'staff', location_code: '',
  start_time: '09:00', end_time: '17:00',
})

async function loadData() {
  loading.value = true
  try {
    const [sRes, bRes, lRes, uRes] = await Promise.all([
      scheduleApi.getAll(), businessApi.getAll(), locationApi.getAll(), userApi.getAll(),
    ])
    schedules.value  = sRes.data?.data ?? sRes.data ?? []
    businesses.value = bRes.data?.data ?? bRes.data ?? []
    locations.value  = lRes.data?.data ?? lRes.data ?? []
    users.value      = uRes.data?.data ?? uRes.data ?? []
  } catch { error('Failed to load data') }
  finally { loading.value = false }
}

onMounted(loadData)

function openCreate() {
  isEdit.value = false
  selectedDays.value = []
  form.value = { business_code: '', user_code: '', employee_type: 'staff', location_code: '', start_time: '09:00', end_time: '17:00' }
  modal.value = true
}

function openEdit(s: Schedule) {
  isEdit.value = true
  targetId.value = s.id
  selectedDays.value = typeof s.working_days === 'string' ? s.working_days.split(',').map(d => d.trim()) : s.working_days
  form.value = {
    business_code: s.business_code, user_code: s.user_code, employee_type: s.employee_type,
    location_code: s.location_code || '', start_time: s.start_time, end_time: s.end_time,
  }
  modal.value = true
}

function openDelete(s: Schedule) {
  targetId.value = s.id
  deleteConfirm.value = true
}

function toggleDay(d: string) {
  if (selectedDays.value.includes(d)) {
    selectedDays.value = selectedDays.value.filter(x => x !== d)
  } else {
    selectedDays.value.push(d)
  }
}

async function save() {
  if (!selectedDays.value.length) { error('Select at least one working day'); return }
  saving.value = true
  try {
    const payload = { ...form.value, working_days: selectedDays.value }
    if (isEdit.value) {
      await scheduleApi.update(targetId.value, payload)
      success('Schedule updated')
    } else {
      await scheduleApi.create(payload)
      success('Schedule created')
    }
    modal.value = false; loadData()
  } catch (err: any) {
    error(err?.response?.data?.message || 'Operation failed')
  } finally { saving.value = false }
}

async function deleteSchedule() {
  deleteLoading.value = true
  try {
    await scheduleApi.delete(targetId.value)
    success('Schedule deleted')
    deleteConfirm.value = false; loadData()
  } catch { error('Failed to delete') }
  finally { deleteLoading.value = false }
}

function userName(code: string) {
  const u = users.value.find(u => u.user_code === code)
  return u?.name || u?.email || code
}

function bizName(code: string) {
  return businesses.value.find(b => b.business_code === code)?.name || code
}

function formatDays(days: any) {
  if (Array.isArray(days)) return days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ')
  if (typeof days === 'string') return days.split(',').map((d: string) => d.trim().charAt(0).toUpperCase() + d.trim().slice(1, 3)).join(', ')
  return '—'
}
</script>

<template>
  <div>
    <PageHeader title="Schedules" subtitle="Manage staff work schedules" action-label="Add Schedule" action-icon="M12 4v16m8-8H4" @action="openCreate"/>

    <div class="card">
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Business</th>
              <th>Working Days</th>
              <th>Hours</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-10 text-gray-400">
                <svg class="w-5 h-5 animate-spin inline mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>Loading...
              </td>
            </tr>
            <tr v-else-if="!schedules.length">
              <td colspan="6" class="text-center py-10 text-gray-400">No schedules found</td>
            </tr>
            <tr v-for="s in schedules" :key="s.id">
              <td class="font-medium text-gray-800">{{ userName(s.user_code) }}</td>
              <td class="text-gray-600 text-sm">{{ bizName(s.business_code) }}</td>
              <td class="text-gray-600 text-sm">{{ formatDays(s.working_days) }}</td>
              <td class="text-gray-600 text-sm">{{ s.start_time }} – {{ s.end_time }}</td>
              <td>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 capitalize">{{ s.employee_type }}</span>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <button class="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium" @click="openEdit(s)">Edit</button>
                  <button class="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 font-medium" @click="openDelete(s)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal :is-open="modal" :title="isEdit ? 'Edit Schedule' : 'Add Schedule'" size="lg" @close="modal = false">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="form-label">Business</label>
          <select v-model="form.business_code" class="form-select">
            <option value="">— None —</option>
            <option v-for="b in businesses" :key="b.business_code" :value="b.business_code">{{ b.name }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">User</label>
          <select v-model="form.user_code" class="form-select">
            <option value="">— Select user —</option>
            <option v-for="u in users" :key="u.user_code" :value="u.user_code">{{ u.name || u.email }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Employee Type</label>
          <select v-model="form.employee_type" class="form-select">
            <option value="staff">Staff</option>
            <option value="doctor">Doctor</option>
            <option value="technician">Technician</option>
          </select>
        </div>
        <div>
          <label class="form-label">Location</label>
          <select v-model="form.location_code" class="form-select">
            <option value="">— None —</option>
            <option v-for="l in locations" :key="l.location_code" :value="l.location_code">{{ l.city || l.location_type }} ({{ l.location_code }})</option>
          </select>
        </div>
        <div>
          <label class="form-label">Start Time</label>
          <input v-model="form.start_time" type="time" class="form-input"/>
        </div>
        <div>
          <label class="form-label">End Time</label>
          <input v-model="form.end_time" type="time" class="form-input"/>
        </div>
        <div class="sm:col-span-2">
          <label class="form-label">Working Days <span class="text-red-500">*</span></label>
          <div class="flex flex-wrap gap-2 mt-1">
            <button
              v-for="d in DAYS" :key="d"
              type="button"
              :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize border',
                       selectedDays.includes(d) ? 'border-transparent text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300']"
              :style="selectedDays.includes(d) ? 'background-color: #2e37a4;' : ''"
              @click="toggleDay(d)"
            >{{ d }}</button>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="modal = false">Cancel</button>
        <button class="btn-primary" :disabled="saving" @click="save">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ isEdit ? 'Save Changes' : 'Create Schedule' }}
        </button>
      </template>
    </AppModal>

    <ConfirmDialog
      :is-open="deleteConfirm"
      title="Delete Schedule"
      message="Are you sure you want to delete this schedule?"
      confirm-label="Delete"
      :danger="true"
      :loading="deleteLoading"
      @confirm="deleteSchedule"
      @cancel="deleteConfirm = false"
    />
  </div>
</template>
