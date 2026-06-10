import { Router } from "express";
import controller from "../controllers/appointment.controller";
import AppointmentServiceController from "../controllers/appointmentServiceItem.controller";
import AppointmentChargeController from "../controllers/appointmentCharge.controller";
import AppointmentHistoryController from "../controllers/appointmentHistory.controller";
import AppointmentParticipantController from "../controllers/appointmentParticipant.controller";
import AppointmentDiscountController from "../controllers/appointmentDiscount.controller";
import AppointmentRecurrenceController from "../controllers/appointmentRecurrence.controller";
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
    "/respond-to-reschedule/:appointmentCode",
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
    "/delete-appointment-service/:serviceId",
    authenticate,
    authorizeRoles(...MANAGERS),
    AppointmentServiceController.delete
);

// Appointment Charges Routes

router.post(
    "/create-appointment-charge/:appointmentCode",
    authenticate,
    authorizeRoles(...MANAGERS),
    AppointmentChargeController.create
);

router.get(
    "/get-appointment-charge/:appointmentCode",
    authenticate,
    authorizeRoles(...MANAGERS, ROLES.CLIENT),
    AppointmentChargeController.getAll
);

router.delete(
    "/delete-appointment-charge/:chargeId",
    authenticate,
    authorizeRoles(...MANAGERS),
    AppointmentChargeController.delete
);

// Appointment History Routes

router.get(
    "/get-appointment-history/:appointmentCode",
    authenticate,
    authorizeRoles(...MANAGERS),
    AppointmentHistoryController.getByAppointmentCode
);

//  Appointment Participants Routes

router.post(
    "/create-appointment-participants",
    authenticate,
    authorizeRoles(...MANAGERS),
    AppointmentParticipantController.create
);

router.get(
    "/get-appointment-participants",
    authenticate,
    authorizeRoles(...ALL_STAFF, ROLES.CLIENT),
    AppointmentParticipantController.getAll
);

router.delete(
    "/delete-appointment-participants/:participantId",
    authenticate,
    authorizeRoles(...MANAGERS),
    AppointmentParticipantController.delete
);

// Appointment Discount Routes
router.post(
    "/create-appointment-discount",
    authenticate,
    authorizeRoles(...MANAGERS),
    AppointmentDiscountController.create
);

router.get(
    "/get-appointment-discounts",
    authenticate,
    authorizeRoles(...ALL_STAFF, ROLES.CLIENT),
    AppointmentDiscountController.getAll
);

router.delete(
    "/delete-appointment-discount/:discountId",
    authenticate,
    authorizeRoles(...MANAGERS),
    AppointmentDiscountController.delete
);


//  Appointment Recurrence Routes
router.post(
    "/create-appointment-recurrence",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    AppointmentRecurrenceController.create
);

router.get(
    "/get-appointment-recurrence",
    authenticate,
    authorizeRoles(...MANAGERS),
    AppointmentRecurrenceController.getAll
);

router.get(
    "/get-appointment-recurrence/:id",
    authenticate,
    authorizeRoles(...MANAGERS),
    AppointmentRecurrenceController.getById
);

router.put(
    "/update-appointment-recurrence/:id",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    AppointmentRecurrenceController.update
);

router.delete(
    "/delete-appointment-recurrence/:id",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    AppointmentRecurrenceController.delete
);

export default router;