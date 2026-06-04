import repo from "../repositories/appointment.repository";
import historyRepo from "../repositories/appointmentHistory.repository";
import participantRepo from "../repositories/appointmentParticipant.repository";
import appointmentServiceRepo from "../repositories/appointmentService.repository";
import appointmentChargeRepo from "../repositories/appointmentCharge.repository";
import appointmentDiscountRepo from "../repositories/appointmentDiscount.repository";
import appointmentRecurrenceRepo from "../repositories/appointmentRecurrence.repository";
import chargeRepo from "../repositories/charge.repository";
import invoiceRepo from "../repositories/invoice.repository";
import scheduleRepo from "../repositories/schedule.repository";
import serviceRepo from "../repositories/service.repository";
import { generateCode } from "../utils/codeGenerator";
import { ROLES } from "../utils/roles";
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

const DAYS_OF_WEEK = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function normalizeDateOnly(input: any): string {
    if (!input) throw new Error("Appointment has invalid date");

    if (input instanceof Date) {
        if (isNaN(input.getTime())) throw new Error("Appointment has invalid date");
        return input.toISOString().split("T")[0];
    }

    const text = String(input).trim();
    const datePart = text.includes("T") ? text.split("T")[0] : text;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
    if (!m) {
        const parsed = new Date(text);
        if (isNaN(parsed.getTime())) throw new Error("Appointment has invalid date");
        return parsed.toISOString().split("T")[0];
    }

    return datePart;
}

function getWorkingDayFromDate(input: any): string {
    const dateOnly = normalizeDateOnly(input);
    const [year, month, day] = dateOnly.split("-").map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    return DAYS_OF_WEEK[utcDate.getUTCDay()];
}

function normalizeTimeToHHMM(input: any, label: "startTime" | "endTime"): string {
    const raw = input == null ? "" : String(input).trim();
    const match = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(raw);
    if (!match) {
        throw new Error(`Invalid ${label} format. Use HH:MM`);
    }
    return `${match[1]}:${match[2]}`;
}

class AppointmentService {

    private toAmount(value: any): number {
        const n = Number(value ?? 0);
        return Number.isFinite(n) ? n : 0;
    }

    private roundMoney(value: number): number {
        return Number(value.toFixed(2));
    }

    private computeChargeAmount(baseAmount: number, chargeUom: string, chargeValue: any): number {
        const normalizedUom = String(chargeUom || "").toLowerCase();
        const value = this.toAmount(chargeValue);
        if (normalizedUom === "percentage") {
            return this.roundMoney((baseAmount * value) / 100);
        }
        return this.roundMoney(value);
    }

    private async calculatePricingFromServiceCodes(
        businessCode: string,
        serviceCodes: string[],
        chargeRows: any[]
    ) {
        let serviceSubtotal = 0;
        let currency: string | null = null;
        const servicesBreakdown: any[] = [];

        for (const code of serviceCodes) {
            const service = await serviceRepo.findByCode(code);
            if (!service) continue;
            const s = service.dataValues || service;
            if (s.business_code !== businessCode) continue;

            const price = this.roundMoney(this.toAmount(s.price));
            serviceSubtotal += price;
            if (!currency && s.currency) currency = s.currency;

            servicesBreakdown.push({
                service_code: s.service_code,
                name: s.name,
                price,
                currency: s.currency || null,
            });
        }

        serviceSubtotal = this.roundMoney(serviceSubtotal);

        let chargeTotal = 0;
        const chargesBreakdown = (chargeRows || []).map((charge: any) => {
            const c = charge.dataValues || charge;
            const computedAmount = this.computeChargeAmount(serviceSubtotal, c.charge_uom, c.charge_value);
            chargeTotal += computedAmount;
            return {
                charge_code: c.charge_code,
                name: c.name || null,
                charge_uom: c.charge_uom,
                charge_value: this.toAmount(c.charge_value),
                computed_amount: computedAmount,
            };
        });

        chargeTotal = this.roundMoney(chargeTotal);
        const subtotal = serviceSubtotal;
        const total = this.roundMoney(subtotal + chargeTotal);

        return {
            currency: currency || "PKR",
            service_subtotal: serviceSubtotal,
            discount_total: 0,
            subtotal,
            charge_total: chargeTotal,
            total,
            services: servicesBreakdown,
            charges: chargesBreakdown,
        };
    }

