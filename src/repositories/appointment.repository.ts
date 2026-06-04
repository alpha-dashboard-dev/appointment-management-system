import initModels from "../config/database/sequelize/models/index";
import dbHelper from "../helpers/newDBHelper";
import { Op } from "sequelize";

const db = initModels();


class AppointmentRepository {
    private tables: any;

    constructor() {
        this.tables = { sequelize: db.Appointment };
    }

    async create(data: any) {
        return dbHelper.create(this.tables, data);
    }

    async findAll(filters: any = {}) {
        const where: any = {};
        if (filters.business_code) where.business_code = filters.business_code;
        if (filters.status) where.status = filters.status;
        if (filters.user_code) where.created_by = filters.user_code;
        if (filters.rescheduled_from) where.rescheduled_from = filters.rescheduled_from;
        return dbHelper.findAll(this.tables, { where });
    }

    // For service_staff: returns only appointments where they are a participant
    async findByParticipantCodes(appointmentCodes: string[], extraFilters: any = {}) {
        if (!appointmentCodes.length) return [];
        const where: any = { appointment_code: { [Op.in]: appointmentCodes } };
        if (extraFilters.business_code) where.business_code = extraFilters.business_code;
        if (extraFilters.status) where.status = extraFilters.status;
        return dbHelper.findAll(this.tables, { where });
    }

    async findByCode(appointmentCode: string) {
        return dbHelper.findByField(this.tables, "appointment_code", appointmentCode);
    }

    async findByBusiness(businessCode: string) {
        return dbHelper.findAllByField(this.tables, "business_code", businessCode);
    }

    async update(appointmentCode: string, data: any) {
        return dbHelper.updateByCode(this.tables, "appointment_code", appointmentCode, data);
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
                [Op.or]: [
                    { start_time: { [Op.lte]: startTime }, end_time: { [Op.gt]: startTime } },
                    { start_time: { [Op.lt]: endTime }, end_time: { [Op.gte]: endTime } },
                    { start_time: { [Op.gte]: startTime }, end_time: { [Op.lte]: endTime } },
                ],
            },
            raw: true,
        });
    }
}

export default new AppointmentRepository();