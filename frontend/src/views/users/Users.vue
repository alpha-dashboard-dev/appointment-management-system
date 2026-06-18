<template>
  <div class="ams-page">

    <!-- HEADER -->
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Users</h2>
        <p class="text-muted small mb-0">Manage system users</p>
      </div>
      <router-link to="/users/create" class="btn btn-ams">+ New User</router-link>
    </div>

    <!-- TABLE CARD -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Business Name</th>
              <th>Role</th>
              <th>Status</th>
              <th class="pe-3" style="width:160px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.user_code">
              <td class="ps-3">{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{user.phone}}</td>
              <td>{{user.business_name}}</td>
              <td>{{ user.user_type }}</td>
              <td>
                <span :class="['ams-badge', user.is_active === 'active' ? 'active' : 'inactive']">
                  {{ user.is_active === 'active' ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="pe-3">
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <button class="dropdown-item" @click="openEdit(user)">
                        <i class="bi bi-pencil me-2"></i>
                        Edit
                      </button>
                    </li>
                    <li>
                      <button class="dropdown-item text-danger" @click="openDelete(user)">
                        <i class="bi bi-trash me-2"></i>
                        Deactivate
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="7" class="text-center text-muted py-4">No users found</td>
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
            <h5 class="modal-title">Edit User</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <form @submit.prevent="updateUser">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Full Name *</label>
                <input v-model="editForm.name" class="form-control" placeholder="Full Name" required />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Email *</label>
                <input v-model="editForm.email" type="email" class="form-control" placeholder="Email" required />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Phone *</label>
                <input v-model="editForm.phone" type="text" class="form-control" placeholder="Phone" required />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">New Password</label>

                <input v-model="editForm.password" type="password" class="form-control" placeholder="Leave blank to keep current password"/>
                <small class="text-muted">
                  Leave empty if you don't want to change the password.
                </small>
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
            <h5 class="modal-title">Deactivate User</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <p class="mb-0">Deactivate <strong>{{ selected?.name }}</strong>?</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger btn-sm" @click="deactivateUser" :disabled="saving">{{ saving ? '...' : 'Deactivate' }}</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'
import {apiHandler} from "../../utils/api/apiHandler.js";

const users = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)

const editForm = reactive({ name: '', email: '', phone: '', password: '', is_active: 'active' })


async function fetchUsers() {
  loading.value = true
  error.value = ''

  try {
    const response = await apiHandler("user", "getAllUsers", {
      include: "business"
    })

    users.value = (response.data.data || []).map(
        (user) => ({
          ...user,
          business_name:
              user.business?.name || '',
        })
    )
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to load Users'
  } finally {
    loading.value = false
  }
}

function openEdit(user) {
  selected.value = user
  editForm.name = user.name
  editForm.email = user.email
  editForm.phone = user.phone
  editForm.password = user.password
  editForm.is_active = user.is_active
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
    await apiHandler("user", "updateUser",
        {
          code: selected.value.user_code,
          ...editForm
        })
    showEditModal.value = false
    await fetchUsers()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}
// deactivate user
async function deactivateUser() {
  saving.value = true
  try {
    await apiHandler("user", "deactivateUser",
        {
          code: selected.value.user_code,
          is_active: 'inactive'
        })
    showDeleteModal.value = false
    await fetchUsers()
  } catch (err) {
    error.value = err.response?.data?.message || 'Deactivation failed'
  } finally {
    saving.value = false
  }
}

// async function deleteUser() {
//   saving.value = true
//   try {
//     await api.delete(`/users/delete-user${selected.value.user_code}`)
//     showDeleteModal.value = false
//     await fetchUsers()
//   } catch (err) {
//     error.value = err.response?.data?.message || 'Failed to deactivate user'
//   } finally {
//     saving.value = false
//   }
// }

onMounted(fetchUsers)
</script>


