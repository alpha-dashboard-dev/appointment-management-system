<template>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <div>
        <h2>Clients</h2>
        <p class="sub">Manage all clients</p>
      </div>
      <router-link to="/clients/create" class="btn">+ New Client</router-link>
    </div>

    <!-- FILTER -->
    <div class="filters">
      <input v-model="search" placeholder="Search by name or email..." />
    </div>


    <!-- TABLE CARD -->
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>

      <table v-else class="table">
        <thead>
        <tr>
          <th>Full Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>User Code</th>
          <th width="140">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="client in filteredClients" :key="client.user_code">
          <td>{{ client.name }}</td>
          <td>{{ client.email }}</td>
          <td>{{ client.phone || '—' }}</td>
          <td><code>{{ client.user_code }}</code></td>
          <td>
            <button class="edit-btn" @click="openEdit(client)">Edit</button>
            <button class="delete-btn" @click="openDelete(client)">Delete</button>
          </td>
        </tr>
        <tr v-if="filteredClients.length === 0">
          <td colspan="5" class="empty">No clients found</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Client</h3>
          <button class="close" @click="showEditModal = false">✕</button>
        </div>
        <form class="form" @submit.prevent="updateClient">
          <input v-model="editForm.name" placeholder="Full Name" required />
          <input v-model="editForm.email" type="email" placeholder="Email" required />
          <input v-model="editForm.phone" placeholder="Phone" />
          <p v-if="formError" class="error-msg">{{ formError }}</p>
          <button type="submit" class="save-btn" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal delete-modal">
        <h3>Delete Client</h3>
        <p>Are you sure you want to delete <strong>{{ selected?.name }}</strong>?</p>
        <div class="actions">
          <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
          <button class="delete-confirm-btn" @click="deleteClient" :disabled="saving">
            {{ saving ? 'Deleting...' : 'Delete' }}
          </button>
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

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header h2 { margin: 0; color: #1e293b; }
.sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }

.btn {
  background: #6366f1;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.filters { display: flex; gap: 12px; }
.filters input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  min-width: 260px;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.table { width: 100%; border-collapse: collapse; }
.table th, .table td {
  text-align: left;
  padding: 10px 12px;
  font-size: 13px;
  border-bottom: 1px solid #f1f5f9;
}
.table th { color: #64748b; font-weight: 600; }

.edit-btn, .delete-btn {
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 4px;
}
.edit-btn   { background: #ede9fe; color: #6366f1; }
.delete-btn { background: #fee2e2; color: #dc2626; }

.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  background: white;
  border-radius: 10px;
  padding: 24px;
  width: 420px;
  max-width: 90%;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.modal-header h3 { margin: 0; }
.close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }

.form { display: flex; flex-direction: column; gap: 12px; }
.form input {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}
.save-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.delete-modal { text-align: center; }
.delete-modal h3 { margin: 0 0 12px; }
.delete-modal p { color: #64748b; margin-bottom: 16px; }

.actions { display: flex; gap: 10px; justify-content: center; }
.cancel-btn { background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.delete-confirm-btn { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }

code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
</style>
