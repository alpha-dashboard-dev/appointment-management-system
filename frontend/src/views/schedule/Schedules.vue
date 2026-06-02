 <template>
  <div class="ams-page">

    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Schedules</h2>
        <p class="text-muted small mb-0">Manage staff schedules</p>
      </div>
      <button class="btn btn-ams" @click="showCreateModal = true">+ New Schedule</button>
    </div>

    <div v-if="isAdmin" class="d-flex gap-2">
      <select v-model="bizFilter" @change="fetchSchedules" class="form-select" style="max-width:240px">
        <option value="">All Businesses</option>
        <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">{{ biz.name }}</option>
      </select>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">ID</th>
              <th>Staff</th>
              <th>Day</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th class="pe-3" style="width:120px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="schedule in schedules" :key="schedule.id">
              <td class="ps-3">{{ schedule.id }}</td>
              <td>{{ schedule.user_name || schedule.user_code || '—' }}</td>
              <td class="text-capitalize">{{ schedule.working_days }}</td>
              <td>{{ formatTime(schedule.start_time) }}</td>
              <td>{{ formatTime(schedule.end_time) }}</td>
              <td><span :class="['badge', schedule.status === 'active' ? 'bg-success' : 'bg-secondary']">{{ schedule.status === 'active' ? 'Active' : 'Inactive' }}</span></td>
              <td class="pe-3">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(schedule)">Edit</button>
                <button class="btn btn-sm btn-outline-danger" @click="openDelete(schedule)">Delete</button>
              </td>
            </tr>
            <tr v-if="schedules.length === 0">
              <td colspan="7" class="text-center text-muted py-4">No schedules found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Schedule</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <form @submit.prevent="updateSchedule">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Working Day *</label>
                <select v-model="editForm.working_days" class="form-select" required>
                  <option v-for="d in DAY_KEYS" :key="d" :value="d">{{ DAY_LABELS[d] }}</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Location</label>
                <select v-model="editForm.location_code" class="form-select">
                  <option value="">No specific location</option>
                  <option v-for="loc in locationsList" :key="loc.location_code" :value="loc.location_code">
                    {{ loc.address + " " + loc.street + " " + loc.city }}
                  </option>
                </select>
              </div>
              <div class="row g-3">
                <div class="col-6">
                  <label class="form-label fw-semibold">Start Time *</label>
                  <input type="time" v-model="editForm.start_time" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">End Time *</label>
                  <input type="time" v-model="editForm.end_time" class="form-control" required />
                </div>
              </div>
              <div class="mt-3">
                <label class="form-label fw-semibold">Status *</label>
                <select v-model="editForm.status" class="form-select" required>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <p v-if="editError" class="text-danger small mt-2 mb-0">{{ editError }}</p>
            </div>
            <div class="modal-footer d-flex gap-2 justify-content-end align-items-center">
              <button type="button" class="btn btn-secondary" @click="showEditModal = false">Cancel</button>
              <button type="submit" class="btn btn-ams" :disabled="saving">{{ saving ? 'Saving...' : 'Save Changes' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRM MODAL -->
    <div v-if="showDeleteModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Schedule</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <p class="mb-0">Delete this schedule?</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger btn-sm" @click="deleteSchedule" :disabled="saving">{{ saving ? '...' : 'Delete' }}</button>
          </div>
        </div>
      </div>
    </div>

<!-- if    -->
    <!-- CREATE MODAL -->
    <div v-if="showCreateModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style="max-height:90vh">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">New Weekly Schedule</h5>
            <button type="button" class="btn-close" @click="showCreateModal = false"></button>
          </div>
          <form @submit.prevent="createSchedule">
            <div class="modal-body" style="overflow-y:auto; max-height:calc(90vh - 120px)">

              <!-- Business (admin only) -->
              <div v-if="isAdmin" class="mb-3">
                <label class="form-label fw-semibold">Business *</label>
                <select v-model="createForm.business_code" class="form-select" required @change="onBusinessChange">
                  <option value="">Select business</option>
                  <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">{{ biz.name }}</option>
                </select>
              </div>

              <!-- Staff dropdown -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Staff Member *</label>
                <select v-model="createForm.user_code" class="form-select" required :disabled="staffList.length === 0">
                  <option value="">{{ staffList.length === 0 ? 'No staff available' : 'Select staff' }}</option>
                  <option v-for="u in staffList" :key="u.user_code" :value="u.user_code">{{ u.name }} ({{ u.user_type }})</option>
                </select>
              </div>


              <!-- Location -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Location</label>
                <select v-model="createForm.location_code" class="form-select">
                  <option value="">No specific location</option>
                  <option v-for="loc in locationsList" :key="loc.location_code" :value="loc.location_code">
                    {{ loc.address + " " + loc.street + " " + loc.city }}
                  </option>
                </select>
              </div>

              <div class="mb-4 border rounded-3 p-3 bg-light-subtle">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Working Days Setup</label>
                  <div class="d-flex gap-4 flex-wrap">
                    <div class="form-check">
                      <input id="modeWholeWeek" v-model="scheduleMode" class="form-check-input" type="radio" value="whole_week" />
                      <label class="form-check-label" for="modeWholeWeek">Whole week is working</label>
                    </div>
                    <div class="form-check">
                      <input id="modeCustomDays" v-model="scheduleMode" class="form-check-input" type="radio" value="custom" />
                      <label class="form-check-label" for="modeCustomDays">Custom working days</label>
                    </div>
                  </div>
                  <small v-if="scheduleMode === 'custom'" class="text-muted">Select only the working days. Other days will be non-working by default.</small>
                </div>

                <div class="form-check form-switch mb-3">
                  <input id="sameTimeAllDays" v-model="sameTimeForAllDays" class="form-check-input" type="checkbox" />
                  <label class="form-check-label fw-semibold" for="sameTimeAllDays">Use same time for all days</label>
                </div>
                <div v-if="sameTimeForAllDays" class="row g-3">
                  <div class="col-6">
                    <label class="form-label fw-semibold">Shared Start Time *</label>
                    <input type="time" v-model="sharedSchedule.start_time" class="form-control" required />
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-semibold">Shared End Time *</label>
                    <input type="time" v-model="sharedSchedule.end_time" class="form-control" required />
                  </div>
                </div>
              </div>

              <!-- Weekly schedule grid -->
              <div class="week-grid-wrap">
                <div class="week-grid">
                  <div class="week-grid-header" :class="{ 'with-working': scheduleMode === 'custom' }">
                    <span>Day</span>
                    <span v-if="scheduleMode === 'custom'" class="text-center">Working</span>
                    <span>Start Time</span>
                    <span>End Time</span>
                  </div>
                  <div v-for="day in weekDays" :key="day.key" class="week-grid-row" :class="{ 'with-working': scheduleMode === 'custom' }">
                    <span class="day-label">{{ day.label }}</span>
                    <div v-if="scheduleMode === 'custom'" class="text-center">
                      <input type="checkbox" v-model="day.is_working" class="form-check-input" />
                    </div>
                    <input
                      type="time"
                      v-model="day.start_time"
                      class="form-control form-control-sm"
                      :disabled="sameTimeForAllDays"
                      required
                    />
                    <input
                      type="time"
                      v-model="day.end_time"
                      class="form-control form-control-sm"
                      :disabled="sameTimeForAllDays"
                      required
                    />
                  </div>
                </div>
              </div>

              <p v-if="createError" class="text-danger small mt-3 mb-0">{{ createError }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showCreateModal = false">Cancel</button>
              <button type="submit" class="btn btn-ams" :disabled="saving">{{ saving ? 'Creating...' : 'Create Schedule' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'
import formatTime from "../../utils/formatTime.js";

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.role === 'admin')
const schedules = ref([])
const businesses = ref([])
const staffList = ref([])
const locationsList = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const createError = ref('')
const bizFilter = ref('')

const showDeleteModal = ref(false)
const showEditModal = ref(false)
const showCreateModal = ref(false)
const selected = ref(null)

const editForm = ref({ working_days: '',  location_code: '', start_time: '', end_time: '', status: 'active' })
const editError = ref('')

function openEdit(schedule) {
  selected.value = schedule
  editForm.value = {
    working_days: schedule.working_days,
    // employee_type: schedule.employee_type || '',
    location_code: schedule.location_code || '',
    start_time: (schedule.start_time || '').slice(0, 5),
    end_time: (schedule.end_time || '').slice(0, 5),
    status: schedule.status || 'active',
  }
  editError.value = ''
  showEditModal.value = true
}

async function updateSchedule() {
  saving.value = true
  editError.value = ''
  try {
    const payload = { ...editForm.value }
    payload.start_time = (payload.start_time || '').slice(0, 5)
    payload.end_time = (payload.end_time || '').slice(0, 5)
    if (!payload.location_code) delete payload.location_code
    await api.put(`/schedules/update-schedule${selected.value.id}`, payload)
    showEditModal.value = false
    await refreshSchedules()
  } catch (err) {
    editError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

async function refreshSchedules() {
  try {
    const params = bizFilter.value ? { business_code: bizFilter.value } : {}
    const res = await api.get('/schedules/get-schedule', { params })
    schedules.value = res.data.data || []
  } catch (_) {}
}

const DAY_KEYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAY_LABELS = { monday:'Monday', tuesday:'Tuesday', wednesday:'Wednesday', thursday:'Thursday', friday:'Friday', saturday:'Saturday', sunday:'Sunday' }

function freshWeekDays() {
  return DAY_KEYS.map(k => ({ key: k, label: DAY_LABELS[k], start_time: '09:00', end_time: '17:00', is_working: true }))
}

const createForm = ref({ business_code: '', user_code: '', location_code: '' })
const weekDays = ref(freshWeekDays())
const scheduleMode = ref('whole_week')
const sameTimeForAllDays = ref(false)
const sharedSchedule = ref({ start_time: '09:00', end_time: '17:00' })

function applySharedTimesToAllDays() {
  weekDays.value = weekDays.value.map(day => ({
    ...day,
    start_time: sharedSchedule.value.start_time,
    end_time: sharedSchedule.value.end_time,
  }))
}

watch(sameTimeForAllDays, (enabled) => {
  if (!enabled) return
  applySharedTimesToAllDays()
})

watch(scheduleMode, (mode) => {
  if (mode === 'whole_week') {
    weekDays.value = weekDays.value.map(day => ({ ...day, is_working: true }))
    return
  }
  weekDays.value = weekDays.value.map(day => ({ ...day, is_working: false }))
})

watch(sharedSchedule, () => {
  if (!sameTimeForAllDays.value) return
  applySharedTimesToAllDays()
}, { deep: true })

async function fetchStaff(business_code) {
  staffList.value = []
  if (!business_code) return
  try {
    const res = await api.get('/users/get-users', { params: { business_code } })
    const all = res.data.data || []
    staffList.value = all.filter(u => u.user_type === 'operational_staff' || u.user_type === 'service_staff')
  } catch (_) {}
}

async function fetchLocations(business_code) {
  locationsList.value = []
  if (!business_code) return
  try {
    const res = await api.get('/locations/get-location', { params: { business_code } })
    locationsList.value = res.data.data || []
  } catch (_) {}
}

async function onBusinessChange() {
  createForm.value.user_code = ''
  createForm.value.location_code = ''
  await Promise.all([fetchStaff(createForm.value.business_code), fetchLocations(createForm.value.business_code)])
}

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
  createError.value = ''
  const business_code = isAdmin.value ? createForm.value.business_code : (authStore.user?.business_code || '')

  if (scheduleMode.value === 'custom' && !weekDays.value.some(d => d.is_working)) {
    createError.value = 'Select at least one working day for custom setup'
    return
  }

  const entries = weekDays.value.map(d => ({
    business_code,
    user_code: createForm.value.user_code,
    working_days: d.key,
    // employee_type: createForm.value.employee_type,
    location_code: createForm.value.location_code || undefined,
    start_time: d.start_time,
    end_time: d.end_time,
    status: scheduleMode.value === 'whole_week' ? 'active' : (d.is_working ? 'active' : 'inactive'),
  }))

  saving.value = true
  try {
    await api.post('/schedules/bulk-create-schedule', entries)
    showCreateModal.value = false
    createForm.value = { business_code: '', user_code: '', employee_type: '', location_code: '' }
    weekDays.value = freshWeekDays()
    scheduleMode.value = 'whole_week'
    sameTimeForAllDays.value = false
    sharedSchedule.value = { start_time: '09:00', end_time: '17:00' }
    staffList.value = []
    locationsList.value = []
    await fetchSchedules()
  } catch (err) {
    createError.value = err.response?.data?.message || 'Create failed'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!isAdmin.value) {
    const bizCode = authStore.user?.business_code || ''
    createForm.value.business_code = bizCode
    await Promise.all([fetchSchedules(), fetchStaff(bizCode), fetchLocations(bizCode)])
    return
  }
  const [_, bizRes] = await Promise.allSettled([fetchSchedules(), api.get('/businesses/get-business')])
  if (bizRes.status === 'fulfilled') businesses.value = bizRes.value.data.data || []
})
</script>

<style scoped>
.week-grid-wrap {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.week-grid {
  width: 100%;
}

.week-grid-header,
.week-grid-row {
  display: grid;
  grid-template-columns: 110px 1fr 1fr;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.week-grid-header.with-working,
.week-grid-row.with-working {
  grid-template-columns: 110px 90px 1fr 1fr;
}

.week-grid-row > .form-control {
  min-width: 0;
}

.week-grid-header {
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e2e8f0;
}

.week-grid-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}

.week-grid-row:last-child {
  border-bottom: none;
}

.day-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
</style>

