// Client API — end-customers who book appointments.
import api from './axios'

export const clientApi = {
  // GET /clients — list all clients
  getAll: (params?: object) => api.get('/clients', { params }),
  // GET /clients/:code — fetch a single client record
  getByCode: (code: string) => api.get(`/clients/${code}`),
  // POST /clients — register a new client
  create: (data: object) => api.post('/clients', data),
  // PUT /clients/:code — update client information
  update: (code: string, data: object) => api.put(`/clients/${code}`, data),
  // DELETE /clients/:code — remove a client record
  delete: (code: string) => api.delete(`/clients/${code}`),
}
