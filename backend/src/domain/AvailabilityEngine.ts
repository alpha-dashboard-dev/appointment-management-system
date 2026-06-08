import {
    normalizeDateOnly,
    getWorkingDayFromDate,
    normalizeTimeToHHMM,
    normalizeTimeToHHMMSS,
} from "../utils/date_time_format";

export class AvailabilityEngine {
    constructor(
        private repo: any,
        private participantRepo: any,
        private scheduleRepo: any,
        private locationRepo: any,
        private appointmentServiceRepo: any,
        private locationServiceRepo: any,
        private scheduleAnalyzer: any,
        private helpers: any // toRow, simplifyStaffRows, etc.
    ) {}

    async buildAvailability(row: any, appointmentCode: string) {
        const date = normalizeDateOnly(row.appointment_start_date);
        const workingDay = getWorkingDayFromDate(date);

        const startTime = normalizeTimeToHHMM(row.start_time, "startTime");
        const endTime = normalizeTimeToHHMM(row.end_time, "endTime");

        const locationConflicts =
            await this.repo.findLocationSlotConflicts(
                row.business_code,
                row.location_code,
                date,
                startTime,
                endTime,
                appointmentCode
            );

        const busyStaffCodes = new Set(
            await this.participantRepo.findBusyStaffCodes(
                date,
                startTime,
                endTime,
                appointmentCode
            )
        );

        const sameSlotStaff =
            await this.scheduleRepo.findAvailableStaff(
                row.business_code,
                row.location_code,
                workingDay,
                startTime,
                endTime
            );

        const availableSameSlot = (sameSlotStaff || []).filter(
            (s: any) => !busyStaffCodes.has(s.user_code)
        );

        const sameLocationSchedules =
            await this.scheduleRepo.findStaffSchedulesByDay(
                row.business_code,
                workingDay,
                row.location_code
            );

        const otherSlotsSameLocation =
            this.scheduleAnalyzer.filterNonOverlappingSlots(
                sameLocationSchedules,
                startTime,
                endTime
            );

        const allSchedules =
            await this.scheduleRepo.findStaffSchedulesByDay(
                row.business_code,
                workingDay
            );

        const otherLocationSameSlot =
            this.scheduleAnalyzer.filterOverlappingSlots(
                allSchedules,
                startTime,
                endTime
            ).filter(
                (s: any) =>
                    s.location_code !== row.location_code &&
                    !busyStaffCodes.has(s.user_code)
            );

        const selectedServiceLocations =
            await this.buildServiceBasedAlternatives(
                row,
                workingDay,
                startTime,
                endTime,
                busyStaffCodes
            );

        const groupedOtherLocations =
            await this.helpers.attachLocationMeta(
                this.helpers.groupByLocation(otherLocationSameSlot)
            );

        return {
            appointment_code: appointmentCode,
            date,
            start_time: normalizeTimeToHHMMSS(startTime),
            end_time: normalizeTimeToHHMMSS(endTime),
            location_code: row.location_code,
            working_day: workingDay,
            location_slot_already_booked:
                (locationConflicts || []).length > 0,
            conflicting_appointments:
                (locationConflicts || []).map((c: any) => c.appointment_code),

            available_staff:
                this.helpers.uniqStaffSlots(
                    this.helpers.simplifyStaffRows(availableSameSlot)
                ),

            alternatives: {
                different_time_same_location:
                    this.helpers.uniqStaffSlots(
                        this.helpers.simplifyStaffRows(
                            otherSlotsSameLocation
                        )
                    ),

                different_location_same_time: groupedOtherLocations,

                selected_service_other_locations: selectedServiceLocations,
            },
        };
    }

    private async buildServiceBasedAlternatives(
        row: any,
        workingDay: string,
        startTime: string,
        endTime: string,
        busyStaffCodes: Set<string>
    ) {
        const appointmentServices =
            await this.appointmentServiceRepo.findByAppointment(
                row.appointment_code
            );

        const selectedServiceCodes = (appointmentServices || [])
            .map((s: any) => this.helpers.toRow(s).service_code)
            .filter(Boolean);

        if (!selectedServiceCodes.length) return [];

        const locServices =
            await this.locationServiceRepo.findAll({
                business_code: row.business_code,
                availability: "available",
            });

        const grouped = new Map<string, Set<string>>();

        for (const lsItem of locServices || []) {
            const ls = this.helpers.toRow(lsItem);

            if (!selectedServiceCodes.includes(ls.service_code)) continue;

            if (!grouped.has(ls.location_code)) {
                grouped.set(ls.location_code, new Set());
            }

            grouped.get(ls.location_code)!.add(ls.service_code);
        }

        const result: any[] = [];

        for (const [locationCode, serviceSet] of grouped.entries()) {
            if (locationCode === row.location_code) continue;

            const staff =
                await this.scheduleRepo.findAvailableStaff(
                    row.business_code,
                    locationCode,
                    workingDay,
                    startTime,
                    endTime
                );

            const filtered = (staff || []).filter(
                (s: any) => !busyStaffCodes.has(s.user_code)
            );

            const schedules =
                await this.scheduleRepo.findStaffSchedulesByDay(
                    row.business_code,
                    workingDay,
                    locationCode
                );

            const otherSlots =
                this.scheduleAnalyzer.filterNonOverlappingSlots(
                    schedules,
                    startTime,
                    endTime
                );

            const location = await this.locationRepo.findByCode(locationCode);
            const locationRow = location
                ? this.helpers.toRow(location)
                : null;

            result.push({
                location_code: locationCode,
                location: locationRow
                    ? {
                        city: locationRow.city || null,
                        address: locationRow.address || null,
                        status: locationRow.status || null,
                    }
                    : null,
                matched_service_codes: [...serviceSet],
                available_staff_same_slot:
                    this.helpers.uniqStaffSlots(
                        this.helpers.simplifyStaffRows(filtered)
                    ),
                alternative_staff_time_slots:
                    this.helpers.uniqStaffSlots(
                        this.helpers.simplifyStaffRows(otherSlots)
                    ),
            });
        }

        return result;
    }
}