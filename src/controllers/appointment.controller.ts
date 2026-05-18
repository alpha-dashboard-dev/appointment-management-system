import { Request, Response } from "express";
import service from "../services/appointment.service";

class AppointmentController {

    async create(req: Request, res: Response) {
        try {
            // console.log(req.body);
            // console.log(req.user);
            const data = await service.create(req.body, req.user);
            return res.status(201).json({ success: true, message: "Appointment created", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message, errors: err.errors || err, });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const filters = {
                business_code: req.query.business_code,
                status: req.query.status,
            };
            const data = await service.getAll(filters);
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async getByCode(req: Request, res: Response) {
        try {
            const data = await service.getByCode(String(req.params.appointmentCode));
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const data = await service.update(String(req.params.appointmentCode), req.body, req.user);
            return res.status(200).json({ success: true, message: "Appointment updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async changeStatus(req: Request, res: Response) {
        try {
            const { status } = req.body;
            const data = await service.changeStatus(String(req.params.appointmentCode), status, req.user);
            return res.status(200).json({ success: true, message: "Status updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async reschedule(req: Request, res: Response) {
        try {
            const data = await service.reschedule(String(req.params.appointmentCode), req.body, req.user);
            return res.status(201).json({ success: true, message: "Appointment rescheduled", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async getHistory(req: Request, res: Response) {
        try {
            const data = await service.getHistory(String(req.params.appointmentCode));
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }

    async addParticipant(req: Request, res: Response) {
        try {
            const data = await service.addParticipant(String(req.params.appointmentCode), req.body, req.user);
            return res.status(201).json({ success: true, message: "Participant added", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async getParticipants(req: Request, res: Response) {
        try {
            const data = await service.getParticipants(String(req.params.appointmentCode));
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }

    async removeParticipant(req: Request, res: Response) {
        try {
            await service.removeParticipant(String(req.params.appointmentCode), Number(req.params.participantId), req.user);
            return res.status(200).json({ success: true, message: "Participant removed" });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async addService(req: Request, res: Response) {
        try {
            const data = await service.addService(String(req.params.appointmentCode), req.body, req.user);
            return res.status(201).json({ success: true, message: "Service added", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async getServices(req: Request, res: Response) {
        try {
            const data = await service.getServices(String(req.params.appointmentCode));
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }

    async removeService(req: Request, res: Response) {
        try {
            await service.removeService(String(req.params.appointmentCode), Number(req.params.serviceId), req.user);
            return res.status(200).json({ success: true, message: "Service removed" });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async addCharge(req: Request, res: Response) {
        try {
            const data = await service.addCharge(String(req.params.appointmentCode), req.body, req.user);
            return res.status(201).json({ success: true, message: "Charge added", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async getCharges(req: Request, res: Response) {
        try {
            const data = await service.getCharges(String(req.params.appointmentCode));
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }

    async removeCharge(req: Request, res: Response) {
        try {
            await service.removeCharge(String(req.params.appointmentCode), Number(req.params.chargeId), req.user);
            return res.status(200).json({ success: true, message: "Charge removed" });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async addDiscount(req: Request, res: Response) {
        try {
            const data = await service.addDiscount(String(req.params.appointmentCode), req.body, req.user);
            return res.status(201).json({ success: true, message: "Discount added", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async getDiscounts(req: Request, res: Response) {
        try {
            const data = await service.getDiscounts(String(req.params.appointmentCode));
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }

    async removeDiscount(req: Request, res: Response) {
        try {
            await service.removeDiscount(String(req.params.appointmentCode), Number(req.params.discountId), req.user);
            return res.status(200).json({ success: true, message: "Discount removed" });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async createRecurrence(req: Request, res: Response) {
        try {
            const data = await service.createRecurrence(req.body, req.user);
            return res.status(201).json({ success: true, message: "Recurrence created", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async getAllRecurrences(req: Request, res: Response) {
        try {
            const filters = {
                business_code: req.query.business_code,
                service_code: req.query.service_code,
                status: req.query.status,
            };
            const data = await service.getAllRecurrences(filters);
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async getRecurrenceById(req: Request, res: Response) {
        try {
            const data = await service.getRecurrenceById(Number(req.params.id));
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }

    async updateRecurrence(req: Request, res: Response) {
        try {
            const data = await service.updateRecurrence(Number(req.params.id), req.body, req.user);
            return res.status(200).json({ success: true, message: "Recurrence updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async deleteRecurrence(req: Request, res: Response) {
        try {
            await service.deleteRecurrence(Number(req.params.id), req.user);
            return res.status(200).json({ success: true, message: "Recurrence deleted" });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
}

export default new AppointmentController();