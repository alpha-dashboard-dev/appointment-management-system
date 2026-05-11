import db from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

class LocationRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Location };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(filters: any = {}) {
        const where: any = {};
        if (filters.business_code) where.business_code = filters.business_code;
        if (filters.location_type) where.location_type = filters.location_type;
        return dbHelper.findAll(this.tables, { where });
    }

    async findByCode(locationCode: string) {
        return dbHelper.findByField(this.tables, "location_code", locationCode);
    }

    async findByBusiness(businessCode: string) {
        return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    }

    async update(locationCode: string, data: any) {
        return dbHelper.updateByCode(this.tables, "location_code", locationCode, data);
    }

    async delete(locationCode: string) {
        return dbHelper.deleteByField(this.tables, "location_code", locationCode);
    }
}

export default new LocationRepository();
