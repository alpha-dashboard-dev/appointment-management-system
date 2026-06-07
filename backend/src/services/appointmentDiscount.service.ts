import appointmentRepo from "../repositories/appointment.repository";
import appointmentDiscountRepo from "../repositories/appointmentDiscount.repository";
import { validateAppointmentDiscount } from "../utils/validator";

class AppointmentDiscountService {

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

    async add(
        appointmentCode: string,
        data: any
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

        const appointmentRow: any =
            appointment.dataValues || appointment;

        const {
            service_code,
            discount_uom,
            discount_value,
        } = data;

        validateAppointmentDiscount({
            business_code:
                appointmentRow.business_code,
            service_code,
            appointment_code:
                appointmentCode,
            discount_uom,
            discount_value,
        });

        return await appointmentDiscountRepo.create({
            business_code:
                appointmentRow.business_code,
            service_code,
            appointment_code:
                appointmentCode,
            discount_uom,
            discount_value,
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
                "Appointment not found"
            );
        }

        return await appointmentDiscountRepo.findByAppointment(
            appointmentCode,
            this.buildQueryOptions(query)
        );
    }

    async remove(
        appointmentCode: string,
        discountId: number
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

        const item =
            await appointmentDiscountRepo.findById(
                discountId
            );

        if (!item) {
            throw new Error(
                "Appointment discount not found"
            );
        }

        return await appointmentDiscountRepo.delete(
            discountId
        );
    }
}

export default new AppointmentDiscountService();
