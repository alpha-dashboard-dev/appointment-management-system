import appointmentRepo from "../repositories/appointment.repository";
import historyRepo from "../repositories/appointmentHistory.repository";
import { buildQueryOptions } from "../utils/serviceHelpers";

class AppointmentHistoryService {

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
                "appointment not found"
            );
        }

        return await historyRepo.findByAppointment(
            appointmentCode,
            buildQueryOptions(query)
        );
    }
}

export default new AppointmentHistoryService();
