import appointmentRepo from "../repositories/appointment.repository";
import appointmentRecurrenceRepo from "../repositories/appointmentRecurrence.repository";
import {normalizeTimeToHHMMSS} from "../utils/date_time_format";
import participantRepo from "../repositories/appointmentParticipant.repository";
import appointmentServiceRepo from "../repositories/appointmentService.repository";
import historyRepo from "../repositories/appointmentHistory.repository";

import { generateCode } from "../utils/codeGenerator";
import { normalizeDateOnly } from "../utils/date_time_format";

import initModels from "../config/database/sequelize/models/index";

const db = initModels()

class AppointmentRecurrenceExecutorService {

    async processRecurrences() {
        // console.log("Cron started");

        const recurrences = await appointmentRecurrenceRepo.findAll({
            status: "active"
        });

        for (const rec of recurrences) {

            await this.applyAutoCancel(rec);
            await this.applyAutoReschedule(rec);
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
            // console.log(normalizeTimeToHHMMSS(cutoffDate));
            // console.log(normalizeTimeToHHMMSS(apptDate));

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
        cutoffDate.setHours(0, 0, 0, 0);

        cutoffDate.setDate(cutoffDate.getDate() - recurrence.reschedule_after_days);

        const appointments = await appointmentRepo.findAll({
            appointment_code: recurrence.appointment_code,
            status: "canceled"
        });

        // console.log(appointments)

        for (const appt of appointments) {

            const apptDate = new Date(appt.appointment_start_date);

            apptDate.setHours(0, 0, 0, 0);

            if (apptDate > cutoffDate) {
                continue;
            }

            const transaction = await db.sequelize.transaction();

            try {
                // Calculate next appointment date
                const nextDate =
                    new Date(appt.appointment_start_date);

                switch (recurrence.recurrence_uom) {

                    case "daily":
                        nextDate.setDate(nextDate.getDate() + recurrence.recurrence_value);
                        break;

                    case "weekly":
                        nextDate.setDate(nextDate.getDate() + (recurrence.recurrence_value * 7));
                        break;

                    case "monthly":
                        nextDate.setMonth(nextDate.getMonth() + recurrence.recurrence_value);
                        break;

                    default:
                        nextDate.setDate(nextDate.getDate() + recurrence.recurrence_value);
                }

                const newAppointmentCode = generateCode();

                // Create appointment

                await appointmentRepo.create(
                    {
                        business_code: appt.business_code,

                        appointment_code: newAppointmentCode,

                        appointment_start_date: normalizeDateOnly(nextDate),

                        appointment_end_date: normalizeDateOnly(nextDate),

                        start_time: appt.start_time,

                        end_time: appt.end_time,

                        location_code: appt.location_code,

                        status: "pending",

                        created_by: appt.created_by,

                        rescheduled_from: appt.appointment_code,

                        notes: "Auto-rescheduled by recurrence rule"
                    },
                    { transaction }
                );

                // Copy participants

                const participants = await participantRepo.findByAppointment(appt.appointment_code);

                for (const participant of participants || []) {

                    await participantRepo.create(
                        {
                            business_code: appt.business_code,

                            appointment_code: newAppointmentCode,

                            user_code: participant.user_code,

                            user_type: participant.user_type,

                            user_role: participant.user_role,

                            status: "active"
                        },
                        { transaction }
                    );
                }

                // Copy services

                const services =
                    await appointmentServiceRepo.findByAppointment(appt.appointment_code);

                for (const service of services || []) {

                    await appointmentServiceRepo.create(
                        {
                            business_code: appt.business_code,

                            appointment_code: newAppointmentCode,

                            service_code: service.service_code
                        },
                        { transaction }
                    );
                }

                // Mark old appointment

                await appointmentRepo.update(
                    appt.appointment_code,
                    {
                        status: "rescheduled"
                    },
                    { transaction }
                );

                // History

                await historyRepo.create(
                    {
                        business_code: appt.business_code,

                        appointment_code: newAppointmentCode,

                        action: "rescheduled",

                        changed_by: appt.changed_by,

                        old_value: {
                            appointment_code: appt.appointment_code,
                            appointment_date: appt.appointment_start_date
                        },

                        new_value: {
                            appointment_code: newAppointmentCode,
                            appointment_date: normalizeDateOnly(nextDate)
                        }
                    },
                    { transaction }
                );

                await transaction.commit();

                console.log(`Auto-rescheduled appointment ${appt.appointment_code} -> ${newAppointmentCode}`);

            } catch (err) {

                await transaction.rollback();

                console.error(`Failed auto-rescheduling appointment ${appt.appointment_code}`,
                    err
                );
            }
        }
    }

    // async applyAutoReschedule(recurrence: any) {
    //
    //     if (!recurrence.reschedule_after_days) return;
    //
    //     const cutoffDate = new Date();
    //     cutoffDate.setDate(cutoffDate.getDate() - recurrence.reschedule_after_days);
    //
    //     const appointments = await appointmentRepo.findAll({
    //         appointment_code: recurrence.appointment_code,
    //         status: "canceled"
    //     });
    //
    //     for (const appt of appointments) {
    //
    //         const apptDate = new Date(appt.appointment_start_date);
    //
    //         if (apptDate <= cutoffDate) {
    //
    //             const newDate = new Date(apptDate);
    //             newDate.setDate(newDate.getDate() + recurrence.recurrence_value);
    //
    //             await appointmentRepo.create({
    //                 business_code: appt.business_code,
    //                 client_code: appt.client_code,
    //                 service_code: appt.service_code,
    //                 location_code: appt.location_code,
    //                 appointment_start_date: newDate,
    //                 appointment_end_date: newDate,
    //                 start_time: appt.start_time,
    //                 end_time: appt.end_time,
    //                 status: "pending",
    //                 notes: "Auto-rescheduled by recurrence rule"
    //             });
    //         }
    //     }
    // }
}

export default new AppointmentRecurrenceExecutorService();