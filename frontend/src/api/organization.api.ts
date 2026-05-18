// Organization API — top-level tenants in the multi-tenant hierarchy.
import api from './axios'

export const organizationApi = {
  // GET /organizations — list all organizations
  getAll: (params?: object) => api.get('/organizations', { params }),
  // GET /organizations/:code — fetch a single organization
  getByCode: (code: string) => api.get(`/organizations/${code}`),
  // POST /organizations — register a new organization
  create: (data: object) => api.post('/organizations', data),
  // PUT /organizations/:code — update organization details
  update: (code: string, data: object) => api.put(`/organizations/${code}`, data),
  // PATCH /organizations/:code/status — activate or deactivate an organization
  changeStatus: (code: string, status: string) => api.patch(`/organizations/${code}/status`, { status }),
}
