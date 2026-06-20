import { Request, Response } from "express";

import service from "../services/user.service";
import {parseInclude} from "../utils/parseInclude";

class UserController {

    // ======================
    // CREATE USER
    // ======================

    async create(req: Request, res: Response) {

        try {

            const data =
                await service.create(
                    req.body,
                    req.user
                );

            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data,
            });

        } catch (err: any) {

            return res.status(400).json({
                success: false,
                message: err.message,
                errors: err.errors || null,
            });
        }
    }

    // ======================
    // GET ALL USERS (UNIFIED)
    // ======================


    async getAll(req: Request, res: Response) {

        try {
            let include = req.query.include ?? "";
            include = [
                {
                    alias: "business",
                    attributes: [],
                },
            ]
            // console.log(include)
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

    // ======================
    // GET SINGLE USER
    // ======================

    async getByUserCode(req: Request, res: Response) {

        try {
            const userCode = String(req.params.userCode)
            const data =
                await service.getByCode(
                    userCode,
                    req.user,
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

    async getByAnyField(req: Request, res: Response) {

        try {
            const { field, value } = req.query;
            const user = req.user;
            const data = await service.getOne(
                {[field as string]: value},
                user,
                // req.query
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

    // ======================
    // UPDATE USER
    // ======================

    async update(req: Request, res: Response) {

        try {

            const userCode = String(req.params.userCode);

            const data =
                await service.update(
                    userCode,
                    req.body,
                    req.user
                );

            return res.status(200).json({
                success: true,
                message:
                    "User updated successfully",
                data,
            });

        } catch (err: any) {

            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }

    // ======================
    // DELETE USER 
    // ======================

    async delete(req: Request, res: Response) {

        try {

            await service.delete(
                String(req.params.userCode),
                req.user
            );

            return res.status(200).json({
                success: true,
                message: "User permanently deleted"
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
        const userCode = String(req.params.userCode);
        const {data} = req.body
        
        await service.deactivate(
            userCode,
            data,
            req.user
        );

        return res.status(200).json({
            success: true,
            message: "User deactivated successfully"
        });

    } catch (err: any) {

        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
}
    // async changeStatus(req: Request, res: Response) {

    //     try {

    //         const userCode = String(req.params.userCode);

    //         const { is_active } = req.body;

    //         const data =
    //             await service.changeStatus(
    //                 userCode,
    //                 is_active,
    //                 req.user
    //             );

    //         return res.status(200).json({
    //             success: true,
    //             message: "User status updated",
    //             data,
    //         });

    //     } catch (err: any) {

    //         return res.status(400).json({
    //             success: false,
    //             message: err.message,
    //         });
    //     }
    // }
}

export default new UserController();