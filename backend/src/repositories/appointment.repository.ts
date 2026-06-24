import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import { Op } from "sequelize";
import {buildIncludes} from "../utils/includeBuilder";

const db = initModels();


class AppointmentRepository {
    private tables: any;

    constructor() {
        // this.tables = { sequelize: db.Appointment };
        this.tables = db.Appointment
    }

    // buildIncludes(include: string[] = []) {
    //     const associations =
    //         db.Appointment.associations || {};
    //
    //     return [...new Set(include)]
    //         .filter((alias) => associations[alias])
    //         .map((alias) => ({
    //             association: alias,
    //         }));
    // }

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

    // For service_staff: returns only appointments where they are a participant
    async findByParticipantCodes(appointmentCodes: string[], extraFilters: any = {}, options: any = {}) {
        if (!appointmentCodes.length) return [];
        const where: any = { appointment_code: { [Op.in]: appointmentCodes } };
        if (extraFilters.business_code) where.business_code = extraFilters.business_code;
        if (extraFilters.status) where.status = extraFilters.status;
        return dbHelper.findAll(this.tables, {
            where,
            include: buildIncludes(
                options.include || []
            ),
            limit: options.limit,
            offset: options.offset,
            order: options.order || [["created_at", "DESC"]],
        });
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

    // async findByCode(appointmentCode: string, options: any = {}) {
    //     return dbHelper.findOne(this.tables, {
    //         where: {
    //             appointment_code:
    //                 appointmentCode,
    //         },
    //         include: buildIncludes(
    //             options.include || []
    //         ),
    //     });
    // }

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