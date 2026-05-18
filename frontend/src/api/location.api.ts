// Location API — physical or virtual venues where services are delivered.
import api from './axios'

export const locationApi = {
  // GET /locations — list all locations
  getAll: (params?: object) => api.get('/locations', { params }),
  // GET /locations/:code — fetch a single location
  getByCode: (code: string) => api.get(`/locations/${code}`),
  // POST /locations — create a new location
  create: (data: object) => api.post('/locations', data),
  // PUT /locations/:code — update location details (address, name, etc.)
  update: (code: string, data: object) => api.put(`/locations/${code}`, data),
  // DELETE /locations/:code — remove a location
  delete: (code: string) => api.delete(`/locations/${code}`),
}
