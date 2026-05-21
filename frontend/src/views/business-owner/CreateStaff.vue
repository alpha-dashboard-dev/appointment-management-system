<template>
  <div class="page">
    <div class="page-header">
      <h2>Add Staff</h2>
      <router-link to="/business/staff" class="back-link">← Back</router-link>
    </div>
    <div class="card">
      <form class="form" @submit.prevent="submit">
        <div class="field"><label>Full Name *</label><input v-model="form.name" placeholder="Enter full name" required /></div>
        <div class="field"><label>Email *</label><input v-model="form.email" type="email" placeholder="Enter email" required /></div>
        <div class="field"><label>Phone *</label><input v-model="form.phone" placeholder="Phone number" required /></div>
        <div class="field"><label>Password *</label><input v-model="form.password" type="password" placeholder="Password (min 6 chars)" required /></div>
        <div class="field">
          <label>Role *</label>
          <select v-model="form.user_type" required>
            <option value="">Select role</option>
            <option value="operational_staff">Operational Staff</option>
            <option value="service_staff">Service Staff</option>
          </select>
        </div>
        <div class="field"><label>Status *</label>
          <select v-model="form.is_active" required>
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <div class="form-actions">
          <router-link to="/business/staff" class="cancel-btn">Cancel</router-link>
          <button type="submit" class="submit-btn" :disabled="loading">{{ loading ? 'Creating...' : 'Add Staff' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ name: '', email: '', phone: '', password: '', user_type: '', is_active: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await api.post('/users/create-user', { ...form, business_code: authStore.user?.business_code })
    router.push('/business/staff')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create staff'
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
.card { background: white; border-radius: 10px; padding: 24px; max-width: 540px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field select { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline: none; }
.error-msg { color: #ef4444; font-size: 13px; margin: 0; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; }
.cancel-btn { padding: 9px 16px; border-radius: 6px; background: #f1f5f9; color: #374151; text-decoration: none; font-size: 14px; }
.submit-btn { background: #0f172a; color: white; border: none; padding: 9px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
