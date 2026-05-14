import repo from "../repositories/appointment.repository";
import historyRepo from "../repositories/appointmentHistory.repository";
import participantRepo from "../repositories/appointmentParticipant.repository";
import appointmentServiceRepo from "../repositories/appointmentService.repository";
import appointmentChargeRepo from "../repositories/appointmentCharge.repository";
import appointmentDiscountRepo from "../repositories/appointmentDiscount.repository";
import appointmentRecurrenceRepo from "../repositories/appointmentRecurrence.repository";
import chargeRepo from "../repositories/charge.repository";
import { generateCode } from "../utils/codeGenerator";
import {
    validateAppointment,
    validateReschedule,
    validateAppointmentStatus,
    validateAppointmentParticipant,
    validateAppointmentService,
    validateAppointmentCharge,
    validateAppointmentDiscount,
    validateAppointmentRecurrence,
} from "../utils/validator";

class AppointmentService {


    async create(data: any, actor: any) {
        const { business_code, appointment_start_date, appointment_end_date, start_time, end_time, location_code, notes, status } = data;

        // console.log(data)

        validateAppointment(data);

        const appointment_code = generateCode();

        const appointment = await repo.create({
            business_code,
            appointment_code,
            appointment_start_date,
            appointment_end_date,
            start_time,
            end_time,
            location_code: location_code || null,
            status,
            created_by: actor?.userCode,
            notes: notes || null,
        });

        await historyRepo.create({
            business_code,
            appointment_code,
            action: "created",
            changed_by: actor?.userCode,
            old_value: null,
            new_value: { appointment_code, status: "pending" },
        });

        if (actor?.userCode) {
            await participantRepo.create({
                business_code,
                appointment_code,
                user_code: actor.userCode,
                user_type: "owner",
                user_role: actor.userType || null,
                status: "active",
            });
        }

        return appointment;
    }

    async getAll(filters: any = {}) {
        return await repo.findAll(filters);
    }


