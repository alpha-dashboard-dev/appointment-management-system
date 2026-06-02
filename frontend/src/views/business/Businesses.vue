<template>
  <div class="ams-page">

    <!-- HEADER -->
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Businesses</h2>
        <p class="text-muted small mb-0">Manage all businesses</p>
      </div>
      <router-link to="/businesses/create" class="btn btn-ams">+ New Business</router-link>
    </div>

    <!-- TABLE CARD -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Name</th>
              <th>Email</th>
              <th>Organization Name</th>
              <th>Status</th>
              <th class="pe-3" style="width:230px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="business in businesses" :key="business.business_code">
              <td class="ps-3">{{ business.name }}</td>
              <td>{{ business.email }}</td>
              <td>{{ business.organization_name || '—' }}</td>
              <td><span :class="['ams-badge', business.status]">{{ business.status }}</span></td>
              <td class="pe-3">
                <router-link :to="`/businesses/${business.business_code}`" class="btn btn-sm btn-outline-secondary me-1">View</router-link>
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(business)">Edit</button>
                <button class="btn btn-sm btn-outline-danger" @click="openDelete(business)">Deactivate</button>
              </td>
            </tr>
            <tr v-if="businesses.length === 0">
              <td colspan="5" class="text-center text-muted py-4">No businesses found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Business</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <form @submit.prevent="updateBusiness">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Business Name *</label>
                <input v-model="editForm.name" class="form-control" placeholder="Business Name" required />
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

    <!-- DEACTIVATE CONFIRM MODAL -->
    <div v-if="showDeleteModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Deactivate Business</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <p class="mb-0">Deactivate <strong>{{ selected?.name }}</strong>?</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger btn-sm" @click="deactivateBusiness" :disabled="saving">{{ saving ? '...' : 'Deactivate' }}</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'

const businesses = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)

const editForm = reactive({ name: '', status: 'active' })

async function fetchBusinesses() {
  loading.value = true
  error.value = ''
  try {
    const [businessRes, organizationRes] = await Promise.all([
      api.get('/businesses/get-business'),
      api.get('/organizations/get-organization'),
    ])

    const organizations = organizationRes.data.data || []
    const organizationNameByCode = new Map(
      organizations.map((org) => [org.organization_code, org.name])
    )

    businesses.value = (businessRes.data.data || []).map((business) => ({
      ...business,
      organization_name:
        organizationNameByCode.get(business.organization_code) ||
        business.organization_name ||
        '',
    }))
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load businesses'
  } finally {
    loading.value = false
  }
}

function openEdit(business) {
  selected.value = business
  editForm.name = business.name
  editForm.status = business.status
  formError.value = ''
  showEditModal.value = true
}

function openDelete(business) {
  selected.value = business
  showDeleteModal.value = true
}

async function updateBusiness() {
  saving.value = true
  formError.value = ''
  try {
    await api.put(`/businesses/update-business${selected.value.business_code}`, editForm)
    showEditModal.value = false
    await fetchBusinesses()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

// async function updateBusiness() {
//   saving.value = true
//   formError.value = ''
//   try {
//     await api.put(`/businesses/update-business${selected.value.business_code}`, editForm)
//     showEditModal.value = false
//     await fetchBusinesses()
//   } catch (err) {
//     formError.value = err.response?.data?.message || 'Update failed'
//   } finally {
//     saving.value = false
//   }
// }

// Deactivate Business

async function deactivateBusiness() {
  saving.value = true
  try {
    await api.patch(`/businesses/update-business-status${selected.value.business_code}`, { status: 'inactive' })
    showDeleteModal.value = false
    await fetchBusinesses()
  } catch (err) {
    error.value = err.response?.data?.message || 'Deactivation failed'
  } finally {
    saving.value = false
  }
}

// async function deleteBusiness() {
//   saving.value = true
//   try {
//     await api.delete(`/businesses/delete-business${selected.value.business_code}`)
//     showDeleteModal.value = false
//     await fetchBusinesses()
//   } catch (err) {
//     error.value = err.response?.data?.message || 'Delete failed'
//   } finally {
//     saving.value = false
//   }
// }

onMounted(fetchBusinesses)
</script>


