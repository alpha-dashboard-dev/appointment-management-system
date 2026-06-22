import repo from "../repositories/invoice.repository";
import appointmentRepo from "../repositories/appointment.repository";
import { validateInvoice, validateInvoiceStatus } from "../utils/validator";
import { ROLES } from "../utils/roles";
import {buildWhere} from "../utils/buildWhere";

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
       const where = buildWhere(query)

        if (actor && actor.userType !== ROLES.ADMIN) {
            query.business_code = actor.businessCode;
        }
        return repo.findAll({
            where,
            include: Array.isArray(query.include)
                ? query.include
                : [],
            limit: query.limit ? Number(query.limit) : undefined,
            offset: query.offset ? Number(query.offset) : undefined,
            order: [
                [
                    query.sort_by || "created_at",
                    query.sort_order || "DESC"
                ]
            ]
        });
    }

    async getById(id: number, query: any = {}, actor: any) {

        const invoice = await repo.findOne(
            {
                id: id
            },
            {
                include: Array.isArray(query.include) ? query.include : [],
            }

        );
        if (!invoice) throw new Error("Invoice not found");
        return invoice;
    }

    async update(id: number, data: any, actor: any) {
        const invoice = await repo.findOne(
            {
                id: id,
            }
        );
        if (!invoice) throw new Error("Invoice not found");

        const allowed: any = {};
        if (data.subtotal !== undefined) allowed.subtotal = data.subtotal;
        if (data.total !== undefined) allowed.total = data.total;
        if (data.date !== undefined) allowed.date = data.date;
        allowed.updated_by = actor?.userCode || null;

        return await repo.update(
            { id: id },
            allowed);
    }

    async changeStatus(id: number, status: string, actor: any) {
        validateInvoiceStatus({ status });
        const invoice = await repo.findOne(
            { id: id }
        );
        if (!invoice) throw new Error("Invoice not found");

        return await repo.update({ id: id }, {
            invoice_status: status,
            updated_by: actor?.userCode || null,
        });
    }

    async delete(id: number, actor: any) {
        const invoice = await repo.findOne({
                id: id
            });

        if (!invoice) throw new Error("Invoice not found");

        if (actor.userType !== ROLES.ADMIN) {
            throw new Error(
                "Only admin can permanently delete invoices"
            );
        }

        return await repo.delete({
            id: id
        });
    }
}

export default new InvoiceService();
