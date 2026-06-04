<template>
  <div class="page">

    <div class="page-header">
      <h2>New Client</h2>
      <router-link :to="backLink" class="back-link">← Back</router-link>
    </div>

    <div class="card">
      <form class="form" @submit.prevent="submit">

        <div class="field">
          <label>Full Name *</label>
          <input v-model="form.name" placeholder="Enter full name" :class="{ 'field-input-error': errors.name }" @blur="validateField('name')" />
          <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
        </div>

        <div class="field">
          <label>Email *</label>
          <input v-model="form.email" type="email" placeholder="Enter email" :class="{ 'field-input-error': errors.email }" @blur="validateField('email')" />
          <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
        </div>

        <div class="field">
          <label>Phone</label>
          <input v-model="form.phone" placeholder="Enter phone number" :class="{ 'field-input-error': errors.phone }" @blur="validateField('phone')" />
          <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
        </div>

        <div class="field">
          <label>Password *</label>
          <input v-model="form.password" type="password" placeholder="Enter password" :class="{ 'field-input-error': errors.password }" @blur="validateField('password')" />
          <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
        </div>

<!--        <div class="field">-->
<!--          <label>User Type *</label>-->
<!--          <select v-model="form.user_type" required>-->
<!--            <option value="">Select type</option>-->
<!--            <option value="client">Client</option>-->
<!--          </select>-->
<!--        </div>-->

        <div v-if="isAdmin" class="field">
          <label>Business</label>
          <select v-model="form.business_code">
            <option value="">Select Business</option>
            <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">
              {{ biz.name }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Status *</label>
          <select v-model="form.is_active" required>
            <option value="">Select status</option>
            <option v-for="status in ['active', 'inactive']" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="form-actions">
          <router-link :to="backLink" class="cancel-btn">Cancel</router-link>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Client' }}
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
import { validateClientForm } from '@/utils/validator'

const router = useRouter()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.role === 'admin')
const backLink = computed(() => {
  if (authStore.role === 'operational_staff') return '/operations/clients'
  if (authStore.role === 'business_owner') return '/business/clients'
  return '/clients'
})

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  user_type: '',
  business_code: '',
  is_active: 'active',
})
const businesses = ref([])
const loading = ref(false)
const error = ref('')
const errors = reactive({})

function validateField(field) {
  const result = validateClientForm(form)
  if (result[field]) { errors[field] = result[field] } else { delete errors[field] }
}

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
  const validationErrors = validateClientForm(form)
  Object.keys(errors).forEach(k => delete errors[k])
  Object.assign(errors, validationErrors)
  if (Object.keys(errors).length > 0) return

  loading.value = true
  error.value = ''
  try {
    const payload = { ...form, user_type: 'client' }
    if (!payload.business_code) delete payload.business_code
    if (!payload.phone) delete payload.phone
    await api.post('/clients/create-client', payload)
    router.push(backLink.value)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create client'
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
