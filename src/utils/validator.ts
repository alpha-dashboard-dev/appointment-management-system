// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidCode(code: string): boolean {
    return typeof code === "string" && CODE_REGEX.test(code);
}

function isValidDate(value: string): boolean {
    return !isNaN(new Date(value).getTime());
}

// ─── Organization ─────────────────────────────────────────────────────────────

export const validateOrganization = (data: any) => {
    const { name, status } = data;

    if (!name || name.trim().length < 2) {
        throw new Error("Organization name must be at least 2 characters long");
    }

    if (status !== undefined && !VALID_ORG_STATUSES.includes(status)) {
        throw new Error("Invalid status. Must be one of: " + VALID_ORG_STATUSES.join(", "));
    }
};

// ─── Business ─────────────────────────────────────────────────────────────────

export const validateBusiness = (data: any) => {
    const { name, phone, email, organizationCode } = data;

    if (!name || name.trim().length < 2) {
        throw new Error("Business name must be at least 2 characters long");
    }

    if (!phone || phone.trim().length < 5) {
        throw new Error("Phone number is required and must be at least 5 characters");
    }

    if (email !== undefined && email !== null && email !== "" && !isValidEmail(email)) {
        throw new Error("Invalid business email address");
    }

    if (!organizationCode || !isValidCode(organizationCode)) {
        throw new Error("Valid 8-character organizationCode is required");
    }
};

// ─── User ─────────────────────────────────────────────────────────────────────

export const validateUser = (data: any) => {
    const { name, email, password, userType, businessCode, organizationCode, phone } = data;

    if (!name || name.trim().length < 2) {
        throw new Error("Name must be at least 2 characters long");
    }

    if (!email || !isValidEmail(email)) {
        throw new Error("Invalid email address");
    }

    if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }

    if (!userType || !VALID_USER_TYPES.includes(userType)) {
        throw new Error("Invalid userType. Must be one of: " + VALID_USER_TYPES.join(", "));
    }

    if (!organizationCode || !isValidCode(organizationCode)) {
        throw new Error("Valid 8-character organizationCode is required");
    }

    if (userType !== "ADMIN" && (!businessCode || !isValidCode(businessCode))) {
        throw new Error("Valid 8-character businessCode is required for non-admin users");
    }

    if (!phone || phone.trim().length < 5) {
        throw new Error("Phone number is required and must be at least 5 characters");
    }
};

// ─── Client ───────────────────────────────────────────────────────────────────

export const validateClient = (data: any) => {
    const { name, phone, businessCode, email } = data;

    if (!name || name.trim().length < 2) {
        throw new Error("Client name must be at least 2 characters long");
    }

    if (!phone || phone.trim().length < 5) {
        throw new Error("Phone number is required and must be at least 5 characters");
    }

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (email !== undefined && email !== null && email !== "" && !isValidEmail(email)) {
        throw new Error("Invalid email address");
    }
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const validateService = (data: any) => {
    const { name, businessCode, price, durationUom, durationValue } = data;

    if (!name || name.trim().length < 2) {
        throw new Error("Service name must be at least 2 characters long");
    }

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (price !== undefined && price !== null && (isNaN(Number(price)) || Number(price) < 0)) {
        throw new Error("price must be a non-negative number");
    }

    if (durationUom !== undefined && !VALID_DURATION_UOMS.includes(durationUom)) {
        throw new Error("Invalid durationUom. Must be one of: " + VALID_DURATION_UOMS.join(", "));
    }

    if (durationValue !== undefined && (!Number.isInteger(Number(durationValue)) || Number(durationValue) < 1)) {
        throw new Error("durationValue must be a positive integer");
    }
};

// ─── Location ─────────────────────────────────────────────────────────────────

export const validateLocation = (data: any) => {
    const { locationType, businessCode } = data;

    if (!locationType || !VALID_LOCATION_TYPES.includes(locationType)) {
        throw new Error("Invalid locationType. Must be one of: " + VALID_LOCATION_TYPES.join(", "));
    }

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }
};

// ─── Location Service ─────────────────────────────────────────────────────────

export const validateLocationService = (data: any) => {
    const { businessCode, serviceCode, locationCode, availability } = data;

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!serviceCode || !isValidCode(serviceCode)) {
        throw new Error("Valid 8-character serviceCode is required");
    }

    if (!locationCode || !isValidCode(locationCode)) {
        throw new Error("Valid 8-character locationCode is required");
    }

    if (availability !== undefined && !VALID_AVAILABILITY.includes(availability)) {
        throw new Error("Invalid availability. Must be one of: " + VALID_AVAILABILITY.join(", "));
    }
};

// ─── User Shift Schedule ──────────────────────────────────────────────────────

