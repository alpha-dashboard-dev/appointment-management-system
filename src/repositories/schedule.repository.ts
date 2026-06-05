import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import {Op} from "sequelize";
import { ROLES } from "../utils/roles";

const db = initModels();

const normalizeTime = (time: string) => {
    if (!time) return time;
    return /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : time;
};


class ScheduleRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.UserShiftSchedule };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(filters: any = {}) {
        const where: any = {};
        if (filters.business_code) where.business_code = filters.business_code;
        if (filters.user_code) where.user_code = filters.user_code;
        return dbHelper.findAll(this.tables, { where });
    }

    async findById(id: number) {
        return dbHelper.findById(this.tables, id);
    }

    async findByUser(userCode: string) {
        return dbHelper.findAllByField(this.tables, "user_code", userCode);
    }

    async findByBusiness(businessCode: string) {
        return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    }

    async update(id: number, data: any) {
        return dbHelper.update(this.tables, id, data);
    }

    async findAvailableStaff(businessCode: string, locationCode: string, workingDay: string, startTime: string, endTime: string) {
        const normalizedStartTime = normalizeTime(startTime);
        const normalizedEndTime = normalizeTime(endTime);

        const rows = await db.UserShiftSchedule.findAll({
            where: {
                business_code: businessCode,
                location_code: locationCode,
                working_days: String(workingDay || "").toLowerCase(),
                status: "active",
                start_time: { [Op.lte]: normalizedStartTime },
                end_time: { [Op.gte]: normalizedEndTime },
            },
            include: [
                {
                    model: db.User,
                    as: "user",
                    required: true,
                    attributes: ["user_code", "name", "user_type", "is_active"],
                    where: {
                        user_type: ROLES.SERVICE_STAFF,
                        is_active: "active",
                    },
                },
            ],
            raw: true,
        });

        return rows.map((row: any) => ({
            user_code: row["user.user_code"] ?? row.user_code,
            staff_name: row["user.name"] || null,
            user_type: row["user.user_type"] || ROLES.SERVICE_STAFF,
            location_code: row.location_code,
            working_days: row.working_days,
            start_time: row.start_time,
            end_time: row.end_time,
        }));
    }

    async findStaffSchedulesByDay(businessCode: string, workingDay: string, locationCode?: string) {
        const rows = await db.UserShiftSchedule.findAll({
            where: {
                business_code: businessCode,
                working_days: String(workingDay || "").toLowerCase(),
                status: "active",
                ...(locationCode ? { location_code: locationCode } : {}),
            },
            include: [
                {
                    model: db.User,
                    as: "user",
                    required: true,
                    attributes: ["user_code", "name", "user_type", "is_active"],
                    where: {
                        user_type: ROLES.SERVICE_STAFF,
                        is_active: "active",
                    },
                },
            ],
            raw: true,
        });

        return rows.map((row: any) => ({
            user_code: row["user.user_code"] ?? row.user_code,
            staff_name: row["user.name"] || null,
            user_type: row["user.user_type"] || ROLES.SERVICE_STAFF,
            location_code: row.location_code,
            working_days: row.working_days,
            start_time: row.start_time,
            end_time: row.end_time,
        }));
    }

    async delete(id: number) {
        return dbHelper.delete(this.tables, id);
    }
}

export default new ScheduleRepository();