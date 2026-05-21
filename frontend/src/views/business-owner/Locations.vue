<template>
  <div class="page">
    <div class="header">
      <div><h2>Locations</h2><p class="sub">Manage business locations</p></div>
      <button class="btn" @click="showCreateModal = true">+ New Location</button>
    </div>
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <table v-else class="table">
        <thead><tr><th>Name</th><th>Code</th><th>Type</th><th>Address</th><th>Status</th><th width="140">Actions</th></tr></thead>
        <tbody>
          <tr v-for="loc in locations" :key="loc.location_code">
            <td>{{ loc.name }}</td>
            <td><code>{{ loc.location_code }}</code></td>
            <td>{{ loc.location_type || '—' }}</td>
            <td>{{ loc.address || '—' }}</td>
            <td><span :class="['badge', loc.status]">{{ loc.status }}</span></td>
            <td>
              <button class="edit-btn" @click="openEdit(loc)">Edit</button>
              <button class="delete-btn" @click="openDelete(loc)">Delete</button>
            </td>
          </tr>
          <tr v-if="locations.length === 0"><td colspan="6" class="empty">No locations found</td></tr>
        </tbody>
      </table>
    </div>

    <!-- CREATE MODAL -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header"><h3>New Location</h3><button class="close" @click="showCreateModal = false">✕</button></div>
        <form class="form" @submit.prevent="createLocation">
          <div class="field"><label>Name *</label><input v-model="createForm.name" placeholder="Location name" required /></div>
          <div class="field"><label>Address</label><input v-model="createForm.address" placeholder="Address" /></div>
          <div class="field">
            <label>Location Type *</label>
            <select v-model="createForm.location_type" required>
              <option value="">Select type</option>
              <option value="business">Business</option>
              <option value="client">Client</option>
            </select>
          </div>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
          <button type="submit" class="save-btn" :disabled="saving">{{ saving ? 'Creating...' : 'Create' }}</button>
        </form>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header"><h3>Edit Location</h3><button class="close" @click="showEditModal = false">✕</button></div>
        <form class="form" @submit.prevent="updateLocation">
          <div class="field"><label>Name *</label><input v-model="editForm.name" required /></div>
          <div class="field"><label>Address</label><input v-model="editForm.address" /></div>
          <div class="field"><label>Status</label><select v-model="editForm.status"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
          <button type="submit" class="save-btn" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
        </form>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal delete-modal">
        <h3>Delete Location</h3>
        <p>Delete <strong>{{ selected?.name }}</strong>?</p>
        <div class="actions">
          <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
          <button class="delete-confirm-btn" @click="deleteLocation" :disabled="saving">{{ saving ? 'Deleting...' : 'Delete' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'

const authStore = useAuthStore()
const locations = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)

const createForm = reactive({ name: '', address: '', location_type: '' })
const editForm = reactive({ name: '', address: '', status: 'active' })

async function fetchLocations() {
  loading.value = true
  error.value = ''
  try {
    const biz = authStore.user?.business_code
    const res = await api.get('/locations/get-location', { params: biz ? { business_code: biz } : {} })
    locations.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load locations'
  } finally {
    loading.value = false
  }
}

function openEdit(loc) {
  selected.value = loc
  editForm.name = loc.name
  editForm.address = loc.address || ''
  editForm.status = loc.status || 'active'
  formError.value = ''
  showEditModal.value = true
}

function openDelete(loc) { selected.value = loc; showDeleteModal.value = true }

async function createLocation() {
  saving.value = true
  formError.value = ''
  try {
    const biz = authStore.user?.business_code
    const payload = { ...createForm, business_code: biz }
    if (!payload.address) delete payload.address
    await api.post('/locations/create-location', payload)
    showCreateModal.value = false
    Object.assign(createForm, { name: '', address: '', location_type: '' })
    await fetchLocations()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Create failed'
  } finally {
    saving.value = false
  }
}

async function updateLocation() {
  saving.value = true
  formError.value = ''
  try {
    await api.put(`/locations/update-location${selected.value.location_code}`, editForm)
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
    await api.delete(`/locations/delete-location${selected.value.location_code}`)
    showDeleteModal.value = false
    await fetchLocations()
  } catch (err) {
    error.value = err.response?.data?.message || 'Delete failed'
  } finally {
    saving.value = false
  }
}

onMounted(fetchLocations)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; align-items: center; justify-content: space-between; }
.header h2 { margin: 0; color: #1e293b; }
.sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }
.btn { background: #0f172a; color: white; border: none; padding: 9px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.badge.active { background: #dcfce7; color: #166534; }
.badge.inactive { background: #f1f5f9; color: #475569; }
.edit-btn { background: #ede9fe; color: #5b21b6; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.delete-btn { background: #fee2e2; color: #dc2626; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 10px; padding: 24px; width: 440px; max-width: 90%; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.delete-modal { text-align: center; }
.delete-modal h3 { margin: 0 0 12px; }
.delete-modal p { color: #64748b; margin-bottom: 16px; }
.actions { display: flex; gap: 10px; justify-content: center; }
.cancel-btn { background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.delete-confirm-btn { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field select { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; }
.save-btn { background: #0f172a; color: white; border: none; padding: 10px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
