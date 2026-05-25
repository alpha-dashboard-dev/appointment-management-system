import { Router } from "express";
import controller from "../controllers/organization.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router();

router.post(
    "/create-organization",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.create
);

router.get(
    "/get-organization",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.getAll
);

router.get(
    "/get-organization:organizationCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.getByCode
);

router.put(
    "/update-organization:organizationCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.update
);

router.patch(
    "/update-organization-status:organizationCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.changeStatus
);

export default router;
