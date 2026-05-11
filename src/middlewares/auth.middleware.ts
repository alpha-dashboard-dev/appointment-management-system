// Authentication middleware.
// Validates the Bearer token on every protected route and attaches the
// decoded user info to req.user so downstream handlers can use it.
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        // Expect header: "Authorization: Bearer <token>"
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access token required",
            });
        }

        const token = authHeader.split(" ")[1];

        // Throws if token is expired or tampered with
        const decoded: any = verifyAccessToken(token);

        // Attach user context so controllers/services can access it via req.user
        req.user = {
            userCode: decoded.user_code,
            userType: decoded.user_type,
            businessCode: decoded.business_code,
            organizationCode: decoded.organization_code,
        } as any;

        next();

    } catch (err: any) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
