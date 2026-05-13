import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

const db = initModels();

class ChargeRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Charge };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(filters: any = {}) {
        const where: any = {};
        if (filters.business_code) where.business_code = filters.business_code;
        return dbHelper.findAll(this.tables, { where });
    }

    async findByCode(chargeCode: string) {
        return dbHelper.findByField(this.tables, "charge_code", chargeCode);
    }

    async findByBusiness(businessCode: string) {
        return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    }

    async update(chargeCode: string, data: any) {
        return dbHelper.updateByCode(this.tables, "charge_code", chargeCode, data);
    }

    async delete(chargeCode: string) {
        return dbHelper.deleteByField(this.tables, "charge_code", chargeCode);
    }
}

export default new ChargeRepository();