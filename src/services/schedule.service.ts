
import repo from "../repositories/schedule.repository";
import { validateSchedule } from "../utils/validator";

class ScheduleService {

    async create(data: any, actor: any) {
        const { businessCode, userCode, workingDays, employeeType, locationCode, startTime, endTime } = data;

        validateSchedule(data);

        return await repo.create({
            businessCode,
            userCode,
            workingDays,
            employeeType,
            locationCode,
            startTime,
            endTime,
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

    async update(id: number, data: any, actor: any) {
        const schedule = await repo.findById(id);
        if (!schedule) throw new Error("Schedule not found");

        const allowed: any = {};
        const fields = ["workingDays", "employeeType", "locationCode", "startTime", "endTime"];
        for (const f of fields) {
            if (data[f] !== undefined) allowed[f] = data[f];
        }

        if (allowed.startTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(allowed.startTime)) throw new Error("Invalid startTime format");
        if (allowed.endTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(allowed.endTime)) throw new Error("Invalid endTime format");

        return await repo.update(id, allowed);
    }

    async delete(id: number, actor: any) {
        const schedule = await repo.findById(id);
        if (!schedule) throw new Error("Schedule not found");
        return await repo.delete(id);
    }
}

export default new ScheduleService();
