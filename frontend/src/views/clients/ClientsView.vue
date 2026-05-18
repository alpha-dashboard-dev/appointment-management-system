<script setup lang="ts">
// ClientsView — CRUD management page for end-customers (clients).
// Loads the client list and a supporting businesses list for the form dropdown.
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import AppModal from '@/components/common/AppModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { clientApi } from '@/api/client.api'
import { businessApi } from '@/api/business.api'
import { useToast } from '@/composables/useToast'
import type { Client, Business } from '@/types'

const { success, error } = useToast()
const clients    = ref<Client[]>([])
const businesses = ref<Business[]>([])
const loading = ref(true)
const search  = ref('')
const modal   = ref(false)
const isEdit  = ref(false)
const saving  = ref(false)
const deleteConfirm  = ref(false)
const deleteLoading  = ref(false)
const targetCode = ref('')

const form = ref({ business_code: '', user_code: '', name: '', email: '', phone: '', address: '' })

async function loadData() {
  loading.value = true
  try {
    const [cRes, bRes] = await Promise.all([clientApi.getAll(), businessApi.getAll()])
    clients.value    = cRes.data?.data ?? cRes.data ?? []
    businesses.value = bRes.data?.data ?? bRes.data ?? []
  } catch { error('Failed to load data') }
  finally { loading.value = false }
}

onMounted(loadData)

function openCreate() {
  isEdit.value = false
  form.value = { business_code: '', user_code: '', name: '', email: '', phone: '', address: '' }
  modal.value = true
}

function openEdit(c: Client) {
  isEdit.value = true
  targetCode.value = c.user_code
  form.value = { business_code: c.business_code, user_code: c.user_code, name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '' }
  modal.value = true
}

function openDelete(c: Client) {
  targetCode.value = c.user_code
  deleteConfirm.value = true
}

async function save() {
  if (!form.value.name.trim()) { error('Name is required'); return }
  saving.value = true
  try {
    if (isEdit.value) {
      await clientApi.update(targetCode.value, form.value)
      success('Client updated')
    } else {
      await clientApi.create(form.value)
      success('Client created')
    }
    modal.value = false; loadData()
  } catch (err: any) {
    error(err?.response?.data?.message || 'Operation failed')
  } finally { saving.value = false }
}

async function deleteClient() {
  deleteLoading.value = true
  try {
    await clientApi.delete(targetCode.value)
    success('Client deleted')
    deleteConfirm.value = false; loadData()
  } catch { error('Failed to delete') }
  finally { deleteLoading.value = false }
}

const filtered = () => clients.value.filter(c =>
  c.name.toLowerCase().includes(search.value.toLowerCase()) ||
  (c.email || '').toLowerCase().includes(search.value.toLowerCase())
)

function bizName(code: string) {
  return businesses.value.find(b => b.business_code === code)?.name || code
}
</script>

<template>
  <div>
    <PageHeader title="Clients" subtitle="Manage client records" action-label="Add Client" action-icon="M12 4v16m8-8H4" @action="openCreate"/>

    <div class="card">
      <div class="mb-4">
        <div class="relative max-w-xs">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="search" type="text" placeholder="Search clients..." class="form-input pl-9"/>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Business</th>
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
              <td colspan="5" class="text-center py-10 text-gray-400">No clients found</td>
            </tr>
            <tr v-for="c in filtered()" :key="c.user_code">
              <td>
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-teal-500 shrink-0">
                    {{ c.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-medium text-gray-800">{{ c.name }}</span>
                </div>
              </td>
              <td class="text-gray-600">{{ c.email || '—' }}</td>
              <td class="text-gray-600">{{ c.phone || '—' }}</td>
              <td class="text-gray-500 text-sm">{{ bizName(c.business_code) }}</td>
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

    <AppModal :is-open="modal" :title="isEdit ? 'Edit Client' : 'Add Client'" size="lg" @close="modal = false">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="form-label">Name <span class="text-red-500">*</span></label>
          <input v-model="form.name" type="text" class="form-input" placeholder="Client full name"/>
        </div>
        <div>
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" class="form-input" placeholder="client@example.com"/>
        </div>
        <div>
          <label class="form-label">Phone</label>
          <input v-model="form.phone" type="text" class="form-input" placeholder="+1 234 567 8900"/>
        </div>
        <div>
          <label class="form-label">User Code</label>
          <input v-model="form.user_code" type="text" class="form-input" placeholder="Linked user code" :disabled="isEdit"/>
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
          <input v-model="form.address" type="text" class="form-input" placeholder="Client address"/>
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="modal = false">Cancel</button>
        <button class="btn-primary" :disabled="saving" @click="save">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ isEdit ? 'Save Changes' : 'Create Client' }}
        </button>
      </template>
    </AppModal>

    <ConfirmDialog
      :is-open="deleteConfirm"
      title="Delete Client"
      message="Are you sure you want to delete this client?"
      confirm-label="Delete"
      :danger="true"
      :loading="deleteLoading"
      @confirm="deleteClient"
      @cancel="deleteConfirm = false"
    />
  </div>
</template>
