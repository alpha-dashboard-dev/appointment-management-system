<template>
  <div class="page">

    <div class="page-header">
      <h2>New Service</h2>
      <router-link to="/services" class="back-link">← Back</router-link>
    </div>

    <div class="card">
      <form class="form" @submit.prevent="submit">

        <div class="field">
          <label>Business *</label>
          <select v-model="form.business_code" required>
            <option value="">Select business</option>
            <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">
              {{ biz.name }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Service Name *</label>
          <input v-model="form.name" placeholder="Enter service name" required />
        </div>

        <div class="field">
          <label>Description</label>
          <textarea v-model="form.description" placeholder="Optional description..." rows="3"></textarea>
        </div>

        <div class="field">
          <label>Price</label>
          <input v-model.number="form.price" type="number" placeholder="e.g. 50.00" step="0.01" min="0" />
        </div>

        <div class="field">
          <label>Cost</label>
          <input v-model.number="form.cost" type="number" placeholder="e.g. 50.00" step="0.01" min="0" />
        </div>

        <div class="field">
          <label>Currency</label>
          <select v-model="form.currency" required>
            <option value="">Select Currency</option>

            <option v-for="currency in currencies" :key="currency" :value="currency">
              {{ currency }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Duration (value)</label>
          <input v-model.number="form.duration_value" type="number" placeholder="e.g. 30" min="1" />
        </div>

        <div class="field">
          <label>Duration Unit</label>
          <select v-model="form.duration_uom">
            <option :value="null">Select Duration Unit</option>
            <option v-for="duration_uom in durationUnits" :key="duration_uom" :value="duration_uom">
              {{ duration_uom }}
            </option>
          </select>
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
          <router-link to="/services" class="cancel-btn">Cancel</router-link>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Service' }}
          </button>
        </div>

      </form>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'

const router = useRouter()
const statuses = ['active', 'inactive']
const currencies = ['PKR', 'USD', 'EUR']
const durationUnits = ['hour', 'minutes', 'day', 'week']

const form = reactive({ business_code: '', name: '', duration_value: null, price: '', description: '', cost: '', duration_uom: null,
  status: '' , currency: ''})
const businesses = ref([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
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
    if (!payload.price && payload.price !== 0) delete payload.price
    if (!payload.description) delete payload.description
    if (!payload.cost && payload.cost !== 0) delete payload.cost

    if (!payload.duration_value) {
      delete payload.duration_value
    }

    if (!payload.duration_uom) {
      delete payload.duration_uom
    }
    await api.post('/services/create-service', payload)
    router.push('/services')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create service'
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
.field input, .field select, .field textarea { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; font-family: inherit; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: #6366f1; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; }
.cancel-btn { padding: 9px 16px; border-radius: 6px; background: #f1f5f9; color: #64748b; text-decoration: none; font-size: 14px; }
.submit-btn { background: #6366f1; color: white; border: none; padding: 9px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
