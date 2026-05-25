<template>
  <div class="ams-page">

    <!-- HEADER -->
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Clients</h2>
        <p class="text-muted small mb-0">Manage all clients</p>
      </div>
      <router-link to="/clients/create" class="btn btn-ams">+ New Client</router-link>
    </div>

    <!-- FILTER -->
    <div class="d-flex gap-2">
      <input v-model="search" class="form-control" style="max-width:300px" placeholder="Search by name or email..." />
    </div>

    <!-- TABLE CARD -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>User Code</th>
              <th class="pe-3" style="width:140px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in filteredClients" :key="client.user_code">
              <td class="ps-3">{{ client.name }}</td>
              <td>{{ client.email }}</td>
              <td>{{ client.phone || '—' }}</td>
              <td><code>{{ client.user_code }}</code></td>
              <td class="pe-3">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(client)">Edit</button>
                <button class="btn btn-sm btn-outline-danger" @click="openDelete(client)">Delete</button>
              </td>
            </tr>
            <tr v-if="filteredClients.length === 0">
              <td colspan="5" class="text-center text-muted py-4">No clients found</td>
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
            <h5 class="modal-title">Edit Client</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <form @submit.prevent="updateClient">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Full Name *</label>
                <input v-model="editForm.name" class="form-control" placeholder="Full Name" required />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Email *</label>
                <input v-model="editForm.email" type="email" class="form-control" placeholder="Email" required />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Phone</label>
                <input v-model="editForm.phone" class="form-control" placeholder="Phone" />
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
            <h5 class="modal-title">Delete Client</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <p class="mb-0">Delete <strong>{{ selected?.name }}</strong>?</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger btn-sm" @click="deleteClient" :disabled="saving">{{ saving ? '...' : 'Delete' }}</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/utils/api'

const clients = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const search = ref('')

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)

const editForm = reactive({ name: '', email: '', phone: '' })

const filteredClients = computed(() => {
  const s = search.value.toLowerCase()
  if (!s) return clients.value
  return clients.value.filter(c =>
      (c.name || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s)
  )
})

async function fetchClients() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/clients/get-client')
    clients.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load clients'
  } finally {
    loading.value = false
  }
}

function openEdit(client) {
  selected.value = client
  editForm.name = client.name
  editForm.email = client.email
  editForm.phone = client.phone || ''
  formError.value = ''
  showEditModal.value = true
}

function openDelete(client) {
  selected.value = client
  showDeleteModal.value = true
}

async function updateClient() {
  saving.value = true
  formError.value = ''
  try {
    await api.put(`/clients/update-client/${selected.value.user_code}`, editForm)
    showEditModal.value = false
    await fetchClients()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

async function deleteClient() {
  saving.value = true
  try {
    await api.delete(`/clients/delete-client/${selected.value.user_code}`)
    showDeleteModal.value = false
    await fetchClients()
  } catch (err) {
    error.value = err.response?.data?.message || 'Delete failed'
  } finally {
    saving.value = false
  }
}

onMounted(fetchClients)
</script>


