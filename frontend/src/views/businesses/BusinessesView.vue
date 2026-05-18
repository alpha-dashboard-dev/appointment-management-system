<script setup lang="ts">
// BusinessesView — CRUD management page for businesses (sub-tenants of an organization).
// Loads the businesses list and a supporting organizations list for the form dropdown.
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import AppModal from '@/components/common/AppModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { businessApi } from '@/api/business.api'
import { organizationApi } from '@/api/organization.api'
import { useToast } from '@/composables/useToast'
import type { Business, Organization } from '@/types'

const { success, error } = useToast()

const businesses  = ref<Business[]>([])
const orgs        = ref<Organization[]>([])
const loading     = ref(true)
const search      = ref('')
const modal       = ref(false)
const isEdit      = ref(false)
const saving      = ref(false)
const confirmDialog   = ref(false)
const confirmLoading  = ref(false)
const targetCode      = ref('')
const targetStatus    = ref('')

const form = ref({
  organization_code: '',
  name: '', email: '', phone: '', address: '', timezone: '',
})

async function loadData() {
  loading.value = true
  try {
    const [bizRes, orgRes] = await Promise.all([businessApi.getAll(), organizationApi.getAll()])
    businesses.value = bizRes.data?.data ?? bizRes.data ?? []
    orgs.value       = orgRes.data?.data ?? orgRes.data ?? []
  } catch {
    error('Failed to load data')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function openCreate() {
  isEdit.value = false
  form.value = { organization_code: '', name: '', email: '', phone: '', address: '', timezone: '' }
  modal.value = true
}

function openEdit(b: Business) {
  isEdit.value = true
  targetCode.value = b.business_code
  form.value = {
    organization_code: b.organization_code,
    name: b.name, email: b.email || '', phone: b.phone || '',
    address: b.address || '', timezone: b.timezone || '',
  }
  modal.value = true
}

function openStatusChange(b: Business) {
  targetCode.value  = b.business_code
  targetStatus.value = b.status === 'active' ? 'inactive' : 'active'
  confirmDialog.value = true
}

async function save() {
  if (!form.value.name.trim() || !form.value.organization_code) {
    error('Name and Organization are required'); return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await businessApi.update(targetCode.value, form.value)
      success('Business updated')
    } else {
      await businessApi.create(form.value)
      success('Business created (owner account auto-created)')
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
    await businessApi.changeStatus(targetCode.value, targetStatus.value)
    success(`Business ${targetStatus.value}`)
    confirmDialog.value = false
    loadData()
  } catch {
    error('Failed to change status')
  } finally {
    confirmLoading.value = false
  }
}

const filtered = () => businesses.value.filter(b =>
  b.name.toLowerCase().includes(search.value.toLowerCase()) ||
  b.business_code.toLowerCase().includes(search.value.toLowerCase())
)

function orgName(code: string) {
  return orgs.value.find(o => o.organization_code === code)?.name || code
}
</script>

<template>
  <div>
    <PageHeader
      title="Businesses"
      subtitle="Manage business tenants"
      action-label="Add Business"
      action-icon="M12 4v16m8-8H4"
      @action="openCreate"
    />

    <div class="card">
      <div class="mb-4">
        <div class="relative max-w-xs">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="search" type="text" placeholder="Search businesses..." class="form-input pl-9" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Organization</th>
              <th>Phone</th>
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
              <td colspan="6" class="text-center py-10 text-gray-400">No businesses found</td>
            </tr>
            <tr v-for="b in filtered()" :key="b.business_code">
              <td class="font-mono text-xs text-gray-500">{{ b.business_code }}</td>
              <td class="font-medium text-gray-800">{{ b.name }}</td>
              <td class="text-gray-600">{{ orgName(b.organization_code) }}</td>
              <td class="text-gray-500">{{ b.phone || '—' }}</td>
              <td><StatusBadge :status="b.status" /></td>
              <td>
                <div class="flex items-center gap-2">
                  <button class="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium" @click="openEdit(b)">Edit</button>
                  <button
                    :class="['text-xs px-2.5 py-1 rounded-md font-medium transition-colors',
                             b.status === 'active' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100']"
                    @click="openStatusChange(b)"
                  >{{ b.status === 'active' ? 'Deactivate' : 'Activate' }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal :is-open="modal" :title="isEdit ? 'Edit Business' : 'Add Business'" size="lg" @close="modal = false">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="form-label">Organization <span class="text-red-500">*</span></label>
          <select v-model="form.organization_code" class="form-select">
            <option value="">Select organization</option>
            <option v-for="o in orgs" :key="o.organization_code" :value="o.organization_code">{{ o.name }}</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="form-label">Business Name <span class="text-red-500">*</span></label>
          <input v-model="form.name" type="text" class="form-input" placeholder="Business name" />
        </div>
        <div>
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" class="form-input" placeholder="business@example.com" />
        </div>
        <div>
          <label class="form-label">Phone</label>
          <input v-model="form.phone" type="text" class="form-input" placeholder="+1 234 567 8900" />
        </div>
        <div>
          <label class="form-label">Address</label>
          <input v-model="form.address" type="text" class="form-input" placeholder="Business address" />
        </div>
        <div>
          <label class="form-label">Timezone</label>
          <input v-model="form.timezone" type="text" class="form-input" placeholder="e.g. Asia/Karachi" />
        </div>
      </div>
      <p v-if="!isEdit" class="mt-3 text-xs text-gray-400">
        A business owner account will be automatically created with the business code as the default password.
      </p>
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

    <ConfirmDialog
      :is-open="confirmDialog"
      :title="`${targetStatus === 'inactive' ? 'Deactivate' : 'Activate'} Business`"
      :message="`Are you sure you want to ${targetStatus === 'inactive' ? 'deactivate' : 'activate'} this business?`"
      :danger="targetStatus === 'inactive'"
      :loading="confirmLoading"
      @confirm="confirmStatus"
      @cancel="confirmDialog = false"
    />
  </div>
</template>
