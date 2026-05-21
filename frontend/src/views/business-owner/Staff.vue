<template>
  <div class="page">
    <div class="header">
      <div><h2>Staff</h2><p class="sub">Manage your business staff</p></div>
      <router-link to="/business/staff/create" class="btn">+ Add Staff</router-link>
    </div>
    <div class="filters">
      <select v-model="typeFilter" @change="fetchStaff">
        <option value="">All Types</option>
        <option value="operational_staff">Operational Staff</option>
        <option value="service_staff">Service Staff</option>
      </select>
    </div>
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <table v-else class="table">
        <thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Code</th><th>Status</th><th width="140">Actions</th></tr></thead>
        <tbody>
          <tr v-for="user in staff" :key="user.user_code">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.user_type }}</td>
            <td><code>{{ user.user_code }}</code></td>
            <td><span :class="['badge', user.is_active === 'active' ? 'active' : 'inactive']">{{ user.is_active === 'active' ? 'Active' : 'Inactive' }}</span></td>
            <td>
              <button class="edit-btn" @click="openEdit(user)">Edit</button>
              <button class="delete-btn" @click="openDeactivate(user)">Deactivate</button>
            </td>
          </tr>
          <tr v-if="staff.length === 0"><td colspan="6" class="empty">No staff found</td></tr>
        </tbody>
      </table>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header"><h3>Edit Staff</h3><button class="close" @click="showEditModal = false">✕</button></div>
        <form class="form" @submit.prevent="updateStaff">
          <div class="field"><label>Full Name *</label><input v-model="editForm.name" required /></div>
          <div class="field"><label>Phone</label><input v-model="editForm.phone" /></div>
          <div class="field"><label>Status</label>
            <select v-model="editForm.is_active">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
          <button type="submit" class="save-btn" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
        </form>
      </div>
    </div>

    <!-- DEACTIVATE MODAL -->
    <div v-if="showDeactivateModal" class="modal-overlay">
      <div class="modal delete-modal">
        <h3>Deactivate Staff</h3>
        <p>Deactivate <strong>{{ selected?.name }}</strong>?</p>
        <div class="actions">
          <button class="cancel-btn" @click="showDeactivateModal = false">Cancel</button>
          <button class="delete-confirm-btn" @click="deactivateStaff" :disabled="saving">{{ saving ? '...' : 'Deactivate' }}</button>
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
const editForm = reactive({ name: '', phone: '', is_active: 'active' })

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

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; align-items: center; justify-content: space-between; }
.header h2 { margin: 0; color: #1e293b; }
.sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }
.filters { display: flex; gap: 12px; }
.filters select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; min-width: 180px; }
.btn { background: #0f172a; color: white; border: none; padding: 9px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; text-decoration: none; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.badge.active { background: #dcfce7; color: #166534; }
.badge.inactive { background: #fee2e2; color: #991b1b; }
.edit-btn { background: #ede9fe; color: #5b21b6; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.delete-btn { background: #fef3c7; color: #92400e; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 10px; padding: 24px; width: 420px; max-width: 90%; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.delete-modal { text-align: center; }
.delete-modal h3 { margin: 0 0 12px; }
.delete-modal p { color: #64748b; margin-bottom: 16px; }
.actions { display: flex; gap: 10px; justify-content: center; }
.cancel-btn { background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.delete-confirm-btn { background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field select { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; }
.save-btn { background: #0f172a; color: white; border: none; padding: 10px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
