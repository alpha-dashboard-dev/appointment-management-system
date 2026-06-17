import { Router } from "express";
import controller from "../controllers/charge.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router();

router.post(
    "/create-charge",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.create
);

router.get(
    "/get-all-charges",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.CLIENT),
    controller.getAll
);

router.get(
    "/get-one-charge/:chargeCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF),
    controller.getByCode
);

router.put(
    "/update-charge/:chargeCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.update
);

router.patch(
    "/deactivate-charge/:chargeCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.deactivate
)

router.delete(
    "/delete-charge/:chargeCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.delete
);

export default router;
