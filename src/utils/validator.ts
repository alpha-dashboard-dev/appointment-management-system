
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const CODE_REGEX = /^[A-Za-z0-9]{8}$/;

const VALID_USER_TYPES = ["ADMIN", "BUSINESS_OWNER", "OPERATIONAL_STAFF", "SERVICE_STAFF", "CLIENT"];
const VALID_WORKING_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const VALID_EMPLOYEE_TYPES = ["visiting", "permanent", "remote"];
const VALID_APPOINTMENT_STATUSES = ["PENDING", "APPROVED", "IN_PROGRESS", "REJECTED", "COMPLETED", "CANCELLED", "RESCHEDULED"];
const VALID_HISTORY_ACTIONS = ["CREATED", "UPDATED", "ASSIGNED", "RESCHEDULED", "CANCELLED"];
const VALID_RECURRENCE_UOMS = ["MONTHLY", "DAILY", "WEEKLY", "FORTNIGHTLY", "QUARTERLY", "FIXED"];
const VALID_DURATION_UOMS = ["week", "day", "hour", "minutes"];
const VALID_CHARGE_UOMS = ["FIXED", "PERCENTAGE"];
const VALID_DISCOUNT_UOMS = ["FIXED", "PERCENTAGE"];
const VALID_INVOICE_STATUSES = ["DRAFT", "ISSUED", "PAID", "CANCELLED"];
const VALID_LOCATION_TYPES = ["BUSINESS", "CLIENT"];
const VALID_AVAILABILITY = ["AVAILABLE", "NOT_AVAILABLE"];
const VALID_PARTICIPANT_USER_TYPES = ["OWNER", "STAFF", "CLIENT"];
const VALID_ABILITY_USER_TYPES = ["ADMIN", "BUSINESS_OWNER", "STAFF", "CLIENT"];
const VALID_ABILITY_STATUSES = ["ACTIVE", "INACTIVE"];
const VALID_ORG_STATUSES = ["active", "in_active"];


function isValidEmail(email: string): boolean {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidCode(code: string): boolean {
    return typeof code === "string" && CODE_REGEX.test(code);
}

function isValidDate(value: string): boolean {
    return !isNaN(new Date(value).getTime());
}


export const validateOrganization = (data: any) => {
    const { name, status } = data;

    if (!name || name.trim().length < 2) {
        throw new Error("Organization name must be at least 2 characters long");
    }

    if (status !== undefined && !VALID_ORG_STATUSES.includes(status)) {
        throw new Error("Invalid status. Must be one of: " + VALID_ORG_STATUSES.join(", "));
    }
};


export const validateBusiness = (data: any) => {
    const { name, phone, email, organization_code, user_code } = data;

    if (!name || name.trim().length < 2) {
        throw new Error("Business name must be at least 2 characters long");
    }

    if (!phone || phone.trim().length < 5) {
        throw new Error("Phone number is required and must be at least 5 characters");
    }

    if (email !== undefined && email !== null && email !== "" && !isValidEmail(email)) {
        throw new Error("Invalid business email address");
    }

    if (!organization_code || !isValidCode(organization_code)) {
        throw new Error("Valid 8-character organizationCode is required");
    }
    if (!user_code || !isValidCode(user_code)) {
        throw new Error("Valid 8-character userCode is required");
    }
};

export const validateUser = (data: any) => {
    const { name, email, password, user_type, business_code, organization_code, phone } = data;

    if (!name || name.trim().length < 2) {
        throw new Error("Name must be at least 2 characters long");
    }

    if (!email || !isValidEmail(email)) {
        throw new Error("Invalid email address");
    }

    if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }

    if (!user_type || !VALID_USER_TYPES.includes(user_type)) {
        throw new Error("Invalid userType. Must be one of: " + VALID_USER_TYPES.join(", "));
    }

    if (!organization_code || !isValidCode(organization_code)) {
        throw new Error("Valid 8-character organizationCode is required");
    }

    if (user_type !== "ADMIN" && (!business_code || !isValidCode(business_code))) {
        throw new Error("Valid 8-character businessCode is required for non-admin users");
    }

    if (!phone || phone.trim().length < 5) {
        throw new Error("Phone number is required and must be at least 5 characters");
    }
};


