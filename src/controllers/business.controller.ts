import { Request, Response } from "express";
import service from "../services/business.service";

class BusinessController {

    async create(req: Request, res: Response) {
        try {
            const data = await service.create(req.body, req.user);
            return res.status(201).json({ success: true, message: "Business created", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const filters = { organization_code: req.query.organization_code };
            const data = await service.getAll(filters);
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async getByCode(req: Request, res: Response) {
        try {
            const data = await service.getByCode(String(req.params.businessCode));
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const data = await service.update(String(req.params.businessCode), req.body, req.user);
            return res.status(200).json({ success: true, message: "Business updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    // async assignUser(req: Request, res: Response) {
    //     try {
    //         const businessCode = String(req.params.businessCode);
    //         const { user_code } = req.body;
    //
    //         // console.log(user_code, businessCode);
    //
    //         const data = await service.assignUser(
    //             businessCode,
    //             user_code,
    //             req.user
    //         );
    //
    //         return res.status(200).json({
    //             success: true,
    //             message: "User assigned successfully",
    //             data,
    //         });
    //
    //     } catch (err: any) {
    //         return res.status(400).json({
    //             success: false,
    //             message: err.message,
    //         });
    //     }
    // }

    async changeStatus(req: Request, res: Response) {
        try {
            const { status } = req.body;
            const data = await service.changeStatus(String(req.params.businessCode), status);
            return res.status(200).json({ success: true, message: "Status updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message,  errors: err.errors || err, });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await service.delete(String(req.params.businessCode), req.user);
            return res.status(200).json({ success: true, message: "Business deleted" });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
}

export default new BusinessController();