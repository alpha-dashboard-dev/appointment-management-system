// Global error-handling middleware.
// Must be registered LAST in app.ts (after all routes) so Express routes
// errors here when next(err) is called or an unhandled throw escapes.
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal server error";

    // Avoid leaking stack traces to clients in production
    const body: any = { success: false, message };
    if (process.env.NODE_ENV !== "production") {
        body.stack = err.stack;
    }

    res.status(status).json(body);
};

// Catches requests to routes that do not exist and returns a clean JSON 404.
export const notFoundHandler = (_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: "Route not found" });
};
