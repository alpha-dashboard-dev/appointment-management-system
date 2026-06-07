import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

const db = initModels();

class ServiceRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Service };
    }

    buildIncludes(include: string[] = []) {
        const associations =
            db.Service.associations || {};

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

    async findByCode(serviceCode: string, options: any = {}) {
        return dbHelper.findOne(this.tables, {
            where: {
                service_code: serviceCode,
            },
            include: this.buildIncludes(
                options.include || []
            ),
        });
    }

    async findByBusiness(businessCode: string) {
        return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    }

    async update(serviceCode: string, data: any) {
    
        return dbHelper.update(
            this.tables,
            {
              service_code: serviceCode,
            },
            data
        );
      }

    async delete(serviceCode: string) {
    
        return dbHelper.update(
            this.tables,
            {
              service_code: serviceCode,
            },
            {
              status: "inactive",
            }
        );
      }
}

export default new ServiceRepository();
