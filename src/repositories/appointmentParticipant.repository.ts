import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import { Op } from "sequelize";

const db = initModels();


class AppointmentParticipantRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.AppointmentParticipant };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findByAppointment(appointmentCode: string) {
        return dbHelper.findAllByField(this.tables, "appointment_code", appointmentCode);
    }

    async findById(id: number) {
        return dbHelper.findById(this.tables, id);
    }

    async findByUserCode(userCode: string) {
        return dbHelper.findAllByField(this.tables, "user_code", userCode);
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
            attributes: [[db.sequelize.col("AppointmentParticipant.user_code"), "user_code"]],
            include: [
                {
                    model: db.Appointment,
                    as: "appointment",
                    required: true,
                    attributes: [],
                    where: {
                        appointment_start_date: date,
                        status: { [Op.in]: ["approved", "in_progress"] },
                        ...(excludeAppointmentCode ? { appointment_code: { [Op.ne]: excludeAppointmentCode } } : {}),
                        [Op.or]: [
                            { start_time: { [Op.lte]: startTime }, end_time: { [Op.gt]: startTime } },
                            { start_time: { [Op.lt]: endTime }, end_time: { [Op.gte]: endTime } },
                            { start_time: { [Op.gte]: startTime }, end_time: { [Op.lte]: endTime } },
                        ],
                    },
                },
            ],
            where: {
                user_type: "service_staff",
                status: "active",
            },
            raw: true,
        });

        return [...new Set(conflicts.map((c: any) => c.user_code).filter(Boolean))];
    }

    async update(id: number, data: any) {
        return dbHelper.update(this.tables, id, data);
    }

    async delete(id: number) {
        return dbHelper.delete(this.tables, id);
    }
}

export default new AppointmentParticipantRepository();