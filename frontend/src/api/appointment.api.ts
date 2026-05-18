// Appointment API — CRUD plus domain-specific actions (reschedule, participants, services, charges).
import api from './axios'

export const appointmentApi = {
  // GET /appointments — list all appointments, optional query params for filtering/pagination
  getAll: (params?: object) => api.get('/appointments', { params }),
  // GET /appointments/:code — fetch a single appointment by its unique code
  getByCode: (code: string) => api.get(`/appointments/${code}`),
  // POST /appointments — create a new appointment
  create: (data: object) => api.post('/appointments', data),
  // PUT /appointments/:code — update appointment details
  update: (code: string, data: object) => api.put(`/appointments/${code}`, data),
  // PATCH /appointments/:code/status — change lifecycle status (e.g. confirmed → completed)
  changeStatus: (code: string, status: string) => api.patch(`/appointments/${code}/status`, { status }),
  // POST /appointments/:code/reschedule — move appointment to a new date/time
  reschedule: (code: string, data: object) => api.post(`/appointments/${code}/reschedule`, data),
  // GET /appointments/:code/history — audit log of status changes for an appointment
  getHistory: (code: string) => api.get(`/appointments/${code}/history`),
  // POST /appointments/:code/participants — add a staff member or client to the appointment
  addParticipant: (code: string, data: object) => api.post(`/appointments/${code}/participants`, data),
  // GET /appointments/:code/participants — list all participants for an appointment
  getParticipants: (code: string) => api.get(`/appointments/${code}/participants`),
  // DELETE /appointments/:code/participants/:id — remove a specific participant
  removeParticipant: (code: string, participantId: number) =>
    api.delete(`/appointments/${code}/participants/${participantId}`),
  // POST /appointments/:code/services — attach a service to an appointment
  addService: (code: string, data: object) => api.post(`/appointments/${code}/services`, data),
  // GET /appointments/:code/services — list services linked to an appointment
  getServices: (code: string) => api.get(`/appointments/${code}/services`),
  // POST /appointments/:code/charges — add an additional charge to an appointment
  addCharge: (code: string, data: object) => api.post(`/appointments/${code}/charges`, data),
  // GET /appointments/:code/charges — list all charges for an appointment
  getCharges: (code: string) => api.get(`/appointments/${code}/charges`),
}
