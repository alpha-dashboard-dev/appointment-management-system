import appointmentRepo from "../repositories/appointment.repository";
import participantRepo from "../repositories/appointmentParticipant.repository";
import historyRepo from "../repositories/appointmentHistory.repository";
import { ROLES } from "../utils/roles";
import { validateAppointmentParticipant } from "../utils/validator";
import { buildQueryOptions, extractRow } from "../utils/serviceHelpers";

class AppointmentParticipantService {

    async add(
        appointmentCode: string,
        data: any,
        actor: any
    ) {
        const appointment =
            await appointmentRepo.findByCode(
                appointmentCode
            );

        if (!appointment) {
            throw new Error(
                "Appointment not found"
            );
        }

        const appointmentRow = extractRow(appointment);
        const { user_code, user_type, user_role } = data;

        validateAppointmentParticipant({
            business_code: appointmentRow.business_code,
            user_code,
            user_type,
        });

        if (user_type === ROLES.SERVICE_STAFF) {
            if (
                !appointmentRow.appointment_start_date ||
                !appointmentRow.start_time ||
                !appointmentRow.end_time
            ) {
                throw new Error(
                    "Appointment is missing date or time"
                );
            }

            const dateStr =
                new Date(
                    appointmentRow
                        .appointment_start_date
                )
                    .toISOString()
                    .split("T")[0];

            const conflicts =
                await participantRepo
                    .findConflictsForStaff(
                        user_code,
                        dateStr,
                        appointmentRow.start_time,
                        appointmentRow.end_time,
                        appointmentCode
                    );

            if (conflicts.length > 0) {
                throw new Error(
                    "Service staff has conflicting appointment"
                );
            }
        }

        const participant =
            await participantRepo.create({
                business_code:
                    appointmentRow.business_code,
                appointment_code:
                    appointmentCode,
                user_code,
                user_type,
                user_role:
                    user_role || null,
                status: "active",
            });

        await historyRepo.create({
            business_code:
                appointmentRow.business_code,
            appointment_code:
                appointmentCode,
            action: "assigned",
            changed_by: actor?.userCode,
            old_value: null,
            new_value: {
                user_code,
                user_type,
                user_role: user_role || null,
            },
        });

        return participant;
    }

    async getByAppointmentCode(
        appointmentCode: string,
        query: any = {}
    ) {
        const appointment =
            await appointmentRepo.findByCode(
                appointmentCode
            );

        if (!appointment) {
            throw new Error(
                "Appointment not found"
            );
        }

        return await participantRepo.findByAppointment(
            appointmentCode,
            buildQueryOptions(query)
        );
    }

    async remove(appointmentCode: string, participantId: number) {
        const appointment = await appointmentRepo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const participant = await participantRepo.findById(participantId);
        if (!participant) throw new Error("Participant not found");

        return await participantRepo.delete(participantId);
    }
}

export default new AppointmentParticipantService();
