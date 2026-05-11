// Role-based access control middleware.
// Use after authenticate() to restrict a route to specific user roles.
// Example: authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER)
import { Request, Response, NextFunction } from "express";

export const authorizeRoles =
    (...roles: string[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as any;

        // Should never happen if authenticate() runs first, but guard anyway
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // User's role must be in the allowed list
        if (!roles.includes(user.userType)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: insufficient permissions",
            });
        }

        next();
    };
