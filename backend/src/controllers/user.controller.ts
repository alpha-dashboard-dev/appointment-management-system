import { Request, Response } from "express";

import service from "../services/user.service";

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
                message:
                    "User created successfully",
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
        //     let query=req.query.include??"";
        //
        //
        //
        //     [{
        //
        //         "alias":"business",
        //
        //         "attributes":[]
        //
        //     }]
            const data =
                await service.getAll(
                    {
                        ...req.query
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

    async getByCode(req: Request, res: Response) {

        try {

            const data =
                await service.getByCode(
                    String(req.params.userCode),
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

    // ======================
    // UPDATE USER
    // ======================

    async update(req: Request, res: Response) {

        try {

            const userCode =
                String(req.params.userCode);

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
    // DELETE USER (SOFT)
    // ======================

    async delete(req: Request, res: Response) {

        try {

            const userCode =
                String(req.params.userCode);

            await service.delete(
                userCode,
                req.user
            );

            return res.status(200).json({
                success: true,
                message:
                    "User deactivated successfully",
            });

        } catch (err: any) {

            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }

    // ======================
    // STATUS UPDATE
    // ======================

    async changeStatus(req: Request, res: Response) {

        try {

            const userCode =
                String(req.params.userCode);

            const { is_active } = req.body;

            const data =
                await service.changeStatus(
                    userCode,
                    is_active,
                    req.user
                );

            return res.status(200).json({
                success: true,
                message:
                    "User status updated",
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

export default new UserController();