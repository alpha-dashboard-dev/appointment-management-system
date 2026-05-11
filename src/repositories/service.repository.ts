import db from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

class ServiceRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Service };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(filters: any = {}) {
        const where: any = {};
        if (filters.business_code) where.business_code = filters.business_code;
        return dbHelper.findAll(this.tables, { where });
    }

    async findByCode(serviceCode: string) {
        return dbHelper.findByField(this.tables, "service_code", serviceCode);
    }

    async findByBusiness(businessCode: string) {
        return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    }

    async update(serviceCode: string, data: any) {
        return dbHelper.updateByCode(this.tables, "service_code", serviceCode, data);
    }

    async delete(serviceCode: string) {
        return dbHelper.deleteByField(this.tables, "service_code", serviceCode);
    }
}

export default new ServiceRepository();
