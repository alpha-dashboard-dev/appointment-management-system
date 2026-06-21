/**
 * Shared utilities for service layer
 */
import { ROLES } from "./roles";

/**
 * Extract row data from Sequelize model or plain object
 */
export const extractRow = <T = any>(value: any): T => {
    return (value?.dataValues || value) as T;
};

/**
 * Validate actor has access to business
 */
export const validateActorBusiness = (actor: any, appointmentBusiness: string): void => {
    if (!actor || actor.userType === ROLES.ADMIN) return;
    if (appointmentBusiness !== actor.businessCode) {
        throw new Error("Access denied: appointment does not belong to your business");
    }
};

/**
 * Validate actor is the client (appointment creator)
 */
export const validateActorIsCreator = (actor: any, createdBy: string): void => {
    if (!actor || actor.userType === ROLES.ADMIN) return;
    if (actor.userType === ROLES.CLIENT && createdBy !== actor.userCode) {
        throw new Error("Access denied: this appointment does not belong to you");
    }
};

/**
 * Build standardized query options for service methods
 */
export const buildQueryOptions = (query: any = {}) => {
    return {
        include: query.include ? String(query.include).split(",") : [],
        limit: query.limit ? Number(query.limit) : undefined,
        offset: query.offset ? Number(query.offset) : undefined,
        order: [[query.sort_by || "created_at", query.sort_order || "DESC"]],
    };
};

/**
 * Money conversion and rounding utilities
 */
export const toAmount = (value: any): number => {
    const n = Number(value ?? 0);
    return Number.isFinite(n) ? n : 0;
};

export const roundMoney = (value: number): number => {
    return Number(value.toFixed(2));
};

/**
 * Time slot comparison helper
 */
export const timeSlotCoversRange = (
    slotStart: string,
    slotEnd: string,
    rangeStart: string,
    rangeEnd: string
): boolean => {
    return slotStart <= rangeStart && slotEnd >= rangeEnd;
};

/**
 * Deduplicate staff by location and time slot
 */
export const deduplicateStaffSlots = (rows: any[] = []): any[] => {
    const seen = new Set<string>();
    const result: any[] = [];

    for (const row of rows) {
        const key = [row.user_code, row.location_code, row.start_time, row.end_time].join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(row);
    }

    return result;
};

/**
 * Set actor's business code if not admin or client
 */
export const resolveBusinessCode = (actor: any, inputBusinessCode: string): string => {
    if (actor && actor.userType !== ROLES.ADMIN && actor.userType !== ROLES.CLIENT) {
        return actor.businessCode;
    }
    return inputBusinessCode;
};

/**
 * Filter available staff by excluding busy staff codes
 */
export const filterAvailableStaff = (staff: any[], busyStaffCodes: Set<string>): any[] => {
    return (staff || []).filter((s: any) => !busyStaffCodes.has(s.user_code));
};
