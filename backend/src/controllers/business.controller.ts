import { Request, Response } from "express";

import service from "../services/business.service";

class BusinessController {

    async create(req: Request, res: Response) {

        try {

            const data =
                await service.create(
                    req.body,
                    req.user
                );

            return res.status(201).json({
                success: true,
                message: "Business created",
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
            let include = req.query.include ?? ""
            include = [
                {
                    alias: "organization",
                    attributes: ""
                },
                // {
                //     alias: "owner",
                //     attributes: ""
                // }
            ]
            const data =
                await service.getAll(
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

            let include = req.query.include ?? ""
            include = [
                {
                    alias: "organization",
                    attributes: ""
                },
                {
                    alias: "users",
                    attributes: ""

                },
                {
                    alias: "services",
                    attributes: ""
                },
                {
                    alias: "locations",
                    attributes: ""
                },
                {
                    alias: "appointments",
                    attributes: ""
                }
            ]

            const businessCode =  String(req.params.businessCode)
            const data =
                await service.getByCode(
                    businessCode,
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

            return res.status(404).json({
                success: false,
                message: err.message,
            });
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

            const businessCode = String(req.params.businessCode)
            const data =
                await service.update(
                    businessCode,
                    req.body,
                    req.user
                );

            return res.status(200).json({
                success: true,
                message:
                    "Business updated",
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
    
                await service.delete(
                    String(req.params.businessCode),
                    req.user
                );
    
                return res.status(200).json({
                    success: true,
                    message: "Business permanently deleted"
                });
    
            } catch (err: any) {
    
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
        }
    
        // ======================
        // STATUS UPDATE
        // ======================
    
        async deactivate(req: Request, res: Response) {
    
            try {
                const businessCode = String(req.params.businessCode);
                const data = req.body
    
                await service.deactivate(
                    businessCode,
                    data,
                    req.user
                );
    
                return res.status(200).json({
                    success: true,
                    message: "Business deactivated successfully"
                });
    
            } catch (err: any) {
    
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
        }
}

export default new BusinessController();