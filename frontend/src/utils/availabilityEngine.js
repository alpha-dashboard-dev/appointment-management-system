/*
|--------------------------------------------------------------------------
| STAFF AVAILABILITY ENGINE
|--------------------------------------------------------------------------
*/

/**
 * Check if appointment overlaps
 */
function overlaps(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1
}

/**
 * Convert HH:mm to minutes
 */
function toMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number)

    return hours * 60 + minutes
}

/**
 * Main availability checker
 */
export function checkStaffAvailability({staff, date, startTime, duration, appointments = [], blockedHours = []}) {

    const requestedStart = toMinutes(startTime)
    const requestedEnd =
        requestedStart + duration

    /*
    |--------------------------------------------------------------------------
    | 1. CHECK SHIFT
    |--------------------------------------------------------------------------
    */

    const shift = staff.shifts.find(
        s => s.date === date
    )

    if (!shift) {
        return {
            available: false,
            reason: 'No shift assigned'
        }
    }

    const shiftStart = toMinutes(shift.start)
    const shiftEnd = toMinutes(shift.end)

    if (
        requestedStart < shiftStart ||
        requestedEnd > shiftEnd
    ) {
        return {
            available: false,
            reason: 'Outside shift hours'
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2. CHECK BLOCKED HOURS
    |--------------------------------------------------------------------------
    */

    for (const block of blockedHours) {

        if (block.date !== date) continue

        const blockStart =
            toMinutes(block.start)

        const blockEnd =
            toMinutes(block.end)

        if (
            overlaps(
                requestedStart,
                requestedEnd,
                blockStart,
                blockEnd
            )
        ) {
            return {
                available: false,
                reason: 'Blocked hour conflict'
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 3. CHECK EXISTING APPOINTMENTS
    |--------------------------------------------------------------------------
    */

    for (const appointment of appointments) {

        if (
            appointment.staffId !== staff.id ||
            appointment.date !== date
        ) {
            continue
        }

        const appointmentStart =
            toMinutes(appointment.start)

        const appointmentEnd =
            appointmentStart +
            appointment.duration

        if (
            overlaps(
                requestedStart,
                requestedEnd,
                appointmentStart,
                appointmentEnd
            )
        ) {
            return {
                available: false,
                reason:
                    'Conflicts with another appointment'
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | AVAILABLE
    |--------------------------------------------------------------------------
    */

    return {
        available: true
    }
}