// Appointment-service repository — links which services are included in an appointment.
// One appointment can include multiple services.
import db from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

class AppointmentServiceRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.AppointmentService };
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

    async delete(id: number) {
        return dbHelper.delete(this.tables, id);
    }
}

export default new AppointmentServiceRepository();
