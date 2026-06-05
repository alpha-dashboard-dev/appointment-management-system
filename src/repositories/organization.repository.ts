import initModels from "../config/database/sequelize/models/index";

import dbHelper from "../helpers/newDBHelper";

const db = initModels();

class OrganizationRepository {

    private tables: any;

    constructor() {

        this.tables = {
            sequelize: db.Organization,
            // drizzle: organizations
        };
    }

    buildIncludes(
        include: string[] = []
    ) {

        const includes: any[] = [];

        if (include.includes("businesses")) {

            includes.push({
                model: db.Business,
                as: "businesses",
            });
        }

        return includes;
    }

    async create(data: any) {

        return dbHelper.create(
            this.tables,
            data
        );
    }

    async findAll(
        filters: any = {},
        options: any = {}
    ) {

        const where: any = {};

        // STATUS
        if (filters.status) {
            where.status = filters.status;
        }

        // SEARCH
        if (filters.search) {

            const { Op } = require("sequelize");

            where[Op.or] = [
                {
                    name: {
                        [Op.like]:
                            `%${filters.search}%`
                    }
                },
                {
                    organization_code: {
                        [Op.like]:
                            `%${filters.search}%`
                    }
                }
            ];
        }

        return dbHelper.findAll(
            this.tables,
            {
                where,

                include: this.buildIncludes(
                    options.include
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
        organizationCode: string,
        options: any = {}
    ) {

        return dbHelper.findOne(
            this.tables,
            {
                where: {
                    organization_code:
                    organizationCode,
                },

                include: this.buildIncludes(
                    options.include
                ),
            }
        );
    }

    async update(
        organizationCode: string,
        data: any
    ) {

        return dbHelper.update(
            this.tables,

            {
                organization_code:
                organizationCode,
            },

            data
        );
    }

    async delete(
        organizationCode: string
    ) {

        return dbHelper.update(
            this.tables,

            {
                organization_code:
                organizationCode,
            },

            {
                status: "inactive",
            }
        );
    }
}

export default new OrganizationRepository();


// old organization repository
// import initModels from "../config/database/sequelize/models/index";
// import dbHelper from "../helpers/newDBHelper";
//
// const db = initModels();
//
//
// class OrganizationRepository {
//     private tables: any;
//
//     constructor() {
//         this.tables = { sequelize: db.Organization };
//     }
//
//     async create(data: any) {
//         return dbHelper.create(this.tables, data);
//     }
//
//     async findAll(filters: any = {}) {
//         const where: any = {};
//         if (filters.status) where.status = filters.status;
//         return dbHelper.findAll(this.tables, { where });
//     }
//
//     async findByCode(organizationCode: string) {
//         return dbHelper.findByField(this.tables, "organization_code", organizationCode);
//     }
//
//     async update(organizationCode: string, data: any) {
//         return dbHelper.updateByCode(this.tables, "organization_code", organizationCode, data);
//     }
// }
//
// export default new OrganizationRepository();
