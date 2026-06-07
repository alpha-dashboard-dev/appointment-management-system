import { Router } from "express";
import controller from "../controllers/appointmentCharge.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router({ mergeParams: true });

const MANAGERS = [
    ROLES.ADMIN,
    ROLES.BUSINESS_OWNER,
    ROLES.OPERATIONAL_STAFF,
];

router.post(
    "/",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.create
);

router.get(
    "/",
    authenticate,
    authorizeRoles(...MANAGERS, ROLES.CLIENT),
    controller.getAll
);

router.delete(
    "/:chargeId",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.delete
);

export default router;
