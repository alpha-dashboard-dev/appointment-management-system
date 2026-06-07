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

        const relations: any[] = [];

        if (include.includes("organization")) {

            relations.push({
                model: db.Organization,
                as: "organization",
            });
        }

        if (include.includes("users")) {

            relations.push({
                model: db.User,
                as: "users",
            });
        }

        if (include.includes("clients")) {

            relations.push({
                model: db.Client,
                as: "clients",
            });
        }

        if (include.includes("services")) {

            relations.push({
                model: db.Service,
                as: "services",
            });
        }

        if (include.includes("appointments")) {

            relations.push({
                model: db.Appointment,
                as: "appointments",
            });
        }

        if (include.includes("charges")) {

            relations.push({
                model: db.Charge,
                as: "charges",
            });
        }

        return relations;
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


// import initModels from "../config/database/sequelize/models/index";
// import dbHelper from "../helpers/newDBHelper";
//
// const db = initModels();
//
// class BusinessRepository {
//     private tables: any;
//
//     constructor() {
//         this.tables = { sequelize: db.Business };
//     }
//
//     async create(data: any) {
//         return dbHelper.create(this.tables, data);
//     }
//
//     async findAll(filters: any = {}) {
//         const where: any = {};
//
//         if (filters.organization_code) {
//             where.organization_code = filters.organization_code;
//         }
//
//         return dbHelper.findAll(this.tables, {
//             where,
//             include: [
//                 {
//                     association: "organization",
//                 },
//             ],
//         });
//     }
//
//     // async findAll(filters: any = {}) {
//     //     const where: any = {};
//     //     if (filters.organization_code) where.organization_code = filters.organization_code;
//     //     return dbHelper.findAll(this.tables, { where });
//     // }
//
//     // find by business code with organization
//     async findByCodeWithOrganization(businessCode: string) {
//         return dbHelper.findOne(this.tables, {
//             where: {
//                 business_code: businessCode,
//             },
//             include: [
//                 {
//                     model: db.Organization,
//                     as: "organization",
//                 },
//             ],
//         });
//     }
//     async findByBusinessCodeWithUser(businessCode: string) {
//         return dbHelper.findOne(this.tables, {
//             where: {
//                 business_code: businessCode,
//             },
//             include: [
//                 {
//                     model: db.User,
//                     as: "users",
//                 },
//             ],
//         });
//     }
//
//     async findByCode(businessCode: string) {
//         return dbHelper.findByField(this.tables, "business_code", businessCode);
//     }
//
//     async findByOrganization(organizationCode: string) {
//         return dbHelper.findAllByField(this.tables, "organization_code", organizationCode);
//     }
//
//     async update(businessCode: string, data: any) {
//         // console.log(businessCode, data);
//         return dbHelper.updateByCode(this.tables, "business_code", businessCode, data);
//     }
//
//     async delete(businessCode: string) {
//         return dbHelper.deleteByField(this.tables, "business_code", businessCode);
//     }
// }
//
// export default new BusinessRepository();
