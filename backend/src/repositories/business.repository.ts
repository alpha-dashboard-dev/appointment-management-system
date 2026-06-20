import initModels from "../config/database/sequelize/models/index";

import dbHelper from "../helpers/newDBHelper";
import { buildIncludes } from "../utils/includeBuilder";

const db = initModels();

class BusinessRepository {

    private tables: any;

    constructor() {

        // this.tables = {
        //     sequelize: db.Business,
        // };

        this.tables = db.Business
    }

    async create(data: any, options?: any) {
        // console.log(data)
        return dbHelper.create(this.tables, data, options);
    }

    async findAll(options: any = {}) {
        const include = buildIncludes(
            this.tables,
            options.include || []
        )

        return dbHelper.findAll(
            this.tables,
            {
                ...options,
                include
            }
        )
    }

    async findOne(where: any = {}, options: any = {}) {
        return dbHelper.findOne(
            this.tables,
            {
                where,
                include: buildIncludes(
                    this.tables,
                    options.include || []
                )
            }
        )
    }

    async update(where: any, data: any, options: any = {}) {

        return dbHelper.update(
            this.tables,
            where,
            data,
            options
        )

    }

    async deactivate(where: any, data: any) {
        return dbHelper.update(
            this.tables,
            where,
            data
        )
    }

    async delete(where: any) {
        return dbHelper.delete(
            this.tables,
            where
        )
    }



    // async findByCode(
    //     businessCode: string,
    //     options: any = {}
    // ) {

    //     const where = {
    //         business_code: businessCode,
    //     };

    //     return dbHelper.findOne(
    //         this.tables,
    //         {
    //             where,

    //             include: this.buildIncludes(
    //                 options.include || []
    //             ),
    //         }
    //     );
    // }

    // async update(businessCode: string, data: any, options?: any) {

    //     return dbHelper.update(
    //         this.tables,
    //         {
    //             business_code: businessCode,
    //         },
    //         data,
    //         options
    //     );
    // }

    // async delete(businessCode: string) {

    //     return dbHelper.update(
    //         this.tables,
    //         {
    //             business_code: businessCode,
    //         },
    //         {
    //             status: "inactive",
    //         }
    //     );
    // }
}

export default new BusinessRepository();