import repo from "../repositories/appointment.repository";
import historyRepo from "../repositories/appointmentHistory.repository";
import participantRepo from "../repositories/appointmentParticipant.repository";
import appointmentServiceRepo from "../repositories/appointmentService.repository";
import scheduleRepo from "../repositories/schedule.repository";

import { generateCode } from "../utils/codeGenerator";
import { ROLES } from "../utils/roles";
import { validateAppointment, validateReschedule, validateAppointmentStatus } from "../utils/validator";
import { getWorkingDayFromDate, normalizeDateOnly, normalizeTimeToHHMM } from "../utils/date_time_format";
import {
    extractRow,
    validateActorBusiness,
    validateActorIsCreator,
    buildQueryOptions,
    resolveBusinessCode,
    filterAvailableStaff,
} from "../utils/serviceHelpers";
import availabilityChecker from "./appointmentAvailability.checker";
import pricingService from "./appointmentPricing.service";

import initModels from "../config/database/sequelize/models/index";
import appointmentServiceItemService from "./appointmentServiceItem.service";

const db = initModels();

class AppointmentService {

    async getPricingPreview(data: any, actor?: any) {
        const businessCode = resolveBusinessCode(actor, data?.business_code);
        const serviceCodes = Array.isArray(data?.service_codes) ? data.service_codes.filter(Boolean) : [];

        if (!businessCode) throw new Error("business_code is required");
        if (serviceCodes.length === 0) throw new Error("service_codes is required");

        return await pricingService.getPricingPreview(businessCode, serviceCodes);
    }


    async create(data: any, actor: any) {
        // Note: db import needs to be added if not already present
        const transaction = await (db?.sequelize?.transaction?.() || Promise.resolve(undefined));

        try {
            // 1. Resolve business code from actor
            data.business_code = resolveBusinessCode(actor, data.business_code);

            const {
                business_code,
                appointment_start_date,
                appointment_end_date,
                start_time,
                end_time,
                location_code,
                notes,
                user_role,
                service_codes,
                client_code,
            } = data;

            validateAppointment(data);

            const appointment_code = generateCode();

            // 2. Create Appointment
            const appointment = await repo.create(
                {
                    business_code,
                    appointment_code,
                    appointment_start_date,
                    appointment_end_date,
                    start_time,
                    end_time,
                    location_code: location_code || null,
                    status: "pending",
                    created_by: actor?.userCode || null,
                    notes: notes || null,
                },
                { transaction }
            );

            // 3. Create history entry
            await historyRepo.create(
                {
                    business_code,
                    appointment_code,
                    action: "created",
                    changed_by: actor?.userCode || null,
                    old_value: null,
                    new_value: { appointment_code, status: "pending" },
                },
                { transaction }
            );

            // 4. Add actor as participant (if not admin)
            if (actor?.userCode && actor.userType !== ROLES.ADMIN) {
                await participantRepo.create(
                    {
                        business_code,
                        appointment_code,
                        user_code: actor.userCode,
                        user_type: actor.userType,
                        user_role: user_role || null,
                        status: "active",
                    },
                    { transaction }
                );
            }

            // 5. Add client as participant (if on-behalf booking)
            if (client_code && client_code !== actor?.userCode) {
                await participantRepo.create(
                    {
                        business_code,
                        appointment_code,
                        user_code: client_code,
                        user_type: ROLES.CLIENT,
                        user_role: null,
                        status: "active",
                    },
                    { transaction }
                );
            }

            // 6. Add services
            if (Array.isArray(service_codes) && service_codes.length > 0) {

                for (const service_code of service_codes) {

                    await appointmentServiceItemService.add(
                        appointment_code,
                        { service_code }
                    );
                }
            }

            // 7. Commit if transaction exists
            if (transaction) await transaction.commit();

            return appointment;
        } catch (err) {
            if (transaction) await transaction.rollback();
            throw err;
        }
    }

    async getAll(query: any = {}, actor?: any) {
        const options = buildQueryOptions(query);

        const filters: any = {
            business_code: query.business_code,
            status: query.status,
        };

        // Non-admin actors restricted to their business
        if (actor && actor.userType !== ROLES.ADMIN) {
            filters.business_code = actor.businessCode;
        }

        // Service staff can only see their own appointments
        if (actor && actor.userType === ROLES.SERVICE_STAFF) {
            const participantCodes = await participantRepo.findAppointmentCodesByUser(actor.userCode);
            return repo.findByParticipantCodes(participantCodes, filters, options);
        }

        // Clients see only their own appointments
        if (actor && actor.userType === ROLES.CLIENT) {
            filters.created_by = actor.userCode;
        }

        return await repo.findAll(filters, options);
    }


