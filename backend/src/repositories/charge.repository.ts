import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

const db = initModels();

class ChargeRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Charge };
    }

    buildIncludes(include: string[] = []) {
        const associations =
            db.Charge.associations || {};

        return [...new Set(include)]
            .filter((alias) => associations[alias])
            .map((alias) => ({
                association: alias,
            }));
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(filters: any = {}, options: any = {}) {
        const where: any = {};
        if (filters.business_code) where.business_code = filters.business_code;
        if (filters.status) where.status = filters.status;
        return dbHelper.findAll(this.tables, {
            where,
            include: this.buildIncludes(
                options.include || []
            ),
            limit: options.limit,
            offset: options.offset,
            order: options.order || [["created_at", "DESC"]],
        });
    }

    async findActiveByBusiness(businessCode: string) {
        return dbHelper.findAll(this.tables, { where: { business_code: businessCode, status: "active" } });
    }

    async findByCode(chargeCode: string, options: any = {}) {
        return dbHelper.findOne(this.tables, {
            where: {
                charge_code: chargeCode,
            },
            include: this.buildIncludes(
                options.include || []
            ),
        });
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