export const validateClient = (data: any) => {
    const { name, phone, business_code, email } = data;

    if (!name || name.trim().length < 2) {
        throw new Error("Client name must be at least 2 characters long");
    }

    if (!phone || phone.trim().length < 5) {
        throw new Error("Phone number is required and must be at least 5 characters");
    }

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (email !== undefined && email !== null && email !== "" && !isValidEmail(email)) {
        throw new Error("Invalid email address");
    }
};


export const validateService = (data: any) => {
    // console.log(data)
    const { name, business_code, price, duration_uom, duration_value } = data;

    if (!name || name.trim().length < 2) {
        throw new Error("Service name must be at least 2 characters long");
    }

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (price !== undefined && price !== null && (isNaN(Number(price)) || Number(price) < 0)) {
        throw new Error("price must be a non-negative number");
    }

    if (duration_uom !== undefined && !VALID_DURATION_UOMS.includes(duration_uom)) {
        throw new Error("Invalid durationUom. Must be one of: " + VALID_DURATION_UOMS.join(", "));
    }

    if (duration_value !== undefined && (!Number.isInteger(Number(duration_value)) || Number(duration_value) < 1)) {
        throw new Error("durationValue must be a positive integer");
    }
};


export const validateLocation = (data: any) => {
    const { location_type, business_code } = data;

    if (!location_type || !VALID_LOCATION_TYPES.includes(location_type)) {
        throw new Error("Invalid locationType. Must be one of: " + VALID_LOCATION_TYPES.join(", "));
    }

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }
};


export const validateLocationService = (data: any) => {
    const { business_code, service_code, location_code, availability } = data;

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!service_code || !isValidCode(service_code)) {
        throw new Error("Valid 8-character serviceCode is required");
    }

    if (!location_code || !isValidCode(location_code)) {
        throw new Error("Valid 8-character locationCode is required");
    }

    if (availability !== undefined && !VALID_AVAILABILITY.includes(availability)) {
        throw new Error("Invalid availability. Must be one of: " + VALID_AVAILABILITY.join(", "));
    }
};


export const validateSchedule = (data: any) => {
    const { business_code, user_code, working_days, employee_type, location_code, start_time, end_time } = data;

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!user_code || !isValidCode(user_code)) {
        throw new Error("Valid 8-character userCode is required");
    }

    if (!working_days || !VALID_WORKING_DAYS.includes(working_days)) {
        throw new Error("Invalid workingDays. Must be one of: " + VALID_WORKING_DAYS.join(", "));
    }

    if (!employee_type || !VALID_EMPLOYEE_TYPES.includes(employee_type)) {
        throw new Error("Invalid employeeType. Must be one of: " + VALID_EMPLOYEE_TYPES.join(", "));
    }

    if (!location_code || !isValidCode(location_code)) {
        throw new Error("Valid 8-character locationCode is required");
    }

    if (!start_time || !TIME_REGEX.test(start_time)) {
        throw new Error("Invalid startTime format. Use HH:MM (e.g. 09:00)");
    }

    if (!end_time || !TIME_REGEX.test(end_time)) {
        throw new Error("Invalid endTime format. Use HH:MM (e.g. 17:00)");
    }

    if (start_time >= end_time) {
        throw new Error("startTime must be earlier than endTime");
    }
};


export const validateUserAbility = (data: any) => {
    const { business_code, user_code, user_type, ability, status } = data;

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!user_code || !isValidCode(user_code)) {
        throw new Error("Valid 8-character userCode is required");
    }

    if (!user_type || !VALID_ABILITY_USER_TYPES.includes(user_type)) {
        throw new Error("Invalid userType. Must be one of: " + VALID_ABILITY_USER_TYPES.join(", "));
    }

    if (!ability || ability.trim().length < 2) {
        throw new Error("ability is required and must be at least 2 characters");
    }

    if (status !== undefined && !VALID_ABILITY_STATUSES.includes(status)) {
        throw new Error("Invalid status. Must be one of: " + VALID_ABILITY_STATUSES.join(", "));
    }
};


