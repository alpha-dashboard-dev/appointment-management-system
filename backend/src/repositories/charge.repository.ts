import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import { buildIncludes } from "../utils/includeBuilder";


const db = initModels();

class ChargeRepository {
    private tables: any;

    constructor() {
        // this.tables = { sequelize: db.Charge };
        this.tables = db.Charge
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(options: any = {}) {
        // console.log(options);

        const include = buildIncludes(
            this.tables,
            options.include || []
        );

        return dbHelper.findAll(
            this.tables,
            {
                ...options,
                include
            }
        );

    }

    async findOne(where: any = {}, options: any = {}) {
        return dbHelper.findOne(
            this.tables,
            {
                where,
                include: buildIncludes(
                    this.tables,
                    options.include || []
                ),
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

    async deactivate(where: any, data: any) {
        return dbHelper.update(
            this.tables,
            where,
            data
        )
    }

    async delete(where: any) {
        return dbHelper.delete(this.tables, where);
    }

    // async findActiveByBusiness(businessCode: string) {
    //     return dbHelper.findAll(this.tables, { where: { business_code: businessCode, status: "active" } });
    // }

    async findByCode(chargeCode: string, options: any = {}) {
        return dbHelper.findOne(this.tables, {
            where: {
                charge_code: chargeCode,
            },
            include: buildIncludes(
                options.include || []
            ),
        });
    }

    // async findByBusiness(businessCode: string) {
    //     return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    // }

    async findAutoApplyByBusiness(businessCode: string) {
        return dbHelper.findAll(this.tables, {
            where: {
                business_code: businessCode,
                status: "active",
                auto_apply: true,
            },
        });
    }

    async findOptionalByBusiness(businessCode: string) {
        return dbHelper.findAll(this.tables, {
            where: {
                business_code: businessCode,
                status: "active",
                auto_apply: false,
            },
        });
    }
}

export default new ChargeRepository();