import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

const db = initModels();


class AppointmentRecurrenceRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.AppointmentRecurrence };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(filters: any = {}) {
        const where: any = {};
        if (filters.business_code) where.business_code = filters.business_code;
        if (filters.service_code) where.service_code = filters.service_code;
        if (filters.status) where.status = filters.status;
        return dbHelper.findAll(this.tables, { where });
    }

    async findById(id: number) {
        return dbHelper.findById(this.tables, id);
    }

    async findByService(serviceCode: string) {
        return dbHelper.findAllByField(this.tables, "service_code", serviceCode);
    }

    async update(id: number, data: any) {
        return dbHelper.update(this.tables, id, data);
    }

    async delete(id: number) {
        return dbHelper.delete(this.tables, id);
    }
}

export default new AppointmentRecurrenceRepository();
