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

        <template v-if="form.business_code">
          <div class="field">
            <label>Location</label>
            <select v-model="form.location_code" @change="onLocationChange">
              <option value="">Select location (optional)</option>
              <option v-for="loc in locations" :key="loc.location_code" :value="loc.location_code">{{ loc.address + " " + loc.street + " " + loc.city }}</option>
            </select>
          </div>

          <div class="field">
            <label>Service *</label>
            <select v-model="form.service_code" @change="onServiceChange" required>
              <option value="">Select service</option>
              <option v-for="svc in services" :key="svc.service_code" :value="svc.service_code">
                {{ svc.name }} 
                <!-- {{ svc.duration_value }} {{ svc.duration_uom }} -->
              </option>
            </select>
          </div>

          <!-- Charges preview -->
          <div v-if="selectedService" class="charges-box">

            <div class="charges-title">💳 Service Charges</div>

            <!-- Base Service Price -->
            <div class="charge-row">
              <span>{{ selectedService.name }}</span>
              <span class="charge-val">{{ serviceSubtotal }} {{ currencyCode }}</span>
            </div>

            <!-- Additional Charges -->
            <template v-if="selectedCharges.length">

              <div v-for="ch in selectedCharges" :key="ch.charge_code" class="charge-row">
                <span>
                      {{ ch.name }}
                      {{ ch.charge_value }}
                      {{ ch.charge_uom === 'percentage' ? '%' : currencyCode }}
                </span>
                <span class="charge-val">{{ ch.computed_amount }} {{ currencyCode }}</span>
              </div>

            </template>

            <div v-else class="no-charges">
              No additional charges
            </div>

            <div class="charge-row fw-bold mt-2">
              <span>Total Price</span>
              <span class="charge-val">{{ totalPrice }} {{ currencyCode }}</span>
            </div>

          </div>
        </template>

        <div class="row">
          <div class="field"><label>Start Date *</label><input v-model="form.appointment_start_date" type="date" required /></div>
          <div class="field"><label>End Date</label><input v-model="form.appointment_end_date" type="date" /></div>
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
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'

const router = useRouter()

const form = reactive({
  business_code: '',
  service_code: '',
  location_code: '',
  appointment_start_date: '',
  appointment_end_date: '',
  start_time: '',
  end_time: '',
  notes: '',
})

const businesses = ref([])
const services = ref([])
const locations = ref([])
const charges = ref([])
const loading = ref(false)
const error = ref('')
const pricingPreview = ref(null)
const previewLoading = ref(false)

const selectedService = computed(() => services.value.find(s => s.service_code === form.service_code) || null)

const selectedCharges = computed(() => {
  return pricingPreview.value?.charges || []
})

const totalPrice = computed(() => {
  if (pricingPreview.value?.total != null) return Number(pricingPreview.value.total)
  return Number(selectedService.value?.price || 0)
})

const serviceSubtotal = computed(() => {
  if (pricingPreview.value?.service_subtotal != null) return Number(pricingPreview.value.service_subtotal)
  return Number(selectedService.value?.price || 0)
})

const currencyCode = computed(() => {
  return pricingPreview.value?.currency || selectedService.value?.currency || 'PKR'
})

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
  charges.value = []
  pricingPreview.value = null
  if (!form.business_code) return
  try {
    const [svcRes, locRes] = await Promise.all([
      api.get('/services/client-view', { params: { business_code: form.business_code } }),
      api.get('/locations/get-all-locations', { params: { business_code: form.business_code } }),
        // api.get('/charges/get-charge', { params: { business_code: form.business_code } }),
    ])
    services.value = svcRes.data.data.services || []
    locations.value = locRes.data.data || []
    charges.value = svcRes.data.data.charges || []
  } catch (_) {}
}

async function onLocationChange() {
  form.service_code = ''
  pricingPreview.value = null
  if (!form.business_code) return
  try {
    const params = { business_code: form.business_code }
    if (form.location_code) params.location_code = form.location_code
    const svcRes = await api.get('/services/client-view', { params })
    services.value = svcRes.data.data.services || []
    charges.value = svcRes.data.data.charges || []
  } catch (_) {}
}

async function onServiceChange() {
  await fetchPricingPreview()
}

async function fetchPricingPreview() {
  pricingPreview.value = null
  if (!form.business_code || !form.service_code) return

  previewLoading.value = true
  try {
    const res = await api.post('/appointments/pricing-preview', {
      business_code: form.business_code,
      service_codes: [form.service_code],
    })
    pricingPreview.value = res.data.data || null
  } catch (_) {
    pricingPreview.value = null
  } finally {
    previewLoading.value = false
  }
}

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const payload = {
      business_code: form.business_code,
      service_codes: form.service_code ? [form.service_code] : [],
      appointment_start_date: form.appointment_start_date,
      appointment_end_date: form.appointment_end_date || form.appointment_start_date,
      start_time: form.start_time,
      end_time: form.end_time,
      status: 'pending',
    }
    if (form.location_code) payload.location_code = form.location_code
    if (form.notes) payload.notes = form.notes
    await api.post('/appointments/create-appointment', payload)
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
.back-link { font-size: 14px; color: #6366f1; text-decoration: none; }
.card { background: white; border-radius: 10px; padding: 24px; max-width: 680px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.form { display: flex; flex-direction: column; gap: 16px; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field select, .field textarea { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; font-family: inherit; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: #6366f1; }
.charges-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
.charges-title { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
.charges-list { display: flex; flex-direction: column; gap: 6px; }
.charge-row { display: flex; justify-content: space-between; font-size: 13px; color: #374151; }
.charge-val { font-weight: 600; color: #6366f1; }
.no-charges { font-size: 13px; color: #94a3b8; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; }
.cancel-btn { padding: 9px 16px; border-radius: 6px; background: #f1f5f9; color: #374151; text-decoration: none; font-size: 14px; }
.submit-btn { background: #6366f1; color: white; border: none; padding: 9px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
