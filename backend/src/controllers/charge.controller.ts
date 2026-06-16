import { Request, Response } from "express";
import service from "../services/charge.service";

class ChargeController {

    async create(req: Request, res: Response) {
        try {
            const data = await service.create(req.body, req.user);
            return res.status(201).json({ success: true, message: "Charge created", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const data = await service.getAll(req.query, req.user);
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async getByCode(req: Request, res: Response) {
        try {
            const data = await service.getByCode(
                String(req.params.chargeCode),
                req.user,
                req.query
            );
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const data = await service.update(String(req.params.chargeCode), req.body, req.user);
            return res.status(200).json({ success: true, message: "Charge updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async deactivate(req: Request, res: Response) {

        try {

            const data = await service.deactivate(
                    String(req.params.chargeCode),
                    req.body.status
                );

            return res.status(200).json({
                success: true,
                message: "Status updated",
                data,
            });

        } catch (err: any) {

            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await service.delete(String(req.params.chargeCode), req.user);
            return res.status(200).json({ success: true, message: "Charge deleted" });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
}

export default new ChargeController();