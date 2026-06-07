import appointmentRepo from "../repositories/appointment.repository";
import historyRepo from "../repositories/appointmentHistory.repository";

class AppointmentHistoryService {

    private buildQueryOptions(query: any = {}) {
        return {
            include:
                query.include
                    ? String(query.include).split(",")
                    : [],

            limit:
                query.limit
                    ? Number(query.limit)
                    : undefined,

            offset:
                query.offset
                    ? Number(query.offset)
                    : undefined,

            order: [
                [
                    query.sort_by || "created_at",
                    query.sort_order || "DESC",
                ],
            ],
        };
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

        return await historyRepo.findByAppointment(
            appointmentCode,
            this.buildQueryOptions(query)
        );
    }
}

export default new AppointmentHistoryService();