export const validateCharge = (data: any) => {
    const { business_code, name, charge_uom, charge_value } = data;

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!name || name.trim().length < 2) {
        throw new Error("Charge name must be at least 2 characters long");
    }

    if (!charge_uom || !VALID_CHARGE_UOMS.includes(charge_uom)) {
        throw new Error("Invalid charge_uom. Must be one of: " + VALID_CHARGE_UOMS.join(", "));
    }

    if (charge_value === undefined || charge_value === null || isNaN(Number(charge_value)) || Number(charge_value) < 0) {
        throw new Error("chargeValue must be a non-negative number");
    }

    if (charge_uom === "PERCENTAGE" && Number(charge_value) > 100) {
        throw new Error("chargeValue cannot exceed 100 for PERCENTAGE type");
    }
};


export const validateAppointment = (data: any) => {
    const { business_code, appointment_start_date, appointment_end_date, start_time, end_time, status } = data;

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!appointment_start_date || !isValidDate(appointment_start_date)) {
        throw new Error("appointmentStartDate is required and must be a valid date (YYYY-MM-DD)");
    }

    if (!appointment_end_date || !isValidDate(appointment_end_date)) {
        throw new Error("appointmentEndDate is required and must be a valid date (YYYY-MM-DD)");
    }

    if (new Date(appointment_start_date) > new Date(appointment_end_date)) {
        throw new Error("appointmentStartDate cannot be after appointmentEndDate");
    }

    if (!start_time || !TIME_REGEX.test(start_time)) {
        throw new Error("Invalid startTime format. Use HH:MM (e.g. 09:00)");
    }

    if (!end_time || !TIME_REGEX.test(end_time)) {
        throw new Error("Invalid endTime format. Use HH:MM (e.g. 17:00)");
    }

    if (start_time >= end_time) {
        throw new Error("startTime must be earlier than endTime");
    }
    if (!status || !VALID_APPOINTMENT_STATUSES.includes(status)) {
        throw new Error("Invalid status. Must be one of: " + VALID_APPOINTMENT_STATUSES.join(", "));
    }
};

export const validateReschedule = (data: any) => {
    const { appointment_start_date, appointment_end_date, start_time, end_time } = data;

    if (!appointment_start_date || !isValidDate(appointment_start_date)) {
        throw new Error("appointmentStartDate is required and must be a valid date (YYYY-MM-DD)");
    }

    if (!appointment_end_date || !isValidDate(appointment_end_date)) {
        throw new Error("appointmentEndDate is required and must be a valid date (YYYY-MM-DD)");
    }

    if (new Date(appointment_start_date) > new Date(appointment_end_date)) {
        throw new Error("appointmentStartDate cannot be after appointmentEndDate");
    }

    if (!start_time || !TIME_REGEX.test(start_time)) {
        throw new Error("Invalid startTime format. Use HH:MM");
    }

    if (!end_time || !TIME_REGEX.test(end_time)) {
        throw new Error("Invalid endTime format. Use HH:MM");
    }

    if (start_time >= end_time) {
        throw new Error("startTime must be earlier than endTime");
    }
};

export const validateAppointmentStatus = (data: any) => {
    const { status } = data;

    if (!status || !VALID_APPOINTMENT_STATUSES.includes(status)) {
        throw new Error("Invalid status. Must be one of: " + VALID_APPOINTMENT_STATUSES.join(", "));
    }
};


export const validateAppointmentParticipant = (data: any) => {
    const { business_code, userCode, userType } = data;

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!userCode || !isValidCode(userCode)) {
        throw new Error("Valid 8-character userCode is required");
    }

    if (!userType || !VALID_PARTICIPANT_USER_TYPES.includes(userType)) {
        throw new Error("Invalid userType. Must be one of: " + VALID_PARTICIPANT_USER_TYPES.join(", "));
    }
};


export const validateAppointmentService = (data: any) => {
    const { business_code, service_code } = data;

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!service_code || !isValidCode(service_code)) {
        throw new Error("Valid 8-character serviceCode is required");
    }
};


