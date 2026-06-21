import { Request, Response } from "express";
import service from "../services/appointmentCharge.service";

class AppointmentChargeController {

    async create(req: Request, res: Response) {
        try {
            const data = await service.add(
                String(req.params.appointmentCode),
                req.body
            );

            return res.status(201).json({
                success: true,
                message: "Charge added",
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
            const data =
                await service.getByAppointmentCode(
                    String(req.params.appointmentCode),
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

    async delete(req: Request, res: Response) {
        try {
            await service.remove(
                String(req.params.appointmentCode),
                Number(req.params.chargeId)
            );

            return res.status(200).json({
                success: true,
                message: "Charge removed",
            });

        } catch (err: any) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }
}

export default new AppointmentChargeController();
