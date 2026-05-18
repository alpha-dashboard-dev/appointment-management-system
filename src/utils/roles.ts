export const ROLES = {
    ADMIN: "admin",                         // Full system access
    BUSINESS_OWNER: "business_owner",       // Manages their own business
    OPERATIONAL_STAFF: "operational_staff", // Day-to-day operations
    SERVICE_STAFF: "service_staff",         // Delivers services / takes appointments
    CLIENT: "client",                       // End customer booking appointments
} as const;
