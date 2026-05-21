<template>
  <div class="page">

    <div class="page-header">
      <h2>New Appointment</h2>
      <router-link to="/appointments" class="back-link">← Back</router-link>
    </div>

    <div class="card">
      <form class="form" @submit.prevent="submit">

        <div class="field">
          <label>Business *</label>
          <select v-model="form.business_code" required @change="onBusinessChange">
            <option value="">Select business</option>
            <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">
              {{ biz.name }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Client </label>
          <select v-model="form.user_type" required>
            <option value="">Select client</option>
            <option v-for="client in clients" :key="client.user_type" :value="client.user_type">
              {{ client.name }}  <!--({{ client.email }}) -->
            </option>
          </select>
        </div>

        <div class="field">
          <label>Service *</label>
          <select v-model="form.service_code" required>
            <option value="">Select service</option>
            <option v-for="svc in services" :key="svc.service_code" :value="svc.service_code">
              {{ svc.name }}
            </option>
          </select>
        </div>


        <div class="field">
          <label>Location</label>
          <select v-model="form.location_code">
            <option value="">Select location</option>
            <option v-for="loc in locations" :key="loc.location_code" :value="loc.location_code">
              {{ loc.address + " " + loc.street + " " + loc.city }}
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

        <div class="row two-columns">
          <div class="field">
            <label>Start Date *</label>
            <input type="date" v-model="form.appointment_start_date" required />
          </div>
          <div class="field">
            <label>End Date *</label>
            <input type="date" v-model="form.appointment_end_date" required />
          </div>
          <div class="field">
            <label>Start Time *</label>
            <input type="time" v-model="form.start_time" required />
          </div>
          <div class="field">
            <label>End Time *</label>
            <input type="time" v-model="form.end_time" required />
          </div>
        </div>

        <div class="field">
          <label>Notes</label>
          <textarea v-model="form.notes" placeholder="Optional notes..." rows="3"></textarea>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="form-actions">
          <router-link to="/appointments" class="cancel-btn">Cancel</router-link>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Appointment' }}
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

const statuses = ['pending', 'approved', 'rejected', 'completed', 'in_progress', 'canceled', 'rescheduled']

const form = reactive({
  business_code: '',
  client_code: '',
  service_code: '',
  location_code: '',
  appointment_start_date: '',
  appointment_end_date: '',
  start_time: '',
  end_time: '',
  notes: '',
  status: '',
})

const businesses = ref([])
const clients = ref([])
const services = ref([])
const locations = ref([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  const [bizRes, clientRes] = await Promise.allSettled([
    api.get('/businesses/get-business'),
    api.get('/clients/get-client'),
  ])

  if (bizRes.status === 'fulfilled') businesses.value = bizRes.value.data.data || []
  // if (clientRes.status === 'fulfilled') clients.value = clientRes.value.data.data || []
  if (clientRes.status === 'fulfilled') {
    clients.value = (clientRes.value.data.data || []).filter(
        c => c.user_type === 'client'
    )
  }
})

async function onBusinessChange() {
  form.service_code = ''
  form.location_code = ''
  if (!form.business_code) { services.value = []; locations.value = []; return }
  const [svcRes, locRes] = await Promise.allSettled([
    api.get('/services/get-service', { params: { business_code: form.business_code } }),
    api.get('/locations/get-location', { params: { business_code: form.business_code } }),
  ])
  if (svcRes.status === 'fulfilled') services.value = svcRes.value.data.data || []
  if (locRes.status === 'fulfilled') locations.value = locRes.value.data.data || []
}

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const payload = { ...form }
    if (!payload.location_code) delete payload.location_code
    if (!payload.notes) delete payload.notes
    await api.post('/appointments', payload)
    router.push('/appointments')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create appointment'
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

.card {
  background: white;
  border-radius: 10px;
  padding: 24px;
  max-width: 700px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.form { display: flex; flex-direction: column; gap: 16px; }

.row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field select, .field textarea {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: #6366f1; }

.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; }
.cancel-btn {
  padding: 9px 16px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
}
.submit-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 9px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
