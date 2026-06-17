<template>
  <div class="page">

    <div class="page-header">
      <h2>Appointment Recurrence</h2>
      <a class="back-link" @click="router.back()">← Back</a>
    </div>

    <div class="card">
      <form class="form" @submit.prevent="submit">

        <!-- Business (Admin only) -->
        <div v-if="isAdmin" class="field">
          <label>Business *</label>
          <select v-model="form.business_code" :class="{ 'field-input-error': errors.business_code }">
            <option value="">Select business</option>
            <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">
              {{ biz.name }}
            </option>
          </select>
          <p v-if="errors.business_code" class="field-error">{{ errors.business_code }}</p>
        </div>

        <!-- appointment Code -->
        <div class="field">
          <label>Appointment *</label>
          <select v-model="form.appointment_code" :class="{ 'field-input-error': errors.appointment_code }">
            <option value="">Select appointment</option>
            <option v-for="a in appointments" :key="a.appointment_code" :value="a.appointment_code">
              {{ a.appointment_code }}
            </option>
          </select>
          <p v-if="errors.appointment_code" class="field-error">{{ errors.appointment_code }}</p>
        </div>

        <!-- Recurrence -->
        <div class="row two-columns">
          <div class="field">
            <label>Recurrence Unit *</label>
            <select v-model="form.recurrence_uom" :class="{ 'field-input-error': errors.recurrence_uom }">
              <option value="">Select</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <p v-if="errors.recurrence_uom" class="field-error">{{ errors.recurrence_uom }}</p>
          </div>

          <div class="field">
            <label>Recurrence Value *</label>
            <input type="number" min="1" v-model="form.recurrence_value"
                   :class="{ 'field-input-error': errors.recurrence_value }" />
            <p v-if="errors.recurrence_value" class="field-error">{{ errors.recurrence_value }}</p>
          </div>
        </div>

        <!-- Status -->
        <div class="field">
          <label>Status</label>
          <select v-model="form.status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <!-- Auto rules -->
        <div class="row two-columns">
          <div class="field">
            <label>Auto Cancel After (days)</label>
            <input type="number" v-model="form.auto_cancel_after_days" />
          </div>

          <div class="field">
            <label>Reschedule After (days)</label>
            <input type="number" v-model="form.reschedule_after_days" />
          </div>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="router.back()">Cancel</button>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Saving...' : 'Create Recurrence' }}
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
import {apiHandler} from "../../utils/api/apiHandler.js";

const router = useRouter()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.user_type === 'admin')

const form = reactive({
  business_code: '',
  appointment_code: '',
  recurrence_uom: '',
  recurrence_value: '',
  status: 'active',
  auto_cancel_after_days: null,
  reschedule_after_days: null,
})

const businesses = ref([])
const appointments = ref([])
const loading = ref(false)
const error = ref('')
const errors = reactive({})

onMounted(async () => {

  const requests = []

  if (isAdmin.value) {
    requests.push(apiHandler("business", "getAllBusinesses"))
  }

  requests.push(apiHandler("appointment", "getAllAppointments"))

  const results = await Promise.allSettled(requests)

  let index = 0

  if (isAdmin.value) {
    if (results[index].status === 'fulfilled') {
      businesses.value = results[index].value.data.data || []
    }
    index++
  }

  if (results[index]?.status === 'fulfilled') {
    appointments.value = results[index].value.data.data || []
  }
})

function validate() {
  const err = {}

  if (isAdmin.value && !form.business_code) {
    err.business_code = 'Business is required'
  }

  if (!form.appointment_code) {
    err.appointment_code = 'appointment is required'
  }

  if (!form.recurrence_uom) {
    err.recurrence_uom = 'Recurrence unit is required'
  }

  if (!form.recurrence_value || form.recurrence_value <= 0) {
    err.recurrence_value = 'Recurrence value must be greater than 0'
  }

  return err
}

async function submit() {
  Object.keys(errors).forEach(k => delete errors[k])

  const validationErrors = validate()
  Object.assign(errors, validationErrors)

  if (Object.keys(errors).length > 0) return

  loading.value = true
  error.value = ''

  try {
    const payload = { ...form }

    if (!payload.business_code) delete payload.business_code
    if (!payload.auto_cancel_after_days) delete payload.auto_cancel_after_days
    if (!payload.reschedule_after_days) delete payload.reschedule_after_days

    await apiHandler("appointment", "createAppointmentRecurrence", payload)

    await router.push('/appointment-recurrence')

  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create recurrence'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 10px;
  max-width: 700px;
}

.form { display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; }

.field input,
.field select {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.row { display: grid; gap: 12px; }

.two-columns { grid-template-columns: 1fr 1fr; }

.field-input-error { border-color: #ef4444 !important; }

.field-error { color: #ef4444; font-size: 12px; }

.error-msg { color: #ef4444; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  background: #f1f5f9;
  padding: 9px 16px;
  border-radius: 6px;
  border: none;
}

.submit-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 9px 16px;
  border-radius: 6px;
}
</style>