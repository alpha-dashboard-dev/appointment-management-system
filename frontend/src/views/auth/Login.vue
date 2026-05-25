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

          <RouterLink to="/reset-password" class="forgot-link">
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

    router.push(
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

.login-page {

  min-height: 100vh;

  background: #f4f6f9;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 20px;
}

.login-card {

  width: 100%;
  max-width: 500px;

  background: white;

  padding: 50px;

  border-radius: 18px;

  box-shadow: 0 10px 35px rgba(0,0,0,0.08);
}

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

.input-wrapper {

  position: relative;
}

.input-icon {

  position: absolute;

  left: 16px;
  top: 50%;

  transform: translateY(-50%);

  color: #6b7280;

  z-index: 10;
}

.custom-input {

  width: 100%;

  height: 55px;

  padding-left: 45px;
  padding-right: 45px;

  border: 1px solid #d1d5db;

  border-radius: 12px;

  font-size: 14px;

  outline: none;

  transition: border-color 0.2s;
}

.custom-input:focus {

  border-color: #6366f1;

  box-shadow: none;
}

.custom-input.input-error {
  border-color: #ef4444;
}

.field-error {
  color: #ef4444;
  font-size: 12px;
  margin: -12px 0 0 4px;
}

.password-toggle {

  position: absolute;

  right: 16px;
  top: 50%;

  transform: translateY(-50%);

  cursor: pointer;

  color: #6b7280;

  z-index: 10;
}

.options {

  display: flex;

  justify-content: flex-end;
}

.forgot-link {

  text-decoration: none;

  font-size: 14px;

  color: #6366f1;
}

.forgot-link:hover {

  text-decoration: underline;
}

.error {

  color: #ef4444;

  font-size: 13px;

  margin: 0;
}

.submit-btn {

  height: 55px;

  background: #6366f1;

  color: white;

  border: none;

  border-radius: 12px;

  font-size: 16px;

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

/* DARK MODE */

:global(body.dark-mode .login-page){

  background:#111827;
}

:global(body.dark-mode .login-card){

  background:#1f2937;

  border-color:#374151;
}

:global(body.dark-mode .custom-input){

  background:#111827;

  color:white;

  border-color:#374151;
}

:global(body.dark-mode .login-header h2),

:global(body.dark-mode .login-header p){

  color:white;
}

</style>

<!--<template>-->

<!--  <div class="login-page">-->
<!--    <div class="login-card">-->

<!--      <div class="brand">-->
<!--        <h1>AMS Portal</h1>-->
<!--        <p>Appointment Management System</p>-->
<!--      </div>-->

<!--      <form class="form" @submit.prevent="submit">-->

<!--        <div class="field">-->
<!--          <label>Email</label>-->
<!--          <input-->
<!--              v-model="form.email"-->
<!--              type="email"-->
<!--              placeholder="Enter your email"-->
<!--              required-->
<!--          />-->
<!--        </div>-->

<!--        <div class="field">-->
<!--          <label>Password</label>-->
<!--          <input-->
<!--              v-model="form.password"-->
<!--              type="password"-->
<!--              placeholder="Enter your password"-->
<!--              required-->
<!--          />-->
<!--        </div>-->

<!--        <p v-if="error" class="error">{{ error }}</p>-->

<!--        <button type="submit" class="submit-btn" :disabled="loading">-->
<!--          {{ loading ? 'Signing in...' : 'Sign In' }}-->
<!--        </button>-->

<!--      </form>-->

<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import { reactive, ref } from 'vue'-->
<!--import { useRouter } from 'vue-router'-->
<!--import { useAuthStore } from '@/stores/auth.store'-->

<!--const router = useRouter()-->
<!--const authStore = useAuthStore()-->

<!--const form = reactive({ email: '', password: '' })-->
<!--const loading = ref(false)-->
<!--const error = ref('')-->

<!--async function submit() {-->
<!--  loading.value = true-->
<!--  error.value = ''-->
<!--  try {-->
<!--    await authStore.login(form.email, form.password)-->
<!--    router.push(authStore.dashboardRoute)-->
<!--  } catch (err) {-->
<!--    error.value = err.response?.data?.message || 'Login failed. Check credentials.'-->
<!--  } finally {-->
<!--    loading.value = false-->
<!--  }-->
<!--}-->
<!--</script>-->

<!--<style scoped>-->
<!--.login-page {-->
<!--  min-height: 100vh;-->
<!--  background: #f1f5f9;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--}-->

<!--.login-card {-->
<!--  background: white;-->
<!--  padding: 40px;-->
<!--  border-radius: 12px;-->
<!--  width: 100%;-->
<!--  max-width: 420px;-->
<!--  box-shadow: 0 4px 20px rgba(0,0,0,0.08);-->
<!--}-->

<!--.brand {-->
<!--  text-align: center;-->
<!--  margin-bottom: 30px;-->
<!--}-->

<!--.brand h1 {-->
<!--  margin: 0 0 4px;-->
<!--  font-size: 26px;-->
<!--  color: #1e293b;-->
<!--}-->

<!--.brand p {-->
<!--  margin: 0;-->
<!--  color: #64748b;-->
<!--  font-size: 14px;-->
<!--}-->

<!--.form {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  gap: 16px;-->
<!--}-->

<!--.field {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  gap: 6px;-->
<!--}-->

<!--.field label {-->
<!--  font-size: 13px;-->
<!--  font-weight: 600;-->
<!--  color: #374151;-->
<!--}-->

<!--.field input {-->
<!--  padding: 10px 12px;-->
<!--  border: 1px solid #e2e8f0;-->
<!--  border-radius: 6px;-->
<!--  font-size: 14px;-->
<!--  outline: none;-->
<!--  transition: border-color 0.2s;-->
<!--}-->

<!--.field input:focus {-->
<!--  border-color: #6366f1;-->
<!--}-->

<!--.error {-->
<!--  color: #ef4444;-->
<!--  font-size: 13px;-->
<!--  margin: 0;-->
<!--}-->

<!--.submit-btn {-->
<!--  background: #6366f1;-->
<!--  color: white;-->
<!--  border: none;-->
<!--  padding: 12px;-->
<!--  border-radius: 6px;-->
<!--  font-size: 15px;-->
<!--  font-weight: 600;-->
<!--  cursor: pointer;-->
<!--  transition: background 0.2s;-->
<!--}-->

<!--.submit-btn:hover:not(:disabled) {-->
<!--  background: #4f46e5;-->
<!--}-->

<!--.submit-btn:disabled {-->
<!--  opacity: 0.7;-->
<!--  cursor: not-allowed;-->
<!--}-->
<!--</style>-->
