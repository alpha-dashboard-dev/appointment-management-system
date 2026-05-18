import { Router } from "express";
import controller from "../controllers/service.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router();

router.post(
    "/",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.create
);

// Client-facing endpoint: returns active services for a business/location + active charges
router.get(
    "/client-view",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF, ROLES.SERVICE_STAFF, ROLES.CLIENT),
    controller.getForClient
);

router.get(
    "/",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF, ROLES.SERVICE_STAFF),
    controller.getAll
);

router.get(
    "/:serviceCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF, ROLES.SERVICE_STAFF, ROLES.CLIENT),
    controller.getByCode
);

router.put(
    "/:serviceCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.update
);

router.patch(
    "/:serviceCode/status",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.changeStatus
);

router.delete(
    "/:serviceCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.delete
);

export default router;
