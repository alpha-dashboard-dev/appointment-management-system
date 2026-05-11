import { Router } from "express";
import controller from "../controllers/organization.controller";
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
    authorizeRoles(ROLES.ADMIN),
    controller.getAll
);

router.get(
    "/:organizationCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.getByCode
);

router.put(
    "/:organizationCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.update
);

router.patch(
    "/:organizationCode/status",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.changeStatus
);

export default router;
