// Authentication routes: register, login, token refresh, logout.
// Login and register are rate-limited to slow down brute-force attempts.
import { Router } from "express";
import rateLimit from "express-rate-limit";
import authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router();

// Allow max 10 attempts per IP per 15 minutes on sensitive auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts. Please try again later." },
});

// POST /api/auth/register — admin-only user creation
router.post(
    "/register",
    authLimiter,
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    authController.register
);

// POST /api/auth/login — returns access + refresh tokens
router.post("/login", authLimiter, authController.login);

// POST /api/auth/refresh — exchange a valid refresh token for new tokens
router.post("/refresh", authController.refresh);

// POST /api/auth/logout — invalidates the current session
router.post(
    "/logout",
    authenticate,
    authController.logout
);

export default router;
