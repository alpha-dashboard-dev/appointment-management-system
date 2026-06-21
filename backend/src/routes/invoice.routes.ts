import { Router } from "express";
import controller from "../controllers/invoice.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router();

router.post(
    "/create-invoice",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF),
    controller.create
);

router.get(
    "/get-invoice",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF),
    controller.getAll
);

router.get(
    "/get-invoice/:id",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF, ROLES.CLIENT),
    controller.getById
);

router.put(
    "/update-invoice/:id",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF),
    controller.update
);

router.patch(
    "/update-invoice-status/:id",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.changeStatus
);

export default router;