export const validateSchedule = (data: any) => {
    const { businessCode, userCode, workingDays, employeeType, locationCode, startTime, endTime } = data;

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!userCode || !isValidCode(userCode)) {
        throw new Error("Valid 8-character userCode is required");
    }

    if (!workingDays || !VALID_WORKING_DAYS.includes(workingDays)) {
        throw new Error("Invalid workingDays. Must be one of: " + VALID_WORKING_DAYS.join(", "));
    }

    if (!employeeType || !VALID_EMPLOYEE_TYPES.includes(employeeType)) {
        throw new Error("Invalid employeeType. Must be one of: " + VALID_EMPLOYEE_TYPES.join(", "));
    }

    if (!locationCode || !isValidCode(locationCode)) {
        throw new Error("Valid 8-character locationCode is required");
    }

    if (!startTime || !TIME_REGEX.test(startTime)) {
        throw new Error("Invalid startTime format. Use HH:MM (e.g. 09:00)");
    }

    if (!endTime || !TIME_REGEX.test(endTime)) {
        throw new Error("Invalid endTime format. Use HH:MM (e.g. 17:00)");
    }

    if (startTime >= endTime) {
        throw new Error("startTime must be earlier than endTime");
    }
};

// ─── User Ability ─────────────────────────────────────────────────────────────

export const validateUserAbility = (data: any) => {
    const { businessCode, userCode, userType, ability, status } = data;

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!userCode || !isValidCode(userCode)) {
        throw new Error("Valid 8-character userCode is required");
    }

    if (!userType || !VALID_ABILITY_USER_TYPES.includes(userType)) {
        throw new Error("Invalid userType. Must be one of: " + VALID_ABILITY_USER_TYPES.join(", "));
    }

    if (!ability || ability.trim().length < 2) {
        throw new Error("ability is required and must be at least 2 characters");
    }

    if (status !== undefined && !VALID_ABILITY_STATUSES.includes(status)) {
        throw new Error("Invalid status. Must be one of: " + VALID_ABILITY_STATUSES.join(", "));
    }
};

// ─── Charge ───────────────────────────────────────────────────────────────────

export const validateCharge = (data: any) => {
    const { businessCode, name, chargeUom, chargeValue } = data;

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!name || name.trim().length < 2) {
        throw new Error("Charge name must be at least 2 characters long");
    }

    if (!chargeUom || !VALID_CHARGE_UOMS.includes(chargeUom)) {
        throw new Error("Invalid chargeUom. Must be one of: " + VALID_CHARGE_UOMS.join(", "));
    }

    if (chargeValue === undefined || chargeValue === null || isNaN(Number(chargeValue)) || Number(chargeValue) < 0) {
        throw new Error("chargeValue must be a non-negative number");
    }

    if (chargeUom === "PERCENTAGE" && Number(chargeValue) > 100) {
        throw new Error("chargeValue cannot exceed 100 for PERCENTAGE type");
    }
};

// ─── Appointment ──────────────────────────────────────────────────────────────

export const validateAppointment = (data: any) => {
    const { businessCode, appointmentStartDate, appointmentEndDate, startTime, endTime } = data;

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!appointmentStartDate || !isValidDate(appointmentStartDate)) {
        throw new Error("appointmentStartDate is required and must be a valid date (YYYY-MM-DD)");
    }

    if (!appointmentEndDate || !isValidDate(appointmentEndDate)) {
        throw new Error("appointmentEndDate is required and must be a valid date (YYYY-MM-DD)");
    }

    if (new Date(appointmentStartDate) > new Date(appointmentEndDate)) {
        throw new Error("appointmentStartDate cannot be after appointmentEndDate");
    }

    if (!startTime || !TIME_REGEX.test(startTime)) {
        throw new Error("Invalid startTime format. Use HH:MM (e.g. 09:00)");
    }

    if (!endTime || !TIME_REGEX.test(endTime)) {
        throw new Error("Invalid endTime format. Use HH:MM (e.g. 17:00)");
    }

    if (startTime >= endTime) {
        throw new Error("startTime must be earlier than endTime");
    }
};

export const validateReschedule = (data: any) => {
    const { appointmentStartDate, appointmentEndDate, startTime, endTime } = data;

    if (!appointmentStartDate || !isValidDate(appointmentStartDate)) {
        throw new Error("appointmentStartDate is required and must be a valid date (YYYY-MM-DD)");
    }

    if (!appointmentEndDate || !isValidDate(appointmentEndDate)) {
        throw new Error("appointmentEndDate is required and must be a valid date (YYYY-MM-DD)");
    }

    if (new Date(appointmentStartDate) > new Date(appointmentEndDate)) {
        throw new Error("appointmentStartDate cannot be after appointmentEndDate");
    }

    if (!startTime || !TIME_REGEX.test(startTime)) {
        throw new Error("Invalid startTime format. Use HH:MM");
    }

    if (!endTime || !TIME_REGEX.test(endTime)) {
        throw new Error("Invalid endTime format. Use HH:MM");
    }

    if (startTime >= endTime) {
        throw new Error("startTime must be earlier than endTime");
    }
};

