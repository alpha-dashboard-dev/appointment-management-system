// Client repository — database access layer for the clients table.
// A client is a customer profile linked to a user account within a specific business.
import db from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

class ClientRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Client };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(filters: any = {}) {
        const where: any = {};
        if (filters.business_code) where.business_code = filters.business_code;
        return dbHelper.findAll(this.tables, { where });
    }

    async findByUserCode(userCode: string) {
        return dbHelper.findByField(this.tables, "user_code", userCode);
    }

    async findByBusiness(businessCode: string) {
        return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    }

    async update(userCode: string, data: any) {
        return dbHelper.updateByCode(this.tables, "user_code", userCode, data);
    }

    async delete(userCode: string) {
        return dbHelper.deleteByField(this.tables, "user_code", userCode);
    }
}

export default new ClientRepository();
