// Invoice API — billing documents generated from appointments and their charges.
import api from './axios'

export const invoiceApi = {
  // GET /invoices — list all invoices
  getAll: (params?: object) => api.get('/invoices', { params }),
  // GET /invoices/:id — fetch a single invoice
  getById: (id: number) => api.get(`/invoices/${id}`),
  // POST /invoices — create a new invoice (usually triggered after an appointment)
  create: (data: object) => api.post('/invoices', data),
  // PUT /invoices/:id — update invoice line items or details
  update: (id: number, data: object) => api.put(`/invoices/${id}`, data),
  // PATCH /invoices/:id/status — change invoice status (e.g. draft → sent → paid)
  changeStatus: (id: number, status: string) => api.patch(`/invoices/${id}/status`, { status }),
}