    private async applyActiveChargesToAppointment(businessCode: string, appointmentCode: string) {
        const existing = await appointmentChargeRepo.findByAppointment(appointmentCode);
        const existingCodes = new Set(
            (existing || []).map((row: any) => {
                const r = row.dataValues || row;
                return r.charge_code;
            })
        );

        const activeCharges = await chargeRepo.findActiveByBusiness(businessCode);
        for (const charge of activeCharges) {
            const chargeData = charge.dataValues || charge;
            if (existingCodes.has(chargeData.charge_code)) continue;

            await appointmentChargeRepo.create({
                business_code: businessCode,
                appointment_code: appointmentCode,
                charge_code: chargeData.charge_code,
                charge_uom: chargeData.charge_uom,
                charge_value: chargeData.charge_value,
            });
        }
    }

    private async upsertDraftInvoice(
        businessCode: string,
        appointmentCode: string,
        subtotal: number,
        total: number,
        updatedBy: string | null
    ) {
        const existingInvoices = await invoiceRepo.findByAppointment(appointmentCode);
        const existing = existingInvoices?.[0];

        if (existing) {
            const id = (existing as any).id;
            await invoiceRepo.update(id, {
                subtotal,
                total,
                invoice_status: "draft",
                date: new Date().toISOString().split("T")[0],
                updated_by: updatedBy,
            });
            return;
        }

        await invoiceRepo.create({
            business_code: businessCode,
            appointment_code: appointmentCode,
            subtotal,
            total,
            invoice_status: "draft",
            date: new Date().toISOString().split("T")[0],
            updated_by: updatedBy,
        });
    }

    private async computeAppointmentPricing(businessCode: string, appointmentCode: string) {
        const appointmentServices = await appointmentServiceRepo.findByAppointment(appointmentCode);
        const serviceCodes = (appointmentServices || []).map((item: any) => {
            const row = item.dataValues || item;
            return row.service_code;
        });

        const appointmentCharges = await appointmentChargeRepo.findByAppointment(appointmentCode);
        return this.calculatePricingFromServiceCodes(businessCode, serviceCodes, appointmentCharges || []);
    }

    async getPricingPreview(data: any, actor?: any) {
        const inputBusinessCode = data?.business_code;
        const businessCode = actor && actor.userType !== ROLES.ADMIN && actor.userType !== ROLES.CLIENT
            ? actor.businessCode
            : inputBusinessCode;

        const serviceCodes = Array.isArray(data?.service_codes) ? data.service_codes.filter(Boolean) : [];

        if (!businessCode) throw new Error("business_code is required");
        if (serviceCodes.length === 0) throw new Error("service_codes is required");

        const activeCharges = await chargeRepo.findActiveByBusiness(businessCode);
        const pricing = await this.calculatePricingFromServiceCodes(businessCode, serviceCodes, activeCharges || []);

        return {
            business_code: businessCode,
            service_codes: serviceCodes,
            ...pricing,
        };
    }


    async create(data: any, actor: any) {
        // Clients always book under the given business_code (not their own)
        // Non-client, non-admin actors can only book for their own business
        if (actor && actor.userType !== ROLES.ADMIN && actor.userType !== ROLES.CLIENT) {
            data.business_code = actor.businessCode;
        }

        const {
            business_code,
            appointment_start_date,
            appointment_end_date,
            start_time,
            end_time,
            location_code,
            notes,
            status,
            user_role,
            service_codes,   // optional array: ["SVC12345", ...]  for clients to attach services at booking
            client_code,     // optional: explicit client to book for (ops staff on behalf of client)
        } = data;

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
            status: "pending",   // always pending regardless of creator role
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

        // Add the booking actor as a participant (admins are system-wide and not added as participants)
        if (actor?.userCode && actor.userType !== ROLES.ADMIN) {
            await participantRepo.create({
                business_code,
                appointment_code,
                user_code: actor.userCode,
                user_type: actor.userType,
                user_role: user_role || null,
                status: "active",
            });
        }

        // When ops staff books on behalf of a client, also add the client as participant
        if (client_code && client_code !== actor?.userCode) {
            await participantRepo.create({
                business_code,
                appointment_code,
                user_code: client_code,
                user_type: ROLES.CLIENT,
                user_role: null,
                status: "active",
            });
        }

        // Attach services immediately if provided (client booking flow)
        if (Array.isArray(service_codes) && service_codes.length > 0) {
            for (const service_code of service_codes) {
                await appointmentServiceRepo.create({
                    business_code,
                    service_code,
                    appointment_code,
                });
            }
        }

        return appointment;
    }

