<template>
  <div class="page">

    <div class="header">
      <div>
        <h2>Locations</h2>
        <p class="sub">Manage all locations</p>
      </div>
      <router-link to="/locations/create" class="btn">+ New Location</router-link>
    </div>

    <div class="filters">
      <select v-model="bizFilter" @change="fetchLocations">
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
          <th>Code</th>
          <th>Type</th>
          <th>City</th>
          <th>Address</th>
          <th>Status</th>
          <th width="140">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="loc in locations" :key="loc.location_code">
          <td><code>{{ loc.location_code }}</code></td>
          <td>{{ loc.location_type }}</td>
          <td>{{ loc.city || '—' }}</td>
          <td>{{ loc.address || loc.street || '—' }}</td>
          <td><span :class="['badge', loc.status]">{{ loc.status }}</span></td>
          <td>
            <button class="edit-btn" @click="openEdit(loc)">Edit</button>
            <button class="delete-btn" @click="openDelete(loc)">Delete</button>
          </td>
        </tr>
        <tr v-if="locations.length === 0">
          <td colspan="6" class="empty">No locations found</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Location</h3>
          <button class="close" @click="showEditModal = false">✕</button>
        </div>
        <form class="form" @submit.prevent="updateLocation">
          <select v-model="editForm.location_type">
            <option value="business">Business</option>
            <option value="client">Client</option>
          </select>
          <input v-model="editForm.street" placeholder="Street" />
          <input v-model="editForm.address" placeholder="Address" />
          <input v-model="editForm.city" placeholder="City" />
          <input v-model="editForm.province" placeholder="Province" />
          <input v-model="editForm.postal_code" placeholder="Postal Code" />
          <input v-model="editForm.country" placeholder="Country" />
          <select v-model="editForm.status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
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
        <h3>Delete Location</h3>
        <p>Are you sure you want to delete location <strong>{{ selected?.location_code }}</strong>?</p>
        <div class="actions">
          <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
          <button class="delete-confirm-btn" @click="deleteLocation" :disabled="saving">
            {{ saving ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'

const locations = ref([])
const businesses = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const bizFilter = ref('')

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)
const editForm = reactive({ location_type: 'business', street: '', address: '', city: '', province: '', postal_code: '', country: '', status: 'active' })

async function fetchLocations() {
  loading.value = true
  error.value = ''
  try {
    const params = bizFilter.value ? { business_code: bizFilter.value } : {}
    const res = await api.get('/locations', { params })
    locations.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load locations'
  } finally {
    loading.value = false
  }
}

function openEdit(loc) {
  selected.value = loc
  editForm.location_type = loc.location_type || 'business'
  editForm.street = loc.street || ''
  editForm.address = loc.address || ''
  editForm.city = loc.city || ''
  editForm.province = loc.province || ''
  editForm.postal_code = loc.postal_code || ''
  editForm.country = loc.country || ''
  editForm.status = loc.status || 'active'
  formError.value = ''
  showEditModal.value = true
}

function openDelete(loc) {
  selected.value = loc
  showDeleteModal.value = true
}

async function updateLocation() {
  saving.value = true
  formError.value = ''
  try {
    await api.put(`/locations/${selected.value.location_code}`, editForm)
    showEditModal.value = false
    await fetchLocations()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

async function deleteLocation() {
  saving.value = true
  try {
    await api.delete(`/locations/${selected.value.location_code}`)
    showDeleteModal.value = false
    await fetchLocations()
  } catch (err) {
    error.value = err.response?.data?.message || 'Delete failed'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const [_, bizRes] = await Promise.allSettled([fetchLocations(), api.get('/businesses')])
  if (bizRes.status === 'fulfilled') businesses.value = bizRes.value.data.data || []
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; align-items: center; justify-content: space-between; }
.header h2 { margin: 0; color: #1e293b; }
.sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }
.btn { background: #6366f1; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; }
.filters { display: flex; gap: 12px; }
.filters select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; min-width: 200px; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.edit-btn, .delete-btn { border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.edit-btn   { background: #ede9fe; color: #6366f1; }
.delete-btn { background: #fee2e2; color: #dc2626; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 10px; padding: 24px; width: 420px; max-width: 90%; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.form { display: flex; flex-direction: column; gap: 12px; }
.form input, .form select { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; }
.save-btn { background: #6366f1; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.delete-modal { text-align: center; }
.delete-modal h3 { margin: 0 0 12px; }
.delete-modal p { color: #64748b; margin-bottom: 16px; }
.actions { display: flex; gap: 10px; justify-content: center; }
.cancel-btn { background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.delete-confirm-btn { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
</style>
