// User API — manages staff/admin accounts.
import api from './axios'

export const userApi = {
  // GET /users — list all users
  getAll: (params?: object) => api.get('/users', { params }),
  // GET /users/:code — fetch a single user by their unique code
  getByCode: (code: string) => api.get(`/users/${code}`),
  // POST /users — create a new user account
  create: (data: object) => api.post('/users', data),
  // PUT /users/:code — update user profile or credentials
  update: (code: string, data: object) => api.put(`/users/${code}`, data),
  // PATCH /users/:code/status — activate or deactivate a user
  changeStatus: (code: string, status: string) => api.patch(`/users/${code}/status`, { status }),
  // DELETE /users/:code — permanently delete a user account
  delete: (code: string) => api.delete(`/users/${code}`),
}
