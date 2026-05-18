
import { Request, Response } from "express";
import service from "../services/organization.service";

class OrganizationController {

    async create(req: Request, res: Response) {
        try {
            const data = await service.create(req.body);
            return res.status(201).json({ success: true, message: "Organization created", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const filters = { status: req.query.status };
            const data = await service.getAll(filters);
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async getByCode(req: Request, res: Response) {
        try {
            const data = await service.getByCode(String(req.params.organizationCode));
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const data = await service.update(String(req.params.organizationCode), req.body);
            return res.status(200).json({ success: true, message: "Organization updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async changeStatus(req: Request, res: Response) {
        try {
            const { status } = req.body;
            const data = await service.changeStatus(String(req.params.organizationCode), status);
            return res.status(200).json({ success: true, message: "Status updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message,  errors: err.errors || err, });
        }
    }
}

export default new OrganizationController();
