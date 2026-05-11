// Central definition of all user roles in the system.
// Import ROLES instead of using raw strings so typos are caught at compile time.
export const ROLES = {
    ADMIN: "ADMIN",                         // Full system access
    BUSINESS_OWNER: "BUSINESS_OWNER",       // Manages their own business
    OPERATIONAL_STAFF: "OPERATIONAL_STAFF", // Day-to-day operations
    SERVICE_STAFF: "SERVICE_STAFF",         // Delivers services / takes appointments
    CLIENT: "CLIENT",                       // End customer booking appointments
} as const;
