import db from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

class InvoiceRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Invoice };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(filters: any = {}) {
        const where: any = {};
        if (filters.business_code) where.business_code = filters.business_code;
        if (filters.appointment_code) where.appointment_code = filters.appointment_code;
        if (filters.status) where.invoice_status = filters.status;
        return dbHelper.findAll(this.tables, { where });
    }

    async findById(id: number) {
        return dbHelper.findById(this.tables, id);
    }

    async findByAppointment(appointmentCode: string) {
        return dbHelper.findAllByField(this.tables, "appointment_code", appointmentCode);
    }

    async findByBusiness(businessCode: string) {
        return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    }

    async update(id: number, data: any) {
        return dbHelper.update(this.tables, id, data);
    }
}

export default new InvoiceRepository();
