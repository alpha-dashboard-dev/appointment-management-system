<template>
  <div class="page">

    <div class="page-header">
      <h2>New Location</h2>
      <router-link :to="backLink" class="back-link">← Back</router-link>
    </div>

    <div class="card">
      <form class="form" @submit.prevent="submit">

        <div v-if="isAdmin" class="field">
          <label>Business *</label>
          <select v-model="form.business_code" required>
            <option value="">Select business</option>
            <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">
              {{ biz.name }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Type *</label>
          <select v-model="form.location_type" required>
            <option value="business">Business</option>
            <option value="client">Client</option>
          </select>
        </div>

        <div class="field">
          <label>Address</label>
          <input v-model="form.address" placeholder="Address" />
        </div>

        <div class="field">
          <label>Street</label>
          <input v-model="form.street" placeholder="Street" />
        </div>

        <div class="field">
          <label>Apartment</label>
          <input v-model="form.apartment" placeholder="Street" />
        </div>

        <div class="field">
          <label>City</label>
          <input v-model="form.city" placeholder="City" />
        </div>

        <div class="field">
          <label>Province</label>
          <input v-model="form.province" placeholder="Province / State" />
        </div>

        <div class="field">
          <label>Postal Code</label>
          <input v-model="form.postal_code" placeholder="Postal Code" />
        </div>

        <div class="field">
          <label>Country</label>
          <input v-model="form.country" placeholder="Country" />
        </div>

        <div class="field">
          <label>Status *</label>
          <select v-model="form.status" required>
            <option value="">Select Status</option>
            <option v-for="status in statuses" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="form-actions">
          <router-link :to="backLink" class="cancel-btn">Cancel</router-link>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Location' }}
          </button>
        </div>

      </form>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'

const router = useRouter()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.role === 'admin')
const backLink = computed(() => isAdmin.value ? '/locations' : '/business/locations')

const statuses = ['active', 'inactive']
const form = reactive({ business_code: '', location_type: 'business', street: '', address: '', apartment: '', city: '',
  province: '', postal_code: '', country: '', status: '' })
const businesses = ref([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  if (!isAdmin.value) {
    form.business_code = authStore.user?.business_code || ''
    return
  }
  try {
    const res = await api.get('/businesses/get-business')
    businesses.value = res.data.data || []
  } catch (_) {}
})

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const payload = { ...form }
    Object.keys(payload).forEach(k => { if (!payload[k]) delete payload[k] })
    payload.business_code = form.business_code
    await api.post('/locations/create-location', payload)
    router.push(backLink.value)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create location'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-header { display: flex; align-items: center; justify-content: space-between; }
.page-header h2 { margin: 0; color: #1e293b; }
.back-link { font-size: 14px; color: #6366f1; text-decoration: none; }
.card { background: white; border-radius: 10px; padding: 24px; max-width: 600px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field select { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; }
.field input:focus, .field select:focus { border-color: #6366f1; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; }
.cancel-btn { padding: 9px 16px; border-radius: 6px; background: #f1f5f9; color: #64748b; text-decoration: none; font-size: 14px; }
.submit-btn { background: #6366f1; color: white; border: none; padding: 9px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
