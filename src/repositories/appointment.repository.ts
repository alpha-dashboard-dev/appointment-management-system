import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

const db = initModels();


class AppointmentRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Appointment };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(filters: any = {}) {
        const where: any = {};
        if (filters.business_code) where.business_code = filters.business_code;
        if (filters.status) where.status = filters.status;
        return dbHelper.findAll(this.tables, { where });
    }

    async findByCode(appointmentCode: string) {
        return dbHelper.findByField(this.tables, "appointment_code", appointmentCode);
    }

    async findByBusiness(businessCode: string) {
        return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    }

    async update(appointmentCode: string, data: any) {
        return dbHelper.updateByCode(this.tables, "appointment_code", appointmentCode, data);
    }
}

export default new AppointmentRepository();