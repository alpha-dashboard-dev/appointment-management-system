// Business repository — database access layer for the businesses table.
// A business belongs to one organization and contains users, services, and appointments.
import db from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

class BusinessRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Business };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(filters: any = {}) {
        const where: any = {};
        if (filters.organization_code) where.organization_code = filters.organization_code;
        return dbHelper.findAll(this.tables, { where });
    }

    async findByCode(businessCode: string) {
        return dbHelper.findByField(this.tables, "business_code", businessCode);
    }

    async findByOrganization(organizationCode: string) {
        return dbHelper.findAllByField(this.tables, "organization_code", organizationCode);
    }

    async update(businessCode: string, data: any) {
        return dbHelper.updateByCode(this.tables, "business_code", businessCode, data);
    }

    async delete(businessCode: string) {
        return dbHelper.deleteByField(this.tables, "business_code", businessCode);
    }
}

export default new BusinessRepository();
