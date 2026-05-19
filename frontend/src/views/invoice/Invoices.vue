<template>
  <div class="page">

    <div class="header">
      <div>
        <h2>Invoices</h2>
        <p class="sub">Manage all invoices</p>
      </div>
    </div>

    <div class="filters">
      <select v-model="bizFilter" @change="fetchInvoices">
        <option value="">All Businesses</option>
        <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">
          {{ biz.name }}
        </option>
      </select>
      <select v-model="statusFilter" @change="fetchInvoices">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>

      <table v-else class="table">
        <thead>
        <tr>
          <th>Invoice ID</th>
          <th>Appointment</th>
          <th>Total Amount</th>
          <th>Status</th>
          <th>Created</th>
          <th width="140">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="inv in invoices" :key="inv.id">
          <td><code>#{{ inv.id }}</code></td>
          <td><code>{{ inv.appointment_code || '—' }}</code></td>
          <td>{{ inv.total_amount != null ? inv.total_amount : '—' }}</td>
          <td><span :class="['badge', inv.status]">{{ inv.status }}</span></td>
          <td>{{ formatDate(inv.created_at) }}</td>
          <td>
            <button class="view-btn" @click="openDetails(inv)">View</button>
            <button v-if="inv.status === 'pending'" class="approve-btn" @click="updateStatus(inv, 'paid')">Mark Paid</button>
          </td>
        </tr>
        <tr v-if="invoices.length === 0">
          <td colspan="6" class="empty">No invoices found</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- DETAILS MODAL -->
    <div v-if="showDetails" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Invoice #{{ selected?.id }}</h3>
          <button class="close" @click="showDetails = false">✕</button>
        </div>
        <div class="detail-rows">
          <div class="detail-row"><span>Appointment</span><span>{{ selected?.appointment_code || '—' }}</span></div>
          <div class="detail-row"><span>Total Amount</span><span>{{ selected?.total_amount }}</span></div>
          <div class="detail-row"><span>Status</span><span :class="['badge', selected?.status]">{{ selected?.status }}</span></div>
          <div class="detail-row"><span>Created</span><span>{{ formatDate(selected?.created_at) }}</span></div>
        </div>
        <div class="modal-actions">
          <button v-if="selected?.status === 'pending'" class="approve-btn" @click="updateStatus(selected, 'paid')" :disabled="saving">Mark Paid</button>
          <button v-if="selected?.status === 'pending'" class="delete-btn" @click="updateStatus(selected, 'cancelled')" :disabled="saving">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const invoices = ref([])
const businesses = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const bizFilter = ref('')
const statusFilter = ref('')

const showDetails = ref(false)
const selected = ref(null)

async function fetchInvoices() {
  loading.value = true
  error.value = ''
  try {
    const params = {}
    if (bizFilter.value) params.business_code = bizFilter.value
    if (statusFilter.value) params.status = statusFilter.value
    const res = await api.get('/invoices', { params })
    invoices.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load invoices'
  } finally {
    loading.value = false
  }
}

function openDetails(inv) {
  selected.value = inv
  showDetails.value = true
}

async function updateStatus(inv, status) {
  saving.value = true
  try {
    await api.patch(`/invoices/${inv.id}/status`, { status })
    showDetails.value = false
    await fetchInvoices()
  } catch (err) {
    error.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

onMounted(async () => {
  const [_, bizRes] = await Promise.allSettled([fetchInvoices(), api.get('/businesses')])
  if (bizRes.status === 'fulfilled') businesses.value = bizRes.value.data.data || []
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; align-items: center; justify-content: space-between; }
.header h2 { margin: 0; color: #1e293b; }
.sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }
.filters { display: flex; gap: 12px; flex-wrap: wrap; }
.filters select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; min-width: 180px; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: capitalize; }
.badge.pending   { background: #fef9c3; color: #ca8a04; }
.badge.paid      { background: #dcfce7; color: #16a34a; }
.badge.cancelled { background: #fee2e2; color: #dc2626; }
.view-btn, .approve-btn, .delete-btn { border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.view-btn    { background: #ede9fe; color: #6366f1; }
.approve-btn { background: #dcfce7; color: #16a34a; }
.delete-btn  { background: #fee2e2; color: #dc2626; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 10px; padding: 24px; width: 440px; max-width: 90%; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.detail-rows { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.detail-row { display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
.detail-row span:first-child { color: #64748b; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
</style>
