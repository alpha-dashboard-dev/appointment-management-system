import { Request, Response } from "express";
import service from "../services/appointmentParticipant.service";

class AppointmentParticipantController {

    async create(req: Request, res: Response) {
        try {
            const data = await service.add(
                String(req.params.appointmentCode),
                req.body,
                req.user
            );

            return res.status(201).json({
                success: true,
                message: "Participant added",
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

    async update(req: Request, res: Response) {

        try {
            const {id, userCode} = req.params;
            console.log(id, userCode);
            const data = await service.update(id, userCode, req.body);

            return res.status(200).json(
                {success: true,
                message:
                    "appointment Participant updated",
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
                String(req.params.appointmentCode),
                Number(req.params.participantId),
                String(req.params.userCode)

            );

            return res.status(200).json({
                success: true,
                message: "Participant removed",
            });

        } catch (err: any) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }
}

export default new AppointmentParticipantController();
