// Charge API — fee definitions (e.g. consultation fee, no-show penalty) applied to appointments.
import api from './axios'

export const chargeApi = {
  // GET /charges — list all charge types
  getAll: (params?: object) => api.get('/charges', { params }),
  // GET /charges/:code — fetch a single charge definition
  getByCode: (code: string) => api.get(`/charges/${code}`),
  // POST /charges — create a new charge type
  create: (data: object) => api.post('/charges', data),
  // PUT /charges/:code — update a charge (name, amount, type)
  update: (code: string, data: object) => api.put(`/charges/${code}`, data),
  // DELETE /charges/:code — remove a charge type
  delete: (code: string) => api.delete(`/charges/${code}`),
}
