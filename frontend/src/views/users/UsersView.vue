<script setup lang="ts">
// UsersView — CRUD management page for staff/admin user accounts.
// Supports creating/editing users, toggling active status, and deleting accounts.
// A business dropdown is pre-loaded for assigning users to a business.
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import AppModal from '@/components/common/AppModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { userApi } from '@/api/user.api'
import { businessApi } from '@/api/business.api'
import { useToast } from '@/composables/useToast'
import type { User, Business } from '@/types'

const { success, error } = useToast()

const users    = ref<User[]>([])
const businesses = ref<Business[]>([])
const loading  = ref(true)
const search   = ref('')
const modal    = ref(false)
const isEdit   = ref(false)
const saving   = ref(false)
const confirmDialog  = ref(false)
const confirmLoading = ref(false)
const targetCode = ref('')
const targetStatus = ref('')
const deleteConfirm = ref(false)
const deleteLoading = ref(false)

const form = ref({
  business_code: '', user_type: 'operational_staff', name: '',
  email: '', phone: '', password: '', is_active: 'active',
})

const ROLES = [
  { value: 'business_owner',    label: 'Business Owner' },
  { value: 'operational_staff', label: 'Operational Staff' },
  { value: 'service_staff',     label: 'Service Staff' },
  { value: 'client',            label: 'Client' },
]

async function loadData() {
  loading.value = true
  try {
    const [uRes, bRes] = await Promise.all([userApi.getAll(), businessApi.getAll()])
    users.value      = uRes.data?.data ?? uRes.data ?? []
    businesses.value = bRes.data?.data ?? bRes.data ?? []
  } catch { error('Failed to load data') }
  finally { loading.value = false }
}

onMounted(loadData)

function openCreate() {
  isEdit.value = false
  form.value = { business_code: '', user_type: 'operational_staff', name: '', email: '', phone: '', password: '', is_active: 'active' }
  modal.value = true
}

function openEdit(u: User) {
  isEdit.value = true
  targetCode.value = u.user_code
  form.value = {
    business_code: u.business_code || '', user_type: u.user_type, name: u.name || '',
    email: u.email, phone: u.phone || '', password: '', is_active: u.is_active,
  }
  modal.value = true
}

function openStatusChange(u: User) {
  targetCode.value  = u.user_code
  targetStatus.value = u.is_active === 'active' ? 'inactive' : 'active'
  confirmDialog.value = true
}

function openDelete(u: User) {
  targetCode.value = u.user_code
  deleteConfirm.value = true
}

async function save() {
  if (!form.value.email || (!isEdit.value && !form.value.password)) {
    error('Email and password are required'); return
  }
  saving.value = true
  try {
    const payload: any = { ...form.value }
    if (isEdit.value && !payload.password) delete payload.password
    if (isEdit.value) {
      await userApi.update(targetCode.value, payload)
      success('User updated')
    } else {
      await userApi.create(payload)
      success('User created')
    }
    modal.value = false; loadData()
  } catch (err: any) {
    error(err?.response?.data?.message || 'Operation failed')
  } finally { saving.value = false }
}

async function confirmStatus() {
  confirmLoading.value = true
  try {
    await userApi.changeStatus(targetCode.value, targetStatus.value)
    success(`User ${targetStatus.value}`)
    confirmDialog.value = false; loadData()
  } catch { error('Failed to change status') }
  finally { confirmLoading.value = false }
}

async function deleteUser() {
  deleteLoading.value = true
  try {
    await userApi.delete(targetCode.value)
    success('User deactivated')
    deleteConfirm.value = false; loadData()
  } catch { error('Failed to delete user') }
  finally { deleteLoading.value = false }
}

const filtered = () => users.value.filter(u =>
  (u.name || '').toLowerCase().includes(search.value.toLowerCase()) ||
  u.email.toLowerCase().includes(search.value.toLowerCase())
)

function bizName(code: string) {
  return businesses.value.find(b => b.business_code === code)?.name || code || '—'
}
</script>

