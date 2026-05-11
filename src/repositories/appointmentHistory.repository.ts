import db from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

class AppointmentHistoryRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.AppointmentHistory };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findByAppointment(appointmentCode: string) {
        return dbHelper.findAllByField(this.tables, "appointment_code", appointmentCode);
    }
}

export default new AppointmentHistoryRepository();
