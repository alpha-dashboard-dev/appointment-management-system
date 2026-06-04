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
              <th class="ps-3">Business Name</th>
              <th>Name</th>
              <th>Value</th>
              <th>Type</th>
              <th>Status</th>
              <th class="pe-3" style="width:100px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="charge in charges" :key="charge.charge_code">
              <td class="ps-3">{{ charge.business_name }}</td>
              <td>{{ charge.name }}</td>
              <td>{{ charge.charge_value }}</td>
              <td>{{ charge.charge_uom }}</td>
              <td><span :class="['ams-badge', charge.status]">{{ charge.status }}</span></td>
              <td class="pe-3">
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <button class="dropdown-item" @click="openEdit(charge)">
                        <i class="bi bi-pencil me-2"></i>
                        Edit
                      </button>
                    </li>
                    <li>
                      <button class="dropdown-item text-danger" @click="openDeactivate(charge)">
                        <i class="bi bi-trash me-2"></i>
                        Deactivate
                      </button>
                    </li>
                    <li>
                      <button class="dropdown-item text-danger" @click="openDelete(charge)">
                        <i class="bi bi-trash me-2"></i>
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="charges.length === 0">
              <td colspan="6" class="text-center text-muted py-4">No charges found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

<!--    Deactivate charge-->
    <div v-if="showDeactivateModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Deactivate Charge</h5>
            <button type="button" class="btn-close" @click="showDeactivateModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <p class="mb-0">Deactivate <strong>{{ selected?.name }}</strong>?</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeactivateModal = false">Cancel</button>
            <button class="btn btn-danger btn-sm" @click="deactivateCharge" :disabled="saving">{{ saving ? '...' : 'Deactivate' }}</button>
          </div>
        </div>
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

<!--  Edit Modal-->
  <div v-if="showEditModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Charge</h5>
          <button type="button" class="btn-close" @click="showEditModal = false"></button>
        </div>
        <form @submit.prevent="updateCharge">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">Business Name *</label>
              <input v-model="editForm.name" class="form-control" placeholder="Business Name" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Description</label>
              <input v-model="editForm.description" class="form-control" placeholder="Description" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Charge Value *</label>
              <input v-model="editForm.charge_value" class="form-control" placeholder="Charge Value" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Status</label>
              <select v-model="editForm.status" class="form-select">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <p v-if="formError" class="text-danger small mb-0">{{ formError }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showEditModal = false">Cancel</button>
            <button type="submit" class="btn btn-ams" :disabled="saving">{{ saving ? 'Saving...' : 'Save Changes' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, reactive} from 'vue'
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
const formError = ref('')
const bizFilter = ref('')

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showDeactivateModal = ref(false)
const showCreateModal = ref(false)
const selected = ref(null)
const createError = ref('')
const createErrors = ref({})
const createForm = ref({ business_code: '', name: '', charge_uom: '', charge_value: '', description: '' })
const editForm = reactive({ name: '', status: 'active', charge_value: '', description: '' })

async function fetchCharges() {
  loading.value = true
  error.value = ''

  try {
    const params = bizFilter.value
        ? { business_code: bizFilter.value }
        : {}

    const [chargeRes, businessRes] = await Promise.all([
      api.get('/charges/get-charge', { params }),
      api.get('/businesses/get-business'),
    ])

    const businesses = businessRes.data.data || []

    const businessNameByCode = new Map(
        businesses.map((bus) => [bus.business_code, bus.name])
    )

    charges.value = (chargeRes.data.data || []).map((charge) => ({
      ...charge,
      business_name:
          businessNameByCode.get(charge.business_code) ||
          charge.business_name ||
          '',
    }))
  } catch (err) {
    error.value =
        err.response?.data?.message || 'Failed to load charges'
  } finally {
    loading.value = false
  }
}

function openEdit(charge) {
  selected.value = charge
  editForm.name = charge.name
  editForm.charge_value = charge.charge_value
  editForm.description = charge.description

  formError.value = ''
  showEditModal.value = true
}

function openDelete(charge) {
  selected.value = charge
  showDeleteModal.value = true
}

function openDeactivate(charge) {
  selected.value = charge
  showDeactivateModal.value = true
}

async function deleteCharge() {
  saving.value = true
  try {
    await api.delete(`/charges/delete-charge/${selected.value.charge_code}`)
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

async function updateCharge() {
  saving.value = true
  formError.value = ''
  try {
    await api.put(`/charges/update-charge/${selected.value.charge_code}`, editForm)
    showEditModal.value = false
    await fetchCharges()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

async function deactivateCharge() {
  saving.value = true
  try {
    await api.put(`/charges/update-charge/${selected.value.charge_code}`, { status: 'inactive' })
    showDeactivateModal.value = false
    await fetchCharges()
  } catch (err) {
    error.value = err.response?.data?.message || 'Deactivation failed'
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


