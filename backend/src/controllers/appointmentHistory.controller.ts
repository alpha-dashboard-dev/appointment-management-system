import { Request, Response } from "express";
import service from "../services/appointmentHistory.service";

class AppointmentHistoryController {

    async getByAppointmentCode(req: Request, res: Response) {
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
}

export default new AppointmentHistoryController();
