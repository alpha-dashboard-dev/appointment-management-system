/**
 * Handles all availability checking and insights building
 * Extracted from AppointmentService to reduce its complexity
 */
import repo from "../repositories/appointment.repository";
import scheduleRepo from "../repositories/schedule.repository";
import participantRepo from "../repositories/appointmentParticipant.repository";
import appointmentServiceRepo from "../repositories/appointmentService.repository";
import locationServiceRepo from "../repositories/locationService.repository";
import locationRepo from "../repositories/location.repository";

import { extractRow, deduplicateStaffSlots, timeSlotCoversRange, filterAvailableStaff } from "../utils/serviceHelpers";
import { normalizeDateOnly, normalizeTimeToHHMM, normalizeTimeToHHMMSS, getWorkingDayFromDate } from "../utils/date_time_format";

export class AppointmentAvailabilityChecker {
    /**
     * Simplify staff rows to minimal structure
     */
    private simplifyStaffRows(rows: any[] = []): any[] {
        return rows.map((row: any) => ({
            user_code: row.user_code,
            staff_name: row.staff_name || null,
            location_code: row.location_code,
            working_day: row.working_days,
            start_time: normalizeTimeToHHMMSS(row.start_time),
            end_time: normalizeTimeToHHMMSS(row.end_time),
        }));
    }

    /**
     * Group staff by location
     */
    private groupByLocation(rows: any[] = []): any[] {
        const groups = new Map<string, any[]>();

        for (const row of rows) {
            const loc = row.location_code;
            if (!loc) continue;
            if (!groups.has(loc)) groups.set(loc, []);
            groups.get(loc)!.push(row);
        }

        return [...groups.entries()].map(([location_code, staff]) => ({
            location_code,
            staff: deduplicateStaffSlots(this.simplifyStaffRows(staff)),
        }));
    }

    /**
     * Attach location metadata to grouped staff
     */
    private async attachLocationMeta(groups: any[] = []): Promise<any[]> {
        const out: any[] = [];
        for (const group of groups) {
            const location = await locationRepo.findByCode(group.location_code);
            const row = location ? extractRow(location) : null;
            out.push({
                ...group,
                location: row
                    ? {
                        city: row.city || null,
                        address: row.address || null,
                        status: row.status || null,
                    }
                    : null,
            });
        }
        return out;
    }

    /**
     * Get staff available at same slot and location
     */
    private async getAvailableStaffAtSlot(
        businessCode: string,
        locationCode: string,
        workingDay: string,
        startTime: string,
        endTime: string,
        busyStaffCodes: Set<string>
    ): Promise<any[]> {
        const staff = await scheduleRepo.findAvailableStaff(
            businessCode,
            locationCode,
            workingDay,
            startTime,
            endTime
        );
        return this.simplifyStaffRows(filterAvailableStaff(staff, busyStaffCodes));
    }

    /**
     * Get alternative slots at same location
     */
    private async getAlternativeSlotsSameLocation(
        businessCode: string,
        workingDay: string,
        locationCode: string,
        startTime: string,
        endTime: string
    ): Promise<any[]> {
        const schedules = await scheduleRepo.findStaffSchedulesByDay(
            businessCode,
            workingDay,
            locationCode
        );
        return (schedules || []).filter(
            (slot: any) => !timeSlotCoversRange(slot.start_time, slot.end_time, startTime, endTime)
        );
    }

    /**
     * Get available staff at other locations with same slot
     */
    private async getAlternativeLocationsWithStaff(
        businessCode: string,
        workingDay: string,
        currentLocationCode: string,
        startTime: string,
        endTime: string,
        busyStaffCodes: Set<string>
    ): Promise<any[]> {
        const allSchedules = await scheduleRepo.findStaffSchedulesByDay(businessCode, workingDay);
        return (allSchedules || []).filter(
            (slot: any) =>
                slot.location_code !== currentLocationCode &&
                timeSlotCoversRange(slot.start_time, slot.end_time, startTime, endTime) &&
                !busyStaffCodes.has(slot.user_code)
        );
    }

    /**
     * Get service availability at alternative locations
     */
    private async getServiceAlternativeLocations(
        businessCode: string,
        selectedServiceCodes: string[],
        workingDay: string,
        currentLocationCode: string,
        startTime: string,
        endTime: string,
        busyStaffCodes: Set<string>
    ): Promise<any[]> {
        if (selectedServiceCodes.length === 0) return [];

        const locServices = await locationServiceRepo.findAll({
            business_code: businessCode,
            availability: "available",
        });

        // Build map of locations serving selected services
        const grouped = new Map<string, Set<string>>();
        for (const lsItem of locServices || []) {
            const ls = extractRow(lsItem);
            if (!selectedServiceCodes.includes(ls.service_code)) continue;
            if (!grouped.has(ls.location_code)) grouped.set(ls.location_code, new Set<string>());
            grouped.get(ls.location_code)!.add(ls.service_code);
        }

        const selectedServiceLocations: any[] = [];

        for (const [locationCode, serviceSet] of grouped.entries()) {
            if (locationCode === currentLocationCode) continue;

            const sameSlotStaff = await scheduleRepo.findAvailableStaff(
                businessCode,
                locationCode,
                workingDay,
                startTime,
                endTime
            );
            const availableSameSlot = this.simplifyStaffRows(
                filterAvailableStaff(sameSlotStaff, busyStaffCodes)
            );

            const otherSlotSchedules = await scheduleRepo.findStaffSchedulesByDay(
                businessCode,
                workingDay,
                locationCode
            );
            const otherSlots = (otherSlotSchedules || []).filter(
                (slot: any) => !timeSlotCoversRange(slot.start_time, slot.end_time, startTime, endTime)
            );

            const location = await locationRepo.findByCode(locationCode);
            const locationRow = location ? extractRow(location) : null;

            selectedServiceLocations.push({
                location_code: locationCode,
                location: locationRow
                    ? {
                        city: locationRow.city || null,
                        address: locationRow.address || null,
                        status: locationRow.status || null,
                    }
                    : null,
                matched_service_codes: [...serviceSet],
                available_staff_same_slot: availableSameSlot,
                alternative_staff_time_slots: this.simplifyStaffRows(otherSlots),
            });
        }

        return selectedServiceLocations;
    }

