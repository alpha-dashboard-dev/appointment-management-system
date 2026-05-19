<template>
  <div class="page">

    <div class="page-header">
      <h2>New Business</h2>
      <router-link to="/businesses" class="back-link">← Back</router-link>
    </div>

    <div class="card">
      <form class="form" @submit.prevent="submit">

        <div class="field">
          <label>Business Name *</label>
          <input type="text" v-model="form.name" placeholder="Enter business name" required />
        </div>

        <div class="field">
          <label>Business Email *</label>
          <input type="email" v-model="form.email" placeholder="Enter business email" required />
        </div>

        <div class="field">
          <label>Phone Number *</label>
          <input type="text" v-model="form.phone" placeholder="Enter phone number" required />
        </div>

        <div class="field">
          <label>Address *</label>
          <input type="text" v-model="form.address" placeholder="Enter address" required />
        </div>

        <div class="field">
          <label>Time Zone *</label>

          <select v-model="form.timezone" required>
            <option value="">Select Time Zone</option>

            <option v-for="tz in timezones" :key="tz" :value="tz">
              {{ tz }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Status *</label>
          <select v-model="form.status" required>
            <option value="">Select status</option>
            <option v-for="status in ['active', 'inactive']" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Organization *</label>
          <select v-model="form.organization_code" required>
            <option value="">Select organization</option>
            <option v-for="org in organizations" :key="org.organization_code" :value="org.organization_code">
              {{ org.name }}
            </option>
          </select>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="form-actions">
          <router-link to="/businesses" class="cancel-btn">Cancel</router-link>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Business' }}
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

const router = useRouter();
const form = reactive({ name: '', organization_code: '', email: '', timezone: '', status: '', phone: '' })
const timezones = [
  'Asia/Karachi',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Europe/London',
  'America/New_York',
  'UTC'
]
const organizations = ref([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/organizations')
    organizations.value = res.data.data || []
  } catch (_) {}
})

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await api.post('/businesses', form)
    router.push('/businesses')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create business'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
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
