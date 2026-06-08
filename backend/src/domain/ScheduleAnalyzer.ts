export class ScheduleAnalyzer {
    constructor(private scheduleRepo: any) {}

    scheduleCoversSlot(
        slotStart: string,
        slotEnd: string,
        targetStart: string,
        targetEnd: string
    ): boolean {
        return slotStart <= targetStart && slotEnd >= targetEnd;
    }

    filterNonOverlappingSlots(
        schedules: any[],
        startTime: string,
        endTime: string
    ) {
        return (schedules || []).filter(
            (slot) =>
                !this.scheduleCoversSlot(
                    slot.start_time,
                    slot.end_time,
                    startTime,
                    endTime
                )
        );
    }

    filterOverlappingSlots(
        schedules: any[],
        startTime: string,
        endTime: string
    ) {
        return (schedules || []).filter((slot) =>
            this.scheduleCoversSlot(
                slot.start_time,
                slot.end_time,
                startTime,
                endTime
            )
        );
    }
}