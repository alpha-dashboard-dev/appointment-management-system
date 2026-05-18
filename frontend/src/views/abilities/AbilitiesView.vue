<script setup lang="ts">
// AbilitiesView — RBAC ability assignment page.
// Grants or revokes fine-grained action/subject permissions for individual users.
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import AppModal from '@/components/common/AppModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { userAbilityApi } from '@/api/userAbility.api'
import { businessApi } from '@/api/business.api'
import { userApi } from '@/api/user.api'
import { useToast } from '@/composables/useToast'
import type { UserAbility, Business, User } from '@/types'

const { success, error } = useToast()
const abilities  = ref<UserAbility[]>([])
const businesses = ref<Business[]>([])
const users      = ref<User[]>([])
const loading    = ref(true)
const search     = ref('')
const modal      = ref(false)
const isEdit     = ref(false)
const saving     = ref(false)
const deleteConfirm  = ref(false)
const deleteLoading  = ref(false)
const targetId       = ref(0)

const USER_TYPES = ['admin', 'business_owner', 'operational_staff', 'service_staff', 'client']

const form = ref({
  business_code: '', user_code: '', user_type: 'operational_staff',
  ability: '', status: 'active',
})

async function loadData() {
  loading.value = true
  try {
    const [aRes, bRes, uRes] = await Promise.all([userAbilityApi.getAll(), businessApi.getAll(), userApi.getAll()])
    abilities.value  = aRes.data?.data ?? aRes.data ?? []
    businesses.value = bRes.data?.data ?? bRes.data ?? []
    users.value      = uRes.data?.data ?? uRes.data ?? []
  } catch { error('Failed to load data') }
  finally { loading.value = false }
}

onMounted(loadData)

function openCreate() {
  isEdit.value = false
  form.value = { business_code: '', user_code: '', user_type: 'operational_staff', ability: '', status: 'active' }
  modal.value = true
}

function openEdit(a: UserAbility) {
  isEdit.value = true
  targetId.value = a.id
  form.value = {
    business_code: a.business_code, user_code: a.user_code,
    user_type: a.user_type, ability: a.ability, status: a.status,
  }
  modal.value = true
}

function openDelete(a: UserAbility) {
  targetId.value = a.id
  deleteConfirm.value = true
}

async function save() {
  if (!form.value.ability.trim()) { error('Ability name is required'); return }
  saving.value = true
  try {
    if (isEdit.value) {
      await userAbilityApi.update(targetId.value, form.value)
      success('Ability updated')
    } else {
      await userAbilityApi.create(form.value)
      success('Ability created')
    }
    modal.value = false; loadData()
  } catch (err: any) {
    error(err?.response?.data?.message || 'Operation failed')
  } finally { saving.value = false }
}

async function deleteAbility() {
  deleteLoading.value = true
  try {
    await userAbilityApi.delete(targetId.value)
    success('Ability deleted')
    deleteConfirm.value = false; loadData()
  } catch { error('Failed to delete') }
  finally { deleteLoading.value = false }
}

const filtered = () => abilities.value.filter(a =>
  a.ability.toLowerCase().includes(search.value.toLowerCase()) ||
  a.user_type.toLowerCase().includes(search.value.toLowerCase())
)

function userName(code: string) {
  const u = users.value.find(u => u.user_code === code)
  return u?.name || u?.email || code
}

function bizName(code: string) {
  return businesses.value.find(b => b.business_code === code)?.name || code
}
</script>

<template>
  <div>
    <PageHeader title="User Abilities" subtitle="Manage custom permissions & abilities" action-label="Add Ability" action-icon="M12 4v16m8-8H4" @action="openCreate"/>

    <div class="card">
      <div class="mb-4">
        <div class="relative max-w-xs">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="search" type="text" placeholder="Search abilities..." class="form-input pl-9"/>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ability</th>
              <th>User</th>
              <th>User Type</th>
              <th>Business</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-10 text-gray-400">
                <svg class="w-5 h-5 animate-spin inline mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>Loading...
              </td>
            </tr>
            <tr v-else-if="!filtered().length">
              <td colspan="7" class="text-center py-10 text-gray-400">No abilities found</td>
            </tr>
            <tr v-for="a in filtered()" :key="a.id">
              <td class="text-gray-500">{{ a.id }}</td>
              <td>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                  {{ a.ability }}
                </span>
              </td>
              <td class="text-gray-700 text-sm">{{ userName(a.user_code) }}</td>
              <td>
                <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                  {{ a.user_type.replace(/_/g, ' ') }}
                </span>
              </td>
              <td class="text-gray-500 text-sm">{{ bizName(a.business_code) }}</td>
              <td><StatusBadge :status="a.status" /></td>
              <td>
                <div class="flex items-center gap-2">
                  <button class="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium" @click="openEdit(a)">Edit</button>
                  <button class="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 font-medium" @click="openDelete(a)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal :is-open="modal" :title="isEdit ? 'Edit Ability' : 'Add Ability'" size="lg" @close="modal = false">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="form-label">Business</label>
          <select v-model="form.business_code" class="form-select">
            <option value="">— None —</option>
            <option v-for="b in businesses" :key="b.business_code" :value="b.business_code">{{ b.name }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">User</label>
          <select v-model="form.user_code" class="form-select">
            <option value="">— None —</option>
            <option v-for="u in users" :key="u.user_code" :value="u.user_code">{{ u.name || u.email }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">User Type</label>
          <select v-model="form.user_type" class="form-select">
            <option v-for="t in USER_TYPES" :key="t" :value="t" class="capitalize">{{ t.replace(/_/g, ' ') }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Status</label>
          <select v-model="form.status" class="form-select">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="form-label">Ability <span class="text-red-500">*</span></label>
          <input v-model="form.ability" type="text" class="form-input" placeholder="e.g. manage_appointments, view_reports"/>
          <p class="text-xs text-gray-400 mt-1">Use snake_case for ability identifiers</p>
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="modal = false">Cancel</button>
        <button class="btn-primary" :disabled="saving" @click="save">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ isEdit ? 'Save Changes' : 'Create Ability' }}
        </button>
      </template>
    </AppModal>

    <ConfirmDialog
      :is-open="deleteConfirm"
      title="Delete Ability"
      message="Are you sure you want to delete this user ability?"
      confirm-label="Delete"
      :danger="true"
      :loading="deleteLoading"
      @confirm="deleteAbility"
      @cancel="deleteConfirm = false"
    />
  </div>
</template>