export const validateAppointmentStatus = (data: any) => {
    const { status } = data;

    if (!status || !VALID_APPOINTMENT_STATUSES.includes(status)) {
        throw new Error("Invalid status. Must be one of: " + VALID_APPOINTMENT_STATUSES.join(", "));
    }
};

// ─── Appointment Participant ──────────────────────────────────────────────────

export const validateAppointmentParticipant = (data: any) => {
    const { businessCode, userCode, userType } = data;

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!userCode || !isValidCode(userCode)) {
        throw new Error("Valid 8-character userCode is required");
    }

    if (!userType || !VALID_PARTICIPANT_USER_TYPES.includes(userType)) {
        throw new Error("Invalid userType. Must be one of: " + VALID_PARTICIPANT_USER_TYPES.join(", "));
    }
};

// ─── Appointment Service ──────────────────────────────────────────────────────

export const validateAppointmentService = (data: any) => {
    const { businessCode, serviceCode } = data;

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!serviceCode || !isValidCode(serviceCode)) {
        throw new Error("Valid 8-character serviceCode is required");
    }
};

// ─── Appointment Charge ───────────────────────────────────────────────────────

export const validateAppointmentCharge = (data: any) => {
    const { businessCode, appointmentCode } = data;

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!appointmentCode || !isValidCode(appointmentCode)) {
        throw new Error("Valid 8-character appointmentCode is required");
    }
};

// ─── Appointment Discount ─────────────────────────────────────────────────────

export const validateAppointmentDiscount = (data: any) => {
    const { businessCode, serviceCode, appointmentCode, discountUom, discountValue } = data;

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!serviceCode || !isValidCode(serviceCode)) {
        throw new Error("Valid 8-character serviceCode is required");
    }

    if (!appointmentCode || !isValidCode(appointmentCode)) {
        throw new Error("Valid 8-character appointmentCode is required");
    }

    if (!discountUom || !VALID_DISCOUNT_UOMS.includes(discountUom)) {
        throw new Error("Invalid discountUom. Must be one of: " + VALID_DISCOUNT_UOMS.join(", "));
    }

    if (discountValue === undefined || discountValue === null || isNaN(Number(discountValue)) || Number(discountValue) < 0) {
        throw new Error("discountValue must be a non-negative number");
    }

    if (discountUom === "PERCENTAGE" && Number(discountValue) > 100) {
        throw new Error("discountValue cannot exceed 100 for PERCENTAGE type");
    }
};

// ─── Appointment Recurrence ───────────────────────────────────────────────────

export const validateAppointmentRecurrence = (data: any) => {
    const { businessCode, serviceCode, recurrenceUom, recurrenceValue, autoCancelAfterDays, rescheduleAfterDays } = data;

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!serviceCode || !isValidCode(serviceCode)) {
        throw new Error("Valid 8-character serviceCode is required");
    }

    if (!recurrenceUom || !VALID_RECURRENCE_UOMS.includes(recurrenceUom)) {
        throw new Error("Invalid recurrenceUom. Must be one of: " + VALID_RECURRENCE_UOMS.join(", "));
    }

    if (!recurrenceValue || !Number.isInteger(Number(recurrenceValue)) || Number(recurrenceValue) < 1) {
        throw new Error("recurrenceValue must be a positive integer");
    }

    if (autoCancelAfterDays !== undefined && autoCancelAfterDays !== null &&
        (!Number.isInteger(Number(autoCancelAfterDays)) || Number(autoCancelAfterDays) < 0)) {
        throw new Error("autoCancelAfterDays must be a non-negative integer");
    }

    if (rescheduleAfterDays !== undefined && rescheduleAfterDays !== null &&
        (!Number.isInteger(Number(rescheduleAfterDays)) || Number(rescheduleAfterDays) < 0)) {
        throw new Error("rescheduleAfterDays must be a non-negative integer");
    }
};

// ─── Appointment History ──────────────────────────────────────────────────────

export const validateAppointmentHistory = (data: any) => {
    const { businessCode, appointmentCode, action } = data;

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!appointmentCode || !isValidCode(appointmentCode)) {
        throw new Error("Valid 8-character appointmentCode is required");
    }

    if (!action || !VALID_HISTORY_ACTIONS.includes(action)) {
        throw new Error("Invalid action. Must be one of: " + VALID_HISTORY_ACTIONS.join(", "));
    }
};

// ─── Invoice ──────────────────────────────────────────────────────────────────

export const validateInvoice = (data: any) => {
    const { businessCode, appointmentCode, status, subtotal, total, date } = data;

    if (!businessCode || !isValidCode(businessCode)) {
        throw new Error("Valid 8-character businessCode is required");
    }

    if (!appointmentCode || !isValidCode(appointmentCode)) {
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
