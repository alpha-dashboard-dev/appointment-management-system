<template>
  <div class="ams-page">

    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Location Services</h2>
        <p class="text-muted small mb-0">Map services to locations</p>
      </div>
      <button class="btn btn-ams" @click="openCreate">+ Add Mapping</button>
    </div>

    <div class="d-flex gap-2 flex-wrap">
      <select v-if="isAdmin" v-model="bizFilter" @change="fetchMappings" class="form-select" style="max-width:220px">
        <option value="">All Businesses</option>
        <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">{{ biz.name }}</option>
      </select>
      <select v-model="locFilter" @change="fetchMappings" class="form-select" style="max-width:260px">
        <option value="">All Locations</option>
        <option v-for="loc in locations" :key="loc.location_code" :value="loc.location_code">
          {{ loc.address + " " + loc.street + " " + loc.city  }}
        </option>
      </select>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">ID</th>
              <th>Business</th>
              <th>Location</th>
              <th>Service</th>
              <th>Availability</th>
              <th class="pe-3" style="width:140px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in mappings" :key="item.id">
              <td class="ps-3">{{ item.id }}</td>
              <td>{{ item.business_name }}</td>
              <td>{{ item.location_address }}</td>
              <td>{{ item.service_name }}</td>
              <td>
                <span :class="['ams-badge', item.availability === 'available' ? 'active' : 'inactive']">
                  {{ item.availability }}
                </span>
              </td>
              <td class="pe-3">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(item)">Edit</button>
                <button class="btn btn-sm btn-outline-danger" @click="openDelete(item)">Delete</button>
              </td>
            </tr>
            <tr v-if="mappings.length === 0">
              <td colspan="6" class="text-center text-muted py-4">No mappings found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- CREATE MODAL -->
    <div v-if="showCreateModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add Location Service</h5>
            <button type="button" class="btn-close" @click="showCreateModal = false"></button>
          </div>
          <form @submit.prevent="createMapping">
            <div class="modal-body">
              <div v-if="isAdmin" class="mb-3">
                <label class="form-label fw-semibold">Business *</label>
                <select v-model="createForm.business_code" @change="onBizChange" class="form-select" required>
                  <option value="">Select business</option>
                  <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">{{ biz.name }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Location *</label>
                <select v-model="createForm.location_code" class="form-select" required>
                  <option value="">Select location</option>
                  <option v-for="loc in filteredLocations" :key="loc.location_code" :value="loc.location_code">
                    {{ loc.address + " " + loc.street + " " + loc.city  }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Service *</label>
                <select v-model="createForm.service_code" class="form-select" required>
                  <option value="">Select service</option>
                  <option v-for="svc in filteredServices" :key="svc.service_code" :value="svc.service_code">{{ svc.name }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Availability</label>
                <select v-model="createForm.availability" class="form-select">
                  <option value="available">Available</option>
                  <option value="not_available">Not Available</option>
                </select>
              </div>
              <p v-if="formError" class="text-danger small mb-0">{{ formError }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showCreateModal = false">Cancel</button>
              <button type="submit" class="btn btn-ams" :disabled="saving">{{ saving ? 'Saving...' : 'Add Mapping' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Availability</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <form @submit.prevent="updateMapping">
            <div class="modal-body">
              <p class="text-muted small mb-3">Location: <code>{{ selected?.location_code }}</code> / Service: <code>{{ selected?.service_code }}</code></p>
              <div class="mb-3">
                <label class="form-label fw-semibold">Availability</label>
                <select v-model="editForm.availability" class="form-select">
                  <option value="available">Available</option>
                  <option value="not_available">Not Available</option>
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

    <!-- DELETE CONFIRM MODAL -->
    <div v-if="showDeleteModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Mapping</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <p class="mb-0">Remove service <strong>{{ selected?.service_code }}</strong> from location <strong>{{ selected?.location_code }}</strong>?</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger btn-sm" @click="deleteMapping" :disabled="saving">{{ saving ? '...' : 'Delete' }}</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.role === 'admin')
const myBizCode = computed(() => authStore.user?.business_code || '')

const mappings = ref([])
const businesses = ref([])
const locations = ref([])
const services = ref([])

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const bizFilter = ref('')
const locFilter = ref('')

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)

const createForm = reactive({ business_code: '', location_code: '', service_code: '', availability: 'available' })
const editForm = reactive({ availability: 'available' })

const filteredLocations = computed(() =>
    createForm.business_code
        ? locations.value.filter(l => l.business_code === createForm.business_code)
        : locations.value
)

const filteredServices = computed(() =>
    createForm.business_code
        ? services.value.filter(s => s.business_code === createForm.business_code)
        : services.value
)

async function fetchMappings() {
  loading.value = true
  error.value = ''

  try {
    const params = {}
    if (bizFilter.value) params.business_code = bizFilter.value
    if (locFilter.value) params.location_code = locFilter.value

    const [mappingRes, businessRes, serviceRes, locationRes] = await Promise.all([
      api.get('/location-services/get-location-service', { params }),
      api.get('/businesses/get-business'),
      api.get('/services/get-service'),
      api.get('/locations/get-location'),
    ])

    const businesses = businessRes.data.data || []
    const services = serviceRes.data.data || []
    const locations = locationRes.data.data || []

    const businessNameByCode = new Map(
        businesses.map((b) => [b.business_code, b.name])
    )

    const serviceNameByCode = new Map(
        services.map((s) => [s.service_code, s.name])
    )

    const locationAddressByCode = new Map(
        locations.map((l) => [
          l.location_code,
          l.address + " " + l.street + " " + l.city,
        ])
    )

    mappings.value = (mappingRes.data.data || []).map((mapping) => ({
      ...mapping,
      business_name:
          businessNameByCode.get(mapping.business_code) || '',
      service_name:
          serviceNameByCode.get(mapping.service_code) || '',
      location_address:
          locationAddressByCode.get(mapping.location_code) || '',
    }))
  } catch (err) {
    error.value =
        err.response?.data?.message || 'Failed to load mappings'
  } finally {
    loading.value = false
  }
}

// async function fetchMappings() {
//   loading.value = true
//   error.value = ''
//   try {
//     const params = {}
//     if (bizFilter.value) params.business_code = bizFilter.value
//     if (locFilter.value) params.location_code = locFilter.value
//     const res = await api.get('/location-services/get-location-service', { params })
//     mappings.value = res.data.data || []
//   } catch (err) {
//     error.value = err.response?.data?.message || 'Failed to load mappings'
//   } finally {
//     loading.value = false
//   }
// }

function onBizChange() {
  createForm.location_code = ''
  createForm.service_code = ''
}

function openCreate() {
  createForm.business_code = isAdmin.value ? '' : myBizCode.value
  createForm.location_code = ''
  createForm.service_code = ''
  createForm.availability = 'available'
  formError.value = ''
  showCreateModal.value = true
}

function openEdit(item) {
  selected.value = item
  editForm.availability = item.availability
  formError.value = ''
  showEditModal.value = true
}

function openDelete(item) {
  selected.value = item
  showDeleteModal.value = true
}

async function createMapping() {
  saving.value = true
  formError.value = ''
  try {
    await api.post('/location-services/create-location-service', createForm)
    showCreateModal.value = false
    await fetchMappings()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Failed to create mapping'
  } finally {
    saving.value = false
  }
}

async function updateMapping() {
  saving.value = true
  formError.value = ''
  try {
    await api.put(`/location-services/update-location-service${selected.value.id}`, editForm)
    showEditModal.value = false
    await fetchMappings()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

async function deleteMapping() {
  saving.value = true
  try {
    await api.delete(`/location-services/delete-location-service${selected.value.id}`)
    showDeleteModal.value = false
    await fetchMappings()
  } catch (err) {
    error.value = err.response?.data?.message || 'Delete failed'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const bizCode = myBizCode.value
  const locParams = isAdmin.value ? {} : { business_code: bizCode }
  const svcParams = isAdmin.value ? {} : { business_code: bizCode }
  const [_, bizRes, locRes, svcRes] = await Promise.allSettled([
    fetchMappings(),
    isAdmin.value ? api.get('/businesses/get-business') : Promise.resolve({ data: { data: [] } }),
    api.get('/locations/get-location', { params: locParams }),
    api.get('/services/get-service', { params: svcParams }),
  ])
  if (bizRes.status === 'fulfilled') businesses.value = bizRes.value.data.data || []
  if (locRes.status === 'fulfilled') locations.value = locRes.value.data.data || []
  if (svcRes.status === 'fulfilled') services.value = svcRes.value.data.data || []
})
</script>


