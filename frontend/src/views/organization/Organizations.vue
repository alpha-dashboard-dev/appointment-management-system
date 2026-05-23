<template>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <div>
        <h2>Organizations</h2>
        <p class="sub">Manage all organizations</p>
      </div>
      <router-link to="/organizations/create" class="btn">+ New Organization</router-link>
    </div>

    <!-- TABLE CARD -->
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>

      <table v-else class="table">
        <thead>
        <tr>
          <th>Name</th>
          <th>Code</th>
          <th>Status</th>
          <th width="160">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="org in organizations" :key="org.organization_code">
          <td>{{ org.name }}</td>
          <td><code>{{ org.organization_code }}</code></td>
          <td>
            <span :class="['badge', org.status]">{{ org.status }}</span>
          </td>
          <td>
            <button class="edit-btn" @click="openEdit(org)">Edit</button>
            <button class="delete-btn" @click="openDelete(org)">Deactivate</button>
          </td>
        </tr>
        <tr v-if="organizations.length === 0">
          <td colspan="4" class="empty">No organizations found</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Organization</h3>
          <button class="close" @click="showEditModal = false">✕</button>
        </div>
        <form class="form" @submit.prevent="updateOrg">
          <input v-model="editForm.name" placeholder="Organization Name" required />
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
        <h3>Delete Organization</h3>
        <p>Are you sure you want to delete <strong>{{ selected?.name }}</strong>?</p>
        <div class="actions">
          <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
          <button class="delete-confirm-btn" @click="deactivateOrg" :disabled="saving">
            {{ saving ? 'Deleting...' : 'Deactivate' }}
          </button>
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

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header h2 { margin: 0; color: #1e293b; }
.sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }

.btn {
  background: #6366f1;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.table { width: 100%; border-collapse: collapse; }
.table th, .table td {
  text-align: left;
  padding: 10px 12px;
  font-size: 13px;
  border-bottom: 1px solid #f1f5f9;
}
.table th { color: #64748b; font-weight: 600; }

.badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}
.badge.active   { background: #dcfce7; color: #16a34a; }
.badge.inactive { background: #fee2e2; color: #dc2626; }

.edit-btn, .delete-btn {
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
}
.edit-btn   { background: #ede9fe; color: #6366f1; }
.delete-btn { background: #fee2e2; color: #dc2626; }

.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  background: white;
  border-radius: 10px;
  padding: 24px;
  width: 420px;
  max-width: 90%;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }

.form { display: flex; flex-direction: column; gap: 12px; }
.form input, .form select {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}
.save-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.delete-modal { text-align: center; }
.delete-modal h3 { margin: 0 0 12px; }
.delete-modal p { color: #64748b; margin-bottom: 16px; }

.actions { display: flex; gap: 10px; justify-content: center; }
.cancel-btn { background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.delete-confirm-btn { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }

code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
</style>
