import repo from "../repositories/schedule.repository";
import { validateSchedule } from "../utils/validator";

class ScheduleService {

    async create(data: any) {
        const { business_code, user_code, working_days, employee_type, location_code, start_time, end_time } = data;

        validateSchedule(data);

        return await repo.create({
            business_code,
            user_code,
            working_days,
            employee_type,
            location_code,
            start_time,
            end_time,
        });
    }

    async getAll(filters: any = {}) {
        return await repo.findAll(filters);
    }

    async getById(id: number) {
        const schedule = await repo.findById(id);
        if (!schedule) throw new Error("Schedule not found");
        return schedule;
    }

    async update(id: number, data: any) {
        const schedule = await repo.findById(id);
        if (!schedule) throw new Error("Schedule not found");

        const allowed: any = {};
        const fields = ["working_days", "employee_type", "location_code", "start_time", "end_time"];
        for (const f of fields) {
            if (data[f] !== undefined) allowed[f] = data[f];
        }

        if (allowed.start_time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(allowed.start_time)) throw new Error("Invalid startTime format");
        if (allowed.end_time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(allowed.end_time)) throw new Error("Invalid endTime format");

        return await repo.update(id, allowed);
    }

    async delete(id: number) {
        const schedule = await repo.findById(id);
        if (!schedule) throw new Error("Schedule not found");
        return await repo.delete(id);
    }

    async checkAvailability(
        businessCode: string,
        locationCode: string,
        date: string,
        startTime: string,
        endTime: string
    ) {
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