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

    async bulkCreate(req: Request, res: Response) {
        try {
            const entries = req.body;
            if (!Array.isArray(entries) || entries.length === 0) {
                return res.status(400).json({ success: false, message: "Request body must be a non-empty array" });
            }
            const data = await service.bulkCreate(entries, req.user);
            return res.status(201).json({ success: true, message: "Schedules created", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            let include = req.query.include ?? "";
            include = [
                {
                    alias: "business",
                    attributes: [],
                },
                {
                    alias: "location",
                    attributes: [],
                }
            ]
            const data = await service.getAll(
                {
                    ...req.query,
                    include,
                },
                req.user
            );
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const data = await service.getById(
                Number(req.params.id),
                req.user,
                req.query
            );
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }

    async getByAnyField(req: Request, res: Response) {

        try {

            let include = req.query.include ?? "";

            include = [
                {
                    alias: "business",
                    attributes: [],
                },
                {
                    alias: "location",
                    attributes: [],
                }
            ]

            const user = req.user;
            const data = await service.getOne(
                {
                    ...req.query,
                    include
                },
                user,
            )

            return res.status(200).json({
                success: true,
                data,
            });

        } catch (err: any) {

            return res.status(404).json({
                success: false,
                message: err.message,
            });
        }
    }


    async update(req: Request, res: Response) {
        try {
            const scheduleId = Number(req.params.id);
            const data = await service.update(scheduleId, req.body, req.user);
            return res.status(200).json({ success: true, message: "Schedule updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const scheduleId = Number(req.params.id);
            await service.delete(scheduleId, req.user);
            return res.status(200).json({ success: true, message: "Schedule deleted" });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async checkAvailability(req: Request, res: Response) {
        try {
            const businessCode = req.query.business_code ?? req.query.businessCode;
            const locationCode = req.query.location_code ?? req.query.locationCode;
            const date = req.query.date;
            const startTime = req.query.start_time ?? req.query.startTime;
            const endTime = req.query.end_time ?? req.query.endTime;

            const data = await service.checkAvailability(
                String(businessCode || ""),
                String(locationCode || ""),
                String(date || ""),
                String(startTime || ""),
                String(endTime || "")
            );
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
}

export default new ScheduleController();
