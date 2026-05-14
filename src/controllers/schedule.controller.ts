import { Request, Response } from "express";
import service from "../services/schedule.service";

class ScheduleController {

    async create(req: Request, res: Response) {
        try {
            const data = await service.create(req.body, req.user);
            return res.status(201).json({ success: true, message: "Schedule created", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const filters = {
                business_code: req.query.business_code,
                user_code: req.query.user_code,
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
            return res.status(200).json({ success: true, message: "Schedule updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await service.delete(Number(req.params.id), req.user);
            return res.status(200).json({ success: true, message: "Schedule deleted" });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async checkAvailability(req: Request, res: Response) {
        try {
            const { business_code, location_code, date, start_time, end_time } = req.query;
            const data = await service.checkAvailability(
                String(business_code || ""),
                String(location_code || ""),
                String(date || ""),
                String(start_time || ""),
                String(end_time || "")
            );
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
}

export default new ScheduleController();
