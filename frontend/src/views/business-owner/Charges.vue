<template>
  <div class="page">
    <div class="header">
      <div><h2>Charges</h2><p class="sub">Manage your business charges</p></div>
      <button class="btn" @click="showCreateModal = true">+ New Charge</button>
    </div>
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <table v-else class="table">
        <thead><tr><th>Name</th><th>Code</th><th>Value</th><th>Unit</th><th>Description</th><th width="80">Actions</th></tr></thead>
        <tbody>
          <tr v-for="charge in charges" :key="charge.charge_code">
            <td>{{ charge.name }}</td>
            <td><code>{{ charge.charge_code }}</code></td>
            <td>{{ charge.charge_value }}</td>
            <td>{{ charge.charge_uom }}</td>
            <td>{{ charge.description || '—' }}</td>
            <td><button class="delete-btn" @click="openDelete(charge)">Delete</button></td>
          </tr>
          <tr v-if="charges.length === 0"><td colspan="6" class="empty">No charges found</td></tr>
        </tbody>
      </table>
    </div>

    <!-- CREATE MODAL -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header"><h3>New Charge</h3><button class="close" @click="showCreateModal = false">✕</button></div>
        <form class="form" @submit.prevent="createCharge">
          <div class="field"><label>Name *</label><input v-model="createForm.name" placeholder="Charge name" required /></div>
          <div class="field">
            <label>Unit of Measure *</label>
            <select v-model="createForm.charge_uom" required>
              <option value="">Select UOM</option>
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
              <option value="per_hour">Per Hour</option>
              <option value="per_service">Per Service</option>
            </select>
          </div>
          <div class="field"><label>Charge Value *</label><input v-model.number="createForm.charge_value" type="number" step="0.01" min="0" placeholder="0.00" required /></div>
          <div class="field"><label>Description</label><textarea v-model="createForm.description" rows="2"></textarea></div>
          <p v-if="formError" class="error-msg">{{ formError }}</p>
          <button type="submit" class="save-btn" :disabled="saving">{{ saving ? 'Creating...' : 'Create' }}</button>
        </form>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal delete-modal">
        <h3>Delete Charge</h3>
        <p>Delete <strong>{{ selected?.name }}</strong>?</p>
        <div class="actions">
          <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
          <button class="delete-confirm-btn" @click="deleteCharge" :disabled="saving">{{ saving ? '...' : 'Delete' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'

const authStore = useAuthStore()
const charges = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)

const createForm = reactive({ name: '', charge_uom: '', charge_value: '', description: '' })

async function fetchCharges() {
  loading.value = true
  error.value = ''
  try {
    const biz = authStore.user?.business_code
    const res = await api.get('/charges/get-charge', { params: biz ? { business_code: biz } : {} })
    charges.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load charges'
  } finally {
    loading.value = false
  }
}

function openDelete(charge) { selected.value = charge; showDeleteModal.value = true }

async function createCharge() {
  saving.value = true
  formError.value = ''
  try {
    const biz = authStore.user?.business_code
    const payload = { ...createForm, business_code: biz }
    if (!payload.description) delete payload.description
    await api.post('/charges/create-charge', payload)
    showCreateModal.value = false
    Object.assign(createForm, { name: '', charge_uom: '', charge_value: '', description: '' })
    await fetchCharges()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Create failed'
  } finally {
    saving.value = false
  }
}

async function deleteCharge() {
  saving.value = true
  try {
    await api.delete(`/charges/delete-charge${selected.value.charge_code}`)
    showDeleteModal.value = false
    await fetchCharges()
  } catch (err) {
    error.value = err.response?.data?.message || 'Delete failed'
  } finally {
    saving.value = false
  }
}

onMounted(fetchCharges)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; align-items: center; justify-content: space-between; }
.header h2 { margin: 0; color: #1e293b; }
.sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }
.btn { background: #0f172a; color: white; border: none; padding: 9px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.delete-btn { background: #fee2e2; color: #dc2626; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 10px; padding: 24px; width: 440px; max-width: 90%; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.delete-modal { text-align: center; }
.delete-modal h3 { margin: 0 0 12px; }
.delete-modal p { color: #64748b; margin-bottom: 16px; }
.actions { display: flex; gap: 10px; justify-content: center; }
.cancel-btn { background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.delete-confirm-btn { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field select, .field textarea { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; font-family: inherit; }
.save-btn { background: #0f172a; color: white; border: none; padding: 10px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
