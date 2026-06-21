import repo from "../repositories/invoice.repository";
import appointmentRepo from "../repositories/appointment.repository";
import { validateInvoice, validateInvoiceStatus } from "../utils/validator";
import { ROLES } from "../utils/roles";

class InvoiceService {

    async create(data: any, actor: any) {
        const {
            business_code,
            appointment_code,
            subtotal,
            total,
            date,
        } = data;

        validateInvoice(data);

        const appointment = await appointmentRepo.findByCode(appointment_code);
        if (!appointment) throw new Error("appointment not found");

        if (actor && actor.userType !== ROLES.ADMIN) {
            const apptBusiness = appointment.dataValues?.business_code ?? appointment.business_code;
            if (apptBusiness !== actor.businessCode) {
                throw new Error("Access denied: appointment does not belong to your business");
            }
        }

        return await repo.create({
            business_code,
            appointment_code,
            subtotal: subtotal || null,
            total: total || null,
            invoice_status: "unpaid",
            date: date || new Date().toISOString().split("T")[0],
            updated_by: actor?.userCode || null,
        });
    }

    async getAll(query: any = {}, actor?: any) {
        const filters: any = {
            business_code:
                query.business_code,

            appointment_code:
                query.appointment_code,

            status: query.status,
        };

        const options = {
            include:
                query.include
                    ? String(query.include)
                        .split(",")
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

        if (actor && actor.userType !== ROLES.ADMIN) {
            filters.business_code = actor.businessCode;
        }
        return await repo.findAll(
            filters,
            options
        );
    }

    async getById(
        id: number,
        query: any = {}
    ) {
        const options = {
            include:
                query.include
                    ? String(query.include)
                        .split(",")
                    : [],
        };

        const invoice = await repo.findById(
            id,
            options
        );
        if (!invoice) throw new Error("Invoice not found");
        return invoice;
    }

    async update(id: number, data: any, actor: any) {
        const invoice = await repo.findById(id);
        if (!invoice) throw new Error("Invoice not found");

        const allowed: any = {};
        if (data.subtotal !== undefined) allowed.subtotal = data.subtotal;
        if (data.total !== undefined) allowed.total = data.total;
        if (data.date !== undefined) allowed.date = data.date;
        allowed.updated_by = actor?.userCode || null;

        return await repo.update(id, allowed);
    }

    async changeStatus(id: number, status: string, actor: any) {
        validateInvoiceStatus({ status });
        const invoice = await repo.findById(id);
        if (!invoice) throw new Error("Invoice not found");

        return await repo.update(id, {
            invoice_status: status,
            updated_by: actor?.userCode || null,
        });
    }
}

export default new InvoiceService();
