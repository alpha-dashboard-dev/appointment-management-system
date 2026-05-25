<template>
  <div class="ams-page">
    <div class="d-flex align-items-center justify-content-between">
      <div><h2 class="mb-0">Services</h2><p class="text-muted small mb-0">Manage your business services</p></div>
      <router-link to="/business/services/create" class="btn btn-ams">+ New Service</router-link>
    </div>
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr><th class="ps-3">Name</th><th>Code</th><th>Description</th><th>Price</th><th>Status</th><th class="pe-3" style="width:140px">Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="svc in services" :key="svc.service_code">
              <td class="ps-3">{{ svc.name }}</td>
              <td><code>{{ svc.service_code }}</code></td>
              <td>{{ svc.description }}</td>
              <td>{{ svc.price ?? '—' }}</td>
              <td><span :class="['ams-badge', svc.status]">{{ svc.status }}</span></td>
              <td class="pe-3">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(svc)">Edit</button>
                <button class="btn btn-sm btn-outline-danger" @click="openDelete(svc)">Delete</button>
              </td>
            </tr>
            <tr v-if="services.length === 0"><td colspan="6" class="text-center text-muted py-4">No services found</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Service</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <form @submit.prevent="updateService">
            <div class="modal-body">
              <div class="mb-3"><label class="form-label fw-semibold">Service Name *</label><input v-model="editForm.name" class="form-control" required /></div>
              <div class="mb-3"><label class="form-label fw-semibold">Duration</label><input v-model.number="editForm.duration_value" type="number" min="1" class="form-control" /></div>
              <div class="mb-3"><label class="form-label fw-semibold">Price</label><input v-model.number="editForm.price" type="number" step="0.01" min="0" class="form-control" /></div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Status</label>
                <select v-model="editForm.status" class="form-select"><option value="active">Active</option><option value="inactive">Inactive</option></select>
              </div>
              <p v-if="formError" class="text-danger small mb-0">{{ formError }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showEditModal = false">Cancel</button>
              <button type="submit" class="btn btn-ams" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div v-if="showDeleteModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Service</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <p class="mb-0">Delete <strong>{{ selected?.name }}</strong>?</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger btn-sm" @click="deleteService" :disabled="saving">{{ saving ? 'Deleting...' : 'Delete' }}</button>
          </div>
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
const services = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)

const createForm = reactive({ name: '', duration_minutes: '', price: '', description: '' })
const editForm = reactive({ name: '', duration_minutes: '', price: '', status: 'active' })

async function fetchServices() {
  loading.value = true
  error.value = ''
  try {
    const biz = authStore.user?.business_code
    const res = await api.get('/services/get-service', { params: biz ? { business_code: biz } : {} })
    services.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load services'
  } finally {
    loading.value = false
  }
}

function openEdit(svc) {
  selected.value = svc
  editForm.name = svc.name
  editForm.duration_minutes = svc.duration_minutes
  editForm.price = svc.price ?? ''
  editForm.status = svc.status
  formError.value = ''
  showEditModal.value = true
}

function openDelete(svc) { selected.value = svc; showDeleteModal.value = true }

async function createService() {
  saving.value = true
  formError.value = ''
  try {
    const biz = authStore.user?.business_code
    const payload = { ...createForm, business_code: biz }
    if (!payload.price) delete payload.price
    if (!payload.description) delete payload.description
    await api.post('/services/create-service', payload)
    showCreateModal.value = false
    Object.assign(createForm, { name: '', duration_minutes: '', price: '', description: '' })
    await fetchServices()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Create failed'
  } finally {
    saving.value = false
  }
}

async function updateService() {
  saving.value = true
  formError.value = ''
  try {
    await api.put(`/services/update-service${selected.value.service_code}`, editForm)
    showEditModal.value = false
    await fetchServices()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

async function deleteService() {
  saving.value = true
  try {
    await api.delete(`/services/delete-service${selected.value.service_code}`)
    showDeleteModal.value = false
    await fetchServices()
  } catch (err) {
    error.value = err.response?.data?.message || 'Delete failed'
  } finally {
    saving.value = false
  }
}

onMounted(fetchServices)
</script>

<style scoped>
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field select, .field textarea { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; font-family: inherit; }
.save-btn { background: #0f172a; color: white; border: none; padding: 10px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
