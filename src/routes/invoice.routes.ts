import { Router } from "express";
import controller from "../controllers/invoice.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router();

router.post(
    "/",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF),
    controller.create
);

router.get(
    "/",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF),
    controller.getAll
);

router.get(
    "/:id",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF, ROLES.CLIENT),
    controller.getById
);

router.put(
    "/:id",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF),
    controller.update
);

router.patch(
    "/:id/status",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.changeStatus
);

export default router;
