import { Request, Response } from "express";

import service from "../services/organization.service";
import {parseInclude} from "../utils/parseInclude";

class OrganizationController {

    async create(req: Request, res: Response) {

        try {
            const data = await service.create(
                req.body,
                req.user
            );

            return res.status(201).json({
                success: true,
                message: "Organization created",
                data,
            });

        } catch (err: any) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }

    // async getAll(req: Request, res: Response) {
    //
    //     try {
    //
    //         const data =
    //             await service.getAll(
    //                 req.query
    //             );
    //
    //         return res.status(200).json({
    //             success: true,
    //             data,
    //         });
    //
    //     } catch (err: any) {
    //         return res.status(500).json({
    //             success: false,
    //             message: err.message,
    //         });
    //     }
    // }

    async getAll(req: Request, res: Response) {

        try {
            let include = req.query.include ?? "";
            include = [
                {
                    alias: "businesses",
                    attributes: []
                }
            ]
            // console.log(includes)

            const data = await service.getAllOrganizations(
                {
                    ...req.query,
                    include
                },
                req.user
            );

            // console.log(data)

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

    async getByOrganizationCode(req: Request, res: Response) {

        try {
            const organizationCode = String(req.params.organizationCode)
            const data =
                await service.getByCode(
                    organizationCode,
                    // req.user
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

            const data =
                await service.update(
                    String(req.params.organizationCode),
                    req.body
                );

            return res.status(200).json({
                success: true,
                message:
                    "Organization updated",
                data,
            });

        } catch (err: any) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }

    async changeStatus(req: Request, res: Response) {

        try {

            const data =
                await service.changeStatus(
                    String(req.params.organizationCode),
                    req.body.status
                );

            return res.status(200).json({
                success: true,
                message:
                    "Organization status updated",
                data,
            });

        } catch (err: any) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }
}

export default new OrganizationController();
