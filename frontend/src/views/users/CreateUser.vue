<template>
  <div class="page">

    <div class="page-header">
      <h2>New User</h2>
      <router-link to="/users" class="back-link">← Back</router-link>
    </div>

    <div class="card">
      <form class="form" @submit.prevent="submit">

        <div class="field">
          <label>Full Name *</label>
          <input v-model="form.name" placeholder="Enter full name" :class="{ 'field-input-error': errors.name }" @blur="validateField('name')" />
          <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
        </div>

        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="Enter email" :class="{ 'field-input-error': errors.email }" @blur="validateField('email')" />
          <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
        </div>

        <div class="field">
          <label>Phone *</label>
          <input v-model="form.phone" type="text" placeholder="Enter phone number" :class="{ 'field-input-error': errors.phone }" @blur="validateField('phone')" />
          <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
        </div>

        <div class="field">
          <label>Password *</label>
          <input v-model="form.password" type="password" placeholder="Enter password" :class="{ 'field-input-error': errors.password }" @blur="validateField('password')" />
          <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
        </div>

        <div class="field">
          <label>User Type *</label>
          <select v-model="form.user_type" :class="{ 'field-input-error': errors.user_type }" @change="validateField('user_type')">
            <option value="">Select type</option>
            <option v-if="!staffOnly && !isBusinessOwner" value="business_owner">Business Owner</option>
            <option value="operational_staff">Operational Staff</option>
            <option value="service_staff">Service Staff</option>
            <option value="client">Client</option>
          </select>
          <p v-if="errors.user_type" class="field-error">{{ errors.user_type }}</p>
        </div>

        <div v-if="['service_staff', 'operational_staff'].includes(form.user_type)" class="field">
          <label>Employee Type *</label>
          <select v-model="form.employee_type">
            <option value="">Select Employee Type</option>
            <option value="permanent">Permanent</option>
            <option value="visiting">Visiting</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        <div class="field">
          <label>Business</label>
          <select v-model="form.business_code" :class="{ 'field-input-error': errors.business_code }" @change="validateField('business_code')">
            <option value="">Select Business</option>
            <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">
              {{ biz.name }}
            </option>
          </select>
          <p v-if="errors.business_code" class="field-error">{{ errors.business_code }}</p>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="form-actions">
          <router-link to="/users" class="cancel-btn">Cancel</router-link>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create User' }}
          </button>
        </div>

      </form>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/utils/api'
import { validateUserForm } from '@/utils/validator'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const staffOnly = computed(() => route.query.staffOnly === 'true')
const isBusinessOwner = computed(() => authStore.role === 'business_owner')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  user_type: '',
  employee_type: '',
  business_code: '',
  is_active: 'active',
})

watch(
    () => form.user_type,
    (newValue) => {
      if (!['service_staff', 'operational_staff'].includes(newValue)) {
        form.employee_type = ''
      }
    }
)
const businesses = ref([])
const loading = ref(false)
const error = ref('')
const errors = reactive({})

function validateField(field) {
  const result = validateUserForm(form)
  if (result[field]) { errors[field] = result[field] } else { delete errors[field] }
}

onMounted(async () => {
  try {
    const res = await api.get('/businesses/get-business')
    businesses.value = res.data.data || []
  } catch (_) {}
})

async function submit() {
  const validationErrors = validateUserForm(form)
  Object.keys(errors).forEach(k => delete errors[k])
  Object.assign(errors, validationErrors)
  if (Object.keys(errors).length > 0) return

  loading.value = true
  error.value = ''
  try {
    const payload = { ...form }
    if (!['service_staff', 'operational_staff'].includes(payload.user_type)) {
      payload.employee_type = null
    }
    if (!payload.business_code) delete payload.business_code
    await api.post('/users/create-user', payload)
    router.push('/users')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create user'
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
  max-width: 600px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field select {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}
.field input:focus, .field select:focus { border-color: #6366f1; }
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
