import repo from "../repositories/appointment.repository";
import historyRepo from "../repositories/appointmentHistory.repository";
import participantRepo from "../repositories/appointmentParticipant.repository";
import appointmentServiceRepo from "../repositories/appointmentService.repository";
import appointmentChargeRepo from "../repositories/appointmentCharge.repository";
import appointmentDiscountRepo from "../repositories/appointmentDiscount.repository";
import chargeRepo from "../repositories/charge.repository";
import invoiceRepo from "../repositories/invoice.repository";
import scheduleRepo from "../repositories/schedule.repository";
import locationServiceRepo from "../repositories/locationService.repository";
import locationRepo from "../repositories/location.repository";
import serviceRepo from "../repositories/service.repository";
import { generateCode } from "../utils/codeGenerator";
import { ROLES } from "../utils/roles";
import {validateAppointment, validateReschedule, validateAppointmentStatus} from "../utils/validator";
import {getWorkingDayFromDate, normalizeDateOnly, normalizeTimeToHHMM} from "../utils/date_time_format";

class AppointmentService {

    private toRow<T = any>(value: any): T {
        return (value?.dataValues || value) as T;
    }
    //
    // private scheduleCoversSlot(scheduleStart: any, scheduleEnd: any, slotStart: any, slotEnd: any): boolean {
    //     const sStart = normalizeTimeToHHMMSS(scheduleStart);
    //     const sEnd = normalizeTimeToHHMMSS(scheduleEnd);
    //     const aStart = normalizeTimeToHHMMSS(slotStart);
    //     const aEnd = normalizeTimeToHHMMSS(slotEnd);
    //     return sStart <= aStart && sEnd >= aEnd;
    // }
    //
    // private simplifyStaffRows(rows: any[] = []) {
    //     return rows.map((row: any) => ({
    //         user_code: row.user_code,
    //         staff_name: row.staff_name || null,
    //         location_code: row.location_code,
    //         working_day: row.working_days,
    //         start_time: normalizeTimeToHHMMSS(row.start_time),
    //         end_time: normalizeTimeToHHMMSS(row.end_time),
    //     }));
    // }
    //
    // private uniqStaffSlots(rows: any[] = []) {
    //     const seen = new Set<string>();
    //     const result: any[] = [];
    //
    //     for (const row of rows) {
    //         const key = [row.user_code, row.location_code, row.start_time, row.end_time].join("|");
    //         if (seen.has(key)) continue;
    //         seen.add(key);
    //         result.push(row);
    //     }
    //
    //     return result;
    // }
    //
    // private groupByLocation(rows: any[] = []) {
    //     const groups = new Map<string, any[]>();
    //
    //     for (const row of rows) {
    //         const loc = row.location_code;
    //         if (!loc) continue;
    //         if (!groups.has(loc)) groups.set(loc, []);
    //         groups.get(loc)!.push(row);
    //     }
    //
    //     return [...groups.entries()].map(([location_code, staff]) => ({
    //         location_code,
    //         staff: this.uniqStaffSlots(this.simplifyStaffRows(staff)),
    //     }));
    // }
    //
    // private async attachLocationMeta(groups: any[] = []) {
    //     const out: any[] = [];
    //     for (const group of groups) {
    //         const location = await locationRepo.findByCode(group.location_code);
    //         const row = location ? this.toRow(location) : null;
    //         out.push({
    //             ...group,
    //             location: row
    //                 ? {
    //                     city: row.city || null,
    //                     address: row.address || null,
    //                     status: row.status || null,
    //                 }
    //                 : null,
    //         });
    //     }
    //     return out;
    // }
    //
    // private async buildAvailabilityInsights(appointment: any, appointmentCode: string) {
    //     const row = this.toRow(appointment);
    //     const date = normalizeDateOnly(row.appointment_start_date);
    //     const workingDay = getWorkingDayFromDate(row.appointment_start_date);
    //     const startTime = normalizeTimeToHHMM(row.start_time, "startTime");
    //     const endTime = normalizeTimeToHHMM(row.end_time, "endTime");
    //
    //     const locationConflicts = await repo.findLocationSlotConflicts(
    //         row.business_code,
    //         row.location_code,
    //         date,
    //         startTime,
    //         endTime,
    //         appointmentCode
    //     );
    //
    //     const busyStaffCodes = new Set(
    //         await participantRepo.findBusyStaffCodes(date, startTime, endTime, appointmentCode)
    //     );
    //
    //     const sameSlotAtLocationRaw = await scheduleRepo.findAvailableStaff(
    //         row.business_code,
    //         row.location_code,
    //         workingDay,
    //         startTime,
    //         endTime
    //     );
    //
    //     const availableSameSlot = (sameSlotAtLocationRaw || []).filter(
    //         (staff: any) => !busyStaffCodes.has(staff.user_code)
    //     );
    //
    //     const sameLocationSchedules = await scheduleRepo.findStaffSchedulesByDay(
    //         row.business_code,
    //         workingDay,
    //         row.location_code
    //     );
    //     const sameLocationOtherSlots = (sameLocationSchedules || []).filter(
    //         (slot: any) => !this.scheduleCoversSlot(slot.start_time, slot.end_time, startTime, endTime)
    //     );
    //
    //     const allSchedulesForDay = await scheduleRepo.findStaffSchedulesByDay(row.business_code, workingDay);
    //     const otherLocationSameSlot = (allSchedulesForDay || []).filter(
    //         (slot: any) =>
    //             slot.location_code !== row.location_code &&
    //             this.scheduleCoversSlot(slot.start_time, slot.end_time, startTime, endTime) &&
    //             !busyStaffCodes.has(slot.user_code)
    //     );
    //
    //     const appointmentServices = await appointmentServiceRepo.findByAppointment(appointmentCode);
    //     const selectedServiceCodes = (appointmentServices || [])
    //         .map((s: any) => this.toRow(s).service_code)
    //         .filter(Boolean);
    //
    //     const selectedServiceLocations: any[] = [];
    //     if (selectedServiceCodes.length > 0) {
    //         const locServices = await locationServiceRepo.findAll({
    //             business_code: row.business_code,
    //             availability: "available",
    //         });
    //
    //         const grouped = new Map<string, Set<string>>();
    //         for (const lsItem of locServices || []) {
    //             const ls = this.toRow(lsItem);
    //             if (!selectedServiceCodes.includes(ls.service_code)) continue;
    //             if (!grouped.has(ls.location_code)) grouped.set(ls.location_code, new Set<string>());
    //             grouped.get(ls.location_code)!.add(ls.service_code);
    //         }
    //
    //         for (const [locationCode, serviceSet] of grouped.entries()) {
    //             if (locationCode === row.location_code) continue;
    //
    //             const sameSlotRaw = await scheduleRepo.findAvailableStaff(
    //                 row.business_code,
    //                 locationCode,
    //                 workingDay,
    //                 startTime,
    //                 endTime
    //             );
    //             const sameSlot = (sameSlotRaw || []).filter(
    //                 (staff: any) => !busyStaffCodes.has(staff.user_code)
    //             );
    //
    //             const daySchedules = await scheduleRepo.findStaffSchedulesByDay(
    //                 row.business_code,
    //                 workingDay,
    //                 locationCode
    //             );
    //             const otherSlots = (daySchedules || []).filter(
    //                 (slot: any) => !this.scheduleCoversSlot(slot.start_time, slot.end_time, startTime, endTime)
    //             );
    //
    //             const location = await locationRepo.findByCode(locationCode);
    //             const locationRow = location ? this.toRow(location) : null;
    //
    //             selectedServiceLocations.push({
    //                 location_code: locationCode,
    //                 location: locationRow
    //                     ? {
    //                         city: locationRow.city || null,
    //                         address: locationRow.address || null,
    //                         status: locationRow.status || null,
    //                     }
    //                     : null,
    //                 matched_service_codes: [...serviceSet],
    //                 available_staff_same_slot: this.uniqStaffSlots(this.simplifyStaffRows(sameSlot)),
    //                 alternative_staff_time_slots: this.uniqStaffSlots(this.simplifyStaffRows(otherSlots)),
    //             });
    //         }
    //     }
    //
    //     const groupedOtherLocations = this.groupByLocation(otherLocationSameSlot);
    //     const groupedOtherLocationsWithMeta = await this.attachLocationMeta(groupedOtherLocations);
    //
    //     return {
    //         appointment_code: appointmentCode,
    //         date,
    //         start_time: normalizeTimeToHHMMSS(startTime),
    //         end_time: normalizeTimeToHHMMSS(endTime),
    //         location_code: row.location_code,
    //         working_day: workingDay,
    //         location_slot_already_booked: (locationConflicts || []).length > 0,
    //         conflicting_appointments: (locationConflicts || []).map((c: any) => c.appointment_code),
    //         available_staff: this.uniqStaffSlots(this.simplifyStaffRows(availableSameSlot)),
    //         alternatives: {
    //             different_time_same_location: this.uniqStaffSlots(this.simplifyStaffRows(sameLocationOtherSlots)),
    //             different_location_same_time: groupedOtherLocationsWithMeta,
    //             selected_service_other_locations: selectedServiceLocations,
    //         },
    //     };
    // }
    //
    // private toAmount(value: any): number {
    //     const n = Number(value ?? 0);
    //     return Number.isFinite(n) ? n : 0;
    // }
    //
    // private roundMoney(value: number): number {
    //     return Number(value.toFixed(2));
    // }
    //
    // private computeChargeAmount(baseAmount: number, chargeUom: string, chargeValue: any): number {
    //     const normalizedUom = String(chargeUom || "").toLowerCase();
    //     const value = this.toAmount(chargeValue);
    //     if (normalizedUom === "percentage") {
    //         return this.roundMoney((baseAmount * value) / 100);
    //     }
    //     return this.roundMoney(value);
    // }
    //
    // private async calculatePricingFromServiceCodes(
    //     businessCode: string,
    //     serviceCodes: string[],
    //     chargeRows: any[]
    // ) {
    //     let serviceSubtotal = 0;
    //     let currency: string | null = null;
    //     const servicesBreakdown: any[] = [];
    //
    //     for (const code of serviceCodes) {
    //         const service = await serviceRepo.findByCode(code);
    //         if (!service) continue;
    //         const s = service.dataValues || service;
    //         if (s.business_code !== businessCode) continue;
    //
    //         const price = this.roundMoney(this.toAmount(s.price));
    //         serviceSubtotal += price;
    //         if (!currency && s.currency) currency = s.currency;
    //
    //         servicesBreakdown.push({
    //             service_code: s.service_code,
    //             name: s.name,
    //             price,
    //             currency: s.currency || null,
    //         });
    //     }
    //
    //     serviceSubtotal = this.roundMoney(serviceSubtotal);
    //
    //     let chargeTotal = 0;
    //     const chargesBreakdown = (chargeRows || []).map((charge: any) => {
    //         const c = charge.dataValues || charge;
    //         const computedAmount = this.computeChargeAmount(serviceSubtotal, c.charge_uom, c.charge_value);
    //         chargeTotal += computedAmount;
    //         return {
    //             charge_code: c.charge_code,
    //             name: c.name || null,
    //             charge_uom: c.charge_uom,
    //             charge_value: this.toAmount(c.charge_value),
    //             computed_amount: computedAmount,
    //         };
    //     });
    //
    //     chargeTotal = this.roundMoney(chargeTotal);
    //     const subtotal = serviceSubtotal;
    //     const total = this.roundMoney(subtotal + chargeTotal);
    //
    //     return {
    //         currency: currency || "PKR",
    //         service_subtotal: serviceSubtotal,
    //         discount_total: 0,
    //         subtotal,
    //         charge_total: chargeTotal,
    //         total,
    //         services: servicesBreakdown,
    //         charges: chargesBreakdown,
    //     };
    // }
    //
    // private async applyActiveChargesToAppointment(businessCode: string, appointmentCode: string) {
    //     const existing = await appointmentChargeRepo.findByAppointment(appointmentCode);
    //     const existingCodes = new Set(
    //         (existing || []).map((row: any) => {
    //             const r = row.dataValues || row;
    //             return r.charge_code;
    //         })
    //     );
    //
    //     const activeCharges = await chargeRepo.findActiveByBusiness(businessCode);
    //     for (const charge of activeCharges) {
    //         const chargeData = charge.dataValues || charge;
    //         if (existingCodes.has(chargeData.charge_code)) continue;
    //
    //         await appointmentChargeRepo.create({
    //             business_code: businessCode,
    //             appointment_code: appointmentCode,
    //             charge_code: chargeData.charge_code,
    //             charge_uom: chargeData.charge_uom,
    //             charge_value: chargeData.charge_value,
    //         });
    //     }
    // }
    //
    // private async upsertDraftInvoice(
    //     businessCode: string,
    //     appointmentCode: string,
    //     subtotal: number,
    //     total: number,
    //     updatedBy: string | null
    // ) {
    //     const existingInvoices = await invoiceRepo.findByAppointment(appointmentCode);
    //     const existing = existingInvoices?.[0];
    //
    //     if (existing) {
    //         const id = (existing as any).id;
    //         await invoiceRepo.update(id, {
    //             subtotal,
    //             total,
    //             invoice_status: "draft",
    //             date: new Date().toISOString().split("T")[0],
    //             updated_by: updatedBy,
    //         });
    //         return;
    //     }
    //
    //     await invoiceRepo.create({
    //         business_code: businessCode,
    //         appointment_code: appointmentCode,
    //         subtotal,
    //         total,
    //         invoice_status: "draft",
    //         date: new Date().toISOString().split("T")[0],
    //         updated_by: updatedBy,
    //     });
    // }
    //
    // private async computeAppointmentPricing(businessCode: string, appointmentCode: string) {
    //     const appointmentServices = await appointmentServiceRepo.findByAppointment(appointmentCode);
    //     const serviceCodes = (appointmentServices || []).map((item: any) => {
    //         const row = item.dataValues || item;
    //         return row.service_code;
    //     });
    //
    //     const appointmentCharges = await appointmentChargeRepo.findByAppointment(appointmentCode);
    //     return this.calculatePricingFromServiceCodes(businessCode, serviceCodes, appointmentCharges || []);
    // }
    //
    // async getPricingPreview(data: any, actor?: any) {
    //     const inputBusinessCode = data?.business_code;
    //     const businessCode = actor && actor.userType !== ROLES.ADMIN && actor.userType !== ROLES.CLIENT
    //         ? actor.businessCode
    //         : inputBusinessCode;
    //
    //     const serviceCodes = Array.isArray(data?.service_codes) ? data.service_codes.filter(Boolean) : [];
    //
    //     if (!businessCode) throw new Error("business_code is required");
    //     if (serviceCodes.length === 0) throw new Error("service_codes is required");
    //
    //     const activeCharges = await chargeRepo.findActiveByBusiness(businessCode);
    //     const pricing = await this.calculatePricingFromServiceCodes(businessCode, serviceCodes, activeCharges || []);
    //
    //     return {
    //         business_code: businessCode,
    //         service_codes: serviceCodes,
    //         ...pricing,
    //     };
    // }
    async create(data: any, actor: any) {
        const transaction = await db.sequelize.transaction();

        try {
            // 1. Actor-based business assignment
            if (actor && actor.userType !== ROLES.ADMIN && actor.userType !== ROLES.CLIENT) {
                data.business_code = actor.businessCode;
            }

            const {business_code, appointment_start_date, appointment_end_date, start_time, end_time, location_code, notes,
                user_role, service_codes, client_code} = data;

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

            // 3. History (audit log)
            await historyRepo.create(
                {
                    business_code,
                    appointment_code,
                    action: "created",
                    changed_by: actor?.userCode || null,
                    old_value: null,
                    new_value: {
                        appointment_code,
                        status: "pending",
                    },
                },
                { transaction }
            );

            // 4. Participants (actor)
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

            // 5. Participants (client on behalf booking)
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

            // 6. Appointment Services
            if (Array.isArray(service_codes) && service_codes.length > 0) {
                const serviceRows = service_codes.map((service_code: string) => ({
                    business_code,
                    service_code,
                    appointment_code,
                }));

                await appointmentServiceRepo.bulkCreate(serviceRows, {
                    transaction,
                });
            }

            // 7. Commit
            await transaction.commit();

            return appointment;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    async getAll(query: any = {}, actor?: any) {
        const filters: any = {
            business_code: query.business_code,
            status: query.status,
            user_code: query.user_code,
        };

        const options = {
            include: query.include ? String(query.include).split(",") : [],

            limit: query.limit ? Number(query.limit) : undefined,

            offset: query.offset ? Number(query.offset) : undefined,

            order: [
                [
                    query.sort_by || "created_at",
                    query.sort_order || "ASC",
                ],
            ],
        };

        // Non-admin actors can only see appointments from their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            filters.business_code = actor.businessCode;
        }

        // Service staff can only see appointments where they are a participant
        if (actor && actor.userType === ROLES.SERVICE_STAFF) {
            const participantCodes = await participantRepo.findAppointmentCodesByUser(actor.userCode);
            return repo.findByParticipantCodes(
                participantCodes,
                {
                    business_code: filters.business_code,
                    status: filters.status,
                },
                options
            );
        }

        // Client can filter by their own user_code (created_by)
        if (actor && actor.userType === ROLES.CLIENT) {
            filters.user_code = actor.userCode;
        }

        return await repo.findAll(
            filters,
            options
        );
    }


    async getByCode(appointmentCode: string, actor?: any, query: any = {}) {
        const options = {
            include: query.include ? String(query.include).split(",") : [],
        };

        const appointment = await repo.findByCode(
            appointmentCode,
            options
        );
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
        const appointmentRow = this.toRow(appointment);

        // Non-admin actors can only change status for appointments in their own business
        if (actor && actor.userType !== ROLES.ADMIN) {
            const apptBusiness = appointmentRow.business_code;
            if (apptBusiness !== actor.businessCode) {
                throw new Error("Access denied: appointment does not belong to your business");
            }
        }

        // Schedule conflict check when approving
        if (status === "approved") {
            if (!appointmentRow.location_code) {
                throw new Error("Cannot approve appointment without a location");
            }
            if (!appointmentRow.appointment_start_date || !appointmentRow.start_time || !appointmentRow.end_time) {
                throw new Error("Appointment is missing date or time information");
            }

            const date = normalizeDateOnly(appointmentRow.appointment_start_date);
            const startTime = normalizeTimeToHHMM(appointmentRow.start_time, "startTime");
            const endTime = normalizeTimeToHHMM(appointmentRow.end_time, "endTime");
            const locationConflicts = await repo.findLocationSlotConflicts(
                appointmentRow.business_code,
                appointmentRow.location_code,
                date,
                startTime,
                endTime,
                appointmentCode
            );
            if (locationConflicts.length > 0) {
                throw new Error("Cannot approve appointment: this location time slot is already booked");
            }

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
            const freeStaff = (availableStaff || []).filter(
                (staff: any) => !busyStaffCodes.has(staff.user_code)
            );

            if (!freeStaff || freeStaff.length === 0) {
                throw new Error(
                    `No available service_staff for this appointment time slot (${workingDay} ${startTime}–${endTime} at location ${appointmentRow.location_code})`
                );
            }
        }

        const oldStatus = appointmentRow.status;

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

        // if (status === "approved") {
        //     await this.applyActiveChargesToAppointment(appointmentRow.business_code, appointmentCode);
        //     const pricing = await this.computeAppointmentPricing(appointmentRow.business_code, appointmentCode);
        //     await this.upsertDraftInvoice(
        //         appointmentRow.business_code,
        //         appointmentCode,
        //         pricing.subtotal,
        //         pricing.total,
        //         actor?.userCode || null
        //     );
        // }

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


    // ─── Approval Flow ───────────────────────────────────────────────────────────

    /**
     * Returns the list of service-staff members whose shift schedule covers
     * the appointment's date, time window, and location — without changing anything.
     */
    async checkAvailability(appointmentCode: string, actor: any) {
        const appointment = await repo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");
        const appointmentRow = this.toRow(appointment);

        if (actor && actor.userType !== ROLES.ADMIN) {
            const apptBusiness = appointmentRow.business_code;
            if (apptBusiness !== actor.businessCode) {
                throw new Error("Access denied: appointment does not belong to your business");
            }
        }

        if (!appointmentRow.location_code)
            throw new Error("Appointment has no location assigned — cannot check staff availability");
        if (!appointmentRow.appointment_start_date || !appointmentRow.start_time || !appointmentRow.end_time)
            throw new Error("Appointment is missing date or time information");

        return await this.buildAvailabilityInsights(appointmentRow, appointmentCode);
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
        const appointmentRow = this.toRow(appointment);

        if (actor && actor.userType !== ROLES.ADMIN) {
            const apptBusiness = appointmentRow.business_code;
            if (apptBusiness !== actor.businessCode) {
                throw new Error("Access denied: appointment does not belong to your business");
            }
        }

        const currentStatus = appointmentRow.status;
        if (currentStatus !== "pending")
            throw new Error("Only pending appointments can be approved this way");

        if (!appointmentRow.location_code)
            throw new Error("Cannot approve appointment without a location");
        if (!appointmentRow.appointment_start_date || !appointmentRow.start_time || !appointmentRow.end_time)
            throw new Error("Appointment is missing date or time information");

        const dateStr = normalizeDateOnly(appointmentRow.appointment_start_date);
        const startTime = normalizeTimeToHHMM(appointmentRow.start_time, "startTime");
        const endTime = normalizeTimeToHHMM(appointmentRow.end_time, "endTime");
        const workingDay = getWorkingDayFromDate(appointmentRow.appointment_start_date);

        const locationConflicts = await repo.findLocationSlotConflicts(
            appointmentRow.business_code,
            appointmentRow.location_code,
            dateStr,
            startTime,
            endTime,
            appointmentCode
        );
        if (locationConflicts.length > 0) {
            throw new Error("Cannot approve appointment: this location time slot is already booked");
        }

        const busyStaffCodes = new Set(
            await participantRepo.findBusyStaffCodes(dateStr, startTime, endTime, appointmentCode)
        );

        // Confirm the chosen staff is still in an available schedule slot
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
        if (!staffRecord)
            throw new Error("Selected service_staff is not available for this appointment slot");

        // Check for double-booking
        const conflicts = await participantRepo.findConflictsForStaff(
            staffCode,
            dateStr,
            startTime,
            endTime,
            appointmentCode
        );
        if (conflicts && conflicts.length > 0)
            throw new Error("Selected staff member has a conflicting appointment at this time");

        // Assign the staff member as participant
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

        await this.applyActiveChargesToAppointment(appointmentRow.business_code, appointmentCode);
        const pricing = await this.computeAppointmentPricing(appointmentRow.business_code, appointmentCode);
        await this.upsertDraftInvoice(
            appointmentRow.business_code,
            appointmentCode,
            pricing.subtotal,
            pricing.total,
            actor?.userCode || null
        );

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