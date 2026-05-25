<template>
  <div class="page">
    <div class="header">
      <div><h2>Invoices</h2><p class="sub">View and manage invoices</p></div>
    </div>
    <div class="filters">
      <select v-model="statusFilter" @change="fetchInvoices">
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="paid">Paid</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <table v-else class="table">
        <thead><tr><th>ID</th><th>Total</th><th>Status</th><th>Created</th><th width="120">Actions</th></tr></thead>
        <tbody>
          <tr v-for="inv in invoices" :key="inv.id">
            <td>#{{ inv.id }}</td>
            <td>{{ inv.total_amount ?? '—' }}</td>
            <td><span :class="['badge', inv.status]">{{ inv.status }}</span></td>
            <td>{{ formatDate(inv.created_at) }}</td>
            <td><button class="view-btn" @click="openView(inv)">View</button></td>
          </tr>
          <tr v-if="invoices.length === 0"><td colspan="5" class="empty">No invoices found</td></tr>
        </tbody>
      </table>
    </div>

    <!-- VIEW MODAL -->
    <div v-if="showViewModal && selected" class="modal-overlay">
      <div class="modal">
        <div class="modal-header"><h3>Invoice #{{ selected.id }}</h3><button class="close" @click="showViewModal = false">✕</button></div>
        <div class="detail-grid">
          <div class="d-row"><span>Status</span><span :class="['badge', selected.status]">{{ selected.status }}</span></div>
          <div class="d-row"><span>Total</span><strong>{{ selected.total_amount }}</strong></div>
          <div class="d-row"><span>Created</span><span>{{ formatDate(selected.created_at) }}</span></div>
        </div>
        <div class="status-update">
          <label>Update Status</label>
          <select v-model="newStatus">
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button class="save-btn" @click="updateStatus" :disabled="saving">{{ saving ? '...' : 'Update' }}</button>
        </div>
        <p v-if="formError" class="error-msg">{{ formError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'

const authStore = useAuthStore()
const invoices = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const statusFilter = ref('')

const showViewModal = ref(false)
const selected = ref(null)
const newStatus = ref('')

function formatDate(d) { return d ? new Date(d).toLocaleDateString() : '—' }

async function fetchInvoices() {
  loading.value = true
  error.value = ''
  try {
    const biz = authStore.user?.business_code
    const params = {}
    if (biz) params.business_code = biz
    if (statusFilter.value) params.status = statusFilter.value
    const res = await api.get('/invoices/get-invoice', { params })
    invoices.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load invoices'
  } finally {
    loading.value = false
  }
}

function openView(inv) {
  selected.value = inv
  newStatus.value = inv.status
  formError.value = ''
  showViewModal.value = true
}

async function updateStatus() {
  saving.value = true
  formError.value = ''
  try {
    await api.patch(`/invoices/update-invoice-status${selected.value.id}`, { status: newStatus.value })
    showViewModal.value = false
    await fetchInvoices()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

onMounted(fetchInvoices)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; align-items: center; justify-content: space-between; }
.header h2 { margin: 0; color: #1e293b; }
.sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }
.filters { display: flex; gap: 12px; }
.filters select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; min-width: 160px; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.badge.draft { background: #f1f5f9; color: #475569; }
.badge.sent { background: #dbeafe; color: #1d4ed8; }
.badge.paid { background: #dcfce7; color: #166534; }
.badge.cancelled { background: #fee2e2; color: #991b1b; }
.view-btn { background: #ede9fe; color: #5b21b6; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 10px; padding: 24px; width: 420px; max-width: 90%; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.detail-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.d-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
.status-update { display: flex; gap: 10px; align-items: center; }
.status-update label { font-size: 13px; font-weight: 600; color: #374151; }
.status-update select { flex: 1; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; }
.save-btn { background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; }
</style>
