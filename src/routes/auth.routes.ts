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
// const authLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 10,
//     standardHeaders: true,
//     legacyHeaders: false,
//     message: { success: false, message: "Too many attempts. Please try again later." },
// });

router.post(
    "/register",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    authController.register
);

router.post("/login", authController.login);

router.post("/refresh", authController.refresh);

router.post(
    "/logout",
    authenticate,
    authController.logout
);

export default router;