    /**
     * Get staff engaged with other overlapping appointments
     */
    private async getEngagedStaff(
        businessCode: string,
        locationCode: string,
        date: string,
        startTime: string,
        endTime: string,
        appointmentCode: string
    ): Promise<any[]> {

        // get all staff who are assigned in overlapping appointments
        const engaged = await participantRepo.findEngagedStaffDetails(
            date,
            startTime,
            endTime,
            appointmentCode
        );

        return (engaged || []).map((s: any) => ({
            user_code: s.user_code,
            staff_name: s.staff_name || null,
            location_code: locationCode,
            appointments: (s.appointments || []).map((a: any) => ({
                appointment_code: a.appointment_code,
                start_time: normalizeTimeToHHMMSS(a.start_time),
                end_time: normalizeTimeToHHMMSS(a.end_time),
            })),
        }));
    }

    /**
     * Build complete availability insights for an appointment
     */
    async buildInsights(appointment: any, appointmentCode: string): Promise<any> {
        const row = extractRow(appointment);
        const date = normalizeDateOnly(row.appointment_start_date);
        const workingDay = getWorkingDayFromDate(row.appointment_start_date);
        const startTime = normalizeTimeToHHMM(row.start_time, "startTime");
        const endTime = normalizeTimeToHHMM(row.end_time, "endTime");

        // Find conflicting appointments at location
        const locationConflicts = await repo.findLocationSlotConflicts(
            row.business_code,
            row.location_code,
            date,
            startTime,
            endTime,
            appointmentCode
        );

        // Find busy staff
        const busyStaffCodes = new Set(
            await participantRepo.findBusyStaffCodes(date, startTime, endTime, appointmentCode)
        );

        const engagedStaff = await this.getEngagedStaff(
            row.business_code,
            row.location_code,
            date,
            startTime,
            endTime,
            appointmentCode
        );

        // Get available staff at same slot/location
        const availableStaff = await this.getAvailableStaffAtSlot(
            row.business_code,
            row.location_code,
            workingDay,
            startTime,
            endTime,
            busyStaffCodes
        );

        // Get alternative slots at same location
        const differentTimeSameLocation = await this.getAlternativeSlotsSameLocation(
            row.business_code,
            workingDay,
            row.location_code,
            startTime,
            endTime
        );

        // Get available staff at other locations
        const otherLocationSameSlot = await this.getAlternativeLocationsWithStaff(
            row.business_code,
            workingDay,
            row.location_code,
            startTime,
            endTime,
            busyStaffCodes
        );

        // Get service-specific location alternatives
        const appointmentServices = await appointmentServiceRepo.findByAppointment(appointmentCode);
        const selectedServiceCodes = (appointmentServices || [])
            .map((s: any) => extractRow(s).service_code)
            .filter(Boolean);

        const selectedServiceLocations = await this.getServiceAlternativeLocations(
            row.business_code,
            selectedServiceCodes,
            workingDay,
            row.location_code,
            startTime,
            endTime,
            busyStaffCodes
        );

        // Group and attach metadata
        const groupedOtherLocations = this.groupByLocation(otherLocationSameSlot);
        const groupedOtherLocationsWithMeta = await this.attachLocationMeta(groupedOtherLocations);

        return {
            appointment_code: appointmentCode,
            date,
            start_time: normalizeTimeToHHMMSS(startTime),
            end_time: normalizeTimeToHHMMSS(endTime),
            location_code: row.location_code,
            working_day: workingDay,
            location_slot_already_booked: (locationConflicts || []).length > 0,
            conflicting_appointments: (locationConflicts || []).map((c: any) => c.appointment_code),
            available_staff: deduplicateStaffSlots(availableStaff),
            engaged_staff: engagedStaff,
            alternatives: {
                different_time_same_location: deduplicateStaffSlots(this.simplifyStaffRows(differentTimeSameLocation)),
                different_location_same_time: groupedOtherLocationsWithMeta,
                selected_service_other_locations: selectedServiceLocations,
            },
        };
    }
}

export default new AppointmentAvailabilityChecker();
