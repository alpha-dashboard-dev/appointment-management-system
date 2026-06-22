import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import {buildIncludes} from "../utils/includeBuilder";

const db = initModels();


class InvoiceRepository {
    private tables: any;

    constructor() {
        // this.tables = { sequelize: db.Invoice };
        this.tables = db.Invoice
    }

    buildIncludes(include: string[] = []) {
        const associations =
            db.Invoice.associations || {};

        return [...new Set(include)]
            .filter((alias) => associations[alias])
            .map((alias) => ({
                association: alias,
            }));
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
    //
    // async findByCode(appointmentCode: string, options: any = {}) {
    //     return dbHelper.findOne(this.tables, {
    //         where: {
    //             appointment_code:
    //             appointmentCode,
    //         },
    //         include: this.buildIncludes(
    //             options.include || []
    //         ),
    //     });
    // }
    //
    // // async findByAppointment(appointmentCode: string) {
    // //     return dbHelper.findAllByField(this.tables, "appointment_code", appointmentCode);
    // // }
    //
    // async findByBusiness(businessCode: string) {
    //     return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    // }
    //
    // async update(id: number, data: any) {
    //     return dbHelper.update(this.tables, {"id": id}, data);
    // }
}

export default new InvoiceRepository();
