import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import {buildIncludes} from "../utils/includeBuilder";

const db = initModels();

class LocationServiceRepository {
    private tables: any;

    constructor() {
        // this.tables = { sequelize: db.LocationService };
        this.tables = db.LocationService
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(options: any = {}) {

        const include = buildIncludes(
            this.tables,
            options.include || []
        )

        return dbHelper.findAll(this.tables,{
            ...options,
            include
            });
    }

    async findOne(where: any = {}, options: any = {}) {

        // console.log(options);
        const include = buildIncludes(
            this.tables,
            options.include || []
        )

        return dbHelper.findOne(
            this.tables,
            {
                where,
                include
            }
        );
    }

    async update(where: any, data: any, options: any = {}) {

        return dbHelper.update(
            this.tables,
            where,
            data,
            options
        );
    }

    async delete(where: any) {
        return dbHelper.delete(
            this.tables,
            where
        );
    }

    // async findById(id: number, options: any = {}) {
    //     return dbHelper.findOne(this.tables, {
    //         where: { id },
    //         include: this.buildIncludes(
    //             options.include || []
    //         ),
    //     });
    // }

    // async findByLocation(locationCode: string) {
    //     return dbHelper.findAllByField(this.tables, "location_code", locationCode);
    // }

    // async findByService(serviceCode: string) {
    //     return dbHelper.findAllByField(this.tables, "service_code", serviceCode);
    // }

    // async update(id: number, data: any) {
    //     return dbHelper.update(this.tables, id, data);
    // }
    // async update(id: number, data: any) {
    //
    //         return dbHelper.update(
    //             this.tables,
    //             {
    //               "id": id,
    //             },
    //             data
    //         );
    //       }
    //
    // // async delete(id: number) {
    // //     return dbHelper.delete(this.tables, id);
    // // }
    //
    // async delete(id: number) {
    //
    //         return dbHelper.update(
    //             this.tables,
    //             {
    //               id: id,
    //             },
    //             {
    //               availability: "not_available",
    //             }
    //         );
    //       }
}

export default new LocationServiceRepository();
