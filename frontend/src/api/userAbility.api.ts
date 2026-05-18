// UserAbility API — fine-grained RBAC rules that grant or restrict what a user can do.
import api from './axios'

export const userAbilityApi = {
  // GET /user-abilities — list all ability assignments
  getAll: (params?: object) => api.get('/user-abilities', { params }),
  // GET /user-abilities/:id — fetch a single ability record
  getById: (id: number) => api.get(`/user-abilities/${id}`),
  // POST /user-abilities — assign a new ability (action + subject) to a user
  create: (data: object) => api.post('/user-abilities', data),
  // PUT /user-abilities/:id — update an existing ability assignment
  update: (id: number, data: object) => api.put(`/user-abilities/${id}`, data),
  // DELETE /user-abilities/:id — revoke an ability from a user
  delete: (id: number) => api.delete(`/user-abilities/${id}`),
}
