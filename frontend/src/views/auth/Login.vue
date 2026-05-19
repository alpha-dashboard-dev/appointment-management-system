<template>
  <div class="login-page">
    <div class="login-card">

      <div class="brand">
        <h1>AMS Portal</h1>
        <p>Appointment Management System</p>
      </div>

      <form class="form" @submit.prevent="submit">

        <div class="field">
          <label>Email</label>
          <input
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
              required
          />
        </div>

        <div class="field">
          <label>Password</label>
          <input
              v-model="form.password"
              type="password"
              placeholder="Enter your password"
              required
          />
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

      </form>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.email, form.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Check credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.brand {
  text-align: center;
  margin-bottom: 30px;
}

.brand h1 {
  margin: 0 0 4px;
  font-size: 26px;
  color: #1e293b;
}

.brand p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.field input {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus {
  border-color: #6366f1;
}

.error {
  color: #ef4444;
  font-size: 13px;
  margin: 0;
}

.submit-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #4f46e5;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
