import appointmentRepo from "../repositories/appointment.repository";
import appointmentRecurrenceRepo from "../repositories/appointmentRecurrence.repository";
import {normalizeTimeToHHMMSS} from "../utils/date_time_format";

class AppointmentRecurrenceExecutorService {

    async processRecurrences() {
        console.log("Cron started");

        const recurrences = await appointmentRecurrenceRepo.findAll({
            status: "active"
        });

        for (const rec of recurrences) {

            await this.applyAutoCancel(rec);
            // await this.applyAutoReschedule(rec);
        }
    }

    async applyAutoCancel(recurrence: any) {
        // console.log(recurrence);

        if (!recurrence.auto_cancel_after_days) return;
        // console.log(recurrence.auto_cancel_after_days);

        const cutoffDate = new Date();
        cutoffDate.setHours(0, 0, 0, 0);
        // console.log(normalizeTimeToHHMMSS(cutoffDate));

        // console.log(cutoffDate);
        cutoffDate.setDate(cutoffDate.getDate() - recurrence.auto_cancel_after_days);
        // console.log(normalizeTimeToHHMMSS(cutoffDate));


        const appointments = await appointmentRepo.findAll({
            appointment_code: recurrence.appointment_code,
            status: "pending"
        });

        // console.log(appointments);

        for (const appt of appointments) {

            const apptDate = new Date(appt.appointment_start_date);
            apptDate.setHours(0, 0, 0, 0);
            console.log(normalizeTimeToHHMMSS(cutoffDate));
            console.log(normalizeTimeToHHMMSS(apptDate));

            if (apptDate <= cutoffDate) {
                await appointmentRepo.update(appt.appointment_code, {
                    status: "canceled",
                    notes: "Auto-cancel by recurrence rule",
                });
            }
        }

    }

    async applyAutoReschedule(recurrence: any) {

        if (!recurrence.reschedule_after_days) return;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - recurrence.reschedule_after_days);

        const appointments = await appointmentRepo.findAll({
            appointment_code: recurrence.appointment_code,
            status: "canceled"
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