<template>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <div>
        <h2>Users</h2>
        <p class="sub">Manage system users</p>
      </div>
      <router-link to="/users/create" class="btn">+ New User</router-link>
    </div>

    <!-- TABLE CARD -->
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>

      <table v-else class="table">
        <thead>
        <tr>
          <th>Full Name</th>
          <th>Email</th>
          <th>Type</th>
          <th>Code</th>
          <th>Status</th>
          <th width="160">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in users" :key="user.user_code">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.user_type }}</td>
          <td><code>{{ user.user_code }}</code></td>
          <td>
              <span :class="['badge', user.is_active === 'active' ? 'active' : 'inactive']">
                {{ user.is_active === 'active' ? 'Active' : 'Inactive' }}
              </span>
          </td>
          <td>
            <button class="edit-btn" @click="openEdit(user)">Edit</button>
            <button class="delete-btn" @click="openDelete(user)">Delete</button>
          </td>
        </tr>
        <tr v-if="users.length === 0">
          <td colspan="6" class="empty">No users found</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit User</h3>
          <button class="close" @click="showEditModal = false">✕</button>
        </div>
        <form class="form" @submit.prevent="updateUser">
          <input v-model="editForm.name" placeholder="Full Name" required />
          <input v-model="editForm.email" type="email" placeholder="Email" required />
          <select v-model="editForm.user_type">
            <option value="admin">Admin</option>
            <option value="business_owner">Business Owner</option>
            <option value="operational_staff">Operational Staff</option>
            <option value="client">Client</option>
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
        <h3>Deactivate User</h3>
        <p>Are you sure you want to deactivate <strong>{{ selected?.name }}</strong>?</p>
        <div class="actions">
          <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
          <button class="delete-confirm-btn" @click="deleteUser" :disabled="saving">
            {{ saving ? 'Processing...' : 'Deactivate' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'

const users = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)

const editForm = reactive({ name: '', email: '', user_type: 'client' })

async function fetchUsers() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/users/get-users')
    users.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

function openEdit(user) {
  selected.value = user
  editForm.name = user.name
  editForm.email = user.email
  editForm.user_type = user.user_type
  formError.value = ''
  showEditModal.value = true
}

function openDelete(user) {
  selected.value = user
  showDeleteModal.value = true
}

async function updateUser() {
  saving.value = true
  formError.value = ''
  try {
    await api.put(`/users/update-user${selected.value.user_code}`, editForm)
    showEditModal.value = false
    await fetchUsers()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

async function deleteUser() {
  saving.value = true
  try {
    await api.delete(`/users/delete-users${selected.value.user_code}`)
    showDeleteModal.value = false
    await fetchUsers()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to deactivate user'
  } finally {
    saving.value = false
  }
}

onMounted(fetchUsers)
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
}
.badge.active   { background: #dcfce7; color: #16a34a; }
.badge.inactive { background: #fee2e2; color: #dc2626; }

.edit-btn, .delete-btn {
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 4px;
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
