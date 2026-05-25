const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/
const CODE_REGEX = /^[A-Za-z0-9]{8}$/

const VALID_USER_TYPES = ['admin', 'business_owner', 'operational_staff', 'service_staff', 'client']
const VALID_WORKING_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const VALID_EMPLOYEE_TYPES = ['visiting', 'permanent', 'remote']
const VALID_APPOINTMENT_STATUSES = ['pending', 'approved', 'in_progress', 'rejected', 'completed', 'canceled', 'rescheduled']
const VALID_RECURRENCE_UOMS = ['monthly', 'daily', 'weekly', 'fortnightly', 'quarterly', 'fixed']
const VALID_DURATION_UOMS = ['week', 'day', 'hour', 'minutes']
const VALID_CHARGE_UOMS = ['fixed', 'percentage']
const VALID_INVOICE_STATUSES = ['draft', 'issued', 'paid', 'canceled']
const VALID_LOCATION_TYPES = ['business', 'client']
const VALID_AVAILABILITY = ['available', 'not_available']
const VALID_ABILITY_USER_TYPES = ['admin', 'business_owner', 'staff', 'client']
const VALID_ABILITY_STATUSES = ['active', 'inactive']
const VALID_ORG_STATUSES = ['active', 'inactive']

export function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidCode(code) {
  return typeof code === 'string' && CODE_REGEX.test(code)
}

export function isValidDate(value) {
  return !!value && !isNaN(new Date(value).getTime())
}

export function isValidTime(value) {
  return typeof value === 'string' && TIME_REGEX.test(value)
}

// ---------- Login ----------
export function validateLoginForm(data) {
  const errors = {}
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'A valid email address is required'
  }
  if (!data.password || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }
  return errors
}

// ---------- Organization ----------
export function validateOrganizationForm(data) {
  const errors = {}
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Organization name must be at least 2 characters'
  }
  return errors
}

// ---------- Business ----------
export function validateBusinessForm(data) {
  const errors = {}
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Business name must be at least 2 characters'
  }
  if (!data.phone || data.phone.trim().length < 5) {
    errors.phone = 'Phone number must be at least 5 characters'
  }
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email address'
  }
  if (!data.organization_code) {
    errors.organization_code = 'Organization is required'
  }
  return errors
}

// ---------- User ----------
export function validateUserForm(data) {
  const errors = {}
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'A valid email address is required'
  }
  if (!data.phone || data.phone.trim().length < 5) {
    errors.phone = 'Phone number must be at least 5 characters'
  }
  if (!data.password || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }
  if (!data.user_type || !VALID_USER_TYPES.includes(data.user_type)) {
    errors.user_type = 'User type is required'
  }
  if (data.user_type && data.user_type !== 'admin' && !data.business_code) {
    errors.business_code = 'Business is required for this user type'
  }
  return errors
}

// ---------- Client ----------
export function validateClientForm(data) {
  const errors = {}
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'A valid email address is required'
  }
  if (data.phone && data.phone.trim().length < 5) {
    errors.phone = 'Phone number must be at least 5 characters'
  }
  if (!data.password || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }
  return errors
}

// ---------- Service ----------
export function validateServiceForm(data) {
  const errors = {}
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Service name must be at least 2 characters'
  }
  if (!data.business_code) {
    errors.business_code = 'Business is required'
  }
  if (data.price !== '' && data.price !== null && data.price !== undefined) {
    if (isNaN(Number(data.price)) || Number(data.price) < 0) {
      errors.price = 'Price must be a non-negative number'
    }
  }
  if (data.duration_uom && !VALID_DURATION_UOMS.includes(data.duration_uom)) {
    errors.duration_uom = 'Invalid duration unit'
  }
  if (data.duration_value !== null && data.duration_value !== '' && data.duration_value !== undefined) {
    if (!Number.isInteger(Number(data.duration_value)) || Number(data.duration_value) < 1) {
      errors.duration_value = 'Duration value must be a positive whole number'
    }
  }
  return errors
}

// ---------- Location ----------
export function validateLocationForm(data) {
  const errors = {}
  if (!data.business_code) {
    errors.business_code = 'Business is required'
  }
  if (!data.location_type || !VALID_LOCATION_TYPES.includes(data.location_type)) {
    errors.location_type = 'Location type is required'
  }
  return errors
}

// ---------- Charge ----------
export function validateChargeForm(data) {
  const errors = {}
  if (!data.business_code) {
    errors.business_code = 'Business is required'
  }
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Charge name must be at least 2 characters'
  }
  if (!data.charge_uom || !VALID_CHARGE_UOMS.includes(data.charge_uom)) {
    errors.charge_uom = 'Charge type is required'
  }
  if (data.charge_value === '' || data.charge_value === null || data.charge_value === undefined || isNaN(Number(data.charge_value)) || Number(data.charge_value) < 0) {
    errors.charge_value = 'Charge value must be a non-negative number'
  } else if (data.charge_uom === 'percentage' && Number(data.charge_value) > 100) {
    errors.charge_value = 'Percentage value cannot exceed 100'
  }
  return errors
}

// ---------- Appointment ----------
export function validateAppointmentForm(data) {
  const errors = {}
  if (!data.business_code) {
    errors.business_code = 'Business is required'
  }
  if (!data.service_code) {
    errors.service_code = 'Service is required'
  }
  if (!data.appointment_start_date || !isValidDate(data.appointment_start_date)) {
    errors.appointment_start_date = 'Valid start date is required'
  }
  if (!data.appointment_end_date || !isValidDate(data.appointment_end_date)) {
    errors.appointment_end_date = 'Valid end date is required'
  }
  if (data.appointment_start_date && data.appointment_end_date && isValidDate(data.appointment_start_date) && isValidDate(data.appointment_end_date)) {
    if (new Date(data.appointment_start_date) > new Date(data.appointment_end_date)) {
      errors.appointment_end_date = 'End date cannot be before start date'
    }
  }
  if (!data.start_time || !isValidTime(data.start_time)) {
    errors.start_time = 'Valid start time is required (HH:MM)'
  }
  if (!data.end_time || !isValidTime(data.end_time)) {
    errors.end_time = 'Valid end time is required (HH:MM)'
  }
  if (data.start_time && data.end_time && isValidTime(data.start_time) && isValidTime(data.end_time)) {
    if (data.start_time >= data.end_time) {
      errors.end_time = 'End time must be after start time'
    }
  }
  return errors
}

export { VALID_USER_TYPES, VALID_WORKING_DAYS, VALID_EMPLOYEE_TYPES, VALID_APPOINTMENT_STATUSES, VALID_DURATION_UOMS, VALID_CHARGE_UOMS, VALID_LOCATION_TYPES, VALID_ORG_STATUSES, VALID_ABILITY_USER_TYPES, VALID_ABILITY_STATUSES, VALID_INVOICE_STATUSES, VALID_AVAILABILITY }
