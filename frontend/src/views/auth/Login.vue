<template>

  <div class="login-page">

    <div class="login-card">

      <!-- HEADER -->

      <div class="login-header">

        <h2>Appointment Management System</h2>

        <p>Please login to your account</p>

      </div>

      <!-- FORM -->

      <form class="form" @submit.prevent="submit">

        <!-- EMAIL -->

        <div class="input-wrapper">

          <i class="bi bi-envelope input-icon"></i>

          <input
              v-model="form.email"
              type="email"
              class="custom-input"
              :class="{ 'input-error': errors.email }"
              placeholder="Enter your email"
              @blur="validateField('email')"
          />

        </div>
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>

        <!-- PASSWORD -->

        <div class="input-wrapper">

          <i class="bi bi-lock input-icon"></i>

          <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="custom-input"
              :class="{ 'input-error': errors.password }"
              placeholder="Enter your password"
              @blur="validateField('password')"
          />

          <i
              :class="showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'"
              class="password-toggle"
              @click="togglePassword"
          ></i>

        </div>
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>

        <div
            class="d-flex justify-content-between align-items-center"
        >

          <div class="form-check">

            <input
                class="form-check-input"
                type="checkbox"
                id="remember"
                v-model="rememberMe"
            >

            <label
                class="form-check-label"
                for="remember"
            >
              Remember Me
            </label>

          </div>

          <RouterLink to="/forgot-password" class="forgot-link">
            Forgot Password?
          </RouterLink>

        </div>

        <!-- FORGOT PASSWORD -->

<!--        <div class="options">-->

<!--          <RouterLink-->
<!--              to="/reset-password"-->
<!--              class="forgot-link"-->
<!--          >-->
<!--            Forgot Password?-->
<!--          </RouterLink>-->

<!--        </div>-->

        <!-- ERROR -->

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <!-- BUTTON -->

        <button
            type="submit"
            class="submit-btn"
            :disabled="loading"
        >
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
import { validateLoginForm } from '@/utils/validator'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const errors = reactive({})
const showPassword = ref(false)
const rememberMe = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}

function validateField(field) {
  const result = validateLoginForm(form)
  if (result[field]) {
    errors[field] = result[field]
  } else {
    delete errors[field]
  }
}

async function submit() {
  Object.assign(errors, validateLoginForm(form))
  const validationErrors = validateLoginForm(form)
  Object.keys(errors).forEach(k => delete errors[k])
  Object.assign(errors, validationErrors)
  if (Object.keys(errors).length > 0) return

  loading.value = true
  error.value = ''

  try {

    await authStore.login(
        form.email,
        form.password
    )

    await router.push(
        authStore.dashboardRoute
    )

  } catch (err) {

    error.value =
        err.response?.data?.message
        || 'Login failed. Check credentials.'

  } finally {

    loading.value = false

  }
}
</script>

<style scoped>

/* FULL PAGE */

.login-page {

  min-height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  background-image:
      url('https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1600');

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  position: relative;

  overflow: hidden;
}

/* BLUE OVERLAY */

.login-page::before {

  content: '';

  position: absolute;

  inset: 0;

  background:
      rgba(13,110,253,.75);

  z-index: 1;
}

/* CENTER LOGIN */

.login-left {

  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;

  z-index: 2;

  padding: 20px;
}

/* HIDE RIGHT PANEL */

.login-right {

  display: none;
}

/* LOGIN CARD */

.login-card {

  width: 100%;
  max-width: 500px;

  background: rgba(255,255,255,.96);

  backdrop-filter: blur(12px);

  padding: 50px;

  border-radius: 20px;

  box-shadow:
      0 20px 60px rgba(0,0,0,.25);

  position: relative;

  z-index: 3;
}

/* HEADER */

.login-header {

  text-align: center;

  margin-bottom: 35px;
}

.login-header h2 {

  font-size: 30px;

  font-weight: 700;

  color: #111827;

  margin-bottom: 10px;
}

.login-header p {

  color: #6b7280;

  margin: 0;
}

.form {

  display: flex;

  flex-direction: column;

  gap: 20px;
}

/* INPUT WRAPPER */

.input-wrapper {

  position: relative;
}

/* INPUT ICON */

.input-icon {

  position: absolute;

  left: 16px;
  top: 50%;

  transform: translateY(-50%);

  color: #6b7280;

  z-index: 10;
}

/* INPUTS */

.custom-input {

  width: 100%;

  height: 55px;

  padding-left: 45px;
  padding-right: 45px;

  border-radius: 12px;

  border: 1px solid #d1d5db;

  font-size: 14px;

  outline: none;

  transition: border-color 0.2s;
}

.custom-input:focus {

  box-shadow: none;

  border-color: #0d6efd;
}

.custom-input.input-error {
  border-color: #ef4444;
}

.field-error {
  color: #ef4444;
  font-size: 12px;
  margin: -12px 0 0 4px;
}

/* PASSWORD TOGGLE */

.password-toggle {

  position: absolute;

  right: 16px;
  top: 50%;

  transform: translateY(-50%);

  cursor: pointer;

  color: #6b7280;

  z-index: 10;
}

/* BUTTON */

.submit-btn {

  height: 55px;

  background: #0d6efd;

  color: white;

  border: none;

  border-radius: 12px;

  font-size: 16px;

  font-weight: 600;

  cursor: pointer;

  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {

  background: #0b5ed7;
}

.submit-btn:disabled {

  opacity: 0.7;

  cursor: not-allowed;
}

/* FORGOT PASSWORD */

.forgot-link {

  text-decoration: none;

  font-size: 14px;

  color: #0d6efd;
}

.forgot-link:hover {

  text-decoration: underline;
}

.error {

  color: #ef4444;

  font-size: 13px;

  margin: 0;
}

/* DARK MODE */

:global(body.dark-mode .login-card){

  background: rgba(31,41,55,.95);

  border: 1px solid #374151;
}

:global(body.dark-mode .custom-input){

  background:#111827;

  color:white;

  border-color:#374151;
}

:global(body.dark-mode .custom-input::placeholder){

  color:#9ca3af;
}

:global(body.dark-mode .login-header h2),

:global(body.dark-mode .login-header p),

:global(body.dark-mode label),

:global(body.dark-mode .form-check-label){

  color:white;
}

:global(body.dark-mode .input-icon),

:global(body.dark-mode .password-toggle){

  color:#9ca3af;
}

/* MOBILE */

@media (max-width: 768px) {

  .login-card {

    padding: 30px;
  }

  .login-header h2 {

    font-size: 24px;
  }

}

</style>