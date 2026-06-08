import { Router } from "express";
import controller from "../controllers/appointment.controller";
import AppointmentServiceController from "../controllers/appointmentServiceItem.controller";

import appointmentHistoryRoutes from "./appointmentHistory.routes";
import appointmentParticipantRoutes from "./appointmentParticipant.routes";
// import appointmentServiceItemRoutes from "./appointmentServiceItem.routes";
import appointmentChargeRoutes from "./appointmentCharge.routes";
import appointmentDiscountRoutes from "./appointmentDiscount.routes";
import appointmentRecurrenceRoutes from "./appointmentRecurrence.routes";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router();

const ALL_STAFF = [ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF];
const MANAGERS = [ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF];

router.post(
    "/create-appointment",
    authenticate,
    authorizeRoles(...ALL_STAFF, ROLES.CLIENT),
    controller.create
);

router.post(
    "/pricing-preview",
    authenticate,
    authorizeRoles(...ALL_STAFF, ROLES.CLIENT),
    controller.pricingPreview
);

router.get(
    "/get-all-appointments",
    authenticate,
    authorizeRoles(...ALL_STAFF, ROLES.SERVICE_STAFF, ROLES.CLIENT),
    controller.getAll
);

router.get(
    "/get-one-appointment/:appointmentCode",
    authenticate,
    authorizeRoles(...ALL_STAFF, ROLES.CLIENT),
    controller.getByCode
);

router.put(
    "/update-appointment/:appointmentCode",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.update
);

router.patch(
    "/update-appointment-status/:appointmentCode",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.changeStatus
);

router.post(
    "/reschedule-appointment/:appointmentCode",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.reschedule
);

router.patch(
    "/:appointmentCode/reschedule/respond",
    authenticate,
    authorizeRoles(ROLES.CLIENT),
    controller.respondToReschedule
);

// Approval flow
router.get(
    "/check-availability/:appointmentCode",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.checkAvailability
);

router.post(
    "/approve-appointment/:appointmentCode",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.approveWithStaff
);

router.use(
    "/:appointmentCode/history",
    appointmentHistoryRoutes
);

router.use(
    "/:appointmentCode/participants",
    appointmentParticipantRoutes
);

// router.use(
//     "/:appointmentCode/services",
//     appointmentServiceItemRoutes
// );

router.use(
    "/:appointmentCode/charges",
    appointmentChargeRoutes
);

router.use(
    "/:appointmentCode/discounts",
    appointmentDiscountRoutes
);

router.use(
    "/recurrences",
    appointmentRecurrenceRoutes
);


//  Appointment Service Routes
router.post(
    "/create-appointment-service",
    authenticate,
    authorizeRoles(...MANAGERS),
    AppointmentServiceController.create
);

router.get(
    "/get-appointment-service/:appointmentCode",
    authenticate,
    authorizeRoles(...ALL_STAFF, ROLES.CLIENT),
    AppointmentServiceController.getAll
);

router.delete(
    "/:serviceId",
    authenticate,
    authorizeRoles(...MANAGERS),
    AppointmentServiceController.delete
);

export default router;