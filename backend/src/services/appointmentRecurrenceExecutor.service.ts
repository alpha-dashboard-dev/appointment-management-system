import appointmentRepo from "../repositories/appointment.repository";
import appointmentRecurrenceRepo from "../repositories/appointmentRecurrence.repository";

class AppointmentRecurrenceExecutorService {

    /**
     * Run recurrence rules for all active recurrences
     * (should be called by cron job)
     */
    async processRecurrences() {

        const recurrences = await appointmentRecurrenceRepo.findAll({
            status: "active"
        });

        for (const rec of recurrences) {

            await this.applyAutoCancel(rec);
            await this.applyAutoReschedule(rec);
        }
    }

    /**
     * AUTO CANCEL LOGIC
     */
    async applyAutoCancel(recurrence: any) {

        if (!recurrence.auto_cancel_after_days) return;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - recurrence.auto_cancel_after_days);

        const appointments = await appointmentRepo.findAll({
            appointment_code: recurrence.appointment_code,
            status: "pending"
        });

        for (const appt of appointments) {

            const apptDate = new Date(appt.appointment_start_date);

            if (apptDate <= cutoffDate) {
                await appointmentRepo.update(appt.id, {
                    status: "canceled",
                    cancel_reason: "Auto-cancel by recurrence rule"
                });
            }
        }
    }

    /**
     * AUTO RESCHEDULE LOGIC
     */
    async applyAutoReschedule(recurrence: any) {

        if (!recurrence.reschedule_after_days) return;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - recurrence.reschedule_after_days);

        const appointments = await appointmentRepo.findAll({
            appointment_code: recurrence.appointment_code,
            status: "cancelled"
        });

        for (const appt of appointments) {

            const apptDate = new Date(appt.appointment_start_date);

            if (apptDate <= cutoffDate) {

                const newDate = new Date(apptDate);
                newDate.setDate(newDate.getDate() + recurrence.recurrence_value);

                await appointmentRepo.create({
                    business_code: appt.business_code,
                    client_code: appt.client_code,
                    service_code: appt.service_code,
                    location_code: appt.location_code,
                    appointment_start_date: newDate,
                    appointment_end_date: newDate,
                    start_time: appt.start_time,
                    end_time: appt.end_time,
                    status: "pending",
                    notes: "Auto-rescheduled by recurrence rule"
                });
            }
        }
    }
}

export default new AppointmentRecurrenceExecutorService();