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
            <option value="">Select client</option>
            <option v-for="client in clients" :key="client.user_code" :value="client.user_code">
              {{ client.name }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Location</label>
          <select v-model="form.location_code" @change="onLocationChange">
            <option value="">Select location</option>
            <option v-for="loc in locations" :key="loc.location_code" :value="loc.location_code">
              {{ loc.address + " " + loc.street + " " + loc.city }}
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
        api.get('/services/get-all-services', { params: { business_code: form.business_code } }),
        api.get('/locations/get-all-locations', { params: { business_code: form.business_code } }),
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
    api.get('/services/get-all-services', { params: { business_code: form.business_code } }),
    api.get('/locations/get-all-locations', { params: { business_code: form.business_code } }),
  ])
  if (svcRes.status === 'fulfilled') services.value = svcRes.value.data.data || []
  if (locRes.status === 'fulfilled') locations.value = locRes.value.data.data || []
}

async function onLocationChange() {
  form.service_code = ''
  if (!form.business_code) return
  try {
    const params = { business_code: form.business_code }
    if (form.location_code) params.location_code = form.location_code
    const svcRes = await api.get('/services/client-view', { params })
    services.value = svcRes.data.data.services || []
    // charges.value = svcRes.data.data.charges || []
  } catch (_) {}
}

