import { Router } from "express";
import controller from "../controllers/business.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router();

router.post(
    "/",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.create
);

router.get(
    "/",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.getAll
);

router.get(
    "/:businessCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.getByCode
);

router.put(
    "/:businessCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.update
);

router.patch(
    "/:businessCode/status",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.changeStatus
)

router.delete(
    "/:businessCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.delete
);

export default router;
