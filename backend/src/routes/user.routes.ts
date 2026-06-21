import { Router } from "express";
import controller from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router();

router.post(
    "/create-user",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.create
);

router.get(
    "/get-all-users",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.getAll
);

router.get(
    "/get-one-user/:userCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.getByUserCode
);

// get by any field
router.get(
    "/get-one-user",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.getByAnyField
);

router.put(
    "/update-user/:userCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.update
);

router.patch(
    "/deactivate-user/:userCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.deactivate
);

router.delete(
    "/delete-user/:userCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.delete
);

export default router;