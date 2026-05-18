// useAuth composable — centralised authentication state and actions.
// A single `user` ref is shared across all component instances (module-level singleton),
// so the logged-in state is consistent everywhere without a global store.
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth.api'
import type { AuthUser } from '@/types'

// Module-level reactive ref — shared by every component that calls useAuth()
const user = ref<AuthUser | null>(null)

// Rehydrate the user from localStorage on first import (e.g. after a page refresh)
const stored = localStorage.getItem('user')
if (stored) {
  try { user.value = JSON.parse(stored) } catch { /* ignore malformed JSON */ }
}

export function useAuth() {
  // true when a user object is present (token exists in storage)
  const isAuthenticated = computed(() => !!user.value)

  // Calls the login endpoint, persists tokens & user data, then updates reactive state
  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password })
    const { accessToken, refreshToken, user: userData } = res.data.data
    // Persist tokens so they survive page refreshes (picked up by the axios interceptor)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    user.value = userData
    return userData
  }

  // Calls the logout endpoint (best-effort), then clears all local state
  async function logout() {
    try { await authApi.logout() } catch { /* ignore network errors on logout */ }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    user.value = null
  }

  return { user, isAuthenticated, login, logout }
}
