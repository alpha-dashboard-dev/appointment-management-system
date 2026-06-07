import { Request, Response } from "express";
import service from "../services/locationService.service";

class LocationServiceController {

    async create(req: Request, res: Response) {
        try {
            const data = await service.create(req.body, req.user);
            return res.status(201).json({ success: true, message: "Location service created", data });
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

    async update(req: Request, res: Response) {
        try {
            const data = await service.update(Number(req.params.id), req.body, req.user);
            return res.status(200).json({ success: true, message: "Location service updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await service.delete(Number(req.params.id), req.user);
            return res.status(200).json({ success: true, message: "Location service deleted" });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
}

export default new LocationServiceController();