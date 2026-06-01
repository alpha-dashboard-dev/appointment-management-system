<template>
  <div class="ams-page">
    <div class="d-flex align-items-center justify-content-between">
      <div><h2 class="mb-0">Staff</h2><p class="text-muted small mb-0">Manage your business staff</p></div>
      <router-link to="/business/staff/create" class="btn btn-ams">+ Add Staff</router-link>
    </div>
    <div class="d-flex gap-2">
      <select v-model="typeFilter" @change="fetchStaff" class="form-select" style="max-width:220px">
        <option value="">All Types</option>
        <option value="operational_staff">Operational Staff</option>
        <option value="service_staff">Service Staff</option>
      </select>
    </div>
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr><th class="ps-3">Name</th><th>Email</th><th>Role</th><th>Code</th><th>Status</th><th class="pe-3" style="width:140px">Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="user in staff" :key="user.user_code">
              <td class="ps-3">{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.user_type }}</td>
              <td><code>{{ user.user_code }}</code></td>
              <td><span :class="['ams-badge', user.is_active === 'active' ? 'active' : 'inactive']">{{ user.is_active === 'active' ? 'Active' : 'Inactive' }}</span></td>
              <td class="pe-3">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(user)">Edit</button>
                <button class="btn btn-sm btn-outline-warning" @click="openDeactivate(user)">Deactivate</button>
              </td>
            </tr>
            <tr v-if="staff.length === 0"><td colspan="6" class="text-center text-muted py-4">No staff found</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Staff</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <form @submit.prevent="updateStaff">
            <div class="modal-body">
              <div class="mb-3"><label class="form-label fw-semibold">Full Name *</label><input v-model="editForm.name" class="form-control" required /></div>
              <div class="mb-3"><label class="form-label fw-semibold">Phone</label><input v-model="editForm.phone" class="form-control" /></div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Employee Type</label>
                <select v-model="editForm.employee_type" class="form-select">
                  <option value="permanent">Permanent</option>
                  <option value="visiting">Visiting</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Status</label>
                <select v-model="editForm.is_active" class="form-select">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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

    <!-- DEACTIVATE MODAL -->
    <div v-if="showDeactivateModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Deactivate Staff</h5>
            <button type="button" class="btn-close" @click="showDeactivateModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <p class="mb-0">Deactivate <strong>{{ selected?.name }}</strong>?</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeactivateModal = false">Cancel</button>
            <button class="btn btn-warning btn-sm" @click="deactivateStaff" :disabled="saving">{{ saving ? '...' : 'Deactivate' }}</button>
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
const staff = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const typeFilter = ref('')

const showEditModal = ref(false)
const showDeactivateModal = ref(false)
const selected = ref(null)
const editForm = reactive({ name: '', phone: '', employee_type: "", is_active: 'active'})

async function fetchStaff() {
  loading.value = true
  error.value = ''
  try {
    const biz = authStore.user?.business_code
    const params = {}
    if (biz) params.business_code = biz
    if (typeFilter.value) params.user_type = typeFilter.value
    const res = await api.get('/users/get-users', { params })
    staff.value = (res.data.data || []).filter(u => ['operational_staff','service_staff'].includes(u.user_type))
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load staff'
  } finally {
    loading.value = false
  }
}

function openEdit(user) {
  selected.value = user
  editForm.name = user.name
  editForm.phone = user.phone || ''
  editForm.is_active = user.is_active
  formError.value = ''
  showEditModal.value = true
}

function openDeactivate(user) { selected.value = user; showDeactivateModal.value = true }

async function updateStaff() {
  saving.value = true
  formError.value = ''
  try {
    await api.put(`/users/update-user${selected.value.user_code}`, editForm)
    showEditModal.value = false
    await fetchStaff()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

async function deactivateStaff() {
  saving.value = true
  try {
    await api.delete(`/users/delete-user${selected.value.user_code}`)
    showDeactivateModal.value = false
    await fetchStaff()
  } catch (err) {
    error.value = err.response?.data?.message || 'Deactivate failed'
  } finally {
    saving.value = false
  }
}

onMounted(fetchStaff)
</script>


