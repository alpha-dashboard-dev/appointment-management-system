// Service API — catalog of services offered by businesses (e.g. haircut, consultation).
import api from './axios'

export const serviceApi = {
  // GET /services — list all services
  getAll: (params?: object) => api.get('/services', { params }),
  // GET /services/:code — fetch a single service
  getByCode: (code: string) => api.get(`/services/${code}`),
  // POST /services — add a new service to the catalog
  create: (data: object) => api.post('/services', data),
  // PUT /services/:code — update service details (name, duration, price)
  update: (code: string, data: object) => api.put(`/services/${code}`, data),
  // PATCH /services/:code/status — enable or disable a service
  changeStatus: (code: string, status: string) => api.patch(`/services/${code}/status`, { status }),
  // DELETE /services/:code — remove a service from the catalog
  delete: (code: string) => api.delete(`/services/${code}`),
}
