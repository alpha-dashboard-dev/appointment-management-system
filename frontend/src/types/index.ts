// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string
  password: string
}

export interface AuthUser {
  user_code: string
  user_type: string
  business_code: string | null
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

// ─── Organization ────────────────────────────────────────────────────────────
export interface Organization {
  organization_code: string
  name: string
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

// ─── Business ────────────────────────────────────────────────────────────────
export interface Business {
  business_code: string
  organization_code: string
  name: string
  email?: string
  phone?: string
  address?: string
  timezone?: string
  user_code?: string
  status: 'active' | 'inactive'
  created_at?: string
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  user_code: string
  business_code?: string
  user_type: 'admin' | 'business_owner' | 'operational_staff' | 'service_staff' | 'client'
  email: string
  name?: string
  phone?: string
  is_active: 'active' | 'inactive'
  created_at?: string
}

// ─── Client ──────────────────────────────────────────────────────────────────
export interface Client {
  user_code: string
  business_code: string
  name: string
  email?: string
  phone?: string
  address?: string
  created_at?: string
}

// ─── Service ─────────────────────────────────────────────────────────────────
export interface Service {
  service_code: string
  business_code: string
  name: string
  description?: string
  price?: number
  cost?: number
  currency: string
  duration_uom?: string
  duration_value?: number
  status: 'active' | 'inactive'
  created_at?: string
}

// ─── Location ────────────────────────────────────────────────────────────────
export interface Location {
  location_code: string
  business_code?: string
  location_type: string
  address?: string
  street?: string
  apartment?: string
  city?: string
  postal_code?: string
  province?: string
  country?: string
  status?: 'active' | 'inactive'
  created_at?: string
}

// ─── Schedule ────────────────────────────────────────────────────────────────
export interface Schedule {
  id: number
  business_code: string
  user_code: string
  working_days: string
  employee_type: string
  location_code?: string
  start_time: string
  end_time: string
  created_at?: string
}

// ─── Charge ──────────────────────────────────────────────────────────────────
export interface Charge {
  charge_code: string
  business_code: string
  name: string
  description?: string
  charge_uom: string
  charge_value: number
  status?: 'active' | 'inactive'
  created_at?: string
}

// ─── Appointment ─────────────────────────────────────────────────────────────
export interface Appointment {
  appointment_code: string
  business_code: string
  appointment_start_date: string
  appointment_end_date: string
  start_time: string
  end_time: string
  location_code?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled'
  notes?: string
  created_by?: string
  created_at?: string
}

// ─── Invoice ─────────────────────────────────────────────────────────────────
export interface Invoice {
  id: number
  businessCode: string
  appointmentCode: string
  subtotal?: number
  total?: number
  status: 'draft' | 'sent' | 'paid' | 'cancelled'
  date: string
  updatedBy?: string
  created_at?: string
}

// ─── UserAbility ─────────────────────────────────────────────────────────────
export interface UserAbility {
  id: number
  business_code: string
  user_code: string
  user_type: string
  ability: string
  status: 'active' | 'inactive'
  added_by?: string
  created_at?: string
}

// ─── API Response ────────────────────────────────────────────────────────────
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}
