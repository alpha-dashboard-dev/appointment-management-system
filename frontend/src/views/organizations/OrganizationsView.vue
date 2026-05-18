<script setup lang="ts">
// OrganizationsView — CRUD management page for top-level tenant organizations.
// Pattern shared by most views: load list on mount, open a modal to create/edit,
// use ConfirmDialog for destructive actions (status changes / deletes).
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import AppModal from '@/components/common/AppModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { organizationApi } from '@/api/organization.api'
import { useToast } from '@/composables/useToast'
import type { Organization } from '@/types'

const { success, error } = useToast()

const orgs    = ref<Organization[]>([])
const loading = ref(true)
const search  = ref('')

const modal  = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const confirmDialog = ref(false)
const confirmLoading = ref(false)
const targetCode = ref('')
const targetStatus = ref('')

const form = ref({ name: '', status: 'active' as 'active' | 'inactive' })

async function loadData() {
  loading.value = true
  try {
    const res = await organizationApi.getAll()
    orgs.value = res.data?.data ?? res.data ?? []
  } catch {
    error('Failed to load organizations')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function openCreate() {
  isEdit.value = false
  form.value = { name: '', status: 'active' }
  modal.value = true
}

function openEdit(org: Organization) {
  isEdit.value = true
  form.value = { name: org.name, status: org.status }
  targetCode.value = org.organization_code
  modal.value = true
}

function openStatusChange(org: Organization) {
  targetCode.value  = org.organization_code
  targetStatus.value = org.status === 'active' ? 'inactive' : 'active'
  confirmDialog.value = true
}

async function save() {
  if (!form.value.name.trim()) { error('Name is required'); return }
  saving.value = true
  try {
    if (isEdit.value) {
      await organizationApi.update(targetCode.value, form.value)
      success('Organization updated')
    } else {
      await organizationApi.create(form.value)
      success('Organization created')
    }
    modal.value = false
    loadData()
  } catch (err: any) {
    error(err?.response?.data?.message || 'Operation failed')
  } finally {
    saving.value = false
  }
}

async function confirmStatus() {
  confirmLoading.value = true
  try {
    await organizationApi.changeStatus(targetCode.value, targetStatus.value)
    success(`Organization ${targetStatus.value}`)
    confirmDialog.value = false
    loadData()
  } catch {
    error('Failed to change status')
  } finally {
    confirmLoading.value = false
  }
}

const filtered = () => orgs.value.filter(o =>
  o.name.toLowerCase().includes(search.value.toLowerCase()) ||
  o.organization_code.toLowerCase().includes(search.value.toLowerCase())
)
</script>

<template>
  <div>
    <PageHeader
      title="Organizations"
      subtitle="Manage top-level organizations"
      action-label="Add Organization"
      action-icon="M12 4v16m8-8H4"
      @action="openCreate"
    />

    <div class="card">
      <!-- Search -->
      <div class="mb-4 flex items-center gap-3">
        <div class="relative flex-1 max-w-xs">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="search" type="text" placeholder="Search organizations..." class="form-input pl-9" />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-10">
                <div class="flex items-center justify-center gap-2 text-gray-400">
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Loading...
                </div>
              </td>
            </tr>
            <tr v-else-if="!filtered().length">
              <td colspan="5" class="text-center py-10 text-gray-400">No organizations found</td>
            </tr>
            <tr v-for="org in filtered()" :key="org.organization_code">
              <td class="font-mono text-xs text-gray-500">{{ org.organization_code }}</td>
              <td class="font-medium text-gray-800">{{ org.name }}</td>
              <td><StatusBadge :status="org.status" /></td>
              <td class="text-gray-500 text-xs">{{ org.created_at ? new Date(org.created_at).toLocaleDateString() : '—' }}</td>
              <td>
                <div class="flex items-center gap-2">
                  <button class="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium"
                          @click="openEdit(org)">Edit</button>
                  <button
                    :class="['text-xs px-2.5 py-1 rounded-md font-medium transition-colors',
                             org.status === 'active'
                               ? 'bg-red-50 text-red-700 hover:bg-red-100'
                               : 'bg-green-50 text-green-700 hover:bg-green-100']"
                    @click="openStatusChange(org)"
                  >
                    {{ org.status === 'active' ? 'Deactivate' : 'Activate' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <AppModal :is-open="modal" :title="isEdit ? 'Edit Organization' : 'Add Organization'" @close="modal = false">
      <div class="space-y-4">
        <div>
          <label class="form-label">Name <span class="text-red-500">*</span></label>
          <input v-model="form.name" type="text" class="form-input" placeholder="Organization name" />
        </div>
        <div>
          <label class="form-label">Status</label>
          <select v-model="form.status" class="form-select">
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
          {{ isEdit ? 'Save Changes' : 'Create' }}
        </button>
      </template>
    </AppModal>

    <!-- Confirm dialog -->
    <ConfirmDialog
      :is-open="confirmDialog"
      :title="`${targetStatus === 'inactive' ? 'Deactivate' : 'Activate'} Organization`"
      :message="`Are you sure you want to ${targetStatus === 'inactive' ? 'deactivate' : 'activate'} this organization?`"
      :confirm-label="targetStatus === 'inactive' ? 'Deactivate' : 'Activate'"
      :danger="targetStatus === 'inactive'"
      :loading="confirmLoading"
      @confirm="confirmStatus"
      @cancel="confirmDialog = false"
    />
  </div>
</template>
