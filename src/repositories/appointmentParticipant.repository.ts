import db from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

class AppointmentParticipantRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.AppointmentParticipant };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findByAppointment(appointmentCode: string) {
        return dbHelper.findAllByField(this.tables, "appointment_code", appointmentCode);
    }

    async findById(id: number) {
        return dbHelper.findById(this.tables, id);
    }

    async update(id: number, data: any) {
        return dbHelper.update(this.tables, id, data);
    }

    async delete(id: number) {
        return dbHelper.delete(this.tables, id);
    }
}

export default new AppointmentParticipantRepository();