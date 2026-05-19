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
    "/get-business",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.getAll
);

router.get(
    "/get-business:businessCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.getByCode
);

router.put(
    "/update-business:businessCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.update
);

router.patch(
    "/update-business-status:businessCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.changeStatus
)

router.delete(
    "/delete-business:businessCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.delete
);

export default router;
