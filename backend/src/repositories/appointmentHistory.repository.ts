import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import {buildIncludes} from "../utils/includeBuilder";
const db = initModels();


class AppointmentHistoryRepository {
    private tables: any;

    constructor() {
        // this.tables = { sequelize: db.AppointmentHistory };
        this.tables = db.AppointmentHistory;
    }

    // buildIncludes(include: string[] = []) {
    //     const associations =
    //         db.AppointmentHistory.associations || {};
    //
    //     return [...new Set(include)]
    //         .filter((alias) => associations[alias])
    //         .map((alias) => ({
    //             association: alias,
    //         }));
    // }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findByAppointment(appointmentCode: string, options: any = {}) {
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
}

export default new AppointmentHistoryRepository();
