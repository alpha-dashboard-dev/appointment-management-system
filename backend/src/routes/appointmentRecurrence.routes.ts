import { Router } from "express";
import controller from "../controllers/appointmentRecurrence.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router();

const MANAGERS = [
    ROLES.ADMIN,
    ROLES.BUSINESS_OWNER,
    ROLES.OPERATIONAL_STAFF,
];

router.post(
    "/",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.create
);

router.get(
    "/",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.getAll
);

router.get(
    "/:id",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.getById
);

router.put(
    "/:id",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.update
);

router.delete(
    "/:id",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.delete
);

export default router;
