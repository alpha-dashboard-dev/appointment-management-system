import repo from "../repositories/schedule.repository";
import { validateSchedule } from "../utils/validator";
import { ROLES } from "../utils/roles";

class ScheduleService {

    async create(data: any, actor?: any) {
        // Non-admin actors can only create schedules for their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            data.business_code = actor.businessCode;
        }

        const { business_code, user_code, working_days, location_code, start_time, end_time, status } = data;

        validateSchedule(data);

        return await repo.create({
            business_code,
            user_code,
            working_days,
            location_code,
            start_time,
            end_time,
            status: status || 'active',
        });
    }

    async bulkCreate(entries: any[], actor?: any) {
        const results = [];
        for (const entry of entries) {
            if (actor && actor.userType !== ROLES.ADMIN) {
                entry.business_code = actor.businessCode;
            }
            validateSchedule(entry);
            const result = await repo.create({
                business_code: entry.business_code,
                user_code: entry.user_code,
                working_days: entry.working_days,
                employee_type: entry.employee_type,
                location_code: entry.location_code || null,
                start_time: entry.start_time,
                end_time: entry.end_time,
                status: entry.status || 'active',
            });
            results.push(result);
        }
        return results;
    }

    async getAll(filters: any = {}, actor?: any) {
        // Non-admin actors can only see schedules from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            filters.business_code = actor.businessCode;
        }
        return await repo.findAll(filters);
    }

    async getById(id: number, actor?: any) {
        const schedule = await repo.findById(id);
        if (!schedule) throw new Error("Schedule not found");

        // Non-admin actors can only view schedules from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const schedBiz = schedule.dataValues?.business_code ?? schedule.business_code;
            if (schedBiz !== actor.businessCode) {
                throw new Error("Access denied: schedule does not belong to your business");
            }
        }

        return schedule;
    }

    async update(id: number, data: any, actor?: any) {
        const schedule = await repo.findById(id);
        if (!schedule) throw new Error("Schedule not found");

        // Non-admin actors can only update schedules from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const schedBiz = schedule.dataValues?.business_code ?? schedule.business_code;
            if (schedBiz !== actor.businessCode) {
                throw new Error("Access denied: schedule does not belong to your business");
            }
        }

        const allowed: any = {};
        const fields = ["working_days", "employee_type", "location_code", "start_time", "end_time", "status"];
        for (const f of fields) {
            if (data[f] !== undefined) allowed[f] = data[f];
        }

        if (allowed.status && !['active', 'inactive'].includes(allowed.status)) {
            throw new Error("Invalid status. Must be 'active' or 'inactive'");
        }

        const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (allowed.start_time && !TIME_RE.test(allowed.start_time)) throw new Error("Invalid startTime format");
        if (allowed.end_time && !TIME_RE.test(allowed.end_time)) throw new Error("Invalid endTime format");

        return await repo.update(id, allowed);
    }

    async delete(id: number, actor?: any) {
        const schedule = await repo.findById(id);
        if (!schedule) throw new Error("Schedule not found");

        // Non-admin actors can only delete schedules from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const schedBiz = schedule.dataValues?.business_code ?? schedule.business_code;
            if (schedBiz !== actor.businessCode) {
                throw new Error("Access denied: schedule does not belong to your business");
            }
        }

        return await repo.delete(id);
    }

    async checkAvailability(businessCode: string, locationCode: string, date: string, startTime: string, endTime: string) {
        if (!businessCode || !locationCode || !date || !startTime || !endTime) {
            throw new Error("businessCode, locationCode, date, startTime, endTime are all required");
        }

        const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!TIME_REGEX.test(startTime)) throw new Error("Invalid startTime format. Use HH:MM");
        if (!TIME_REGEX.test(endTime)) throw new Error("Invalid endTime format. Use HH:MM");
        if (startTime >= endTime) throw new Error("startTime must be earlier than endTime");

        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) throw new Error("Invalid date format");
        const workingDay = days[parsed.getDay()];

        return await repo.findAvailableStaff(businessCode, locationCode, workingDay, startTime, endTime);
    }
}

export default new ScheduleService();
