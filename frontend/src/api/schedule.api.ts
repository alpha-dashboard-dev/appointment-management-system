// Schedule API — staff working-hours / availability windows.
import api from './axios'

export const scheduleApi = {
  // GET /schedules — list all schedules
  getAll: (params?: object) => api.get('/schedules', { params }),
  // GET /schedules/:id — fetch a single schedule entry
  getById: (id: number) => api.get(`/schedules/${id}`),
  // POST /schedules — define a new availability window for a staff member
  create: (data: object) => api.post('/schedules', data),
  // PUT /schedules/:id — update a schedule entry (time range, days)
  update: (id: number, data: object) => api.put(`/schedules/${id}`, data),
  // DELETE /schedules/:id — remove a schedule entry
  delete: (id: number) => api.delete(`/schedules/${id}`),
  // GET /schedules/availability — check open slots for booking purposes
  checkAvailability: (params: object) => api.get('/schedules/availability', { params }),
}