async function submit() {
  const validationErrors = validateAppointmentForm(form)
  Object.keys(errors).forEach(k => delete errors[k])
  Object.assign(errors, validationErrors)
  if (Object.keys(errors).length > 0) return

  loading.value = true
  error.value = ''
  try {
    const payload = {
      // ...form,
      business_code: form.business_code,
      client_code: form.client_code,
      service_codes: form.service_code ? [form.service_code] : [],
      location_code: form.location_code,
      appointment_start_date: form.appointment_start_date,
      appointment_end_date: form.appointment_end_date,
      start_time: form.start_time,
      end_time: form.end_time,
      notes: form.notes,
      status: 'pending',
    }
    if (!payload.location_code) delete payload.location_code
    if (!payload.notes) delete payload.notes
    if (!payload.client_code) delete payload.client_code
    await api.post('/appointments/create-appointment', payload)
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




<!--<template>-->
<!--  <div class="page">-->
<!--    <div class="page-header">-->
<!--      <h2>New Appointment</h2>-->
<!--      <button type="button" class="back-link" @click="goBack">Back</button>-->
<!--    </div>-->

<!--    <div class="card">-->
<!--      <form class="form" @submit.prevent="submit">-->
<!--        <div v-if="isAdmin" class="field">-->
<!--          <label>Business *</label>-->
<!--          <select v-model="form.business_code" :class="{ 'field-input-error': errors.business_code }" @change="onBusinessChange">-->
<!--            <option value="">Select business</option>-->
<!--            <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">-->
<!--              {{ biz.name }}-->
<!--            </option>-->
<!--          </select>-->
<!--          <p v-if="errors.business_code" class="field-error">{{ errors.business_code }}</p>-->
<!--        </div>-->

<!--        <div v-else class="field">-->
<!--          <label>Business</label>-->
<!--          <input :value="currentBusinessName" disabled />-->
<!--        </div>-->

<!--        <div class="field">-->
<!--          <label>Client</label>-->
<!--          <select v-model="form.client_code" :disabled="!form.business_code || dataLoading">-->
<!--            <option value="">Select client</option>-->
<!--            <option v-for="client in filteredClients" :key="client.user_code" :value="client.user_code">-->
<!--              {{ client.name }}-->
<!--            </option>-->
<!--          </select>-->
<!--        </div>-->

<!--        <div class="field">-->
<!--          <label>Services *</label>-->
<!--          <div :class="['service-picker', { 'field-input-error': errors.service_codes }]">-->
<!--            <label v-for="svc in services" :key="svc.service_code" class="service-option">-->
<!--              <input-->
<!--                type="checkbox"-->
<!--                :value="svc.service_code"-->
<!--                v-model="form.service_codes"-->
<!--                @change="onServicesChange"-->
<!--              />-->
<!--              <span>-->
<!--                <strong>{{ svc.name }}</strong>-->
<!--                <small v-if="svc.price !== undefined && svc.price !== null">-->
<!--                  {{ formatMoney(svc.price) }} {{ svc.currency || currencyCode }}-->
<!--                </small>-->
<!--              </span>-->
<!--            </label>-->
<!--            <p v-if="form.business_code && !dataLoading && services.length === 0" class="empty-inline">-->
<!--              No services found for this business.-->
<!--            </p>-->
<!--            <p v-if="!form.business_code" class="empty-inline">-->
<!--              Select a business first.-->
<!--            </p>-->
<!--          </div>-->
<!--          <p v-if="errors.service_codes" class="field-error">{{ errors.service_codes }}</p>-->
<!--        </div>-->

<!--        <div v-if="form.service_codes.length" class="pricing-box">-->
<!--          <div class="pricing-title">-->
<!--            <span>Pricing Preview</span>-->
<!--            <small v-if="previewLoading">Updating...</small>-->
<!--          </div>-->

<!--          <div v-if="pricingPreview">-->
<!--            <div v-for="svc in pricingPreview.services || []" :key="svc.service_code" class="price-row">-->
<!--              <span>{{ svc.name || svc.service_code }}</span>-->
<!--              <strong>{{ formatMoney(svc.price) }} {{ pricingPreview.currency }}</strong>-->
<!--            </div>-->

<!--            <div v-if="pricingPreview.charges?.length" class="price-section">-->
<!--              <div v-for="charge in pricingPreview.charges" :key="charge.charge_code || charge.name" class="price-row muted">-->
<!--                <span>{{ charge.name || charge.charge_code || 'Charge' }}</span>-->
<!--                <strong>{{ formatMoney(charge.computed_amount) }} {{ pricingPreview.currency }}</strong>-->
<!--              </div>-->
<!--            </div>-->

<!--            <div class="price-total">-->
<!--              <span>Total</span>-->
<!--              <strong>{{ formatMoney(pricingPreview.total) }} {{ pricingPreview.currency }}</strong>-->
<!--            </div>-->
<!--          </div>-->

<!--          <p v-else-if="!previewLoading" class="empty-inline">-->
<!--            Pricing preview is unavailable for the selected services.-->
<!--          </p>-->
<!--        </div>-->

<!--        <div class="field">-->
<!--          <label>Location</label>-->
<!--          <select v-model="form.location_code" :disabled="!form.business_code || dataLoading">-->
<!--            <option value="">Select location</option>-->
<!--            <option v-for="loc in locations" :key="loc.location_code" :value="loc.location_code">-->
<!--              {{ formatLocation(loc) }}-->
<!--            </option>-->
<!--          </select>-->
<!--          <p class="field-help">Optional now. Approval requires a location.</p>-->
<!--        </div>-->

<!--        <div class="row two-columns">-->
<!--          <div class="field">-->
<!--            <label>Start Date *</label>-->
<!--            <input type="date" v-model="form.appointment_start_date" :class="{ 'field-input-error': errors.appointment_start_date }" @change="validateField('appointment_start_date')" />-->
<!--            <p v-if="errors.appointment_start_date" class="field-error">{{ errors.appointment_start_date }}</p>-->
<!--          </div>-->
<!--          <div class="field">-->
<!--            <label>End Date *</label>-->
<!--            <input type="date" v-model="form.appointment_end_date" :class="{ 'field-input-error': errors.appointment_end_date }" @change="validateField('appointment_end_date')" />-->
<!--            <p v-if="errors.appointment_end_date" class="field-error">{{ errors.appointment_end_date }}</p>-->
<!--          </div>-->
<!--          <div class="field">-->
<!--            <label>Start Time *</label>-->
<!--            <input type="time" v-model="form.start_time" :class="{ 'field-input-error': errors.start_time }" @change="validateField('start_time')" />-->
<!--            <p v-if="errors.start_time" class="field-error">{{ errors.start_time }}</p>-->
<!--          </div>-->
<!--          <div class="field">-->
<!--            <label>End Time *</label>-->
<!--            <input type="time" v-model="form.end_time" :class="{ 'field-input-error': errors.end_time }" @change="validateField('end_time')" />-->
<!--            <p v-if="errors.end_time" class="field-error">{{ errors.end_time }}</p>-->
<!--          </div>-->
<!--        </div>-->

<!--        <div class="field">-->
<!--          <label>Notes</label>-->
<!--          <textarea v-model="form.notes" placeholder="Optional notes..." rows="3"></textarea>-->
<!--        </div>-->

<!--        <p v-if="error" class="error-msg">{{ error }}</p>-->

<!--        <div class="form-actions">-->
<!--          <button type="button" class="cancel-btn" @click="goBack">Cancel</button>-->
<!--          <button type="submit" class="submit-btn" :disabled="loading || dataLoading">-->
<!--            {{ loading ? 'Creating...' : 'Create Appointment' }}-->
<!--          </button>-->
<!--        </div>-->
<!--      </form>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import { reactive, ref, computed, onMounted } from 'vue'-->
<!--import { useRouter } from 'vue-router'-->
<!--import api from '@/utils/api'-->
<!--import { validateAppointmentForm } from '@/utils/validator'-->
<!--import { useAuthStore } from '@/stores/auth.store'-->

<!--const router = useRouter()-->
<!--const authStore = useAuthStore()-->

<!--const isAdmin = computed(() => authStore.user?.user_type === 'admin')-->
<!--const userRole = computed(() => authStore.user?.user_type || '')-->

<!--const returnRoute = computed(() => {-->
<!--  const routes = {-->
<!--    admin: '/appointments',-->
<!--    business_owner: '/business/appointments',-->
<!--    operational_staff: '/operations/appointments',-->
<!--    client: '/client/appointments',-->
<!--  }-->
<!--  return routes[userRole.value] || '/appointments'-->
<!--})-->

<!--const form = reactive({-->
<!--  business_code: '',-->
<!--  client_code: '',-->
<!--  service_codes: [],-->
<!--  location_code: '',-->
<!--  appointment_start_date: '',-->
<!--  appointment_end_date: '',-->
<!--  start_time: '',-->
<!--  end_time: '',-->
<!--  notes: '',-->
<!--})-->

<!--const businesses = ref([])-->
<!--const clients = ref([])-->
<!--const services = ref([])-->
<!--const locations = ref([])-->
<!--const pricingPreview = ref(null)-->
<!--const loading = ref(false)-->
<!--const dataLoading = ref(false)-->
<!--const previewLoading = ref(false)-->
<!--const error = ref('')-->
<!--const errors = reactive({})-->

<!--const currentBusinessName = computed(() => {-->
<!--  return businesses.value.find((biz) => biz.business_code === form.business_code)?.name || form.business_code || 'Your business'-->
<!--})-->

<!--const filteredClients = computed(() => {-->
<!--  return clients.value.filter((client) => {-->
<!--    const isClient = !client.user_type || client.user_type === 'client'-->
<!--    const matchesBusiness = !form.business_code || !client.business_code || client.business_code === form.business_code-->
<!--    return isClient && matchesBusiness-->
<!--  })-->
<!--})-->

<!--const currencyCode = computed(() => {-->
<!--  return pricingPreview.value?.currency || services.value.find((svc) => form.service_codes.includes(svc.service_code))?.currency || 'PKR'-->
<!--})-->

<!--function clearErrors() {-->
<!--  Object.keys(errors).forEach((key) => delete errors[key])-->
<!--}-->

<!--function validateField(field) {-->
<!--  const result = validateAppointmentForm(form)-->
<!--  if (result[field]) {-->
<!--    errors[field] = result[field]-->
<!--  } else {-->
<!--    delete errors[field]-->
<!--  }-->
<!--}-->

<!--function goBack() {-->
<!--  router.push(returnRoute.value)-->
<!--}-->

<!--function formatLocation(loc) {-->
<!--  return [loc.address, loc.street, loc.city].filter(Boolean).join(' ') || loc.location_code-->
<!--}-->

<!--function formatMoney(value) {-->
<!--  const amount = Number(value ?? 0)-->
<!--  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'-->
<!--}-->

<!--function resetBusinessData() {-->
<!--  form.client_code = ''-->
<!--  form.service_codes = []-->
<!--  form.location_code = ''-->
<!--  clients.value = []-->
<!--  services.value = []-->
<!--  locations.value = []-->
<!--  pricingPreview.value = null-->
<!--}-->

<!--async function loadBusinesses() {-->
<!--  try {-->
<!--    const res = await api.get('/businesses/get-business')-->
<!--    businesses.value = res.data.data || []-->
<!--  } catch (_) {-->
<!--    businesses.value = []-->
<!--  }-->
<!--}-->

<!--async function loadBusinessData() {-->
<!--  resetBusinessData()-->
<!--  if (!form.business_code) return-->

<!--  dataLoading.value = true-->
<!--  try {-->
<!--    const params = { business_code: form.business_code }-->
<!--    const [clientRes, svcRes, locRes] = await Promise.allSettled([-->
<!--      api.get('/clients/get-client', { params }),-->
<!--      api.get('/services/get-all-services', { params }),-->
<!--      api.get('/locations/get-all-locations', { params }),-->
<!--    ])-->

<!--    if (clientRes.status === 'fulfilled') clients.value = clientRes.value.data.data || []-->
<!--    if (svcRes.status === 'fulfilled') services.value = svcRes.value.data.data || []-->
<!--    if (locRes.status === 'fulfilled') locations.value = locRes.value.data.data || []-->
<!--  } finally {-->
<!--    dataLoading.value = false-->
<!--  }-->
<!--}-->

<!--async function onBusinessChange() {-->
<!--  validateField('business_code')-->
<!--  await loadBusinessData()-->
<!--}-->

<!--async function onServicesChange() {-->
<!--  validateField('service_codes')-->
<!--  await fetchPricingPreview()-->
<!--}-->

<!--async function fetchPricingPreview() {-->
<!--  pricingPreview.value = null-->
<!--  if (!form.business_code || form.service_codes.length === 0) return-->

<!--  previewLoading.value = true-->
<!--  try {-->
<!--    const res = await api.post('/appointments/pricing-preview', {-->
<!--      business_code: form.business_code,-->
<!--      service_codes: form.service_codes,-->
<!--    })-->
<!--    pricingPreview.value = res.data.data || null-->
<!--  } catch (_) {-->
<!--    pricingPreview.value = null-->
<!--  } finally {-->
<!--    previewLoading.value = false-->
<!--  }-->
<!--}-->

<!--async function submit() {-->
<!--  const validationErrors = validateAppointmentForm(form)-->
<!--  clearErrors()-->
<!--  Object.assign(errors, validationErrors)-->
<!--  if (Object.keys(errors).length > 0) return-->

<!--  loading.value = true-->
<!--  error.value = ''-->
<!--  try {-->
<!--    const payload = {-->
<!--      business_code: form.business_code,-->
<!--      service_codes: form.service_codes.filter(Boolean),-->
<!--      appointment_start_date: form.appointment_start_date,-->
<!--      appointment_end_date: form.appointment_end_date,-->
<!--      start_time: form.start_time,-->
<!--      end_time: form.end_time,-->
<!--      status: 'pending',-->
<!--    }-->

<!--    if (form.client_code) payload.client_code = form.client_code-->
<!--    if (form.location_code) payload.location_code = form.location_code-->
<!--    if (form.notes) payload.notes = form.notes-->

<!--    await api.post('/appointments/create-appointment', payload)-->
<!--    router.push(returnRoute.value)-->
<!--  } catch (err) {-->
<!--    error.value = err.response?.data?.message || 'Failed to create appointment'-->
<!--  } finally {-->
<!--    loading.value = false-->
<!--  }-->
<!--}-->

<!--onMounted(async () => {-->
<!--  await loadBusinesses()-->

<!--  if (!isAdmin.value) {-->
<!--    form.business_code = authStore.user?.business_code || ''-->
<!--    await loadBusinessData()-->
<!--  }-->
<!--})-->
<!--</script>-->

<!--<style scoped>-->
<!--.page { display: flex; flex-direction: column; gap: 16px; }-->
<!--.page-header { display: flex; align-items: center; justify-content: space-between; }-->
<!--.page-header h2 { margin: 0; color: #1e293b; }-->
<!--.back-link { border: 0; background: transparent; font-size: 14px; color: #6366f1; cursor: pointer; }-->

<!--.card {-->
<!--  background: white;-->
<!--  border-radius: 10px;-->
<!--  padding: 24px;-->
<!--  max-width: 760px;-->
<!--  box-shadow: 0 1px 4px rgba(0,0,0,0.06);-->
<!--}-->
<!--.form { display: flex; flex-direction: column; gap: 16px; }-->

<!--.row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }-->
<!--.two-columns {-->
<!--  display: grid;-->
<!--  grid-template-columns: 1fr 1fr;-->
<!--  gap: 16px;-->
<!--}-->

<!--.field { display: flex; flex-direction: column; gap: 6px; }-->
<!--.field label { font-size: 13px; font-weight: 600; color: #374151; }-->
<!--.field input, .field select, .field textarea {-->
<!--  padding: 9px 12px;-->
<!--  border: 1px solid #e2e8f0;-->
<!--  border-radius: 6px;-->
<!--  font-size: 14px;-->
<!--  outline: none;-->
<!--  font-family: inherit;-->
<!--}-->
<!--.field input:focus, .field select:focus, .field textarea:focus { border-color: #6366f1; }-->
<!--.field input:disabled, .field select:disabled { background: #f8fafc; color: #64748b; }-->

<!--.service-picker {-->
<!--  border: 1px solid #e2e8f0;-->
<!--  border-radius: 6px;-->
<!--  padding: 8px;-->
<!--  display: grid;-->
<!--  gap: 6px;-->
<!--  max-height: 220px;-->
<!--  overflow: auto;-->
<!--}-->
<!--.service-option {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  gap: 10px;-->
<!--  padding: 8px;-->
<!--  border-radius: 6px;-->
<!--  cursor: pointer;-->
<!--}-->
<!--.service-option:hover { background: #f8fafc; }-->
<!--.service-option input { width: auto; }-->
<!--.service-option span { display: flex; flex-direction: column; gap: 2px; }-->
<!--.service-option small { color: #64748b; font-weight: 400; }-->

<!--.pricing-box {-->
<!--  border: 1px solid #e2e8f0;-->
<!--  background: #f8fafc;-->
<!--  border-radius: 8px;-->
<!--  padding: 14px;-->
<!--}-->
<!--.pricing-title, .price-row, .price-total {-->
<!--  display: flex;-->
<!--  justify-content: space-between;-->
<!--  gap: 12px;-->
<!--}-->
<!--.pricing-title { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 10px; }-->
<!--.pricing-title small { color: #64748b; font-weight: 500; }-->
<!--.price-row { font-size: 13px; color: #374151; padding: 3px 0; }-->
<!--.price-row.muted { color: #64748b; }-->
<!--.price-section { border-top: 1px solid #e2e8f0; margin-top: 8px; padding-top: 8px; }-->
<!--.price-total { border-top: 1px solid #cbd5e1; margin-top: 10px; padding-top: 10px; color: #1e293b; font-weight: 700; }-->

<!--.field-input-error { border-color: #ef4444 !important; }-->
<!--.field-error { color: #ef4444; font-size: 12px; margin: 2px 0 0; }-->
<!--.field-help, .empty-inline { color: #64748b; font-size: 12px; margin: 0; }-->

<!--.error-msg { color: #ef4444; font-size: 13px; margin: 0; }-->
<!--.form-actions { display: flex; gap: 10px; justify-content: flex-end; }-->
<!--.cancel-btn {-->
<!--  border: 0;-->
<!--  padding: 9px 16px;-->
<!--  border-radius: 6px;-->
<!--  background: #f1f5f9;-->
<!--  color: #64748b;-->
<!--  font-size: 14px;-->
<!--  cursor: pointer;-->
<!--}-->
<!--.submit-btn {-->
<!--  background: #6366f1;-->
<!--  color: white;-->
<!--  border: none;-->
<!--  padding: 9px 20px;-->
<!--  border-radius: 6px;-->
<!--  font-size: 14px;-->
<!--  font-weight: 600;-->
<!--  cursor: pointer;-->
<!--}-->
<!--.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }-->

<!--@media (max-width: 720px) {-->
<!--  .two-columns { grid-template-columns: 1fr; }-->
<!--}-->
<!--</style>-->