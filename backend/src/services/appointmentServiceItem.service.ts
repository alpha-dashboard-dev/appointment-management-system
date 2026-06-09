import appointmentRepo from "../repositories/appointment.repository";
import appointmentServiceRepo from "../repositories/appointmentService.repository";
import { validateAppointmentService } from "../utils/validator";
import { buildQueryOptions, extractRow } from "../utils/serviceHelpers";

class AppointmentServiceItemService {

    async add(appointmentCode: string, data: any) {
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
        validateAppointmentService({
            business_code: appointmentRow.business_code,
            service_code: data.service_code,
        });

        return await appointmentServiceRepo.create({
            business_code:
                appointmentRow.business_code,
            service_code:
                data.service_code,
            appointment_code:
                appointmentCode,
        });
    }

    async getByAppointmentCode(appointmentCode: string, query: any = {})
    {
        const appointment = await appointmentRepo.findByCode(appointmentCode);

        if (!appointment) {
            throw new Error(
                "Appointment not found"
            );
        }

        return await appointmentServiceRepo.findByAppointment(
            appointmentCode,
            this.buildQueryOptions(query)
        );
    }

    async remove(appointmentCode: string, serviceId: number) {
        const appointment = await appointmentRepo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        const item = await appointmentServiceRepo.findById(serviceId);
        if (!item) throw new Error("Appointment service not found");

        return await appointmentServiceRepo.delete(serviceId);
    }
}

export default new AppointmentServiceItemService();
