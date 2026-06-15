import appointmentRepo from "../repositories/appointment.repository";
import appointmentChargeRepo from "../repositories/appointmentCharge.repository";
import { validateAppointmentCharge } from "../utils/validator";
import { buildQueryOptions, extractRow } from "../utils/serviceHelpers";

class AppointmentChargeService {

    async add(appointmentCode: string, data: any) {
        const appointment =
            await appointmentRepo.findByCode(
                appointmentCode
            );

        if (!appointment) {
            throw new Error(
                "appointment not found"
            );
        }

        const appointmentRow = extractRow(appointment);
        const { charge_code, charge_uom, charge_value } = data;

        validateAppointmentCharge({
            business_code: appointmentRow.business_code,
            appointment_code: appointmentCode,
        });

        return await appointmentChargeRepo.create({
            business_code:
                appointmentRow.business_code,
            appointment_code:
                appointmentCode,
            charge_code:
                charge_code || null,
            charge_uom:
                charge_uom || null,
            charge_value:
                charge_value || null,
        });
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
                "appointment not found"
            );
        }

        return await appointmentChargeRepo.findByAppointment(
            appointmentCode,
            buildQueryOptions(query)
        );
    }

    async remove(appointmentCode: string, chargeId: number) {
        const appointment = await appointmentRepo.findByCode(appointmentCode);
        if (!appointment) throw new Error("appointment not found");

        const item = await appointmentChargeRepo.findById(chargeId);
        if (!item) throw new Error("appointment charge not found");

        return await appointmentChargeRepo.delete(chargeId);
    }
}

export default new AppointmentChargeService();
