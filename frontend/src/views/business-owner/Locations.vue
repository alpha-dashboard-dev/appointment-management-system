<template>
  <div class="ams-page">
    <div class="d-flex align-items-center justify-content-between">
      <div><h2 class="mb-0">Locations</h2><p class="text-muted small mb-0">Manage business locations</p></div>
      <router-link to="/business/locations/create" class="btn btn-ams">+ New Location</router-link>
    </div>
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Business Name</th>
              <th>Location Code</th>
              <th>Address</th>
              <th>Street</th>
              <th>Apartment</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
              <th>Type</th>
              <th>Status</th>
              <th class="pe-3" style="width:140px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="loc in locations" :key="loc.location_code">
              <td class="ps-3">{{ loc.business_name }}</td>
              <td><code>{{ loc.location_code }}</code></td>
              <td>{{ loc.address || '—' }}</td>
              <td>{{loc.street || '—'}}</td>
              <td>{{loc.apartment || '—'}}</td>
              <td>{{ loc.city || '—' }}</td>
              <td>{{loc.province || '—'}}</td>
              <td>{{ loc.country || '—' }}</td>
              <td>{{ loc.location_type || '—' }}</td>
              <td><span :class="['ams-badge', loc.status]">{{ loc.status }}</span></td>
              <td class="pe-3">
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <button class="dropdown-item" @click="openEdit(loc)">
                        <i class="bi bi-pencil me-2"></i>
                        Edit
                      </button>
                    </li>
                    <li>
                      <button class="dropdown-item text-danger" @click="openDelete(loc)">
                        <i class="bi bi-trash me-2"></i>
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="locations.length === 0"><td colspan="10" class="text-center text-muted py-4">No locations found</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Location</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <form @submit.prevent="updateLocation">
            <div class="modal-body">
              <div class="mb-3"><label class="form-label fw-semibold">Address</label><input v-model="editForm.address" class="form-control" /></div>
              <div class="mb-3"><label class="form-label fw-semibold">City</label><input v-model="editForm.city" class="form-control" /></div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Status</label>
                <select v-model="editForm.status" class="form-select"><option value="active">Active</option><option value="inactive">Inactive</option></select>
              </div>
              <p v-if="formError" class="text-danger small mb-0">{{ formError }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showEditModal = false">Cancel</button>
              <button type="submit" class="btn btn-ams" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div v-if="showDeleteModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Location</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <p class="mb-0">Delete location <strong>{{ selected?.location_code }}</strong>?</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger btn-sm" @click="deleteLocation" :disabled="saving">{{ saving ? 'Deleting...' : 'Delete' }}</button>
          </div>
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
const locations = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)

const editForm = reactive({ city: '', address: '', status: 'active' })

async function fetchLocations() {
  loading.value = true
  error.value = ''

  try {
    const biz = authStore.user?.business_code

    const [locationRes, businessRes] = await Promise.all([
      api.get('/locations/get-location', {
        params: biz ? { business_code: biz } : {}
      }),
      api.get('/businesses/get-business')
    ])

    const businesses = businessRes.data.data || []

    const businessNameByCode = new Map(
        businesses.map((bus) => [bus.business_code, bus.name])
    )

    locations.value = (locationRes.data.data || []).map((location) => ({
      ...location,
      business_name:
          businessNameByCode.get(location.business_code) ||
          location.business_name ||
          ''
    }))
  } catch (err) {
    error.value =
        err.response?.data?.message || 'Failed to load locations'
  } finally {
    loading.value = false
  }
}

// async function fetchLocations() {
//   loading.value = true
//   error.value = ''
//   try {
//     const biz = authStore.user?.business_code
//     const res = await api.get('/locations/get-location', { params: biz ? { business_code: biz } : {} })
//     locations.value = res.data.data || []
//   } catch (err) {
//     error.value = err.response?.data?.message || 'Failed to load locations'
//   } finally {
//     loading.value = false
//   }
// }

function openEdit(loc) {
  selected.value = loc
  editForm.city = loc.city
  editForm.address = loc.address || ''
  editForm.status = loc.status || 'active'
  formError.value = ''
  showEditModal.value = true
}

function openDelete(loc) { selected.value = loc; showDeleteModal.value = true }

async function updateLocation() {
  saving.value = true
  formError.value = ''
  try {
    await api.put(`/locations/update-location${selected.value.location_code}`, editForm)
    showEditModal.value = false
    await fetchLocations()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

async function deleteLocation() {
  saving.value = true
  try {
    await api.delete(`/locations/delete-location${selected.value.location_code}`)
    showDeleteModal.value = false
    await fetchLocations()
  } catch (err) {
    error.value = err.response?.data?.message || 'Delete failed'
  } finally {
    saving.value = false
  }
}

onMounted(fetchLocations)
</script>


