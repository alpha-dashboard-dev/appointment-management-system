import { Router } from "express";
import controller from "../controllers/user.controller";
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
    "/:userCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.getById
);

router.put(
    "/:userCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.update
);

router.patch(
    "/:userCode/status",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.changeStatus
);

router.patch(
    "/:userCode/business",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.assignBusiness
);

router.delete(
    "/:userCode",
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    controller.delete
);

export default router;