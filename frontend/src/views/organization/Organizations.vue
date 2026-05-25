<template>
  <div class="ams-page">

    <!-- HEADER -->
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Organizations</h2>
        <p class="text-muted small mb-0">Manage all organizations</p>
      </div>
      <router-link to="/organizations/create" class="btn btn-ams">+ New Organization</router-link>
    </div>

    <!-- TABLE CARD -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Name</th>
              <th>Code</th>
              <th>Status</th>
              <th class="pe-3" style="width:180px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="org in organizations" :key="org.organization_code">
              <td class="ps-3">{{ org.name }}</td>
              <td><code>{{ org.organization_code }}</code></td>
              <td><span :class="['ams-badge', org.status]">{{ org.status }}</span></td>
              <td class="pe-3">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(org)">Edit</button>
                <button class="btn btn-sm btn-outline-danger" @click="openDelete(org)">Deactivate</button>
              </td>
            </tr>
            <tr v-if="organizations.length === 0">
              <td colspan="4" class="text-center text-muted py-4">No organizations found</td>
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
            <h5 class="modal-title">Edit Organization</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <form @submit.prevent="updateOrg">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Organization Name *</label>
                <input v-model="editForm.name" class="form-control" placeholder="Organization Name" required />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Status</label>
                <select v-model="editForm.status" class="form-select">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <p v-if="formError" class="text-danger small mb-0">{{ formError }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showEditModal = false">Cancel</button>
              <button type="submit" class="btn btn-ams" :disabled="saving">{{ saving ? 'Saving...' : 'Save Changes' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- DEACTIVATE CONFIRM MODAL -->
    <div v-if="showDeleteModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Deactivate Organization</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <p class="mb-0">Deactivate <strong>{{ selected?.name }}</strong>?</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger btn-sm" @click="deactivateOrg" :disabled="saving">{{ saving ? '...' : 'Deactivate' }}</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'

const organizations = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)

const editForm = reactive({ name: '', status: 'active' })

async function fetchOrgs() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/organizations/get-organization')
    organizations.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load organizations'
  } finally {
    loading.value = false
  }
}

function openEdit(org) {
  selected.value = org
  editForm.name = org.name
  editForm.status = org.status
  formError.value = ''
  showEditModal.value = true
}

function openDelete(org) {
  selected.value = org
  showDeleteModal.value = true
}

async function updateOrg() {
  saving.value = true
  formError.value = ''
  try {
    await api.put(`/organizations/update-organization${selected.value.organization_code}`, editForm)
    showEditModal.value = false
    await fetchOrgs()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

async function deactivateOrg() {
  saving.value = true
  try {
    await api.patch(`/organizations/update-organization-status${selected.value.organization_code}`, { status: 'inactive' })
    showDeleteModal.value = false
    await fetchOrgs()
  } catch (err) {
    error.value = err.response?.data?.message || 'Delete failed'
  } finally {
    saving.value = false
  }
}

onMounted(fetchOrgs)
</script>