<template>
  <div>
    <PageHeader
      title="Users"
      subtitle="Manage staff and system users"
      action-label="Add User"
      action-icon="M12 4v16m8-8H4"
      @action="openCreate"
    />

    <div class="card">
      <div class="mb-4">
        <div class="relative max-w-xs">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="search" type="text" placeholder="Search users..." class="form-input pl-9"/>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Business</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-10 text-gray-400">
                <svg class="w-5 h-5 animate-spin inline mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>Loading...
              </td>
            </tr>
            <tr v-else-if="!filtered().length">
              <td colspan="6" class="text-center py-10 text-gray-400">No users found</td>
            </tr>
            <tr v-for="u in filtered()" :key="u.user_code">
              <td>
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                       style="background-color: #2e37a4;">
                    {{ (u.name || u.email).charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-medium text-gray-800">{{ u.name || '—' }}</span>
                </div>
              </td>
              <td class="text-gray-600">{{ u.email }}</td>
              <td>
                <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                  {{ u.user_type.replace(/_/g, ' ') }}
                </span>
              </td>
              <td class="text-gray-500 text-sm">{{ bizName(u.business_code || '') }}</td>
              <td><StatusBadge :status="u.is_active" /></td>
              <td>
                <div class="flex items-center gap-2">
                  <button class="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium" @click="openEdit(u)">Edit</button>
                  <button
                    :class="['text-xs px-2.5 py-1 rounded-md font-medium transition-colors',
                             u.is_active === 'active' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100']"
                    @click="openStatusChange(u)"
                  >{{ u.is_active === 'active' ? 'Disable' : 'Enable' }}</button>
                  <button class="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 font-medium" @click="openDelete(u)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal :is-open="modal" :title="isEdit ? 'Edit User' : 'Add User'" size="lg" @close="modal = false">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="form-label">Name</label>
          <input v-model="form.name" type="text" class="form-input" placeholder="Full name"/>
        </div>
        <div>
          <label class="form-label">Email <span class="text-red-500">*</span></label>
          <input v-model="form.email" type="email" class="form-input" placeholder="user@example.com"/>
        </div>
        <div>
          <label class="form-label">Phone</label>
          <input v-model="form.phone" type="text" class="form-input" placeholder="+1 234 567 8900"/>
        </div>
        <div>
          <label class="form-label">{{ isEdit ? 'New Password' : 'Password' }} {{ !isEdit ? '*' : '' }}</label>
          <input v-model="form.password" type="password" class="form-input" :placeholder="isEdit ? 'Leave blank to keep' : 'Enter password'"/>
        </div>
        <div>
          <label class="form-label">Role <span class="text-red-500">*</span></label>
          <select v-model="form.user_type" class="form-select">
            <option v-for="r in ROLES" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Business</label>
          <select v-model="form.business_code" class="form-select">
            <option value="">— None —</option>
            <option v-for="b in businesses" :key="b.business_code" :value="b.business_code">{{ b.name }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Status</label>
          <select v-model="form.is_active" class="form-select">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="modal = false">Cancel</button>
        <button class="btn-primary" :disabled="saving" @click="save">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ isEdit ? 'Save Changes' : 'Create User' }}
        </button>
      </template>
    </AppModal>

    <ConfirmDialog
      :is-open="confirmDialog"
      :title="targetStatus === 'inactive' ? 'Disable User' : 'Enable User'"
      :message="`Are you sure you want to ${targetStatus === 'inactive' ? 'disable' : 'enable'} this user?`"
      :danger="targetStatus === 'inactive'"
      :loading="confirmLoading"
      @confirm="confirmStatus"
      @cancel="confirmDialog = false"
    />
    <ConfirmDialog
      :is-open="deleteConfirm"
      title="Delete User"
      message="This will deactivate the user account. Are you sure?"
      confirm-label="Delete"
      :danger="true"
      :loading="deleteLoading"
      @confirm="deleteUser"
      @cancel="deleteConfirm = false"
    />
  </div>
</template>
