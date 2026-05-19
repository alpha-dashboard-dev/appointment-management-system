<template>
  <div class="page">

    <div class="header">
      <div>
        <h2>Location Services</h2>
        <p class="sub">Map services to locations</p>
      </div>
      <button class="btn" @click="openCreate">+ Add Mapping</button>
    </div>

    <div class="filters">
      <select v-model="bizFilter" @change="fetchMappings">
        <option value="">All Businesses</option>
        <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">
          {{ biz.name }}
        </option>
      </select>
      <select v-model="locFilter" @change="fetchMappings">
        <option value="">All Locations</option>
        <option v-for="loc in locations" :key="loc.location_code" :value="loc.location_code">
          {{ loc.location_code }} — {{ loc.city || loc.address || loc.location_type }}
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
          <th>Business</th>
          <th>Location</th>
          <th>Service</th>
          <th>Availability</th>
          <th width="140">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in mappings" :key="item.id">
          <td>{{ item.id }}</td>
          <td><code>{{ item.business_code }}</code></td>
          <td><code>{{ item.location_code }}</code></td>
          <td><code>{{ item.service_code }}</code></td>
          <td>
              <span :class="['badge', item.availability === 'available' ? 'active' : 'inactive']">
                {{ item.availability }}
              </span>
          </td>
          <td>
            <button class="edit-btn" @click="openEdit(item)">Edit</button>
            <button class="delete-btn" @click="openDelete(item)">Delete</button>
          </td>
        </tr>
        <tr v-if="mappings.length === 0">
          <td colspan="6" class="empty">No mappings found</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- CREATE MODAL -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Add Location Service</h3>
          <button class="close" @click="showCreateModal = false">✕</button>
        </div>
        <form class="form" @submit.prevent="createMapping">
          <div class="field">
            <label>Business *</label>
            <select v-model="createForm.business_code" @change="onBizChange" required>
              <option value="">Select business</option>
              <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">
                {{ biz.name }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>Location *</label>
            <select v-model="createForm.location_code" required>
              <option value="">Select location</option>
              <option v-for="loc in filteredLocations" :key="loc.location_code" :value="loc.location_code">
                {{ loc.location_code }} — {{ loc.city || loc.address || loc.location_type }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>Service *</label>
            <select v-model="createForm.service_code" required>
              <option value="">Select service</option>
              <option v-for="svc in filteredServices" :key="svc.service_code" :value="svc.service_code">
                {{ svc.name }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>Availability</label>
            <select v-model="createForm.availability">
              <option value="available">Available</option>
              <option value="not_available">Not Available</option>
            </select>
          </div>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
          <button type="submit" class="save-btn" :disabled="saving">
            {{ saving ? 'Saving...' : 'Add Mapping' }}
          </button>
        </form>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Availability</h3>
          <button class="close" @click="showEditModal = false">✕</button>
        </div>
        <form class="form" @submit.prevent="updateMapping">
          <p class="info-line">Location: <code>{{ selected?.location_code }}</code> / Service: <code>{{ selected?.service_code }}</code></p>
          <div class="field">
            <label>Availability</label>
            <select v-model="editForm.availability">
              <option value="available">Available</option>
              <option value="not_available">Not Available</option>
            </select>
          </div>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
          <button type="submit" class="save-btn" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal delete-modal">
        <h3>Delete Mapping</h3>
        <p>Remove service <strong>{{ selected?.service_code }}</strong> from location <strong>{{ selected?.location_code }}</strong>?</p>
        <div class="actions">
          <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
          <button class="delete-confirm-btn" @click="deleteMapping" :disabled="saving">
            {{ saving ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/utils/api'

const mappings = ref([])
const businesses = ref([])
const locations = ref([])
const services = ref([])

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const bizFilter = ref('')
const locFilter = ref('')

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)

const createForm = reactive({ business_code: '', location_code: '', service_code: '', availability: 'available' })
const editForm = reactive({ availability: 'available' })

const filteredLocations = computed(() =>
    createForm.business_code
        ? locations.value.filter(l => l.business_code === createForm.business_code)
        : locations.value
)

const filteredServices = computed(() =>
    createForm.business_code
        ? services.value.filter(s => s.business_code === createForm.business_code)
        : services.value
)

async function fetchMappings() {
  loading.value = true
  error.value = ''
  try {
    const params = {}
    if (bizFilter.value) params.business_code = bizFilter.value
    if (locFilter.value) params.location_code = locFilter.value
    const res = await api.get('/location-services/get-location-service', { params })
    mappings.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load mappings'
  } finally {
    loading.value = false
  }
}

function onBizChange() {
  createForm.location_code = ''
  createForm.service_code = ''
}

function openCreate() {
  createForm.business_code = ''
  createForm.location_code = ''
  createForm.service_code = ''
  createForm.availability = 'available'
  formError.value = ''
  showCreateModal.value = true
}

function openEdit(item) {
  selected.value = item
  editForm.availability = item.availability
  formError.value = ''
  showEditModal.value = true
}

function openDelete(item) {
  selected.value = item
  showDeleteModal.value = true
}

async function createMapping() {
  saving.value = true
  formError.value = ''
  try {
    await api.post('/location-services/create-location-service', createForm)
    showCreateModal.value = false
    await fetchMappings()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Failed to create mapping'
  } finally {
    saving.value = false
  }
}

async function updateMapping() {
  saving.value = true
  formError.value = ''
  try {
    await api.put(`/location-services/update-location-service${selected.value.id}`, editForm)
    showEditModal.value = false
    await fetchMappings()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

async function deleteMapping() {
  saving.value = true
  try {
    await api.delete(`/location-services/delete-location-service${selected.value.id}`)
    showDeleteModal.value = false
    await fetchMappings()
  } catch (err) {
    error.value = err.response?.data?.message || 'Delete failed'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const [_, bizRes, locRes, svcRes] = await Promise.allSettled([
    fetchMappings(),
    api.get('/businesses/get-business'),
    api.get('/locations/get-location'),
    api.get('/services/get-service'),
  ])
  if (bizRes.status === 'fulfilled') businesses.value = bizRes.value.data.data || []
  if (locRes.status === 'fulfilled') locations.value = locRes.value.data.data || []
  if (svcRes.status === 'fulfilled') services.value = svcRes.value.data.data || []
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; align-items: center; justify-content: space-between; }
.header h2 { margin: 0; color: #1e293b; }
.sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }
.btn { background: #6366f1; color: white; padding: 8px 16px; border-radius: 6px; border: none; font-size: 14px; font-weight: 500; cursor: pointer; }
.filters { display: flex; gap: 12px; flex-wrap: wrap; }
.filters select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; min-width: 200px; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: capitalize; }
.badge.active   { background: #dcfce7; color: #16a34a; }
.badge.inactive { background: #fee2e2; color: #dc2626; }
.edit-btn, .delete-btn { border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.edit-btn   { background: #ede9fe; color: #6366f1; }
.delete-btn { background: #fee2e2; color: #dc2626; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 10px; padding: 24px; width: 440px; max-width: 90%; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.form { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field select { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; }
.info-line { font-size: 13px; color: #64748b; margin: 0; }
.save-btn { background: #6366f1; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.delete-modal { text-align: center; }
.delete-modal h3 { margin: 0 0 12px; }
.delete-modal p { color: #64748b; margin-bottom: 16px; }
.actions { display: flex; gap: 10px; justify-content: center; }
.cancel-btn { background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.delete-confirm-btn { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
</style>
