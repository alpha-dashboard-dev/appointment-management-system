import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";

const db = initModels();


class AppointmentServiceRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.AppointmentService };
    }

    buildIncludes(include: string[] = []) {
        const associations =
            db.AppointmentService.associations || {};

        return [...new Set(include)]
            .filter((alias) => associations[alias])
            .map((alias) => ({
                association: alias,
            }));
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findByAppointment(
        appointmentCode: string,
        options: any = {}
    ) {
        return dbHelper.findAll(this.tables, {
            where: {
                appointment_code:
                    appointmentCode,
            },
            include: this.buildIncludes(
                options.include || []
            ),
            limit: options.limit,
            offset: options.offset,
            order: options.order || [["created_at", "DESC"]],
        });
    }

    async findById(
        id: number,
        options: any = {}
    ) {
        return dbHelper.findOne(this.tables, {
            where: { id },
            include: this.buildIncludes(
                options.include || []
            ),
        });
    }

    async delete(id: number) {
        return dbHelper.delete(this.tables, id);
    }
}

export default new AppointmentServiceRepository();