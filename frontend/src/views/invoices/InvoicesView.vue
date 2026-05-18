<script setup lang="ts">
// InvoicesView — management page for billing invoices.
// Invoices are linked to appointments and track payment lifecycle (draft → sent → paid).
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import AppModal from '@/components/common/AppModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { invoiceApi } from '@/api/invoice.api'
import { appointmentApi } from '@/api/appointment.api'
import { businessApi } from '@/api/business.api'
import { useToast } from '@/composables/useToast'
import type { Invoice, Appointment, Business } from '@/types'

const { success, error } = useToast()
const invoices      = ref<Invoice[]>([])
const appointments  = ref<Appointment[]>([])
const businesses    = ref<Business[]>([])
const loading       = ref(true)
const search        = ref('')
const statusFilter  = ref('')
const modal         = ref(false)
const isEdit        = ref(false)
const saving        = ref(false)
const statusModal   = ref(false)
const targetId      = ref(0)
const newStatus     = ref('')

const STATUSES = ['draft', 'sent', 'paid', 'cancelled']

const form = ref({
  businessCode: '', appointmentCode: '', subtotal: '', total: '', date: '',
})

async function loadData() {
  loading.value = true
  try {
    const [iRes, aRes, bRes] = await Promise.all([invoiceApi.getAll(), appointmentApi.getAll(), businessApi.getAll()])
    invoices.value     = iRes.data?.data ?? iRes.data ?? []
    appointments.value = aRes.data?.data ?? aRes.data ?? []
    businesses.value   = bRes.data?.data ?? bRes.data ?? []
  } catch { error('Failed to load data') }
  finally { loading.value = false }
}

onMounted(loadData)

function openCreate() {
  isEdit.value = false
  form.value = { businessCode: '', appointmentCode: '', subtotal: '', total: '', date: new Date().toISOString().split('T')[0] }
  modal.value = true
}

function openEdit(inv: Invoice) {
  isEdit.value = true
  targetId.value = inv.id
  form.value = {
    businessCode: inv.businessCode, appointmentCode: inv.appointmentCode,
    subtotal: inv.subtotal?.toString() || '', total: inv.total?.toString() || '', date: inv.date,
  }
  modal.value = true
}

function openStatusChange(inv: Invoice) {
  targetId.value = inv.id
  newStatus.value = inv.status
  statusModal.value = true
}

async function save() {
  if (!form.value.appointmentCode) { error('Appointment is required'); return }
  saving.value = true
  try {
    const payload = {
      ...form.value,
      subtotal: form.value.subtotal ? parseFloat(form.value.subtotal) : null,
      total:    form.value.total    ? parseFloat(form.value.total)    : null,
    }
    if (isEdit.value) {
      await invoiceApi.update(targetId.value, payload)
      success('Invoice updated')
    } else {
      await invoiceApi.create(payload)
      success('Invoice created')
    }
    modal.value = false; loadData()
  } catch (err: any) {
    error(err?.response?.data?.message || 'Operation failed')
  } finally { saving.value = false }
}

async function saveStatus() {
  try {
    await invoiceApi.changeStatus(targetId.value, newStatus.value)
    success('Status updated')
    statusModal.value = false; loadData()
  } catch (err: any) {
    error(err?.response?.data?.message || 'Failed to update status')
  }
}

const filtered = () => invoices.value.filter(inv => {
  const matchSearch = inv.appointmentCode.toLowerCase().includes(search.value.toLowerCase())
  const matchStatus = !statusFilter.value || inv.status === statusFilter.value
  return matchSearch && matchStatus
})

function bizName(code: string) {
  return businesses.value.find(b => b.business_code === code)?.name || code
}
</script>

