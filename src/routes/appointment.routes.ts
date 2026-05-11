import { Router } from "express";
import controller from "../controllers/appointment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { ROLES } from "../utils/roles";

const router = Router();

const ALL_STAFF = [ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF, ROLES.SERVICE_STAFF];
const MANAGERS = [ROLES.ADMIN, ROLES.BUSINESS_OWNER, ROLES.OPERATIONAL_STAFF];

router.post(
    "/",
    authenticate,
    authorizeRoles(...ALL_STAFF, ROLES.CLIENT),
    controller.create
);

router.get(
    "/",
    authenticate,
    authorizeRoles(...ALL_STAFF, ROLES.CLIENT),
    controller.getAll
);

router.get(
    "/:appointmentCode",
    authenticate,
    authorizeRoles(...ALL_STAFF, ROLES.CLIENT),
    controller.getByCode
);

router.put(
    "/:appointmentCode",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.update
);

router.patch(
    "/:appointmentCode/status",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.changeStatus
);

router.post(
    "/:appointmentCode/reschedule",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.reschedule
);

router.get(
    "/:appointmentCode/history",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.getHistory
);


router.post(
    "/:appointmentCode/participants",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.addParticipant
);

router.get(
    "/:appointmentCode/participants",
    authenticate,
    authorizeRoles(...ALL_STAFF, ROLES.CLIENT),
    controller.getParticipants
);

router.delete(
    "/:appointmentCode/participants/:participantId",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.removeParticipant
);


router.post(
    "/:appointmentCode/services",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.addService
);

router.get(
    "/:appointmentCode/services",
    authenticate,
    authorizeRoles(...ALL_STAFF, ROLES.CLIENT),
    controller.getServices
);

router.delete(
    "/:appointmentCode/services/:serviceId",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.removeService
);


router.post(
    "/:appointmentCode/charges",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.addCharge
);

router.get(
    "/:appointmentCode/charges",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.getCharges
);

router.delete(
    "/:appointmentCode/charges/:chargeId",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.removeCharge
);


router.post(
    "/:appointmentCode/discounts",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.addDiscount
);

router.get(
    "/:appointmentCode/discounts",
    authenticate,
    authorizeRoles(...ALL_STAFF, ROLES.CLIENT),
    controller.getDiscounts
);

router.delete(
    "/:appointmentCode/discounts/:discountId",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.removeDiscount
);


router.post(
    "/recurrences",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.createRecurrence
);

router.get(
    "/recurrences",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.getAllRecurrences
);

router.get(
    "/recurrences/:id",
    authenticate,
    authorizeRoles(...MANAGERS),
    controller.getRecurrenceById
);

router.put(
    "/recurrences/:id",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.updateRecurrence
);

router.delete(
    "/recurrences/:id",
    authenticate,
    authorizeRoles(ROLES.ADMIN, ROLES.BUSINESS_OWNER),
    controller.deleteRecurrence
);

export default router;
