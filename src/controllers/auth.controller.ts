// Auth controller — HTTP handlers for registration, login, token refresh, and logout.
// Thin layer: validates input then delegates all logic to auth.service.
import { Request, Response } from "express";
import service from "../services/auth.service";
import {validateUser} from "../utils/validator";

class AuthController {

    async register(req: Request, res: Response) {
        try {
            const payload = req.body;
            validateUser(payload)
            const user = await service.register(payload);

            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: user,
            });

        } catch (err: any) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email) return res.status(400).json({ message: "email is required" });
            if (!password) return res.status(400).json({ message: "password is required" });

            const tokens = await service.login(email, password);

            return res.json({
                success: true,
                data: tokens,
            });

        } catch (err: any) {
            return res.status(401).json({
                success: false,
                message: err.message,
            });
        }
    }

    async refresh(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    message: "refreshToken is required",
                });
            }

            const tokens = await service.refresh(refreshToken);

            return res.json({
                success: true,
                data: tokens,
            });

        } catch (err: any) {
            return res.status(401).json({
                success: false,
                message: err.message,
            });
        }
    }

    async logout(req: Request, res: Response) {
        try {
            const userCode = (req.user as any)?.userCode;

            if (!userCode) {
                return res.status(400).json({
                    message: "Not authenticated",
                });
            }

            await service.logout(userCode);

            return res.json({
                success: true,
                message: "Logged out successfully",
            });

        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }
}

export default new AuthController();