    async getAll(filters: any = {}, actor?: any) {
        // Non-admin actors can only see appointments from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            filters.business_code = actor.businessCode;
        }

        // Service staff can only see appointments where they are a participant
        if (actor && actor.userType === ROLES.SERVICE_STAFF) {
            const participantCodes = await participantRepo.findAppointmentCodesByUser(actor.userCode);
            return repo.findByParticipantCodes(participantCodes, { business_code: filters.business_code, status: filters.status });
        }

        // Client can filter by their own user_code (created_by)
        if (actor && actor.userType === ROLES.CLIENT) {
            filters.user_code = actor.userCode;
        }

        return await repo.findAll(filters);
    }


    async getByCode(appointmentCode: string, actor?: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        // Non-admin actors can only view appointments from their own business
        // Clients can view any appointment they created
        if (actor && actor.userType !== ROLES.ADMIN) {
            if (actor.userType === ROLES.CLIENT) {
                const apptCreator = appointment.dataValues?.created_by ?? appointment.created_by;
                if (apptCreator !== actor.userCode) {
                    throw new Error("Access denied: this appointment does not belong to you");
                }
            } else {
                const apptBusiness = appointment.dataValues?.business_code ?? appointment.business_code;
                if (apptBusiness !== actor.businessCode) {
                    throw new Error("Access denied: appointment does not belong to your business");
                }
            }
        }

        const result: any = appointment.dataValues ? { ...appointment.dataValues } : { ...appointment };

        // If the appointment was rescheduled, look up the new appointment so clients can see the offer
        if (result.status === "rescheduled" && result.appointment_code) {
            const rescheduledTo = await repo.findAll({
                rescheduled_from: result.appointment_code,
            } as any);
            if (rescheduledTo.length > 0) {
                const r: any = rescheduledTo[0];
                result.reschedule_offer = r.dataValues ? { ...r.dataValues } : { ...r };
            }
        }

        return result;
    }

    async update(appointmentCode: string, data: any, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        // Non-admin actors can only update appointments from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const apptBusiness = appointment.dataValues?.business_code ?? appointment.business_code;
            if (apptBusiness !== actor.businessCode) {
                throw new Error("Access denied: appointment does not belong to your business");
            }
        }

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

        // Non-admin actors can only change status for appointments in their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const apptBusiness = appointment.dataValues?.business_code ?? appointment.business_code;
            if (apptBusiness !== actor.businessCode) {
                throw new Error("Access denied: appointment does not belong to your business");
            }
        }

        // Schedule conflict check when approving
        if (status === "approved") {
            if (!appointment.location_code) {
                throw new Error("Cannot approve appointment without a location");
            }
            if (!appointment.appointment_start_date || !appointment.start_time || !appointment.end_time) {
                throw new Error("Appointment is missing date or time information");
            }

            const workingDay = getWorkingDayFromDate(appointment.appointment_start_date);

            const availableStaff = await scheduleRepo.findAvailableStaff(
                appointment.business_code,
                appointment.location_code,
                workingDay,
                appointment.start_time,
                appointment.end_time
            );

            if (!availableStaff || availableStaff.length === 0) {
                throw new Error(
                    `No available staff for this appointment time slot (${workingDay} ${appointment.start_time}–${appointment.end_time} at location ${appointment.location_code})`
                );
            }
        }

        const oldStatus = appointment.status;

        const updateData: any = { status };
        if (status === "approved") updateData.approved_by = actor?.userCode || null;
        if (status === "canceled") updateData.cancelled_by = actor?.userCode || null;

        const actionMap: Record<string, string> = {
            approved: "approved",
            rejected: "rejected",
            canceled: "canceled",
            rescheduled: "rescheduled",
            completed: "completed",
            in_progress: "in_progress",
        };

        await repo.update(appointmentCode, updateData);

        if (status === "approved") {
            await this.applyActiveChargesToAppointment(appointment.business_code, appointmentCode);
            const pricing = await this.computeAppointmentPricing(appointment.business_code, appointmentCode);
            await this.upsertDraftInvoice(
                appointment.business_code,
                appointmentCode,
                pricing.subtotal,
                pricing.total,
                actor?.userCode || null
            );
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

        // Non-admin actors can only reschedule appointments in their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const apptBusiness = original.dataValues?.business_code ?? original.business_code;
            if (apptBusiness !== actor.businessCode) {
                throw new Error("Access denied: appointment does not belong to your business");
            }
        }

        const { appointment_start_date, appointment_end_date, start_time, end_time, location_code, notes } = data;
        const originalRow: any = original.dataValues || original;

        // Allow partial reschedule payloads by defaulting missing fields to original values.
        const resolvedPayload = {
            appointment_start_date: normalizeDateOnly(
                appointment_start_date || originalRow.appointment_start_date
            ),
            appointment_end_date: normalizeDateOnly(
                appointment_end_date || originalRow.appointment_end_date
            ),
            start_time: normalizeTimeToHHMM(
                start_time || originalRow.start_time,
                "startTime"
            ),
            end_time: normalizeTimeToHHMM(
                end_time || originalRow.end_time,
                "endTime"
            ),
        };

        validateReschedule(resolvedPayload);

        const business_code = originalRow.business_code;
        const new_appointment_code = generateCode();

        const newAppointment = await repo.create({
            business_code,
            appointment_code: new_appointment_code,
            appointment_start_date: resolvedPayload.appointment_start_date,
            appointment_end_date: resolvedPayload.appointment_end_date,
            start_time: resolvedPayload.start_time,
            end_time: resolvedPayload.end_time,
            location_code: location_code || originalRow.location_code || null,
            status: "pending",
            created_by: actor?.userCode,
            rescheduled_from: originalRow.appointment_code,
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

    // Client accepts or rejects a reschedule offer
    async respondToReschedule(originalAppointmentCode: string, action: string, actor: any) {
        if (!["accepted", "rejected"].includes(action)) {
            throw new Error("Action must be 'accepted' or 'rejected'");
        }

        const original = await repo.findByCode(originalAppointmentCode);
        if (!original) throw new Error("Original appointment not found");

        // Only the client who created the original appointment can respond
        if (actor.userType !== ROLES.CLIENT) {
            throw new Error("Only the client can respond to a reschedule offer");
        }
        const originalCreator = original.dataValues?.created_by ?? original.created_by;
        if (originalCreator !== actor.userCode) {
            throw new Error("Access denied: this appointment does not belong to you");
        }

        if ((original.dataValues?.status ?? original.status) !== "rescheduled") {
            throw new Error("No reschedule offer on this appointment");
        }

        // Find the new (rescheduled) appointment linked to this one
        const candidates = await repo.findAll({ rescheduled_from: originalAppointmentCode } as any);
        if (!candidates.length) throw new Error("Reschedule offer not found");
        const rescheduledAppointment = candidates[0];
        const rescheduledCode = rescheduledAppointment.dataValues?.appointment_code ?? rescheduledAppointment.appointment_code;
        const business_code = original.dataValues?.business_code ?? original.business_code;

        if (action === "accepted") {
            await this.applyActiveChargesToAppointment(business_code, rescheduledCode);

            await repo.update(rescheduledCode, { status: "approved" });

            const pricing = await this.computeAppointmentPricing(business_code, rescheduledCode);
            await this.upsertDraftInvoice(
                business_code,
                rescheduledCode,
                pricing.subtotal,
                pricing.total,
                actor.userCode
            );

            await historyRepo.create({
                business_code,
                appointment_code: rescheduledCode,
                action: "approved",
                changed_by: actor.userCode,
                old_value: { status: "pending" },
                new_value: { status: "approved" },
            });

            return { originalAppointmentCode, rescheduledCode, action: "accepted" };
        } else {
            // Client rejected — cancel the new appointment
            await repo.update(rescheduledCode, { status: "canceled", cancelled_by: actor.userCode });
            // Restore original to pending so it can be re-processed
            await repo.update(originalAppointmentCode, { status: "pending" });

            await historyRepo.create({
                business_code,
                appointment_code: rescheduledCode,
                action: "canceled",
                changed_by: actor.userCode,
                old_value: { status: "pending" },
                new_value: { status: "canceled" },
            });

            return { originalAppointmentCode, rescheduledCode, action: "rejected" };
        }
    }


    async addParticipant(appointmentCode: string, data: any, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const { user_code, user_type, user_role } = data;
        validateAppointmentParticipant({
            business_code: appointment.business_code,
            user_code,
            user_type,
        });

        // Double-booking conflict check for service staff assignment
        if (user_type === ROLES.SERVICE_STAFF) {
            if (!appointment.appointment_start_date || !appointment.start_time || !appointment.end_time) {
                throw new Error("Appointment is missing date or time — cannot check for conflicts");
            }

            const dateStr = new Date(appointment.appointment_start_date).toISOString().split("T")[0];

            const conflicts = await participantRepo.findConflictsForStaff(
                user_code,
                dateStr,
                appointment.start_time,
                appointment.end_time,
                appointmentCode
            );

            if (conflicts.length > 0) {
                const conflictCodes = conflicts.map((c: any) => c.appointment_code).join(", ");
                throw new Error(
                    `Conflict detected: staff ${user_code} is already assigned to appointment(s) [${conflictCodes}] ` +
                    `that overlap with ${dateStr} ${appointment.start_time}–${appointment.end_time}`
                );
            }
        }

        const participant = await participantRepo.create({
            business_code: appointment.business_code,
            appointment_code: appointmentCode,
            user_code: user_code,
            user_type: user_type,
            user_role: user_role || null,
            status: "active",
        });

        await historyRepo.create({
            business_code: appointment.business_code,
            appointment_code: appointmentCode,
            action: "assigned",
            changed_by: actor?.userCode,
            old_value: null,
            new_value: { user_code, user_type, user_role: user_role || null },
        });

        return participant;
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
        // Non-admin actors can only create recurrences for their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            data.business_code = actor.businessCode;
        }

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

    async getAllRecurrences(filters: any = {}, actor?: any) {
        // Non-admin actors can only see recurrences from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            filters.business_code = actor.businessCode;
        }
        return await appointmentRecurrenceRepo.findAll(filters);
    }

    async getRecurrenceById(id: number) {
        const recurrence = await appointmentRecurrenceRepo.findById(id);
        if (!recurrence) throw new Error("Recurrence not found");
        return recurrence;
    }

    // async updateRecurrence(id: number, data: any, actor: any) {
    //     const recurrence = await appointmentRecurrenceRepo.findById(id);
    //     if (!recurrence) throw new Error("Recurrence not found");
    //
    //     const allowed: any = {};
    //     const fields = ["recurrence_uom", "recurrence_value", "status", "auto_cancel_after_days", "reschedule_after_days"];
    //     for (const f of fields) {
    //         if (data[f] !== undefined) allowed[f] = data[f];
    //     }
    //
    //     return await appointmentRecurrenceRepo.update(id, allowed);
    // }

    async update_recurrence(id: number, data: any, actor: any) {
        const recurrence = await appointmentRecurrenceRepo.findById(id)
        if(!recurrence) throw new Error("Recurrence not found");

        const allowed: any = {};
        const fields = ['recurrence_uom, "recurrence_value', "status", "auto_cancel_"]
    }

    async deleteRecurrence(id: number, actor: any) {
        const recurrence = await appointmentRecurrenceRepo.findById(id);
        if (!recurrence) throw new Error("Recurrence not found");
        return await appointmentRecurrenceRepo.delete(id);
    }

    // ─── Approval Flow ───────────────────────────────────────────────────────────

    /**
     * Returns the list of service-staff members whose shift schedule covers
     * the appointment's date, time window, and location — without changing anything.
     */
    async checkAvailability(appointmentCode: string, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        // console.log(appointment)
        if (!appointment) throw new Error("Appointment not found");

        if (actor && actor.userType !== ROLES.ADMIN) {
            const apptBusiness = appointment.dataValues?.business_code ?? appointment.business_code;
            if (apptBusiness !== actor.businessCode) {
                throw new Error("Access denied: appointment does not belong to your business");
            }
        }

        if (!appointment.location_code)
            throw new Error("Appointment has no location assigned — cannot check staff availability");
        if (!appointment.appointment_start_date || !appointment.start_time || !appointment.end_time)
            throw new Error("Appointment is missing date or time information");

        const workingDay = getWorkingDayFromDate(appointment.appointment_start_date);

        const availableStaff = await scheduleRepo.findAvailableStaff(
            appointment.business_code,
            appointment.location_code,
            workingDay,
            appointment.start_time,
            appointment.end_time
        );

        return {
            appointment_code: appointmentCode,
            date: appointment.appointment_start_date,
            start_time: appointment.start_time,
            end_time: appointment.end_time,
            location_code: appointment.location_code,
            working_day: workingDay,
            available_staff: availableStaff || [],
        };
    }

    /**
     * Approves an appointment and assigns the chosen service-staff member.
     * Validates that the staff member is actually available for the slot,
     * applies business charges, and generates a draft invoice — same as the
     * existing changeStatus("approved") path.
     */
    async approveWithStaff(appointmentCode: string, staffCode: string, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        if (actor && actor.userType !== ROLES.ADMIN) {
            const apptBusiness = appointment.dataValues?.business_code ?? appointment.business_code;
            if (apptBusiness !== actor.businessCode) {
                throw new Error("Access denied: appointment does not belong to your business");
            }
        }

        const currentStatus = appointment.dataValues?.status ?? appointment.status;
        if (currentStatus !== "pending")
            throw new Error("Only pending appointments can be approved this way");

        if (!appointment.location_code)
            throw new Error("Cannot approve appointment without a location");
        if (!appointment.appointment_start_date || !appointment.start_time || !appointment.end_time)
            throw new Error("Appointment is missing date or time information");

        const workingDay = getWorkingDayFromDate(appointment.appointment_start_date);

        // Confirm the chosen staff is still in an available schedule slot
        const availableStaff = await scheduleRepo.findAvailableStaff(
            appointment.business_code,
            appointment.location_code,
            workingDay,
            appointment.start_time,
            appointment.end_time
        );
        const staffRecord = (availableStaff || []).find((s: any) => s.user_code === staffCode);
        if (!staffRecord)
            throw new Error("Selected staff member is not available for this appointment slot");

        // Check for double-booking
        const dateStr = normalizeDateOnly(appointment.appointment_start_date);
        const conflicts = await participantRepo.findConflictsForStaff(
            staffCode,
            dateStr,
            appointment.start_time,
            appointment.end_time,
            appointmentCode
        );
        if (conflicts && conflicts.length > 0)
            throw new Error("Selected staff member has a conflicting appointment at this time");

        // Assign the staff member as participant
        await participantRepo.create({
            business_code: appointment.business_code,
            appointment_code: appointmentCode,
            user_code: staffCode,
            user_type: ROLES.SERVICE_STAFF,
            user_role: "service_staff",
            status: "active",
        });

        // Approve
        await repo.update(appointmentCode, { status: "approved", approved_by: actor?.userCode || null });

        await this.applyActiveChargesToAppointment(appointment.business_code, appointmentCode);
        const pricing = await this.computeAppointmentPricing(appointment.business_code, appointmentCode);
        await this.upsertDraftInvoice(
            appointment.business_code,
            appointmentCode,
            pricing.subtotal,
            pricing.total,
            actor?.userCode || null
        );

        await historyRepo.create({
            business_code: appointment.business_code,
            appointment_code: appointmentCode,
            action: "approved",
            changed_by: actor?.userCode,
            old_value: { status: "pending" },
            new_value: { status: "approved", assigned_staff: staffCode },
        });

        return { appointmentCode, status: "approved", assigned_staff: staffCode };
    }
}

export default new AppointmentService();