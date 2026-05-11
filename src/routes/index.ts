import { Router } from "express";

import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import organizationRoutes from "./organization.routes";
import businessRoutes from "./business.routes";
import clientRoutes from "./client.routes";
import serviceRoutes from "./service.routes";
import locationRoutes from "./location.routes";
import locationServiceRoutes from "./locationService.routes";
import scheduleRoutes from "./schedule.routes";
import userAbilityRoutes from "./userAbility.routes";
import chargeRoutes from "./charge.routes";
import appointmentRoutes from "./appointment.routes";
import invoiceRoutes from "./invoice.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/organizations", organizationRoutes);
router.use("/businesses", businessRoutes);
router.use("/clients", clientRoutes);
router.use("/services", serviceRoutes);
router.use("/locations", locationRoutes);
router.use("/location-services", locationServiceRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/user-abilities", userAbilityRoutes);
router.use("/charges", chargeRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/invoices", invoiceRoutes);

export default router;