    async getByCode(appointmentCode: string, actor?: any, query: any = {}) {
        const options = buildQueryOptions(query);
        const appointment = await repo.findByCode(appointmentCode, options);

        if (!appointment) throw new Error("Appointment not found");

        const appointmentRow = extractRow(appointment);

        // Validate access
        if (actor && actor.userType !== ROLES.ADMIN) {
            if (actor.userType === ROLES.CLIENT) {
                validateActorIsCreator(actor, appointmentRow.created_by);
            } else {
                validateActorBusiness(actor, appointmentRow.business_code);
            }
        }

        const result: any = { ...appointmentRow };

        // If rescheduled, include the new appointment offer
        if (result.status === "rescheduled") {
            const rescheduledTo = await repo.findAll({ rescheduled_from: appointmentCode } as any);
            if (rescheduledTo.length > 0) {
                result.reschedule_offer = extractRow(rescheduledTo[0]);
            }
        }

        return result;
    }

    async update(appointmentCode: string, data: any, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const appointmentRow = extractRow(appointment);
        validateActorBusiness(actor, appointmentRow.business_code);

        const oldValue = { ...appointmentRow };

        // Allow only specific fields to be updated
        const allowed: any = {};
        const fields = ["appointment_start_date", "appointment_end_date", "start_time", "end_time", "location_code", "notes"];
        for (const f of fields) {
            if (data[f] !== undefined) allowed[f] = data[f];
        }

        // Validate time format if provided
        if (allowed.start_time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(allowed.start_time)) {
            throw new Error("Invalid start_time format");
        }
        if (allowed.end_time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(allowed.end_time)) {
            throw new Error("Invalid end_time format");
        }

        const updated = await repo.update(appointmentCode, allowed);

        await historyRepo.create({
            business_code: appointmentRow.business_code,
            appointment_code: appointmentCode,
            action: "updated",
            changed_by: actor?.userCode,
            old_value: oldValue,
            new_value: allowed,
        });

        return updated;
    }

    /**
     * Validates that appointment can be approved and has available staff
     */
    private async validateApprovalPrerequisites(appointmentRow: any, appointmentCode: string): Promise<void> {
        if (!appointmentRow.location_code) {
            throw new Error("Cannot approve appointment without a location");
        }
        if (!appointmentRow.appointment_start_date || !appointmentRow.start_time || !appointmentRow.end_time) {
            throw new Error("Appointment is missing date or time information");
        }

        const date = normalizeDateOnly(appointmentRow.appointment_start_date);
        const startTime = normalizeTimeToHHMM(appointmentRow.start_time, "startTime");
        const endTime = normalizeTimeToHHMM(appointmentRow.end_time, "endTime");

        // Check for location conflicts
        const locationConflicts = await repo.findLocationSlotConflicts(
            appointmentRow.business_code,
            appointmentRow.location_code,
            date,
            startTime,
            endTime,
            appointmentCode
        );
        if (locationConflicts.length > 0) {
            throw new Error("Cannot approve: location time slot is already booked");
        }

        // Check for available staff
        const workingDay = getWorkingDayFromDate(appointmentRow.appointment_start_date);
        const busyStaffCodes = new Set(
            await participantRepo.findBusyStaffCodes(date, startTime, endTime, appointmentCode)
        );

        const availableStaff = await scheduleRepo.findAvailableStaff(
            appointmentRow.business_code,
            appointmentRow.location_code,
            workingDay,
            startTime,
            endTime
        );
        const freeStaff = filterAvailableStaff(availableStaff, busyStaffCodes);

        if (!freeStaff || freeStaff.length === 0) {
            throw new Error(
                `No available service staff for this appointment (${workingDay} ${startTime}–${endTime})`
            );
        }
    }

    /**
     * Finalize approval by applying charges and creating invoice
     */
    private async finalizeApproval(appointmentRow: any, appointmentCode: string, actor: any): Promise<void> {
        await pricingService.applyActiveCharges(appointmentRow.business_code, appointmentCode);
        const pricing = await pricingService.computeAppointmentPricing(
            appointmentRow.business_code,
            appointmentCode
        );
        await pricingService.upsertDraftInvoice(
            appointmentRow.business_code,
            appointmentCode,
            pricing.subtotal,
            pricing.total,
            actor?.userCode || null
        );
    }

