<script setup lang="ts">
// ChargesView — CRUD management page for the fee/charge catalog.
// Charges are defined here and then applied to appointments during booking.
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import AppModal from '@/components/common/AppModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { chargeApi } from '@/api/charge.api'
import { businessApi } from '@/api/business.api'
import { useToast } from '@/composables/useToast'
import type { Charge, Business } from '@/types'

const { success, error } = useToast()
const charges    = ref<Charge[]>([])
const businesses = ref<Business[]>([])
const loading    = ref(true)
const search     = ref('')
const modal      = ref(false)
const isEdit     = ref(false)
const saving     = ref(false)
const deleteConfirm  = ref(false)
const deleteLoading  = ref(false)
const targetCode     = ref('')

const CHARGE_UOMS = ['flat', 'percentage', 'per_hour', 'per_day', 'per_unit']

const form = ref({
  business_code: '', name: '', description: '', charge_uom: 'flat', charge_value: '',
})

async function loadData() {
  loading.value = true
  try {
    const [cRes, bRes] = await Promise.all([chargeApi.getAll(), businessApi.getAll()])
    charges.value    = cRes.data?.data ?? cRes.data ?? []
    businesses.value = bRes.data?.data ?? bRes.data ?? []
  } catch { error('Failed to load data') }
  finally { loading.value = false }
}

onMounted(loadData)

function openCreate() {
  isEdit.value = false
  form.value = { business_code: '', name: '', description: '', charge_uom: 'flat', charge_value: '' }
  modal.value = true
}

function openEdit(c: Charge) {
  isEdit.value = true
  targetCode.value = c.charge_code
  form.value = {
    business_code: c.business_code, name: c.name, description: c.description || '',
    charge_uom: c.charge_uom, charge_value: c.charge_value.toString(),
  }
  modal.value = true
}

function openDelete(c: Charge) {
  targetCode.value = c.charge_code
  deleteConfirm.value = true
}

async function save() {
  if (!form.value.name.trim() || !form.value.charge_value) { error('Name and charge value are required'); return }
  saving.value = true
  try {
    const payload = { ...form.value, charge_value: parseFloat(form.value.charge_value) }
    if (isEdit.value) {
      await chargeApi.update(targetCode.value, payload)
      success('Charge updated')
    } else {
      await chargeApi.create(payload)
      success('Charge created')
    }
    modal.value = false; loadData()
  } catch (err: any) {
    error(err?.response?.data?.message || 'Operation failed')
  } finally { saving.value = false }
}

async function deleteCharge() {
  deleteLoading.value = true
  try {
    await chargeApi.delete(targetCode.value)
    success('Charge deleted')
    deleteConfirm.value = false; loadData()
  } catch { error('Failed to delete') }
  finally { deleteLoading.value = false }
}

const filtered = () => charges.value.filter(c =>
  c.name.toLowerCase().includes(search.value.toLowerCase())
)

function bizName(code: string) {
  return businesses.value.find(b => b.business_code === code)?.name || code
}

function uomLabel(uom: string) {
  const map: Record<string, string> = { flat: 'Flat', percentage: 'Percentage (%)', per_hour: 'Per Hour', per_day: 'Per Day', per_unit: 'Per Unit' }
  return map[uom] || uom
}
</script>

<template>
  <div>
    <PageHeader title="Charges" subtitle="Manage appointment charges & fees" action-label="Add Charge" action-icon="M12 4v16m8-8H4" @action="openCreate"/>

    <div class="card">
      <div class="mb-4">
        <div class="relative max-w-xs">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="search" type="text" placeholder="Search charges..." class="form-input pl-9"/>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Business</th>
              <th>Type</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-10 text-gray-400">
                <svg class="w-5 h-5 animate-spin inline mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>Loading...
              </td>
            </tr>
            <tr v-else-if="!filtered().length">
              <td colspan="5" class="text-center py-10 text-gray-400">No charges found</td>
            </tr>
            <tr v-for="c in filtered()" :key="c.charge_code">
              <td>
                <p class="font-medium text-gray-800">{{ c.name }}</p>
                <p v-if="c.description" class="text-xs text-gray-400">{{ c.description }}</p>
              </td>
              <td class="text-gray-600 text-sm">{{ bizName(c.business_code) }}</td>
              <td>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">{{ uomLabel(c.charge_uom) }}</span>
              </td>
              <td class="font-semibold text-gray-800">{{ c.charge_uom === 'percentage' ? c.charge_value + '%' : '$' + c.charge_value }}</td>
              <td>
                <div class="flex items-center gap-2">
                  <button class="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium" @click="openEdit(c)">Edit</button>
                  <button class="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 font-medium" @click="openDelete(c)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal :is-open="modal" :title="isEdit ? 'Edit Charge' : 'Add Charge'" size="lg" @close="modal = false">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="form-label">Name <span class="text-red-500">*</span></label>
          <input v-model="form.name" type="text" class="form-input" placeholder="Charge name"/>
        </div>
        <div class="sm:col-span-2">
          <label class="form-label">Description</label>
          <input v-model="form.description" type="text" class="form-input" placeholder="Optional description"/>
        </div>
        <div>
          <label class="form-label">Business</label>
          <select v-model="form.business_code" class="form-select">
            <option value="">— None —</option>
            <option v-for="b in businesses" :key="b.business_code" :value="b.business_code">{{ b.name }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Charge Type</label>
          <select v-model="form.charge_uom" class="form-select">
            <option v-for="u in CHARGE_UOMS" :key="u" :value="u">{{ uomLabel(u) }}</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="form-label">Value <span class="text-red-500">*</span></label>
          <input v-model="form.charge_value" type="number" class="form-input" placeholder="e.g. 50"/>
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="modal = false">Cancel</button>
        <button class="btn-primary" :disabled="saving" @click="save">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ isEdit ? 'Save Changes' : 'Create Charge' }}
        </button>
      </template>
    </AppModal>

    <ConfirmDialog
      :is-open="deleteConfirm"
      title="Delete Charge"
      message="Are you sure you want to delete this charge?"
      confirm-label="Delete"
      :danger="true"
      :loading="deleteLoading"
      @confirm="deleteCharge"
      @cancel="deleteConfirm = false"
    />
  </div>
</template>
