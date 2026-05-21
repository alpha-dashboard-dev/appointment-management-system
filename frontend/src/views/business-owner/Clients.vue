<template>
  <div class="page">
    <div class="header">
      <div><h2>Clients</h2><p class="sub">Clients for your business</p></div>
    </div>
    <div class="search-bar">
      <input v-model="searchQuery" placeholder="Search by name or email..." @input="filterClients" />
    </div>
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <table v-else class="table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Code</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="client in filtered" :key="client.client_code">
            <td>{{ client.name }}</td>
            <td>{{ client.email }}</td>
            <td>{{ client.phone || '—' }}</td>
            <td><code>{{ client.client_code }}</code></td>
            <td><span :class="['badge', client.is_active === 'active' ? 'active' : 'inactive']">{{ client.is_active === 'active' ? 'Active' : 'Inactive' }}</span></td>
          </tr>
          <tr v-if="filtered.length === 0"><td colspan="5" class="empty">No clients found</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'

const authStore = useAuthStore()
const clients = ref([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')

const filtered = computed(() => {
  if (!searchQuery.value.trim()) return clients.value
  const q = searchQuery.value.toLowerCase()
  return clients.value.filter(c => (c.name?.toLowerCase().includes(q)) || (c.email?.toLowerCase().includes(q)))
})

async function fetchClients() {
  loading.value = true
  error.value = ''
  try {
    const biz = authStore.user?.business_code
    const res = await api.get('/clients/get-client', { params: biz ? { business_code: biz } : {} })
    clients.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load clients'
  } finally {
    loading.value = false
  }
}

onMounted(fetchClients)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header { display: flex; align-items: center; justify-content: space-between; }
.header h2 { margin: 0; color: #1e293b; }
.sub { margin: 2px 0 0; font-size: 13px; color: #64748b; }
.search-bar input { padding: 9px 14px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; width: 100%; max-width: 320px; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; }
.badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.badge.active { background: #dcfce7; color: #166534; }
.badge.inactive { background: #fee2e2; color: #991b1b; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
</style>
