// Authentication API — wraps login, logout, and token refresh endpoints.
import api from './axios'
import type { LoginPayload } from '@/types'

export const authApi = {
  // POST /auth/login — exchange email+password for access & refresh tokens
  login: (payload: LoginPayload) => api.post('/auth/login', payload),
  // POST /auth/logout — invalidates the current session on the server
  logout: () => api.post('/auth/logout'),
  // POST /auth/refresh — obtain a new access token using the refresh token
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
}
