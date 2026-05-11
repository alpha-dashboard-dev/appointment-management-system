// Appointment service — the core of the system.
// Handles the full appointment lifecycle: creation, status changes, rescheduling,
// participant management, linked services/charges/discounts, and recurrence rules.
import repo from "../repositories/appointment.repository";
import historyRepo from "../repositories/appointmentHistory.repository";
import participantRepo from "../repositories/appointmentParticipant.repository";
import appointmentServiceRepo from "../repositories/appointmentService.repository";
import appointmentChargeRepo from "../repositories/appointmentCharge.repository";
import appointmentDiscountRepo from "../repositories/appointmentDiscount.repository";
import appointmentRecurrenceRepo from "../repositories/appointmentRecurrence.repository";
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

    // ─── Appointment CRUD ────────────────────────────────────────────────────

    async create(data: any, actor: any) {
        const {
            businessCode, appointmentStartDate, appointmentEndDate,
            startTime, endTime, locationId, notes,
        } = data;

        validateAppointment(data);

        const appointmentCode = generateCode();

        const appointment = await repo.create({
            business_code: businessCode,
            appointmentCode,
            appointmentStartDate,
            appointmentEndDate,
            startTime,
            endTime,
            locationId: locationId || null,
            status: "PENDING",
            createdBy: actor?.id || 0,
            notes: notes || null,
        });

        // Record creation history
        await historyRepo.create({
            businessCode,
            appointmentCode,
            action: "CREATED",
            changedBy: actor?.id || 0,
            oldValue: null,
            newValue: { appointmentCode, status: "PENDING" },
        });

        // Add creator as participant (OWNER)
        if (actor?.userCode) {
            await participantRepo.create({
                businessCode,
                appointmentCode,
                userId: actor.userCode,
                userType: "OWNER",
                userRole: actor.userType || null,
                status: "ACTIVE",
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
        const fields = ["appointmentStartDate", "appointmentEndDate", "startTime", "endTime", "locationId", "notes"];
        for (const f of fields) {
            if (data[f] !== undefined) allowed[f] = data[f];
        }

        if (allowed.startTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(allowed.startTime)) throw new Error("Invalid startTime");
        if (allowed.endTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(allowed.endTime)) throw new Error("Invalid endTime");

        const updated = await repo.update(appointmentCode, allowed);

        await historyRepo.create({
            businessCode: appointment.business_code || appointment.businessCode,
            appointmentCode,
            action: "UPDATED",
            changedBy: actor?.id || 0,
            oldValue,
            newValue: allowed,
        });

        return updated;
    }

    async changeStatus(appointmentCode: string, status: string, actor: any) {
        validateAppointmentStatus({ status });

        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const oldStatus = appointment.status;

        const updateData: any = { status };
        if (status === "APPROVED") updateData.approvedBy = actor?.id || null;
        if (status === "CANCELLED") updateData.cancelledBy = actor?.id || null;

        const actionMap: Record<string, string> = {
            APPROVED: "ASSIGNED",
            CANCELLED: "CANCELLED",
            RESCHEDULED: "RESCHEDULED",
            UPDATED: "UPDATED",
        };

        await repo.update(appointmentCode, updateData);

        await historyRepo.create({
            businessCode: appointment.business_code || appointment.businessCode,
            appointmentCode,
            action: actionMap[status] || "UPDATED",
            changedBy: actor?.id || 0,
            oldValue: { status: oldStatus },
            newValue: { status },
        });

        return { appointmentCode, status };
    }

    async reschedule(appointmentCode: string, data: any, actor: any) {
        const original = await repo.findByCode(appointmentCode);
        if (!original) throw new Error("Appointment not found");

        const { appointmentStartDate, appointmentEndDate, startTime, endTime, locationId, notes } = data;

        validateReschedule(data);

        const businessCode = original.business_code || original.businessCode;
        const newAppointmentCode = generateCode();

        const newAppointment = await repo.create({
            business_code: businessCode,
            appointmentCode: newAppointmentCode,
            appointmentStartDate,
            appointmentEndDate,
            startTime,
            endTime,
            locationId: locationId || original.locationId || null,
            status: "PENDING",
            createdBy: actor?.id || 0,
            rescheduledFrom: original.id,
            notes: notes || null,
        });

        // Mark original as rescheduled
        await repo.update(appointmentCode, { status: "RESCHEDULED" });

        await historyRepo.create({
            businessCode,
            appointmentCode: newAppointmentCode,
            action: "RESCHEDULED",
            changedBy: actor?.id || 0,
            oldValue: { appointmentCode },
            newValue: { appointmentCode: newAppointmentCode },
        });

        return newAppointment;
    }

    // ─── Participants ────────────────────────────────────────────────────────

    async addParticipant(appointmentCode: string, data: any, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const { userCode, userType, userRole } = data;
        validateAppointmentParticipant({
            businessCode: appointment.business_code || appointment.businessCode,
            userCode,
            userType,
        });

        return await participantRepo.create({
            businessCode: appointment.business_code || appointment.businessCode,
            appointmentCode,
            userId: userCode,
            userType,
            userRole: userRole || null,
            status: "ACTIVE",
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

    // ─── Services ───────────────────────────────────────────────────────────

    async addService(appointmentCode: string, data: any, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const { serviceCode } = data;
        validateAppointmentService({
            businessCode: appointment.business_code || appointment.businessCode,
            serviceCode,
        });

        return await appointmentServiceRepo.create({
            businessCode: appointment.business_code || appointment.businessCode,
            serviceCode,
            appointmentCode,
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

    // ─── Charges ────────────────────────────────────────────────────────────

    async addCharge(appointmentCode: string, data: any, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const { chargeId, chargeUom, chargeValue } = data;
        validateAppointmentCharge({
            businessCode: appointment.business_code || appointment.businessCode,
            appointmentCode,
        });

        return await appointmentChargeRepo.create({
            businessCode: appointment.business_code || appointment.businessCode,
            appointmentCode,
            chargeId: chargeId || null,
            chargeUom: chargeUom || null,
            chargeValue: chargeValue || null,
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

    // ─── Discounts ──────────────────────────────────────────────────────────

    async addDiscount(appointmentCode: string, data: any, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const { serviceCode, discountUom, discountValue } = data;
        validateAppointmentDiscount({
            businessCode: appointment.business_code || appointment.businessCode,
            serviceCode,
            appointmentCode,
            discountUom,
            discountValue,
        });

        return await appointmentDiscountRepo.create({
            businessCode: appointment.business_code || appointment.businessCode,
            serviceCode,
            appointmentCode,
            discountUom,
            discountValue,
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

    // ─── History ────────────────────────────────────────────────────────────

    async getHistory(appointmentCode: string) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");
        return await historyRepo.findByAppointment(appointmentCode);
    }

    // ─── Recurrence ─────────────────────────────────────────────────────────

    async createRecurrence(data: any, actor: any) {
        const { businessCode, serviceCode, recurrenceUom, recurrenceValue, autoCancelAfterDays, rescheduleAfterDays } = data;

        validateAppointmentRecurrence(data);

        return await appointmentRecurrenceRepo.create({
            businessCode,
            serviceCode,
            recurrenceUom,
            recurrenceValue,
            status: "ACTIVE",
            autoCancelAfterDays: autoCancelAfterDays || null,
            rescheduleAfterDays: rescheduleAfterDays || null,
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
        const fields = ["recurrenceUom", "recurrenceValue", "status", "autoCancelAfterDays", "rescheduleAfterDays"];
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
