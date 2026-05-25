<template>
  <div class="ams-page">

    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Charges</h2>
        <p class="text-muted small mb-0">Manage all charges</p>
      </div>
      <button class="btn btn-ams" @click="showCreateModal = true">+ New Charge</button>
    </div>

    <div v-if="isAdmin" class="d-flex gap-2">
      <select v-model="bizFilter" @change="fetchCharges" class="form-select" style="max-width:240px">
        <option value="">All Businesses</option>
        <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">{{ biz.name }}</option>
      </select>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Charge Code</th>
              <th>Name</th>
              <th>Amount</th>
              <th>Type</th>
              <th class="pe-3" style="width:100px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="charge in charges" :key="charge.charge_code">
              <td class="ps-3"><code>{{ charge.charge_code }}</code></td>
              <td>{{ charge.name }}</td>
              <td>{{ charge.charge_value }}</td>
              <td>{{ charge.charge_uom }}</td>
              <td class="pe-3">
                <button class="btn btn-sm btn-outline-danger" @click="openDelete(charge)">Delete</button>
              </td>
            </tr>
            <tr v-if="charges.length === 0">
              <td colspan="5" class="text-center text-muted py-4">No charges found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- DELETE CONFIRM MODAL -->
    <div v-if="showDeleteModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Charge</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <p class="mb-0">Delete <strong>{{ selected?.name }}</strong>?</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger btn-sm" @click="deleteCharge" :disabled="saving">{{ saving ? '...' : 'Delete' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATE MODAL -->
    <div v-if="showCreateModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">New Charge</h5>
            <button type="button" class="btn-close" @click="showCreateModal = false"></button>
          </div>
          <form @submit.prevent="createCharge">
            <div class="modal-body">
              <div v-if="isAdmin" class="mb-3">
                <label class="form-label fw-semibold">Business *</label>
                <select v-model="createForm.business_code" :class="['form-select', createErrors.business_code ? 'is-invalid' : '']">
                  <option value="">Select business</option>
                  <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">{{ biz.name }}</option>
                </select>
                <div v-if="createErrors.business_code" class="invalid-feedback">{{ createErrors.business_code }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Name *</label>
                <input v-model="createForm.name" :class="['form-control', createErrors.name ? 'is-invalid' : '']" placeholder="Charge name" />
                <div v-if="createErrors.name" class="invalid-feedback">{{ createErrors.name }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Charge UOM *</label>
                <select v-model="createForm.charge_uom" :class="['form-select', createErrors.charge_uom ? 'is-invalid' : '']">
                  <option value="">Select UOM</option>
                  <option value="fixed">Fixed</option>
                  <option value="percentage">Percentage</option>
                </select>
                <div v-if="createErrors.charge_uom" class="invalid-feedback">{{ createErrors.charge_uom }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Charge Value *</label>
                <input v-model.number="createForm.charge_value" type="number" step="0.01" min="0" :class="['form-control', createErrors.charge_value ? 'is-invalid' : '']" placeholder="Value" />
                <div v-if="createErrors.charge_value" class="invalid-feedback">{{ createErrors.charge_value }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Description</label>
                <textarea v-model="createForm.description" class="form-control" rows="2" placeholder="Optional description"></textarea>
              </div>
              <p v-if="createError" class="text-danger small mb-0">{{ createError }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showCreateModal = false">Cancel</button>
              <button type="submit" class="btn btn-ams" :disabled="saving">{{ saving ? 'Creating...' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'
import { validateChargeForm } from '@/utils/validator'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.role === 'admin')
const charges = ref([])
const businesses = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const bizFilter = ref('')

const showDeleteModal = ref(false)
const showCreateModal = ref(false)
const selected = ref(null)
const createError = ref('')
const createErrors = ref({})
const createForm = ref({ business_code: '', name: '', charge_uom: '', charge_value: '', description: '' })

async function fetchCharges() {
  loading.value = true
  error.value = ''
  try {
    const params = bizFilter.value ? { business_code: bizFilter.value } : {}
    const res = await api.get('/charges/get-charge', { params })
    charges.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load charges'
  } finally {
    loading.value = false
  }
}

function openDelete(charge) {
  selected.value = charge
  showDeleteModal.value = true
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

async function createCharge() {
  const validationErrors = validateChargeForm(createForm.value)
  createErrors.value = validationErrors
  if (Object.keys(validationErrors).length > 0) return

  saving.value = true
  createError.value = ''
  try {
    const payload = { ...createForm.value }
    if (!payload.description) delete payload.description
    await api.post('/charges/create-charge', payload)
    showCreateModal.value = false
    createForm.value = { business_code: isAdmin.value ? '' : (authStore.user?.business_code || ''), name: '', charge_uom: '', charge_value: '', description: '' }
    createErrors.value = {}
    await fetchCharges()
  } catch (err) {
    createError.value = err.response?.data?.message || 'Create failed'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!isAdmin.value) {
    createForm.value.business_code = authStore.user?.business_code || ''
    await fetchCharges()
    return
  }
  const [_, bizRes] = await Promise.allSettled([fetchCharges(), api.get('/businesses/get-business')])
  if (bizRes.status === 'fulfilled') businesses.value = bizRes.value.data.data || []
})
</script>


