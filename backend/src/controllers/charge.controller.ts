import { Request, Response } from "express";
import service from "../services/charge.service";

class ChargeController {

    async create(req: Request, res: Response) {
        try {
            const data = await service.create(req.body, req.user);
            return res.status(201).json({ success: true, message: "Charge created", data });
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
                req.user);
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async getByCode(req: Request, res: Response) {
        try {
            const chargeCode = String(req.params.chargeCode)
            const data = await service.getByCode(
                chargeCode,
                req.user,
                // req.query
            );
            return res.status(200).json({ success: true, data });
        } catch (err: any) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }

    async getByAnyField(req: Request, res: Response) {
    
            try {
                // console.log(req.query)
                const { include, ...where } = req.query;
                // console.log(field, value)
                const user = req.user;
                const data = await service.getOne(
                    where,
                    user,
                    {
                        include
                    }
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
            const chargeCode = String(req.params.chargeCode)
            const data = await service.update(chargeCode, req.body, req.user);
            return res.status(200).json({ success: true, message: "Charge updated", data });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    async deactivate(req: Request, res: Response) {

        try {
            const chargeCode = String(req.params.chargeCode)
            const data = req.body
            await service.deactivate(
                chargeCode,
                data,
                req.user
            );

            return res.status(200).json({
                success: true,
                message: "Status updated",
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
            await service.delete(String(req.params.chargeCode), req.user);
            return res.status(200).json({ success: true, message: "Charge deleted" });
        } catch (err: any) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
}

export default new ChargeController();