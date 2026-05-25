<template>
  <div class="page">
    <div class="page-header">
      <h2>Book Appointment</h2>
      <router-link to="/client/dashboard" class="back-link">← Back</router-link>
    </div>
    <div class="card">
      <form class="form" @submit.prevent="submit">
        <div class="field">
          <label>Business *</label>
          <select v-model="form.business_code" @change="onBusinessChange" required>
            <option value="">Select business</option>
            <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">{{ biz.name }}</option>
          </select>
        </div>
        <div v-if="form.business_code" class="field">
          <label>Service *</label>
          <select v-model="form.service_code" required>
            <option value="">Select service</option>
            <option v-for="svc in services" :key="svc.service_code" :value="svc.service_code">{{ svc.name }}</option>
          </select>
        </div>
        <div v-if="form.business_code" class="field">
          <label>Location</label>
          <select v-model="form.location_code">
            <option value="">Select location (optional)</option>
            <option v-for="loc in locations" :key="loc.location_code" :value="loc.location_code">{{ loc.address + " " + loc.street + " " + loc.city }}</option>
          </select>
        </div>
        <div class="row">
          <div class="field"><label>Start Date *</label><input v-model="form.appointment_start_date" type="date" required /></div>
          <div class="field"><label>End Date *</label><input v-model="form.appointment_end_date" type="date" required /></div>
          <div class="field"><label>Start Time *</label><input v-model="form.start_time" type="time" required /></div>
          <div class="field"><label>End Time *</label><input v-model="form.end_time" type="time" required /></div>
        </div>
        <div class="field"><label>Notes</label><textarea v-model="form.notes" rows="3" placeholder="Any special requests..."></textarea></div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <div class="form-actions">
          <router-link to="/client/dashboard" class="cancel-btn">Cancel</router-link>
          <button type="submit" class="submit-btn" :disabled="loading">{{ loading ? 'Booking...' : 'Book Appointment' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  business_code: '',
  service_code: '',
  location_code: '',
  appointment_start_date: '',
  appointment_end_date: '',
  start_time: '',
  end_time: '',
  notes: '',
  status: 'pending',
})

const businesses = ref([])
const services = ref([])
const locations = ref([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/businesses/get-business')
    businesses.value = res.data.data || []
  } catch (_) {}
})

async function onBusinessChange() {
  form.service_code = ''
  form.location_code = ''
  services.value = []
  locations.value = []
  if (!form.business_code) return
  try {
    const [svcRes, locRes] = await Promise.all([
      api.get('/services/get-service', { params: { business_code: form.business_code } }),
      api.get('/locations/get-location', { params: { business_code: form.business_code } }),
    ])
    services.value = svcRes.data.data || []
    locations.value = locRes.data.data || []
  } catch (_) {}
}

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const payload = { ...form }
    if (!payload.location_code) delete payload.location_code
    if (!payload.notes) delete payload.notes
    if (!payload.service_code) delete payload.service_code
    await api.post('/appointments', payload)
    router.push('/client/appointments')
  } catch (err) {
    error.value = err.response?.data?.message || 'Booking failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-header { display: flex; align-items: center; justify-content: space-between; }
.page-header h2 { margin: 0; color: #1e293b; }
.back-link { font-size: 14px; color: #7c3aed; text-decoration: none; }
.card { background: white; border-radius: 10px; padding: 24px; max-width: 640px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.form { display: flex; flex-direction: column; gap: 16px; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field select, .field textarea { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; font-family: inherit; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; }
.cancel-btn { padding: 9px 16px; border-radius: 6px; background: #f1f5f9; color: #374151; text-decoration: none; font-size: 14px; }
.submit-btn { background: #7c3aed; color: white; border: none; padding: 9px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
