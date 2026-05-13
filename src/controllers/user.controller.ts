import { Request, Response } from "express";
import service from "../services/user.service";

class UserController {

    async create(req: Request, res: Response) {
        try {
            const data = await service.create(req.body, req.user);

            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data,
            });

        } catch (err: any) {
            return res.status(400).json({
                success: false,
                message: err.message,
                errors: err.errors || err,
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const filters = {
                organization_code: req.query.organization_code,
                business_code: req.query.business_code,
                user_type: req.query.user_type,
                is_active: req.query.is_active,
            };

            const data = await service.getAll(filters);

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

    async getById(req: Request, res: Response) {
        try {
            const userCode = String(req.params.userCode);

            const data = await service.getByCode(userCode);

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
            const userCode = String(req.params.userCode);

            const data = await service.update(
                userCode,
                req.body,
                req.user
            );

            return res.status(200).json({
                success: true,
                message: "User updated successfully",
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
            const userCode = String(req.params.userCode);

            await service.delete(userCode, req.user);

            return res.status(200).json({
                success: true,
                message: "User deactivated successfully",
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
            const userCode = String(req.params.userCode);
            const { is_active } = req.body;

            const data = await service.changeStatus(userCode, is_active, req.user);

            return res.status(200).json({
                success: true,
                message: "User status updated successfully",
                data,
            });

        } catch (err: any) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }

    // async assignBusiness(req: Request, res: Response) {
    //     try {
    //         const userCode = String(req.params.userCode);
    //         const { business_code } = req.body;
    //
    //         const data = await service.assignBusiness(
    //             userCode,
    //             business_code,
    //             req.user
    //         );
    //
    //         return res.status(200).json({
    //             success: true,
    //             message: "Business assigned successfully",
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
}

export default new UserController();