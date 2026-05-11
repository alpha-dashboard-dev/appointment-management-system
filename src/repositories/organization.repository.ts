import db from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

class OrganizationRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Organization };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(filters: any = {}) {
        const where: any = {};
        if (filters.status) where.status = filters.status;
        return dbHelper.findAll(this.tables, { where });
    }

    async findByCode(organizationCode: string) {
        return dbHelper.findByField(this.tables, "organization_code", organizationCode);
    }

    async update(organizationCode: string, data: any) {
        return dbHelper.updateByCode(this.tables, "organization_code", organizationCode, data);
    }
}

export default new OrganizationRepository();
