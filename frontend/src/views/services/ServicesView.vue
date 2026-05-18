<script setup lang="ts">
// ServicesView — CRUD management page for the service catalog.
// Services can be enabled/disabled and are scoped to a business.
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import AppModal from '@/components/common/AppModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { serviceApi } from '@/api/service.api'
import { businessApi } from '@/api/business.api'
import { useToast } from '@/composables/useToast'
import type { Service, Business } from '@/types'

const { success, error } = useToast()
const services   = ref<Service[]>([])
const businesses = ref<Business[]>([])
const loading    = ref(true)
const search     = ref('')
const modal      = ref(false)
const isEdit     = ref(false)
const saving     = ref(false)
const confirmDialog  = ref(false)
const confirmLoading = ref(false)
const targetCode     = ref('')
const targetStatus   = ref('')

const form = ref({
  business_code: '', name: '', description: '',
  price: '', cost: '', currency: 'PKR',
  duration_uom: 'minutes', duration_value: '',
  status: 'active',
})

async function loadData() {
  loading.value = true
  try {
    const [sRes, bRes] = await Promise.all([serviceApi.getAll(), businessApi.getAll()])
    services.value   = sRes.data?.data ?? sRes.data ?? []
    businesses.value = bRes.data?.data ?? bRes.data ?? []
  } catch { error('Failed to load data') }
  finally { loading.value = false }
}

onMounted(loadData)

function openCreate() {
  isEdit.value = false
  form.value = { business_code: '', name: '', description: '', price: '', cost: '', currency: 'PKR', duration_uom: 'minutes', duration_value: '', status: 'active' }
  modal.value = true
}

function openEdit(s: Service) {
  isEdit.value = true
  targetCode.value = s.service_code
  form.value = {
    business_code: s.business_code, name: s.name, description: s.description || '',
    price: s.price?.toString() || '', cost: s.cost?.toString() || '', currency: s.currency,
    duration_uom: s.duration_uom || 'minutes', duration_value: s.duration_value?.toString() || '',
    status: s.status,
  }
  modal.value = true
}

function openStatusChange(s: Service) {
  targetCode.value   = s.service_code
  targetStatus.value = s.status === 'active' ? 'inactive' : 'active'
  confirmDialog.value = true
}

async function save() {
  if (!form.value.name.trim()) { error('Name is required'); return }
  saving.value = true
  try {
    const payload = {
      ...form.value,
      price: form.value.price ? parseFloat(form.value.price) : null,
      cost:  form.value.cost  ? parseFloat(form.value.cost)  : null,
      duration_value: form.value.duration_value ? parseInt(form.value.duration_value) : null,
    }
    if (isEdit.value) {
      await serviceApi.update(targetCode.value, payload)
      success('Service updated')
    } else {
      await serviceApi.create(payload)
      success('Service created')
    }
    modal.value = false; loadData()
  } catch (err: any) {
    error(err?.response?.data?.message || 'Operation failed')
  } finally { saving.value = false }
}

async function confirmStatus() {
  confirmLoading.value = true
  try {
    await serviceApi.changeStatus(targetCode.value, targetStatus.value)
    success(`Service ${targetStatus.value}`)
    confirmDialog.value = false; loadData()
  } catch { error('Failed to change status') }
  finally { confirmLoading.value = false }
}

const filtered = () => services.value.filter(s =>
  s.name.toLowerCase().includes(search.value.toLowerCase())
)

function bizName(code: string) {
  return businesses.value.find(b => b.business_code === code)?.name || code
}
</script>

<template>
  <div>
    <PageHeader title="Services" subtitle="Manage business services" action-label="Add Service" action-icon="M12 4v16m8-8H4" @action="openCreate"/>

    <div class="card">
      <div class="mb-4">
        <div class="relative max-w-xs">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="search" type="text" placeholder="Search services..." class="form-input pl-9"/>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Business</th>
              <th>Price</th>
              <th>Duration</th>
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
              <td colspan="6" class="text-center py-10 text-gray-400">No services found</td>
            </tr>
            <tr v-for="s in filtered()" :key="s.service_code">
              <td>
                <p class="font-medium text-gray-800">{{ s.name }}</p>
                <p v-if="s.description" class="text-xs text-gray-400 truncate max-w-[200px]">{{ s.description }}</p>
              </td>
              <td class="text-gray-600 text-sm">{{ bizName(s.business_code) }}</td>
              <td class="font-semibold text-gray-800">{{ s.price != null ? s.currency + ' ' + s.price : '—' }}</td>
              <td class="text-gray-500 text-sm">{{ s.duration_value ? `${s.duration_value} ${s.duration_uom}` : '—' }}</td>
              <td><StatusBadge :status="s.status" /></td>
              <td>
                <div class="flex items-center gap-2">
                  <button class="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium" @click="openEdit(s)">Edit</button>
                  <button
                    :class="['text-xs px-2.5 py-1 rounded-md font-medium transition-colors', s.status === 'active' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100']"
                    @click="openStatusChange(s)"
                  >{{ s.status === 'active' ? 'Deactivate' : 'Activate' }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal :is-open="modal" :title="isEdit ? 'Edit Service' : 'Add Service'" size="lg" @close="modal = false">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="form-label">Business</label>
          <select v-model="form.business_code" class="form-select">
            <option value="">— None —</option>
            <option v-for="b in businesses" :key="b.business_code" :value="b.business_code">{{ b.name }}</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="form-label">Service Name <span class="text-red-500">*</span></label>
          <input v-model="form.name" type="text" class="form-input" placeholder="Service name"/>
        </div>
        <div class="sm:col-span-2">
          <label class="form-label">Description</label>
          <textarea v-model="form.description" class="form-input" rows="2" placeholder="Brief description"></textarea>
        </div>
        <div>
          <label class="form-label">Price</label>
          <input v-model="form.price" type="number" class="form-input" placeholder="0.00"/>
        </div>
        <div>
          <label class="form-label">Cost</label>
          <input v-model="form.cost" type="number" class="form-input" placeholder="0.00"/>
        </div>
        <div>
          <label class="form-label">Currency</label>
          <select v-model="form.currency" class="form-select">
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label class="form-label">Duration</label>
          <div class="flex gap-2">
            <input v-model="form.duration_value" type="number" class="form-input" placeholder="e.g. 30"/>
            <select v-model="form.duration_uom" class="form-select w-auto">
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
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
          {{ isEdit ? 'Save Changes' : 'Create Service' }}
        </button>
      </template>
    </AppModal>

    <ConfirmDialog
      :is-open="confirmDialog"
      :title="`${targetStatus === 'inactive' ? 'Deactivate' : 'Activate'} Service`"
      :message="`Are you sure you want to ${targetStatus === 'inactive' ? 'deactivate' : 'activate'} this service?`"
      :danger="targetStatus === 'inactive'"
      :loading="confirmLoading"
      @confirm="confirmStatus"
      @cancel="confirmDialog = false"
    />
  </div>
</template>
