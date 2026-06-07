import { Router } from "express";
import controller from "../controllers/appointmentDiscount.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router({ mergeParams: true });

const ALL_STAFF = [
    ROLES.ADMIN,
    ROLES.BUSINESS_OWNER,
    ROLES.OPERATIONAL_STAFF,
];

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
    authorizeRoles(...ALL_STAFF, ROLES.CLIENT),
    controller.getAll
);

router.delete(
    "/:discountId",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.delete
);

export default router;
