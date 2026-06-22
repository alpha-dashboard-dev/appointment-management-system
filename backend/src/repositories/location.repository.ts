import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import {buildIncludes} from "../utils/includeBuilder";

const db = initModels();


class LocationRepository {
    private tables: any;

    constructor() {
        // this.tables = { sequelize: db.Location };
        this.tables = db.Location;
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(options: any = {}) {

        const include = buildIncludes(
            this.tables,
            options.include || []
        )

        return dbHelper.findAll(this.tables, {
            ...options,
            include
        });
    }

    // async findOne(where: any = {}, options: any = {}) {
    //     return dbHelper.findOne(
    //         this.tables,
    //         {
    //             where,
    //             include: buildIncludes(
    //                 this.tables,
    //                 options.include || []
    //             ),
    //         }
    //     );
    // }

    async findOne(options: any = {}) {

        // console.log(options);
        const include = buildIncludes(
            this.tables,
            options.include || []
        )
        return dbHelper.findOne(
            this.tables,
            {
               ...options,
                include
            }
        );
    }


    // async findByBusiness(businessCode: string) {
    //     return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    // }

    async update(where: any, data: any, options: any = {}) {

        return dbHelper.update(
            this.tables,
            where,
            data,
            options
        );
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
        );
    }
}

export default new LocationRepository();
