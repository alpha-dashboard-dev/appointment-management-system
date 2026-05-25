<template>
  <div class="page">

    <div class="page-header">
      <h2>New Appointment</h2>
      <a class="back-link" style="cursor:pointer" @click="router.back()">← Back</a>
    </div>

    <div class="card">
      <form class="form" @submit.prevent="submit">

        <!-- Business selector: admin only; other roles use their own business automatically -->
        <div v-if="isAdmin" class="field">
          <label>Business *</label>
          <select v-model="form.business_code" :class="{ 'field-input-error': errors.business_code }" @change="onBusinessChange">
            <option value="">Select business</option>
            <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">
              {{ biz.name }}
            </option>
          </select>
          <p v-if="errors.business_code" class="field-error">{{ errors.business_code }}</p>
        </div>

        <div class="field">
          <label>Client</label>
          <select v-model="form.client_code">
            <option value="">Select client (optional)</option>
            <option v-for="client in clients" :key="client.user_code" :value="client.user_code">
              {{ client.name }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Service *</label>
          <select v-model="form.service_code" :class="{ 'field-input-error': errors.service_code }" @change="validateField('service_code')">
            <option value="">Select service</option>
            <option v-for="svc in services" :key="svc.service_code" :value="svc.service_code">
              {{ svc.name }}
            </option>
          </select>
          <p v-if="errors.service_code" class="field-error">{{ errors.service_code }}</p>
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

        <div class="row two-columns">
          <div class="field">
            <label>Start Date *</label>
            <input type="date" v-model="form.appointment_start_date" :class="{ 'field-input-error': errors.appointment_start_date }" @change="validateField('appointment_start_date')" />
            <p v-if="errors.appointment_start_date" class="field-error">{{ errors.appointment_start_date }}</p>
          </div>
          <div class="field">
            <label>End Date *</label>
            <input type="date" v-model="form.appointment_end_date" :class="{ 'field-input-error': errors.appointment_end_date }" @change="validateField('appointment_end_date')" />
            <p v-if="errors.appointment_end_date" class="field-error">{{ errors.appointment_end_date }}</p>
          </div>
          <div class="field">
            <label>Start Time *</label>
            <input type="time" v-model="form.start_time" :class="{ 'field-input-error': errors.start_time }" @change="validateField('start_time')" />
            <p v-if="errors.start_time" class="field-error">{{ errors.start_time }}</p>
          </div>
          <div class="field">
            <label>End Time *</label>
            <input type="time" v-model="form.end_time" :class="{ 'field-input-error': errors.end_time }" @change="validateField('end_time')" />
            <p v-if="errors.end_time" class="field-error">{{ errors.end_time }}</p>
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
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'
import { validateAppointmentForm } from '@/utils/validator'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.user_type === 'admin')

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
})

const businesses = ref([])
const clients = ref([])
const services = ref([])
const locations = ref([])
const loading = ref(false)
const error = ref('')
const errors = reactive({})

function validateField(field) {
  const result = validateAppointmentForm(form)
  if (result[field]) { errors[field] = result[field] } else { delete errors[field] }
}

onMounted(async () => {
  const [bizRes, clientRes] = await Promise.allSettled([
    api.get('/businesses/get-business'),
    api.get('/clients/get-client'),
  ])

  if (bizRes.status === 'fulfilled') businesses.value = bizRes.value.data.data || []
  if (clientRes.status === 'fulfilled') {
    clients.value = (clientRes.value.data.data || []).filter(
        c => c.user_type === 'client'
    )
  }

  // For non-admin roles, business is fixed — auto-set and load services/locations immediately
  if (!isAdmin.value) {
    form.business_code = authStore.user?.business_code || ''
    if (form.business_code) {
      const [svcRes, locRes] = await Promise.allSettled([
        api.get('/services/get-service', { params: { business_code: form.business_code } }),
        api.get('/locations/get-location', { params: { business_code: form.business_code } }),
      ])
      if (svcRes.status === 'fulfilled') services.value = svcRes.value.data.data || []
      if (locRes.status === 'fulfilled') locations.value = locRes.value.data.data || []
    }
  }
})

async function onBusinessChange() {
  validateField('business_code')
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
  const validationErrors = validateAppointmentForm(form)
  Object.keys(errors).forEach(k => delete errors[k])
  Object.assign(errors, validationErrors)
  if (Object.keys(errors).length > 0) return

  loading.value = true
  error.value = ''
  try {
    const payload = { ...form, status: 'pending' }
    if (!payload.location_code) delete payload.location_code
    if (!payload.notes) delete payload.notes
    if (!payload.client_code) delete payload.client_code
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

.field-input-error { border-color: #ef4444 !important; }
.field-error { color: #ef4444; font-size: 12px; margin: 2px 0 0; }

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
