import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

const db = initModels();


class UserAbilityRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.UserAbility };
    }

    buildIncludes(include: string[] = []) {
        const associations =
            db.UserAbility.associations || {};

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
        if (filters.user_code) where.user_code = filters.user_code;
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

    async findById(id: number, options: any = {}) {
        return dbHelper.findOne(this.tables, {
            where: { id },
            include: this.buildIncludes(
                options.include || []
            ),
        });
    }

    async findByUser(userCode: string) {
        return dbHelper.findAllByField(this.tables, "user_code", userCode);
    }

    async findByBusiness(businessCode: string) {
        return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    }

    async update(id: number, data: any) {
        return dbHelper.update(this.tables, id, data);
    }

    async delete(id: number) {
        return dbHelper.delete(this.tables, id);
    }
}

export default new UserAbilityRepository();