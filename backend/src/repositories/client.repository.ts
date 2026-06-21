import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

const db = initModels();


class ClientRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Client };
    }

    buildIncludes(include: string[] = []) {
        const associations =
            db.Client.associations || {};

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

    async findByUserCode(userCode: string, options: any = {}) {
        return dbHelper.findOne(this.tables, {
            where: {
                user_code: userCode,
            },
            include: this.buildIncludes(
                options.include || []
            ),
        });
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
