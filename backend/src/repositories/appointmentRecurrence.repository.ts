import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import {buildIncludes} from "../utils/includeBuilder";

const db = initModels();


class AppointmentRecurrenceRepository {
    private tables: any;

    constructor() {
        // this.tables = { sequelize: db.AppointmentRecurrence };
        this.tables = db.AppointmentRecurrence;
    }

    // buildIncludes(include: string[] = []) {
    //     const associations =
    //         db.AppointmentRecurrence.associations || {};
    //
    //     return [...new Set(include)]
    //         .filter((alias) => associations[alias])
    //         .map((alias) => ({
    //             association: alias,
    //         }));
    // }

    async create(data: any) {
        // console.log(data);
        return dbHelper.create(this.tables, data);
    }

    async findAll(filters: any = {}, options: any = {}) {
        const where: any = {};
        if (filters.business_code) where.business_code = filters.business_code;
        if (filters.service_code) where.service_code = filters.service_code;
        if (filters.status) where.status = filters.status;
        return dbHelper.findAll(this.tables, {
            where,
            include: buildIncludes(
                options.include || []
            ),
            limit: options.limit,
            offset: options.offset,
            order: options.order || [["created_at", "DESC"]],
        });
    }

    async findById(
        id: number,
        options: any = {}
    ) {
        return dbHelper.findOne(this.tables, {
            where: { id },
            include: buildIncludes(
                options.include || []
            ),
        });
    }

    async findByAppointmentCode(appointmentCode: string) {
        return dbHelper.findAll(this.tables, {
            where: {
                appointment_code: appointmentCode,
            },
            order: [["created_at", "DESC"]],
        });
    }

    async update(id: number, data: any) {
        return dbHelper.update(this.tables, {"id": id}, data);
    }

    async delete(id: number) {
        return dbHelper.delete(this.tables, {"id": id});
    }
}

export default new AppointmentRecurrenceRepository();