export const validateAppointmentCharge = (data: any) => {
    const { business_code, appointment_code } = data;

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!appointment_code || !isValidCode(appointment_code)) {
        throw new Error("Valid 8-character appointmentCode is required");
    }
};


export const validateAppointmentDiscount = (data: any) => {
    const { business_code, service_code, appointment_code, discount_uom, discount_value } = data;

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!service_code || !isValidCode(service_code)) {
        throw new Error("Valid 8-character serviceCode is required");
    }

    if (!appointment_code || !isValidCode(appointment_code)) {
        throw new Error("Valid 8-character appointmentCode is required");
    }

    if (!discount_uom || !VALID_DISCOUNT_UOMS.includes(discount_uom)) {
        throw new Error("Invalid discountUom. Must be one of: " + VALID_DISCOUNT_UOMS.join(", "));
    }

    if (discount_value === undefined || discount_value === null || isNaN(Number(discount_value)) || Number(discount_value) < 0) {
        throw new Error("discountValue must be a non-negative number");
    }

    if (discount_uom === "PERCENTAGE" && Number(discount_value) > 100) {
        throw new Error("discountValue cannot exceed 100 for PERCENTAGE type");
    }
};


export const validateAppointmentRecurrence = (data: any) => {
    const { business_code, service_code, recurrence_uom, recurrence_Value, auto_cancel_after_days, reschedule_after_days } = data;

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!service_code || !isValidCode(service_code)) {
        throw new Error("Valid 8-character serviceCode is required");
    }

    if (!recurrence_uom || !VALID_RECURRENCE_UOMS.includes(recurrence_uom)) {
        throw new Error("Invalid recurrenceUom. Must be one of: " + VALID_RECURRENCE_UOMS.join(", "));
    }

    if (!recurrence_Value || !Number.isInteger(Number(recurrence_Value)) || Number(recurrence_Value) < 1) {
        throw new Error("recurrenceValue must be a positive integer");
    }

    if (auto_cancel_after_days !== undefined && auto_cancel_after_days !== null &&
        (!Number.isInteger(Number(auto_cancel_after_days)) || Number(auto_cancel_after_days) < 0)) {
        throw new Error("autoCancelAfterDays must be a non-negative integer");
    }

    if (reschedule_after_days !== undefined && reschedule_after_days !== null &&
        (!Number.isInteger(Number(reschedule_after_days)) || Number(reschedule_after_days) < 0)) {
        throw new Error("rescheduleAfterDays must be a non-negative integer");
    }
};


export const validateAppointmentHistory = (data: any) => {
    const { business_code, appointment_code, action } = data;

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!appointment_code || !isValidCode(appointment_code)) {
        throw new Error("Valid 8-character appointmentCode is required");
    }

    if (!action || !VALID_HISTORY_ACTIONS.includes(action)) {
        throw new Error("Invalid action. Must be one of: " + VALID_HISTORY_ACTIONS.join(", "));
    }
};

export const validateInvoice = (data: any) => {
    const { business_code, appointment_code, status, subtotal, total, date } = data;

    if (!business_code || !isValidCode(business_code)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!appointment_code || !isValidCode(appointment_code)) {
        throw new Error("Valid 8-character appointmentCode is required");
    }

    if (status !== undefined && !VALID_INVOICE_STATUSES.includes(status)) {
        throw new Error("Invalid status. Must be one of: " + VALID_INVOICE_STATUSES.join(", "));
    }

    if (subtotal !== undefined && subtotal !== null && (isNaN(Number(subtotal)) || Number(subtotal) < 0)) {
        throw new Error("subtotal must be a non-negative number");
    }

    if (total !== undefined && total !== null && (isNaN(Number(total)) || Number(total) < 0)) {
        throw new Error("total must be a non-negative number");
    }

    if (date !== undefined && date !== null && !isValidDate(date)) {
        throw new Error("date must be a valid date (YYYY-MM-DD)");
    }
};

export const validateInvoiceStatus = (data: any) => {
    const { status } = data;

    if (!status || !VALID_INVOICE_STATUSES.includes(status)) {
        throw new Error("Invalid status. Must be one of: " + VALID_INVOICE_STATUSES.join(", "));
    }
};