    async changeStatus(appointmentCode: string, status: string, actor: any) {
        validateAppointmentStatus({ status });

        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const appointmentRow = extractRow(appointment);
        validateActorBusiness(actor, appointmentRow.business_code);

        const oldStatus = appointmentRow.status;

        // Validate approval prerequisites
        if (status === "approved") {
            await this.validateApprovalPrerequisites(appointmentRow, appointmentCode);
        }

        // Update status
        const updateData: any = { status };
        if (status === "approved") updateData.approved_by = actor?.userCode || null;
        if (status === "canceled") updateData.cancelled_by = actor?.userCode || null;

        await repo.update(appointmentCode, updateData);

        // If approving, apply charges and generate invoice
        if (status === "approved") {
            await this.finalizeApproval(appointmentRow, appointmentCode, actor);
        }

        // Record history
        const actionMap: Record<string, string> = {
            approved: "approved",
            rejected: "rejected",
            canceled: "canceled",
            rescheduled: "rescheduled",
            completed: "completed",
            in_progress: "in_progress",
        };

        await historyRepo.create({
            business_code: appointmentRow.business_code,
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

        const originalRow = extractRow(original);
        validateActorBusiness(actor, originalRow.business_code);

        const {
            appointment_start_date,
            appointment_end_date,
            start_time,
            end_time,
            location_code,
            notes,
        } = data;

        // Build payload, using original values as defaults
        const resolvedPayload = {
            appointment_start_date: normalizeDateOnly(appointment_start_date || originalRow.appointment_start_date),
            appointment_end_date: normalizeDateOnly(appointment_end_date || originalRow.appointment_end_date),
            start_time: normalizeTimeToHHMM(start_time || originalRow.start_time, "startTime"),
            end_time: normalizeTimeToHHMM(end_time || originalRow.end_time, "endTime"),
        };

        validateReschedule(resolvedPayload);

        const new_appointment_code = generateCode();

        // Create new rescheduled appointment
        const newAppointment = await repo.create({
            business_code: originalRow.business_code,
            appointment_code: new_appointment_code,
            appointment_start_date: resolvedPayload.appointment_start_date,
            appointment_end_date: resolvedPayload.appointment_end_date,
            start_time: resolvedPayload.start_time,
            end_time: resolvedPayload.end_time,
            location_code: location_code || originalRow.location_code || null,
            status: "pending",
            created_by: actor?.userCode,
            rescheduled_from: appointmentCode,
            notes: notes || null,
        });

        // Mark original as rescheduled
        await repo.update(appointmentCode, { status: "rescheduled" });

        // Record history
        await historyRepo.create({
            business_code: originalRow.business_code,
            appointment_code: new_appointment_code,
            action: "rescheduled",
            changed_by: actor?.userCode,
            old_value: { appointment_code: appointmentCode },
            new_value: { appointment_code: new_appointment_code },
        });

        return newAppointment;
    }

    async respondToReschedule(originalAppointmentCode: string, action: string, actor: any) {
        if (!["accepted", "rejected"].includes(action)) {
            throw new Error("Action must be 'accepted' or 'rejected'");
        }

        const original = await repo.findByCode(originalAppointmentCode);
        if (!original) throw new Error("Original appointment not found");

        if (actor?.userType !== ROLES.CLIENT) {
            throw new Error("Only clients can respond to reschedule offers");
        }

        const originalRow = extractRow(original);
        validateActorIsCreator(actor, originalRow.created_by);

        if (originalRow.status !== "rescheduled") {
            throw new Error("No reschedule offer on this appointment");
        }

        // Find the rescheduled appointment
        const candidates = await repo.findAll({ rescheduled_from: originalAppointmentCode } as any);
        if (!candidates.length) throw new Error("Reschedule offer not found");

        const rescheduledAppointment = extractRow(candidates[0]);
        const rescheduledCode = rescheduledAppointment.appointment_code;

        if (action === "accepted") {
            // Apply charges and finalize the rescheduled appointment
            await pricingService.applyActiveCharges(originalRow.business_code, rescheduledCode);
            await repo.update(rescheduledCode, { status: "approved" });

            const pricing = await pricingService.computeAppointmentPricing(
                originalRow.business_code,
                rescheduledCode
            );
            await pricingService.upsertDraftInvoice(
                originalRow.business_code,
                rescheduledCode,
                pricing.subtotal,
                pricing.total,
                actor.userCode
            );

            await historyRepo.create({
                business_code: originalRow.business_code,
                appointment_code: rescheduledCode,
                action: "approved",
                changed_by: actor.userCode,
                old_value: { status: "pending" },
                new_value: { status: "approved" },
            });

            return { originalAppointmentCode, rescheduledCode, action: "accepted" };
        } else {
            // Reject: cancel the rescheduled appointment, restore original to pending
            await repo.update(rescheduledCode, { status: "canceled", cancelled_by: actor.userCode });
            await repo.update(originalAppointmentCode, { status: "pending" });

            await historyRepo.create({
                business_code: originalRow.business_code,
                appointment_code: rescheduledCode,
                action: "canceled",
                changed_by: actor.userCode,
                old_value: { status: "pending" },
                new_value: { status: "canceled" },
            });

            return { originalAppointmentCode, rescheduledCode, action: "rejected" };
        }
    }


    /**
     * Returns availability insights for an appointment without making changes
     */
    async checkAvailability(appointmentCode: string, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const appointmentRow = extractRow(appointment);
        validateActorBusiness(actor, appointmentRow.business_code);

        if (!appointmentRow.location_code) {
            throw new Error("Appointment has no location assigned");
        }
        if (!appointmentRow.appointment_start_date || !appointmentRow.start_time || !appointmentRow.end_time) {
            throw new Error("Appointment is missing date or time information");
        }

        return await availabilityChecker.buildInsights(appointmentRow, appointmentCode);
    }

    /**
     * Approves appointment with specific staff member assigned
     */
    async approveWithStaff(appointmentCode: string, staffCode: string, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const appointmentRow = extractRow(appointment);
        validateActorBusiness(actor, appointmentRow.business_code);

        if (appointmentRow.status !== "pending") {
            throw new Error("Only pending appointments can be approved this way");
        }

        // Validate prerequisites
        if (!appointmentRow.location_code) {
            throw new Error("Cannot approve appointment without a location");
        }
        if (!appointmentRow.appointment_start_date || !appointmentRow.start_time || !appointmentRow.end_time) {
            throw new Error("Appointment is missing date or time information");
        }

        const dateStr = normalizeDateOnly(appointmentRow.appointment_start_date);
        const startTime = normalizeTimeToHHMM(appointmentRow.start_time, "startTime");
        const endTime = normalizeTimeToHHMM(appointmentRow.end_time, "endTime");
        const workingDay = getWorkingDayFromDate(appointmentRow.appointment_start_date);

        // Check location conflicts
        const locationConflicts = await repo.findLocationSlotConflicts(
            appointmentRow.business_code,
            appointmentRow.location_code,
            dateStr,
            startTime,
            endTime,
            appointmentCode
        );
        if (locationConflicts.length > 0) {
            throw new Error("Cannot approve: location time slot is already booked");
        }

        // Check staff availability
        const busyStaffCodes = new Set(
            await participantRepo.findBusyStaffCodes(dateStr, startTime, endTime, appointmentCode)
        );

        const availableStaff = await scheduleRepo.findAvailableStaff(
            appointmentRow.business_code,
            appointmentRow.location_code,
            workingDay,
            startTime,
            endTime
        );
        const staffRecord = (availableStaff || []).find(
            (s: any) => s.user_code === staffCode && !busyStaffCodes.has(s.user_code)
        );
        if (!staffRecord) {
            throw new Error("Selected service staff is not available for this appointment slot");
        }

        // Check for staff double-booking
        const conflicts = await participantRepo.findConflictsForStaff(
            staffCode,
            dateStr,
            startTime,
            endTime,
            appointmentCode
        );
        if (conflicts && conflicts.length > 0) {
            throw new Error("Selected staff member has a conflicting appointment at this time");
        }

        // Assign staff as participant
        await participantRepo.create({
            business_code: appointmentRow.business_code,
            appointment_code: appointmentCode,
            user_code: staffCode,
            user_type: ROLES.SERVICE_STAFF,
            user_role: "service_staff",
            status: "active",
        });

        // Approve
        await repo.update(appointmentCode, { status: "approved", approved_by: actor?.userCode || null });

        // Finalize with charges and invoice
        await this.finalizeApproval(appointmentRow, appointmentCode, actor);

        // Record history
        await historyRepo.create({
            business_code: appointmentRow.business_code,
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