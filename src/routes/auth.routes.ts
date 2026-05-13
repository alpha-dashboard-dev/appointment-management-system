import { Router } from "express";
import authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router();

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