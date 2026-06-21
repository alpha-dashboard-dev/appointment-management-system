// import { Router } from "express";
// import controller from "../controllers/appointmentHistory.controller";
// import { authenticate } from "../middlewares/auth.middleware";
// import { authorizeRoles } from "../middlewares/role.middleware";
// import { ROLES } from "../utils/roles";
//
// const router = Router({ mergeParams: true });
//
// const MANAGERS = [
//     ROLES.ADMIN,
//     ROLES.BUSINESS_OWNER,
//     ROLES.OPERATIONAL_STAFF,
// ];
//
// router.get(
//     "/",
//     authenticate,
//     authorizeRoles(...MANAGERS),
//     controller.getByAppointmentCode
// );
//
// export default router;
