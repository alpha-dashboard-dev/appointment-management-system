import { Request, Response, NextFunction } from "express";

export const authorizeRoles =
    (...roles: string[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as any;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!roles.includes(user.userType)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: insufficient permissions",
            });
        }

        next();
    };
