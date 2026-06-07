import initModels from "../config/database/sequelize/models/index";

import dbHelper from "../helpers/newDBHelper";

const db = initModels();

class BusinessRepository {

    private tables: any;

    constructor() {

        this.tables = {
            sequelize: db.Business,
        };
    }

    buildIncludes(include: string[] = []) {

        const associations =
            db.Business.associations || {};

        return [...new Set(include)]
            .filter((alias) => associations[alias])
            .map((alias) => ({
                association: alias,
            }));
    }

    async create(data: any) {

        return dbHelper.create(
            this.tables,
            data
        );
    }

    async findAll(filters: any = {}, options: any = {}) {

        const where: any = {};

        if (filters.organization_code) {
            where.organization_code =
                filters.organization_code;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        return dbHelper.findAll(
            this.tables,
            {
                where,

                include: this.buildIncludes(
                    options.include || []
                ),

                limit: options.limit,

                offset: options.offset,

                order: options.order || [
                    ["created_at", "DESC"]
                ],
            }
        );
    }

    async findByCode(
        businessCode: string,
        options: any = {}
    ) {

        const where = {
            business_code: businessCode,
        };

        return dbHelper.findOne(
            this.tables,
            {
                where,

                include: this.buildIncludes(
                    options.include || []
                ),
            }
        );
    }

    async update(
        businessCode: string,
        data: any
    ) {

        return dbHelper.update(
            this.tables,
            {
                business_code: businessCode,
            },
            data
        );
    }

    async delete(businessCode: string) {

        return dbHelper.update(
            this.tables,
            {
                business_code: businessCode,
            },
            {
                status: "inactive",
            }
        );
    }
}

export default new BusinessRepository();