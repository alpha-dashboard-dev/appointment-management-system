import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import { Op } from "sequelize";

const db = initModels();


class AppointmentParticipantRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.AppointmentParticipant };
    }

    buildIncludes(include: string[] = []) {
        const associations =
            db.AppointmentParticipant.associations || {};

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

    async findByUserCode(
        userCode: string,
        options: any = {}
    ) {
        return dbHelper.findAll(this.tables, {
            where: {
                user_code: userCode,
            },
            include: this.buildIncludes(
                options.include || []
            ),
            limit: options.limit,
            offset: options.offset,
            order: options.order || [["created_at", "DESC"]],
        });
    }

    // Returns appointment_codes where userCode is a participant (for service staff feed)
    async findAppointmentCodesByUser(userCode: string): Promise<string[]> {
        const rows = await db.AppointmentParticipant.findAll({
            where: { user_code: userCode, status: "active" },
            attributes: ["appointment_code"],
            raw: true,
        });
        return rows.map((r: any) => r.appointment_code);
    }

    // Returns conflicting participant rows where userCode is already assigned during overlapping time
    async findConflictsForStaff(
        userCode: string,
        date: string,
        startTime: string,
        endTime: string,
        excludeAppointmentCode?: string
    ) {
        // Get all appointment_codes this staff is already assigned to
        const participations = await db.AppointmentParticipant.findAll({
            where: {
                user_code: userCode,
                status: "active",
                ...(excludeAppointmentCode ? { appointment_code: { [Op.ne]: excludeAppointmentCode } } : {}),
            },
            attributes: ["appointment_code"],
            raw: true,
        });

        if (!participations.length) return [];

        const codes = participations.map((p: any) => p.appointment_code);

        // Find appointments in those codes that overlap on the same date and time
        const conflicts = await db.Appointment.findAll({
            where: {
                appointment_code: { [Op.in]: codes },
                appointment_start_date: date,
                status: { [Op.in]: ["pending", "approved", "in_progress"] },
                [Op.or]: [
                    // new appointment starts inside an existing one
                    { start_time: { [Op.lte]: startTime }, end_time: { [Op.gt]: startTime } },
                    // new appointment ends inside an existing one
                    { start_time: { [Op.lt]: endTime }, end_time: { [Op.gte]: endTime } },
                    // new appointment completely wraps an existing one
                    { start_time: { [Op.gte]: startTime }, end_time: { [Op.lte]: endTime } },
                ],
            },
            raw: true,
        });

        return conflicts;
    }

    async findBusyStaffCodes(
        date: string,
        startTime: string,
        endTime: string,
        excludeAppointmentCode?: string
    ): Promise<string[]> {

        const conflicts = await db.AppointmentParticipant.findAll({
            attributes: [
                [db.sequelize.col("AppointmentParticipant.user_code"), "user_code"]
            ],

            include: [
                {
                    association: "appointment",
                    required: true,
                    attributes: [],

                    where: {
                        [Op.and]: [

                            // DATE MATCH
                            db.sequelize.where(
                                db.sequelize.fn("DATE", db.sequelize.col("appointment.appointment_start_date")),
                                date
                            ),

                            // STATUS
                            {
                                status: {
                                    [Op.in]: ["approved", "in_progress"]
                                }
                            },

                            // EXCLUDE CURRENT
                            ...(excludeAppointmentCode
                                ? [{
                                    appointment_code: {
                                        [Op.ne]: excludeAppointmentCode
                                    }
                                }]
                                : []),

                            // OVERLAP
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
                    }
                }
            ],

            where: {
                user_type: "service_staff",
                status: "active"
            },

            raw: true
        });

        console.log("BUSY STAFF ROWS:", conflicts);

        return [
            ...new Set(
                conflicts.map((c: any) => c.user_code).filter(Boolean)
            )
        ];
    }

    async findEngagedStaffDetails(
        date: string,
        startTime: string,
        endTime: string,
        appointmentCode: string
    ) {

        const Appointment = db.Appointment;
        const Participant = db.AppointmentParticipant;
        const User = db.User;

        const engaged = await Participant.findAll({
            attributes: ["user_code"],

            include: [
                {
                    model: Appointment,
                    as: "appointment",

                    required: true,

                    attributes: [
                        "appointment_code",
                        "start_time",
                        "end_time",
                        "appointment_start_date"
                    ],

                    where: {
                        [Op.and]: [

                            // DATE MATCH
                            db.sequelize.where(
                                db.sequelize.fn(
                                    "DATE",
                                    db.sequelize.col("appointment.appointment_start_date")
                                ),
                                date
                            ),

                            // EXCLUDE CURRENT
                            {
                                appointment_code: {
                                    [Op.ne]: appointmentCode
                                }
                            },

                            // STATUS
                            {
                                status: {
                                    [Op.in]: ["approved", "in_progress"]
                                }
                            },

                            // OVERLAP
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
                    }
                },

                {
                    model: User,
                    as: "user",
                    attributes: ["name"]
                }
            ],

            where: {
                user_type: "service_staff",
                status: "active"
            }
        });

        console.log("ENGAGED STAFF ROWS:", engaged.length);

        const map = new Map();

        for (const row of engaged) {

            const userCode = row.user_code;

            if (!map.has(userCode)) {
                map.set(userCode, {
                    user_code: userCode,
                    staff_name: row.user?.name || null,
                    appointments: []
                });
            }

            map.get(userCode).appointments.push({
                appointment_code: row.appointment.appointment_code,
                start_time: row.appointment.start_time,
                end_time: row.appointment.end_time
            });
        }

        return [...map.values()];
    }

    // async findBusyStaffCodes(
    //     date: string,
    //     startTime: string,
    //     endTime: string,
    //     excludeAppointmentCode?: string
    // ): Promise<string[]> {
    //     const conflicts = await db.AppointmentParticipant.findAll({
    //         attributes: [[db.sequelize.col("AppointmentParticipant.user_code"), "user_code"]],
    //         include: [
    //             {
    //                 association: "appointment",
    //                 required: true,
    //                 attributes: [],
    //                 where: {
    //                     appointment_start_date: date,
    //                     status: { [Op.in]: ["approved", "in_progress"] },
    //                     ...(excludeAppointmentCode ? { appointment_code: { [Op.ne]: excludeAppointmentCode } } : {}),
    //                     [Op.or]: [
    //                         { start_time: { [Op.lte]: startTime }, end_time: { [Op.gt]: startTime } },
    //                         { start_time: { [Op.lt]: endTime }, end_time: { [Op.gte]: endTime } },
    //                         { start_time: { [Op.gte]: startTime }, end_time: { [Op.lte]: endTime } },
    //                     ],
    //                 },
    //             },
    //         ],
    //         where: {
    //             user_type: "service_staff",
    //             status: "active",
    //         },
    //         raw: true,
    //     });
    //
    //     return [...new Set(conflicts.map((c: any) => c.user_code).filter(Boolean))];
    // }
    //
    // async findEngagedStaffDetails(date: string, startTime: string, endTime: string, appointmentCode: string) {
    //
    //     const Appointment = db.Appointment;
    //     const Participant = db.AppointmentParticipant;
    //     const User = db.User;
    //
    //     const engaged = await Participant.findAll({
    //         attributes: ["user_code"],
    //         include: [
    //             {
    //                 model: Appointment,
    //                 as: "appointment",
    //                 attributes: ["appointment_code", "start_time", "end_time", "appointment_start_date"],
    //                 where: {
    //                     appointment_start_date: date,
    //                     appointment_code: { [Op.ne]: appointmentCode },
    //                     [Op.and]: [
    //                         {
    //                             start_time: { [Op.lt]: endTime }
    //                         },
    //                         {
    //                             end_time: { [Op.gt]: startTime }
    //                         }
    //                     ]
    //                 }
    //             },
    //             {
    //                 model: User,
    //                 as: "user",
    //                 attributes: ["name"]
    //             }
    //         ]
    //     });
    //
    //     // group by staff
    //     const map = new Map();
    //
    //     for (const row of engaged) {
    //         const userCode = row.user_code;
    //
    //         if (!map.has(userCode)) {
    //             map.set(userCode, {
    //                 user_code: userCode,
    //                 staff_name: row.user?.name || null,
    //                 appointments: []
    //             });
    //         }
    //
    //         map.get(userCode).appointments.push({
    //             appointment_code: row.appointment.appointment_code,
    //             start_time: row.appointment.start_time,
    //             end_time: row.appointment.end_time
    //         });
    //     }
    //
    //     return [...map.values()];
    // }

    async update(id: number, data: any) {
        return dbHelper.update(this.tables, id, data);
    }

    async delete(id: number) {
        return dbHelper.delete(this.tables, id);
    }
}

export default new AppointmentParticipantRepository();