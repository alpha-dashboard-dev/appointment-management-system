<template>
  <div class="ams-page">

    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Invoices</h2>
        <p class="text-muted small mb-0">Manage all invoices</p>
      </div>
    </div>

    <div class="d-flex gap-2 flex-wrap">
      <select v-model="bizFilter" @change="fetchInvoices" class="form-select" style="max-width:220px">
        <option value="">All Businesses</option>
        <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">{{ biz.name }}</option>
      </select>
      <select v-model="statusFilter" @change="fetchInvoices" class="form-select" style="max-width:180px">
        <option value="">All Status</option>
        <option value="draft">Draft</option>
        <option value="paid">Paid</option>
        <option value="issued">Issued</option>
        <option value="canceled">Canceled</option>
      </select>
    </div>



    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Invoice ID</th>
              <th>Appointment</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Created</th>
              <th class="pe-3" style="width:140px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in invoices" :key="inv.id">
              <td class="ps-3"><code>{{ inv.id }}</code></td>
              <td><code>{{ inv.appointment_code || '—' }}</code></td>
              <td>{{ inv.total != null ? inv.total : '—' }}</td>
              <td><span :class="['ams-badge', inv.invoice_status]">{{ inv.invoice_status }}</span></td>
              <td>{{ formatDate(inv.created_at) }}</td>
              <td class="pe-3">
                <button class="btn btn-sm btn-outline-secondary me-1" @click="openDetails(inv)">View</button>
                <button v-if="inv.status === 'pending'" class="btn btn-sm btn-success" @click="updateStatus(inv, 'paid')">Mark Paid</button>
              </td>
            </tr>
            <tr v-if="invoices.length === 0">
              <td colspan="6" class="text-center text-muted py-4">No invoices found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- DETAILS MODAL -->
    <div v-if="showDetails" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Invoice #{{ selected?.id }}</h5>
            <button type="button" class="btn-close" @click="showDetails = false"></button>
          </div>
          <div class="modal-body">
            <dl class="row mb-0">
              <dt class="col-5 text-muted">Appointment</dt>
              <dd class="col-7">{{ selected?.appointment_code || '—' }}</dd>
              <dt class="col-5 text-muted">Total Amount</dt>
              <dd class="col-7">{{ selected?.total }}</dd>
              <dt class="col-5 text-muted">Status</dt>
              <dd class="col-7"><span :class="['ams-badge', selected?.invoice_status]">{{ selected?.invoice_status }}</span></dd>
              <dt class="col-5 text-muted">Created</dt>
              <dd class="col-7">{{ formatDate(selected?.created_at) }}</dd>
            </dl>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDetails = false">Close</button>
            <button v-if="selected?.status === 'pending'" class="btn btn-success btn-sm" @click="updateStatus(selected, 'paid')" :disabled="saving">Mark Paid</button>
            <button v-if="selected?.status === 'pending'" class="btn btn-danger btn-sm" @click="updateStatus(selected, 'cancelled')" :disabled="saving">Cancel</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import formatDate from "../../utils/formatDate.js";

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
    const res = await api.get('/invoices/get-invoice', { params })
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
    await api.patch(`/invoices/update-invoice-status${inv.id}`, { status })
    showDetails.value = false
    await fetchInvoices()
  } catch (err) {
    error.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const [_, bizRes] = await Promise.allSettled([fetchInvoices(), api.get('/businesses/get-business')])
  if (bizRes.status === 'fulfilled') businesses.value = bizRes.value.data.data || []
})
</script>


