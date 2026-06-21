import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access token required",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded: any = verifyAccessToken(token);

        // console.log(decoded)

        req.user = {
            userCode: decoded.userCode,
            userType: decoded.userType,
            businessCode: decoded.businessCode,
        } as any;

        next();

    } catch (err: any) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
