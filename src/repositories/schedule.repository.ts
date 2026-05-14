import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import {Op} from "sequelize";

const db = initModels();


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
        return await db.UserShiftSchedule.findAll({
            where: {
                business_code: businessCode,
                location_code: locationCode,
                working_days: workingDay,
                start_time: { [Op.lte]: startTime },
                end_time: { [Op.gte]: endTime },
            },
            raw: true,
        });
    }

    async delete(id: number) {
        return dbHelper.delete(this.tables, id);
    }
}

export default new ScheduleRepository();