    async getByCode(appointmentCode: string) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");
        return appointment;
    }

    async update(appointmentCode: string, data: any, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const oldValue = { ...appointment.dataValues || appointment };

        const allowed: any = {};
        const fields = ["appointment_start_date", "appointment_end_date", "start_time", "end_time", "location_code", "notes"];
        for (const f of fields) {
            if (data[f] !== undefined) allowed[f] = data[f];
        }

        if (allowed.start_time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(allowed.start_time))
            throw new Error("Invalid start_time");
        if (allowed.end_time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(allowed.end_time))
            throw new Error("Invalid end_time");

        const updated = await repo.update(appointmentCode, allowed);

        await historyRepo.create({
            business_code: appointment.business_code,
            appointment_code: appointmentCode,
            action: "updated",
            changed_by: actor?.userCode,
            old_value: oldValue,
            new_value: allowed,
        });

        return updated;
    }

    async changeStatus(appointmentCode: string, status: string, actor: any) {
        validateAppointmentStatus({ status });

        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const oldStatus = appointment.status;

        const updateData: any = { status };
        if (status === "approved") updateData.approved_by = actor?.userCode || null;
        if (status === "canceled") updateData.cancelled_by = actor?.userCode || null;

        const actionMap: Record<string, string> = {
            APPROVED: "assigned",
            CANCELLED: "canceled",
            RESCHEDULED: "rescheduled",
            UPDATED: "updated",
        };

        await repo.update(appointmentCode, updateData);

        if (status === "approved") {
            const activeCharges = await chargeRepo.findActiveByBusiness(appointment.business_code);
            for (const charge of activeCharges) {
                const chargeData = charge.dataValues || charge;
                await appointmentChargeRepo.create({
                    business_code: appointment.business_code,
                    appointment_code: appointmentCode,
                    charge_code: chargeData.charge_code,
                    charge_uom: chargeData.charge_uom,
                    charge_value: chargeData.charge_value,
                });
            }
        }

        await historyRepo.create({
            business_code: appointment.business_code,
            appointment_code: appointmentCode,
            action: actionMap[status] || "updated",
            changed_by: actor?.userCode,
            old_value: { status: oldStatus },
            new_value: { status },
        });

        return { appointmentCode, status };
    }

    async reschedule(appointmentCode: string, data: any, actor: any) {
        const original = await repo.findByCode(appointmentCode);
        if (!original) throw new Error("Appointment not found");

        const { appointment_start_date, appointment_end_date, start_time, end_time, location_code, notes } = data;

        validateReschedule(data);

        const business_code = original.business_code;
        const new_appointment_code = generateCode();

        const newAppointment = await repo.create({
            business_code,
            appointment_code: new_appointment_code,
            appointment_start_date,
            appointment_end_date,
            start_time,
            end_time,
            location_code: location_code || original.location_code || null,
            status: "pending",
            created_by: actor?.userCode,
            rescheduled_from: original.appointment_code,
            notes: notes || null,
        });

        await repo.update(appointmentCode, { status: "rescheduled" });

        await historyRepo.create({
            business_code,
            appointment_code: new_appointment_code,
            action: "rescheduled",
            changed_by: actor?.userCode,
            old_value: { appointment_code: appointmentCode },
            new_value: { appointment_code: new_appointment_code },
        });

        return newAppointment;
    }


    async addParticipant(appointmentCode: string, data: any, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const { userCode, userType, userRole } = data;
        validateAppointmentParticipant({
            business_code: appointment.business_code,
            userCode,
            userType,
        });

        return await participantRepo.create({
            business_code: appointment.business_code,
            appointment_code: appointmentCode,
            user_code: userCode,
            user_type: userType,
            user_role: userRole || null,
            status: "active",
        });
    }

    async getParticipants(appointmentCode: string) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");
        return await participantRepo.findByAppointment(appointmentCode);
    }

    async removeParticipant(appointmentCode: string, participantId: number, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const participant = await participantRepo.findById(participantId);
        if (!participant) throw new Error("Participant not found");

        return await participantRepo.delete(participantId);
    }


    async addService(appointmentCode: string, data: any, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const { service_code } = data;
        validateAppointmentService({
            business_code: appointment.business_code,
            service_code,
        });

        return await appointmentServiceRepo.create({
            business_code: appointment.business_code,
            service_code,
            appointment_code: appointmentCode,
        });
    }

    async getServices(appointmentCode: string) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");
        return await appointmentServiceRepo.findByAppointment(appointmentCode);
    }

    async removeService(appointmentCode: string, serviceId: number, actor: any) {
        const item = await appointmentServiceRepo.findById(serviceId);
        if (!item) throw new Error("Appointment service not found");
        return await appointmentServiceRepo.delete(serviceId);
    }


    async addCharge(appointmentCode: string, data: any, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const { charge_code, charge_uom, charge_value } = data;
        validateAppointmentCharge({
            business_code: appointment.business_code,
            appointment_code: appointmentCode,
        });

        return await appointmentChargeRepo.create({
            business_code: appointment.business_code,
            appointment_code: appointmentCode,
            charge_code: charge_code || null,
            charge_uom: charge_uom || null,
            charge_value: charge_value || null,
        });
    }

    async getCharges(appointmentCode: string) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");
        return await appointmentChargeRepo.findByAppointment(appointmentCode);
    }

    async removeCharge(appointmentCode: string, chargeId: number, actor: any) {
        const item = await appointmentChargeRepo.findById(chargeId);
        if (!item) throw new Error("Appointment charge not found");
        return await appointmentChargeRepo.delete(chargeId);
    }


    async addDiscount(appointmentCode: string, data: any, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const { service_code, discount_uom, discount_value } = data;
        validateAppointmentDiscount({
            business_code: appointment.business_code,
            service_code,
            appointment_code: appointmentCode,
            discount_uom,
            discount_value,
        });

        return await appointmentDiscountRepo.create({
            business_code: appointment.business_code,
            service_code,
            appointment_code: appointmentCode,
            discount_uom,
            discount_value,
        });
    }

    async getDiscounts(appointmentCode: string) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");
        return await appointmentDiscountRepo.findByAppointment(appointmentCode);
    }

    async removeDiscount(appointmentCode: string, discountId: number, actor: any) {
        const item = await appointmentDiscountRepo.findById(discountId);
        if (!item) throw new Error("Appointment discount not found");
        return await appointmentDiscountRepo.delete(discountId);
    }


    async getHistory(appointmentCode: string) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");
        return await historyRepo.findByAppointment(appointmentCode);
    }


    async createRecurrence(data: any, actor: any) {
        const { business_code, service_code, recurrence_uom, recurrence_Value, auto_cancel_after_days, reschedule_after_days } = data;

        validateAppointmentRecurrence(data);

        return await appointmentRecurrenceRepo.create({
            business_code,
            service_code,
            recurrence_uom,
            recurrence_value: recurrence_Value,
            status: "active",
            auto_cancel_after_days: auto_cancel_after_days || null,
            reschedule_after_days: reschedule_after_days || null,
        });
    }

    async getAllRecurrences(filters: any = {}) {
        return await appointmentRecurrenceRepo.findAll(filters);
    }

    async getRecurrenceById(id: number) {
        const recurrence = await appointmentRecurrenceRepo.findById(id);
        if (!recurrence) throw new Error("Recurrence not found");
        return recurrence;
    }

    async updateRecurrence(id: number, data: any, actor: any) {
        const recurrence = await appointmentRecurrenceRepo.findById(id);
        if (!recurrence) throw new Error("Recurrence not found");

        const allowed: any = {};
        const fields = ["recurrence_uom", "recurrence_value", "status", "auto_cancel_after_days", "reschedule_after_days"];
        for (const f of fields) {
            if (data[f] !== undefined) allowed[f] = data[f];
        }

        return await appointmentRecurrenceRepo.update(id, allowed);
    }

    async deleteRecurrence(id: number, actor: any) {
        const recurrence = await appointmentRecurrenceRepo.findById(id);
        if (!recurrence) throw new Error("Recurrence not found");
        return await appointmentRecurrenceRepo.delete(id);
    }
}

export default new AppointmentService();