<script setup lang="ts">
// LoginView — public login page.
// Handles credential validation, calls the auth API, and redirects to /dashboard on success.
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login } = useAuth()

// Form field bindings
const email    = ref('')
const password = ref('')
// UI state
const loading  = ref(false)  // disables submit button while request is in-flight
const error    = ref('')     // inline error message shown above the form
const showPass = ref(false)  // toggles password visibility

async function handleLogin() {
  // Basic client-side guard before hitting the network
  if (!email.value || !password.value) {
    error.value = 'Please enter your email and password.'
    return
  }
  loading.value = true
  error.value   = ''
  try {
    await login(email.value, password.value)
    // On success, send the user to the main dashboard
    router.push('/dashboard')
  } catch (err: any) {
    // Show the server's error message or a generic fallback
    error.value = err?.response?.data?.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex" style="background-color: #f3f4f8;">
    <!-- Left decorative panel -->
    <div class="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
         style="background-color: #1a1f3e;">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-64 h-64 rounded-full" style="background: #2e37a4; filter: blur(80px);"></div>
        <div class="absolute bottom-20 right-10 w-80 h-80 rounded-full" style="background: #2e37a4; filter: blur(100px);"></div>
      </div>
      <div class="relative z-10 text-center max-w-md">
        <div class="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
             style="background-color: #2e37a4;">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-white mb-3">Appointment Management System</h1>
        <p class="text-gray-400 text-base leading-relaxed">
          Streamline your business appointments, manage staff schedules, and serve your clients with ease.
        </p>
        <div class="mt-10 grid grid-cols-3 gap-4">
          <div v-for="stat in [['Organizations','Multi-tenant'],['Roles','5 user types'],['Modules','12+ features']]"
               :key="stat[0]"
               class="rounded-xl p-4 border border-white/10 text-center"
               style="background: rgba(255,255,255,0.05);">
            <p class="text-white font-semibold text-lg">{{ stat[0] }}</p>
            <p class="text-gray-400 text-xs mt-1">{{ stat[1] }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right login form -->
    <div class="flex-1 flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <!-- Mobile logo -->
        <div class="lg:hidden text-center mb-8">
          <div class="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center"
               style="background-color: #2e37a4;">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <h1 class="text-xl font-bold text-gray-800">AMS Admin</h1>
        </div>

        <div class="card">
          <h2 class="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
          <p class="text-gray-500 text-sm mb-6">Sign in to your admin account</p>

          <!-- Error -->
          <div v-if="error" class="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ error }}
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <!-- Email -->
            <div>
              <label class="form-label">Email address</label>
              <input
                v-model="email"
                type="email"
                class="form-input"
                placeholder="admin@example.com"
                autocomplete="email"
              />
            </div>

            <!-- Password -->
            <div>
              <label class="form-label">Password</label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPass ? 'text' : 'password'"
                  class="form-input pr-10"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  @click="showPass = !showPass"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="showPass" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary w-full justify-center py-2.5"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>
        </div>

        <p class="text-center text-xs text-gray-400 mt-6">
          © {{ new Date().getFullYear() }} Appointment Management System. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>
