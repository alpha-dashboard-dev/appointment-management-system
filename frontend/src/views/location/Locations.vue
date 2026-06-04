<template>
  <div class="ams-page">

    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Locations</h2>
        <p class="text-muted small mb-0">Manage all locations</p>
      </div>
      <router-link to="/locations/create" class="btn btn-ams">+ New Location</router-link>
    </div>

    <div class="d-flex gap-2">
      <select v-model="bizFilter" @change="fetchLocations" class="form-select" style="max-width:240px">
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
              <td class="ps-3">{{ loc.business_name ||  '—'}}</td>
              <td>{{ loc.address || '—' }}</td>
              <td>{{loc.street || '—'}}</td>
              <td>{{loc.apartment || '—'}}</td>
              <td>{{ loc.city || '—' }}</td>
              <td>{{loc.province || '—'}}</td>
              <td>{{ loc.country || '—' }}</td>
              <td>{{ loc.location_type }}</td>
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
            <tr v-if="locations.length === 0">
              <td colspan="10" class="text-center text-muted py-4">No locations found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Location</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <form @submit.prevent="updateLocation">
            <div class="modal-body">
<!--              <div class="mb-3">-->
<!--                <label class="form-label fw-semibold">Location Type</label>-->
<!--                <select v-model="editForm.location_type" class="form-select">-->
<!--                  <option value="business">Business</option>-->
<!--                  <option value="client">Client</option>-->
<!--                </select>-->
<!--              </div>-->
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-semibold">Address</label>
                  <input v-model="editForm.address" class="form-control" placeholder="Address" />
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold">Street</label>
                  <input v-model="editForm.street" class="form-control" placeholder="Street" />
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold">Apartment</label>
                  <input v-model="editForm.apartment" class="form-control" placeholder="Apartment" />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">City</label>
                  <input v-model="editForm.city" class="form-control" placeholder="City" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Province</label>
                  <input v-model="editForm.province" class="form-control" placeholder="Province" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Postal Code</label>
                  <input v-model="editForm.postal_code" class="form-control" placeholder="Postal Code" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Country</label>
                  <input v-model="editForm.country" class="form-control" placeholder="Country" />
                </div>
              </div>
              <div class="mt-3">
                <label class="form-label fw-semibold">Status</label>
                <select v-model="editForm.status" class="form-select">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <p v-if="formError" class="text-danger small mt-2 mb-0">{{ formError }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showEditModal = false">Cancel</button>
              <button type="submit" class="btn btn-ams" :disabled="saving">{{ saving ? 'Saving...' : 'Save Changes' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRM MODAL -->
    <div v-if="showDeleteModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Location</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <p class="mb-0">Delete location <strong>{{ selected?.address + " " + selected?.city }}</strong>?</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger btn-sm" @click="deleteLocation" :disabled="saving">{{ saving ? '...' : 'Delete' }}</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'

const locations = ref([])
const businesses = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const bizFilter = ref('')

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)
const editForm = reactive({ location_type: 'business', street: '', address: '', city: '', province: '', postal_code: '', country: '', status: 'active', apartment: '' })

// fetch location with business details

async function fetchLocations() {
  loading.value = true
  error.value = ''

  try {

    const response = await api.get('/locations/get-location-with-business',
        {
          params: { business_code: bizFilter.value}
        }
    )

    locations.value = (response.data.data || []).map(
        (location) => ({
          ...location,
          business_name: location.business?.name || '',
        })
    )
  } catch (err) {
    error.value =
        err.response?.data?.message ||
        'Failed to load Locations'
  } finally {
    loading.value = false
  }
}

// fetch location without business
// async function fetchLocations() {
//   loading.value = true
//   error.value = ''
//   try {
//     const params = bizFilter.value ? { business_code: bizFilter.value } : {}
//     const res = await api.get('/locations/get-location', { params })
//     locations.value = res.data.data || []
//   } catch (err) {
//     error.value = err.response?.data?.message || 'Failed to load locations'
//   } finally {
//     loading.value = false
//   }
// }

function openEdit(loc) {
  selected.value = loc
  editForm.location_type = loc.location_type || 'business'
  editForm.street = loc.street || ''
  editForm.address = loc.address || ''
  editForm.city = loc.city || ''
  editForm.province = loc.province || ''
  editForm.postal_code = loc.postal_code || ''
  editForm.country = loc.country || ''
  editForm.status = loc.status || 'active'
  editForm.apartment = loc.apartment || ''
  formError.value = ''
  showEditModal.value = true
}

function openDelete(loc) {
  selected.value = loc
  showDeleteModal.value = true
}

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

onMounted(async () => {
  const [_, bizRes] = await Promise.allSettled([fetchLocations(), api.get('/businesses/get-business')])
  if (bizRes.status === 'fulfilled') businesses.value = bizRes.value.data.data || []
})
</script>