<template>
  <div>
    <PageHeader title="Invoices" subtitle="Manage billing invoices" action-label="Create Invoice" action-icon="M12 4v16m8-8H4" @action="openCreate"/>

    <div class="card">
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <div class="relative max-w-xs flex-1">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="search" type="text" placeholder="Search by appointment code..." class="form-input pl-9"/>
        </div>
        <select v-model="statusFilter" class="form-select w-auto">
          <option value="">All Statuses</option>
          <option v-for="s in STATUSES" :key="s" :value="s" class="capitalize">{{ s }}</option>
        </select>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-4 gap-3 mb-5">
        <div v-for="s in STATUSES" :key="s"
             :class="['p-3 rounded-xl border cursor-pointer transition-all', statusFilter === s ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 hover:border-gray-200']"
             @click="statusFilter = statusFilter === s ? '' : s">
          <p class="text-xs text-gray-500 capitalize">{{ s }}</p>
          <p class="text-xl font-bold text-gray-800">{{ invoices.filter(i => i.status === s).length }}</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Appointment</th>
              <th>Business</th>
              <th>Date</th>
              <th>Subtotal</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-10 text-gray-400">
                <svg class="w-5 h-5 animate-spin inline mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>Loading...
              </td>
            </tr>
            <tr v-else-if="!filtered().length">
              <td colspan="8" class="text-center py-10 text-gray-400">No invoices found</td>
            </tr>
            <tr v-for="inv in filtered()" :key="inv.id">
              <td class="font-medium text-gray-700">#{{ inv.id }}</td>
              <td class="font-mono text-xs text-gray-500">{{ inv.appointmentCode }}</td>
              <td class="text-gray-600 text-sm">{{ bizName(inv.businessCode) }}</td>
              <td class="text-gray-600 text-sm">{{ new Date(inv.date).toLocaleDateString() }}</td>
              <td class="text-gray-700">{{ inv.subtotal != null ? '$' + inv.subtotal : '—' }}</td>
              <td class="font-semibold text-gray-800">{{ inv.total != null ? '$' + inv.total : '—' }}</td>
              <td><StatusBadge :status="inv.status" /></td>
              <td>
                <div class="flex items-center gap-2">
                  <button class="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium" @click="openEdit(inv)">Edit</button>
                  <button class="text-xs px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100 font-medium" @click="openStatusChange(inv)">Status</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppModal :is-open="modal" :title="isEdit ? 'Edit Invoice' : 'Create Invoice'" size="lg" @close="modal = false">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="form-label">Appointment <span class="text-red-500">*</span></label>
          <select v-model="form.appointmentCode" class="form-select">
            <option value="">— Select appointment —</option>
            <option v-for="a in appointments" :key="a.appointment_code" :value="a.appointment_code">
              {{ a.appointment_code }} ({{ a.appointment_start_date }})
            </option>
          </select>
        </div>
        <div>
          <label class="form-label">Business</label>
          <select v-model="form.businessCode" class="form-select">
            <option value="">— None —</option>
            <option v-for="b in businesses" :key="b.business_code" :value="b.business_code">{{ b.name }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Date</label>
          <input v-model="form.date" type="date" class="form-input"/>
        </div>
        <div>
          <label class="form-label">Subtotal</label>
          <input v-model="form.subtotal" type="number" class="form-input" placeholder="0.00"/>
        </div>
        <div>
          <label class="form-label">Total</label>
          <input v-model="form.total" type="number" class="form-input" placeholder="0.00"/>
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="modal = false">Cancel</button>
        <button class="btn-primary" :disabled="saving" @click="save">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ isEdit ? 'Save Changes' : 'Create Invoice' }}
        </button>
      </template>
    </AppModal>

    <!-- Status Modal -->
    <AppModal :is-open="statusModal" title="Change Invoice Status" size="sm" @close="statusModal = false">
      <div>
        <label class="form-label">New Status</label>
        <select v-model="newStatus" class="form-select">
          <option v-for="s in STATUSES" :key="s" :value="s" class="capitalize">{{ s }}</option>
        </select>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="statusModal = false">Cancel</button>
        <button class="btn-primary" @click="saveStatus">Update Status</button>
      </template>
    </AppModal>
  </div>
</template>
