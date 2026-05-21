<template>
  <div class="page">

    <div class="header">
      <div>
        <h2>Schedules</h2>
        <p class="sub">Manage staff schedules</p>
      </div>
      <button class="btn" @click="showCreateModal = true">+ New Schedule</button>
    </div>

    <div class="filters">
      <select v-model="bizFilter" @change="fetchSchedules">
        <option value="">All Businesses</option>
        <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">
          {{ biz.name }}
        </option>
      </select>
    </div>

    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>

      <table v-else class="table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Staff</th>
          <th>Day</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th width="100">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="schedule in schedules" :key="schedule.id">
          <td>{{ schedule.id }}</td>
          <td>{{ schedule.user_name || schedule.user_code || '—' }}</td>
          <td>{{ schedule.working_days }}</td>
          <td>{{ schedule.start_time }}</td>
          <td>{{ schedule.end_time }}</td>
          <td>
            <button class="delete-btn" @click="openDelete(schedule)">Delete</button>
          </td>
        </tr>
        <tr v-if="schedules.length === 0">
          <td colspan="6" class="empty">No schedules found</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- DELETE MODAL -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal delete-modal">
        <h3>Delete Schedule</h3>
        <p>Are you sure you want to delete this schedule?</p>
        <div class="actions">
          <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
          <button class="delete-confirm-btn" @click="deleteSchedule" :disabled="saving">
            {{ saving ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- CREATE MODAL -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>New Schedule</h3>
          <button class="close" @click="showCreateModal = false">✕</button>
        </div>
        <form class="form" @submit.prevent="createSchedule">
          <div class="field">
            <label>Business *</label>
            <select v-model="createForm.business_code" required>
              <option value="">Select business</option>
              <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">{{ biz.name }}</option>
            </select>
          </div>
          <div class="field">
            <label>Staff User Code *</label>
            <input v-model="createForm.user_code" placeholder="Staff user code" required />
          </div>
          <div class="field">
            <label>Working Day *</label>
            <select v-model="createForm.working_days" required>
              <option value="">Select day</option>
              <option v-for="d in days" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div class="field">
            <label>Employee Type *</label>
            <select v-model="createForm.employee_type" required>
              <option value="">Select type</option>
              <option value="permanent">Permanent</option>
              <option value="visiting">Visiting</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <div class="field">
            <label>Location Code</label>
            <input v-model="createForm.location_code" placeholder="Location code (optional)" />
          </div>
          <div class="field">
            <label>Start Time *</label>
            <input type="time" v-model="createForm.start_time" required />
          </div>
          <div class="field">
            <label>End Time *</label>
            <input type="time" v-model="createForm.end_time" required />
          </div>
          <p v-if="createError" class="error-msg">{{ createError }}</p>
          <button type="submit" class="save-btn" :disabled="saving">{{ saving ? 'Creating...' : 'Create' }}</button>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const schedules = ref([])
const businesses = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const createError = ref('')
const bizFilter = ref('')

const showDeleteModal = ref(false)
const showCreateModal = ref(false)
const selected = ref(null)

const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const createForm = ref({ business_code: '', user_code: '', working_days: '', employee_type: '', location_code: '', start_time: '', end_time: '' })

async function fetchSchedules() {
  loading.value = true
  error.value = ''
  try {
    const params = bizFilter.value ? { business_code: bizFilter.value } : {}
    const res = await api.get('/schedules/get-schedule', { params })
    schedules.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load schedules'
  } finally {
    loading.value = false
  }
}

function openDelete(schedule) {
  selected.value = schedule
  showDeleteModal.value = true
}

async function deleteSchedule() {
  saving.value = true
  try {
    await api.delete(`/schedules/delete-schedule${selected.value.id}`)
    showDeleteModal.value = false
    await fetchSchedules()
  } catch (err) {
    error.value = err.response?.data?.message || 'Delete failed'
  } finally {
    saving.value = false
  }
}

async function createSchedule() {
  saving.value = true
  createError.value = ''
  try {
    const payload = { ...createForm.value }
    if (!payload.location_code) delete payload.location_code
    await api.post('/schedules/create-schedule', payload)
    showCreateModal.value = false
    createForm.value = { business_code: '', user_code: '', working_days: '', employee_type: '', location_code: '', start_time: '', end_time: '' }
    await fetchSchedules()
  } catch (err) {
    createError.value = err.response?.data?.message || 'Create failed'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const [_, bizRes] = await Promise.allSettled([fetchSchedules(), api.get('/businesses/get-business')])
  if (bizRes.status === 'fulfilled') businesses.value = bizRes.value.data.data || []
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; align-items: center; justify-content: space-between; }
.header h2 { margin: 0; color: #1e293b; }
.sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }
.filters { display: flex; gap: 12px; }
.filters select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; min-width: 200px; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.delete-btn { border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; background: #fee2e2; color: #dc2626; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 10px; padding: 24px; width: 460px; max-width: 90%; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.delete-modal { text-align: center; }
.delete-modal h3 { margin: 0 0 12px; }
.delete-modal p { color: #64748b; margin-bottom: 16px; }
.actions { display: flex; gap: 10px; justify-content: center; }
.cancel-btn { background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.delete-confirm-btn { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.btn { background: #6366f1; color: white; border: none; padding: 9px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field select { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; }
.save-btn { background: #6366f1; color: white; border: none; padding: 10px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
