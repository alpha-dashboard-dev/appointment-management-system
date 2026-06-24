import { Request, Response } from "express";
import service from "../services/appointment.service";

class AppointmentController {

    async create(req: Request, res: Response) {
        try {
            const data = await service.create(req.body, req.user);
            return res.status(201).json({ success: true, message: "appointment created", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message, errors: err.errors || err, });
        }
    }
    async getAll(req: Request, res: Response) {

        try {
            let include = req.query.include ?? "";
            include = [
                {
                    alias: "business",
                    attributes: ["name"],
                },
                {
                    alias: "creator",
                    attributes: ["name"],
                },
                {
                    alias: "location",
                    attributes: ["address", "street", "city"],
                }
            ]
            // console.log(include)
            const data = await service.getAll(
                    {
                        ...req.query,
                        include
                    },
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

    async getByCode(req: Request, res: Response) {
        try {
            let include = req.query.include ?? "";
            include = [
                {
                    alias: "business",
                    attributes: [],
                },
                {
                    alias: "services",
                    attributes: [],
                }
            ]
            const appointmentCode = String(req.params.appointmentCode)
            const data = await service.getByCode(
                appointmentCode,
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

    async update(req: Request, res: Response) {
        try {
            const data = await service.update(String(req.params.appointmentCode), req.body, req.user);
            return res.status(200).json({ success: true, message: "appointment updated", data });
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

    async respondToReschedule(req: Request, res: Response) {
        try {
            const { action } = req.body;
            const data = await service.respondToReschedule(String(req.params.appointmentCode), action, req.user);
            return res.status(200).json({ success: true, message: `Reschedule ${action}`, data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async reschedule(req: Request, res: Response) {
        try {
            const data = await service.reschedule(String(req.params.appointmentCode), req.body, req.user);
            return res.status(201).json({ success: true, message: "appointment rescheduled", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    // ─── Approval Flow ────────────────────────────────────────────────────────

    async checkAvailability(req: Request, res: Response) {
        try {
            const data = await service.checkAvailability(String(req.params.appointmentCode), req.user);
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async approveWithStaff(req: Request, res: Response) {
        try {
            const { staff_code, selected_charge_codes  } = req.body;
            if (!staff_code) {
                return res.status(400).json({ success: false, message: "staff_code is required" });
            }
            // console.log(req.user)
            const data = await service.approveWithStaff(String(req.params.appointmentCode), String(staff_code), req.user, selected_charge_codes || []
            );
            return res.status(200).json({ success: true, message: "appointment approved and staff assigned", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async pricingPreview(req: Request, res: Response) {
        try {
            const data = await service.getPricingPreview(req.body, req.user);
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
}

export default new AppointmentController();