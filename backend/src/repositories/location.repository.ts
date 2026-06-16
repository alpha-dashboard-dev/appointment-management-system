import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

const db = initModels();


class LocationRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Location };
    }

    buildIncludes(include: string[] = []) {
        const associations = db.Location.associations || {};

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
        if (filters.location_type) where.location_type = filters.location_type;
        return dbHelper.findAll(this.tables, {
            where,
            include: this.buildIncludes(options.include || []),
            limit: options.limit,
            offset: options.offset,
            order: options.order || [["created_at", "DESC"]],
        });
    }

    // async findAllLocationsWithBusiness(filters: any = {}) {
    //     const where: any = {};
    //     if (filters.business_code) where.business_code = filters.business_code;
    //     if (filters.location_type) where.location_type = filters.location_type;

    //     return dbHelper.findAll(this.tables, {
    //         where,
    //         include: this.buildIncludes(["business"]),
    //     });
    // }

    // async findByLocationCodeWithBusiness(locationCode: string) {
    //     return dbHelper.findOne(this.tables, {
    //         where: {
    //             location_code: locationCode,
    //         },
    //         include: this.buildIncludes(["business"]),
    //     });
    // }

    async findByCode(locationCode: string, options: any = {}) {
        return dbHelper.findOne(this.tables, {
            where: {
                location_code: locationCode,
            },
            include: this.buildIncludes(options.include || []),
        });
    }

    async findByBusiness(businessCode: string) {
        return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    }

    async update(locationCode: string, data: any) {
        return dbHelper.update(this.tables, {"location_code": locationCode}, data);
    }

    async delete(locationCode: string) {
    
        return dbHelper.update(
            this.tables,
            {
              location_code: locationCode,
            },
            {
              status: "inactive",
            }
        );
      }

    // async delete(locationCode: string) {
    //     return dbHelper.deleteByField(this.tables, "location_code", locationCode);
    // }
}

export default new LocationRepository();
