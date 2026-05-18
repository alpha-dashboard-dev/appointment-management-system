<script setup lang="ts">
// LocationsView — CRUD management page for service delivery locations.
// Locations belong to a business and are linked to appointments.
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import AppModal from '@/components/common/AppModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { locationApi } from '@/api/location.api'
import { businessApi } from '@/api/business.api'
import { useToast } from '@/composables/useToast'
import type { Location, Business } from '@/types'

const { success, error } = useToast()
const locations  = ref<Location[]>([])
const businesses = ref<Business[]>([])
const loading    = ref(true)
const search     = ref('')
const modal      = ref(false)
const isEdit     = ref(false)
const saving     = ref(false)
const deleteConfirm  = ref(false)
const deleteLoading  = ref(false)
const targetCode     = ref('')

const LOCATION_TYPES = ['office', 'clinic', 'home', 'online', 'other']

const form = ref({
  business_code: '', location_type: 'office',
  address: '', street: '', apartment: '', city: '', postal_code: '', province: '', country: '',
})

async function loadData() {
  loading.value = true
  try {
    const [lRes, bRes] = await Promise.all([locationApi.getAll(), businessApi.getAll()])
    locations.value  = lRes.data?.data ?? lRes.data ?? []
    businesses.value = bRes.data?.data ?? bRes.data ?? []
  } catch { error('Failed to load data') }
  finally { loading.value = false }
}

onMounted(loadData)

function openCreate() {
  isEdit.value = false
  form.value = { business_code: '', location_type: 'office', address: '', street: '', apartment: '', city: '', postal_code: '', province: '', country: '' }
  modal.value = true
}

function openEdit(l: Location) {
  isEdit.value = true
  targetCode.value = l.location_code
  form.value = {
    business_code: l.business_code || '', location_type: l.location_type,
    address: l.address || '', street: l.street || '', apartment: l.apartment || '',
    city: l.city || '', postal_code: l.postal_code || '', province: l.province || '', country: l.country || '',
  }
  modal.value = true
}

function openDelete(l: Location) {
  targetCode.value = l.location_code
  deleteConfirm.value = true
}

async function save() {
  if (!form.value.location_type) { error('Location type is required'); return }
  saving.value = true
  try {
    if (isEdit.value) {
      await locationApi.update(targetCode.value, form.value)
      success('Location updated')
    } else {
      await locationApi.create(form.value)
      success('Location created')
    }
    modal.value = false; loadData()
  } catch (err: any) {
    error(err?.response?.data?.message || 'Operation failed')
  } finally { saving.value = false }
}

async function deleteLocation() {
  deleteLoading.value = true
  try {
    await locationApi.delete(targetCode.value)
    success('Location deleted')
    deleteConfirm.value = false; loadData()
  } catch { error('Failed to delete') }
  finally { deleteLoading.value = false }
}

const filtered = () => locations.value.filter(l =>
  (l.city || '').toLowerCase().includes(search.value.toLowerCase()) ||
  (l.address || '').toLowerCase().includes(search.value.toLowerCase()) ||
  l.location_type.toLowerCase().includes(search.value.toLowerCase())
)

function bizName(code?: string) {
  if (!code) return '—'
  return businesses.value.find(b => b.business_code === code)?.name || code
}

function fullAddress(l: Location) {
  return [l.street, l.city, l.province, l.country].filter(Boolean).join(', ') || l.address || '—'
}
</script>

<template>
  <div>
    <PageHeader title="Locations" subtitle="Manage business locations" action-label="Add Location" action-icon="M12 4v16m8-8H4" @action="openCreate"/>

    <div class="card">
      <div class="mb-4">
        <div class="relative max-w-xs">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="search" type="text" placeholder="Search locations..." class="form-input pl-9"/>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Address</th>
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
              <td colspan="6" class="text-center py-10 text-gray-400">No locations found</td>
            </tr>
            <tr v-for="l in filtered()" :key="l.location_code">
              <td class="font-mono text-xs text-gray-500">{{ l.location_code }}</td>
              <td>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">{{ l.location_type }}</span>
              </td>
              <td class="text-gray-600 text-sm max-w-[200px] truncate">{{ fullAddress(l) }}</td>
              <td class="text-gray-500 text-sm">{{ bizName(l.business_code) }}</td>
              <td><StatusBadge :status="l.status || 'active'" /></td>
              <td>
                <div class="flex items-center gap-2">
                  <button class="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium" @click="openEdit(l)">Edit</button>
                  <button class="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 font-medium" @click="openDelete(l)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal :is-open="modal" :title="isEdit ? 'Edit Location' : 'Add Location'" size="lg" @close="modal = false">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="form-label">Location Type <span class="text-red-500">*</span></label>
          <select v-model="form.location_type" class="form-select">
            <option v-for="t in LOCATION_TYPES" :key="t" :value="t" class="capitalize">{{ t }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Business</label>
          <select v-model="form.business_code" class="form-select">
            <option value="">— None —</option>
            <option v-for="b in businesses" :key="b.business_code" :value="b.business_code">{{ b.name }}</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="form-label">Address</label>
          <input v-model="form.address" type="text" class="form-input" placeholder="Full address"/>
        </div>
        <div>
          <label class="form-label">Street</label>
          <input v-model="form.street" type="text" class="form-input" placeholder="Street"/>
        </div>
        <div>
          <label class="form-label">Apartment / Unit</label>
          <input v-model="form.apartment" type="text" class="form-input" placeholder="Apt / Unit #"/>
        </div>
        <div>
          <label class="form-label">City</label>
          <input v-model="form.city" type="text" class="form-input" placeholder="City"/>
        </div>
        <div>
          <label class="form-label">Postal Code</label>
          <input v-model="form.postal_code" type="text" class="form-input" placeholder="Postal code"/>
        </div>
        <div>
          <label class="form-label">Province / State</label>
          <input v-model="form.province" type="text" class="form-input" placeholder="Province/State"/>
        </div>
        <div>
          <label class="form-label">Country</label>
          <input v-model="form.country" type="text" class="form-input" placeholder="Country"/>
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="modal = false">Cancel</button>
        <button class="btn-primary" :disabled="saving" @click="save">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ isEdit ? 'Save Changes' : 'Create Location' }}
        </button>
      </template>
    </AppModal>

    <ConfirmDialog
      :is-open="deleteConfirm"
      title="Delete Location"
      message="Are you sure you want to delete this location?"
      confirm-label="Delete"
      :danger="true"
      :loading="deleteLoading"
      @confirm="deleteLocation"
      @cancel="deleteConfirm = false"
    />
  </div>
</template>
