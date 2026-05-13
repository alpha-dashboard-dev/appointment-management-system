export const ROLES = {
    ADMIN: "ADMIN",                         // Full system access
    BUSINESS_OWNER: "BUSINESS_OWNER",       // Manages their own business
    OPERATIONAL_STAFF: "OPERATIONAL_STAFF", // Day-to-day operations
    SERVICE_STAFF: "SERVICE_STAFF",         // Delivers services / takes appointments
    CLIENT: "CLIENT",                       // End customer booking appointments
} as const;
