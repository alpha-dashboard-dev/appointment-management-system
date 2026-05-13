import repo from "../repositories/invoice.repository";
import appointmentRepo from "../repositories/appointment.repository";
import { validateInvoice, validateInvoiceStatus } from "../utils/validator";

class InvoiceService {

    async create(data: any, actor: any) {
        const { businessCode, appointmentCode, subtotal, total, date } = data;

        validateInvoice(data);

        const appointment = await appointmentRepo.findByCode(appointmentCode);
        if (!appointment) throw new Error("Appointment not found");

        return await repo.create({
            businessCode,
            appointmentCode,
            subtotal: subtotal || null,
            total: total || null,
            status: "DRAFT",
            date: date || new Date().toISOString().split("T")[0],
            updatedBy: actor?.userCode || null,
        });
    }

    async getAll(filters: any = {}) {
        return await repo.findAll(filters);
    }

    async getById(id: number) {
        const invoice = await repo.findById(id);
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
        allowed.updatedBy = actor?.userCode || null;

        return await repo.update(id, allowed);
    }

    async changeStatus(id: number, status: string, actor: any) {
        validateInvoiceStatus({ status });
        const invoice = await repo.findById(id);
        if (!invoice) throw new Error("Invoice not found");

        return await repo.update(id, {
            status,
            updatedBy: actor?.userCode || null,
        });
    }
}

export default new InvoiceService();
