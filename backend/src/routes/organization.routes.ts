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
    "/get-all-organizations",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.getAll
);

router.get(
    "/get-one-organization/:organizationCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.getByOrganizationCode
);

router.put(
    "/update-organization/:organizationCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.update
);

router.patch(
    "/deactivate-organization/:organizationCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.deactivate
);

router.delete(
    "/delete-organization/:organizationCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.delete
);

export default router;
