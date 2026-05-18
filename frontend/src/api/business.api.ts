// Business API — businesses are sub-tenants that belong to an organization.
import api from './axios'

export const businessApi = {
  // GET /businesses — list all businesses (optionally filtered by org)
  getAll: (params?: object) => api.get('/businesses', { params }),
  // GET /businesses/:code — fetch a single business
  getByCode: (code: string) => api.get(`/businesses/${code}`),
  // POST /businesses — create a new business under an organization
  create: (data: object) => api.post('/businesses', data),
  // PUT /businesses/:code — update business details
  update: (code: string, data: object) => api.put(`/businesses/${code}`, data),
  // PATCH /businesses/:code/status — activate or deactivate a business
  changeStatus: (code: string, status: string) => api.patch(`/businesses/${code}/status`, { status }),
  // DELETE /businesses/:code — permanently remove a business
  delete: (code: string) => api.delete(`/businesses/${code}`),
}
