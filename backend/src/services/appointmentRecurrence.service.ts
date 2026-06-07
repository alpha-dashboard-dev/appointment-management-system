import appointmentRecurrenceRepo from "../repositories/appointmentRecurrence.repository";
import { ROLES } from "../utils/roles";
import { validateAppointmentRecurrence } from "../utils/validator";

class AppointmentRecurrenceService {

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

    async create(data: any, actor: any) {
        if (actor && actor.userType !== ROLES.ADMIN) {
            data.business_code = actor.businessCode;
        }

        validateAppointmentRecurrence(data);

        return await appointmentRecurrenceRepo.create({
            business_code: data.business_code,
            service_code: data.service_code,
            recurrence_uom: data.recurrence_uom,
            recurrence_value:
                data.recurrence_value ??
                data.recurrence_Value,
            status: data.status || "active",
            auto_cancel_after_days:
                data.auto_cancel_after_days || null,
            reschedule_after_days:
                data.reschedule_after_days || null,
        });
    }

    async getAll(query: any = {}, actor?: any) {
        const filters: any = {
            business_code:
                query.business_code,
            service_code:
                query.service_code,
            status: query.status,
        };

        if (actor && actor.userType !== ROLES.ADMIN) {
            filters.business_code = actor.businessCode;
        }

        return await appointmentRecurrenceRepo.findAll(
            filters,
            this.buildQueryOptions(query)
        );
    }

    async getById(id: number, query: any = {}) {
        const recurrence =
            await appointmentRecurrenceRepo.findById(
                id,
                this.buildQueryOptions(query)
            );

        if (!recurrence) {
            throw new Error("Recurrence not found");
        }

        return recurrence;
    }

    async update(id: number, data: any) {
        const recurrence =
            await appointmentRecurrenceRepo.findById(id);

        if (!recurrence) {
            throw new Error("Recurrence not found");
        }

        const allowed: any = {};
        const fields = [
            "recurrence_uom",
            "recurrence_value",
            "status",
            "auto_cancel_after_days",
            "reschedule_after_days",
        ];

        for (const field of fields) {
            if (data[field] !== undefined) {
                allowed[field] = data[field];
            }
        }

        if (
            allowed.recurrence_value === undefined &&
            data.recurrence_Value !== undefined
        ) {
            allowed.recurrence_value =
                data.recurrence_Value;
        }

        return await appointmentRecurrenceRepo.update(
            id,
            allowed
        );
    }

    async remove(id: number) {
        const recurrence =
            await appointmentRecurrenceRepo.findById(id);

        if (!recurrence) {
            throw new Error("Recurrence not found");
        }

        return await appointmentRecurrenceRepo.delete(id);
    }
}

export default new AppointmentRecurrenceService();
