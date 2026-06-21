import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import { Op } from "sequelize";

const db = initModels();


class AppointmentRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Appointment };
    }

    buildIncludes(include: string[] = []) {
        const associations =
            db.Appointment.associations || {};

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
        if (filters.status) where.status = filters.status;
        if (filters.user_code) where.created_by = filters.user_code;
        if (filters.rescheduled_from) where.rescheduled_from = filters.rescheduled_from;
        let include =
            this.buildIncludes(options.include || []);

        // nested include for services -> service
        include = include.map((item: any) => {

            if (item.association === "services") {

                return {
                    association: "services",

                    include: [
                        {
                            association: "service"
                        }
                    ]
                };
            }

            return item;
        });
        return dbHelper.findAll(this.tables, {
            where,
            include,
            // include: this.buildIncludes(
            //     options.include || []
            // ),
            limit: options.limit,
            offset: options.offset,
            order: options.order || [["created_at", "DESC"]],
        });
    }

    // For service_staff: returns only appointments where they are a participant
    async findByParticipantCodes(
        appointmentCodes: string[],
        extraFilters: any = {},
        options: any = {}
    ) {
        if (!appointmentCodes.length) return [];
        const where: any = { appointment_code: { [Op.in]: appointmentCodes } };
        if (extraFilters.business_code) where.business_code = extraFilters.business_code;
        if (extraFilters.status) where.status = extraFilters.status;
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

    async findByCode(appointmentCode: string, options: any = {}) {
        return dbHelper.findOne(this.tables, {
            where: {
                appointment_code:
                    appointmentCode,
            },
            include: this.buildIncludes(
                options.include || []
            ),
        });
    }

    async update(appointmentCode: string, data: any) {
        return dbHelper.update(this.tables, {"appointment_code": appointmentCode}, data);
    }

    async findLocationSlotConflicts(
        businessCode: string,
        locationCode: string,
        date: string,
        startTime: string,
        endTime: string,
        excludeAppointmentCode?: string
    ) {
        return await db.Appointment.findAll({
            where: {
                business_code: businessCode,
                location_code: locationCode,
                appointment_start_date: date,
                status: { [Op.in]: ["approved", "in_progress"] },
                ...(excludeAppointmentCode ? { appointment_code: { [Op.ne]: excludeAppointmentCode } } : {}),
                // [Op.or]: [
                //     { start_time: { [Op.lte]: startTime }, end_time: { [Op.gt]: startTime } },
                //     { start_time: { [Op.lt]: endTime }, end_time: { [Op.gte]: endTime } },
                //     { start_time: { [Op.gte]: startTime }, end_time: { [Op.lte]: endTime } },
                // ],
                [Op.and]: [
                    db.sequelize.where(
                        db.sequelize.fn(
                            "DATE",
                            db.sequelize.col("appointment_start_date")
                        ),
                        date
                    ),

                    {
                        start_time: {
                            [Op.lt]: endTime
                        }
                    },

                    {
                        end_time: {
                            [Op.gt]: startTime
                        }
                    }
                ]
            },


            raw: true,
        });
    }
}

export default new AppointmentRepository();