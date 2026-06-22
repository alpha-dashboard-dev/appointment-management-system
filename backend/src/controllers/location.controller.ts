import { Request, Response } from "express";
import service from "../services/location.service";

class LocationController {

    async create(req: Request, res: Response) {
        try {
            const data = await service.create(req.body, req.user);
            return res.status(201).json({ success: true, message: "Location created", data });
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
            ]
            const data = await service.getAll(
                {
                    ...req.query,
                    include
                },
                req.user
            );
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async getByCode(req: Request, res: Response) {
        try {
            let include = req.query.include ?? "";

            include = [
                {
                    alias: "business",
                    attributes: [],
                },
            ]
            const locationCode = String(req.params.locationCode)
            const data = await service.getByCode(
                locationCode,
                req.user,
                {
                    ...req.query,
                    include
                }
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
            const locationCode = String(req.params.locationCode)
            const data = await service.update(locationCode, req.body, req.user);
            return res.status(200).json({ success: true, message: "Location updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await service.delete(String(req.params.locationCode), req.user);
            return res.status(200).json({ success: true, message: "Location deleted" });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async deactivate(req: Request, res: Response) {
        try {
            const locationCode = String(req.params.locationCode);
            const { status } = req.body;

            const data = await service.deactivate(locationCode, status, req.user);

            return res.status(200).json({
                success: true,
                message: "Location status updated successfully",
                data,
            });

        } catch (err: any) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }
}

export default new LocationController();
