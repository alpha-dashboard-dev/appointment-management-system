import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import {buildIncludes} from "../utils/includeBuilder";

const db = initModels();


class AppointmentChargeRepository {
    private tables: any;

    constructor() {
        // this.tables = { sequelize: db.AppointmentCharge };
        this.tables = db.AppointmentCharge;
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findByAppointment(
        appointmentCode: string,
        options: any = {}
    ) {
        return dbHelper.findAll(this.tables, {
            where: {
                appointment_code:
                    appointmentCode,
            },
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

    async delete(id: number) {
        return dbHelper.delete(this.tables, id);
    }
}

export default new AppointmentChargeRepository();
