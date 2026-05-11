// Invoice controller — HTTP handlers for creating invoices and updating their status.
import { Request, Response } from "express";
import service from "../services/invoice.service";

class InvoiceController {

    async create(req: Request, res: Response) {
        try {
            const data = await service.create(req.body, req.user);
            return res.status(201).json({ success: true, message: "Invoice created", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const filters = {
                business_code: req.query.business_code,
                appointment_code: req.query.appointment_code,
                status: req.query.status,
            };
            const data = await service.getAll(filters);
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const data = await service.getById(Number(req.params.id));
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const data = await service.update(Number(req.params.id), req.body, req.user);
            return res.status(200).json({ success: true, message: "Invoice updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async changeStatus(req: Request, res: Response) {
        try {
            const { status } = req.body;
            const data = await service.changeStatus(Number(req.params.id), status, req.user);
            return res.status(200).json({ success: true, message: "Invoice status updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
}

export default new InvoiceController();
