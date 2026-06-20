import { Router } from "express";
import controller from "../controllers/business.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router();

router.post(
    "/create-business",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.create
);

router.get(
    "/get-all-businesses",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.CLIENT),
    controller.getAll
);

router.get(
    "/get-one-business/:businessCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.CLIENT),
    controller.getByCode
);

// get by any filed
router.get(
    "/get-one-business",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.getByAnyField
);

router.put(
    "/update-business/:businessCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.update
);

router.patch(
    "/deactivate-business/:businessCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.deactivate
)

router.delete(
    "/delete-business/:businessCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.delete
);

export default router;
