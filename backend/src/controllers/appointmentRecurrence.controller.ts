import { Request, Response } from "express";
import service from "../services/appointmentRecurrence.service";

class AppointmentRecurrenceController {

    async create(req: Request, res: Response) {
        try {
            const data = await service.create(
                req.body,
                req.user
            );

            return res.status(201).json({
                success: true,
                message: "Recurrence created",
                data,
            });

        } catch (err: any) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const data = await service.getAll(
                req.query,
                req.user
            );

            return res.status(200).json({
                success: true,
                data,
            });

        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const data = await service.getById(
                Number(req.params.id),
                req.query
            );

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
            const data = await service.update(
                Number(req.params.id),
                req.body
            );

            return res.status(200).json({
                success: true,
                message: "Recurrence updated",
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
            await service.remove(
                Number(req.params.id)
            );

            return res.status(200).json({
                success: true,
                message: "Recurrence deleted",
            });

        } catch (err: any) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }
}

export default new AppointmentRecurrenceController();
