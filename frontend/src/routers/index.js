import { createRouter, createWebHistory } from "vue-router";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import BusinessOwnerLayout from "@/components/layout/BusinessOwnerLayout.vue";
import OperationalStaffLayout from "@/components/layout/OperationalStaffLayout.vue";
import ServiceStaffLayout from "@/components/layout/ServiceStaffLayout.vue";
import ClientLayout from "@/components/layout/ClientLayout.vue";
import Dashboard from "@/views/Dashboard.vue";
import { useAuthStore } from "@/stores/auth.store";


const routes = [
    { path: "/", redirect: "/dashboard" },
    { path: "/login", component: () => import("@/views/auth/Login.vue") },
    { path: '/forgot-password', component: () => import("@/views/auth/ForgotPassword.vue") },
    { path: '/settings', component: () => import("@/views/settings/SettingsView.vue") },
    { path: '/notifications', component: () => import("@/views/notifications/NotificationsPage.vue") },
    { path: '/profile', component: () => import("@/views/settings/SettingsView.vue") },

    // ── Admin ──────────────────────────────────────────────────────────
    {
        path: "/",
        component: AdminLayout,
        meta: { requiresAuth: true, roles: ["admin"] },
        children: [
            { path: "dashboard", component: Dashboard },
            { path: "organizations", component: () => import("@/views/organization/Organizations.vue") },
            { path: "organizations/create", component: () => import("@/views/organization/CreateOrganization.vue") },
            { path: "businesses", component: () => import("@/views/business/Businesses.vue") },
            { path: "businesses/create", component: () => import("@/views/business/CreateBusiness.vue") },
            { path: "businesses/:business_code", component: () => import("@/views/business/BusinessDetail.vue") },
            { path: "clients", component: () => import("@/views/client/Clients.vue") },
            { path: "clients/create", component: () => import("@/views/client/CreateClient.vue") },
            { path: "appointments", component: () => import("@/views/appointments/Appointments.vue") },
            { path: "appointments/create", component: () => import("@/views/appointments/CreateAppointments.vue") },
            { path: "services", component: () => import("@/views/service/Services.vue") },
            { path: "services/create", component: () => import("@/views/service/CreateService.vue") },
            { path: "locations", component: () => import("@/views/location/Locations.vue") },
            { path: "locations/create", component: () => import("@/views/location/CreateLocation.vue") },
            { path: "location-services", component: () => import("@/views/location/LocationServices.vue") },
            { path: "schedules", component: () => import("@/views/schedule/Schedules.vue") },
            { path: "charges", component: () => import("@/views/charge/charges.vue") },
            { path: "invoices", component: () => import("@/views/invoice/Invoices.vue") },
            { path: "users", component: () => import("@/views/users/Users.vue") },
            { path: "users/create", component: () => import("@/views/users/CreateUser.vue") },
        ],
    },

    // ── Business Owner ─────────────────────────────────────────────────
    {
        path: "/business",
        component: BusinessOwnerLayout,
        meta: { requiresAuth: true, roles: ["business_owner"] },
        children: [
            { path: "dashboard", component: () => import("@/views/business-owner/Dashboard.vue") },
            { path: "appointments", component: () => import("@/views/business-owner/Appointments.vue") },
            { path: "appointments/create", component: () => import("@/views/appointments/CreateAppointments.vue") },
            { path: "services", component: () => import("@/views/business-owner/Services.vue") },
            { path: "services/create", component: () => import("@/views/service/CreateService.vue") },
            { path: "locations", component: () => import("@/views/business-owner/Locations.vue") },
            { path: "locations/create", component: () => import("@/views/location/CreateLocation.vue") },
            { path: "location-services", component: () => import("@/views/location/LocationServices.vue") },
            { path: "staff", component: () => import("@/views/business-owner/Staff.vue") },
            { path: "staff/create", component: () => import("@/views/business-owner/CreateStaff.vue") },
            { path: "clients", component: () => import("@/views/business-owner/Clients.vue") },
            { path: "clients/create", component: () => import("@/views/client/CreateClient.vue") },
            { path: "schedules", component: () => import("@/views/schedule/Schedules.vue") },
            { path: "charges", component: () => import("@/views/charge/charges.vue") },
            { path: "invoices", component: () => import("@/views/business-owner/Invoices.vue") },
        ],
    },

    // ── Operational Staff ──────────────────────────────────────────────
    {
        path: "/operations",
        component: OperationalStaffLayout,
        meta: { requiresAuth: true, roles: ["operational_staff"] },
        children: [
            { path: "dashboard", component: () => import("@/views/operational-staff/Dashboard.vue") },
            { path: "appointments", component: () => import("@/views/operational-staff/Appointments.vue") },
            { path: "pending", component: () => import("@/views/operational-staff/PendingAppointments.vue") },
            { path: "schedules", component: () => import("@/views/operational-staff/Schedules.vue") },
            { path: "availability", component: () => import("@/views/operational-staff/Availability.vue") },
            { path: "clients", component: () => import("@/views/operational-staff/Clients.vue") },
            { path: "clients/create", component: () => import("@/views/client/CreateClient.vue") },
        ],
    },

    // ── Service Staff ──────────────────────────────────────────────────
    {
        path: "/staff",
        component: ServiceStaffLayout,
        meta: { requiresAuth: true, roles: ["service_staff"] },
        children: [
            { path: "dashboard", component: () => import("@/views/service-staff/Dashboard.vue") },
            { path: "schedule", component: () => import("@/views/service-staff/MySchedule.vue") },
            { path: "appointments", component: () => import("@/views/service-staff/MyAppointments.vue") },
        ],
    },

    // ── Client ─────────────────────────────────────────────────────────
    {
        path: "/client",
        component: ClientLayout,
        meta: { requiresAuth: true, roles: ["client"] },
        children: [
            { path: "dashboard", component: () => import("@/views/client/Dashboard.vue") },
            { path: "book", component: () => import("@/views/client/BookAppointment.vue") },
            { path: "appointments", component: () => import("@/views/client/MyAppointments.vue") },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const roleRedirectMap = {
    admin: "/dashboard",
    business_owner: "/business/dashboard",
    operational_staff: "/operations/dashboard",
    service_staff: "/staff/dashboard",
    client: "/client/dashboard",
};

router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next("/login");
    }

    if (to.path === "/login" && authStore.isAuthenticated) {
        const role = authStore.user?.user_type;
        return next(roleRedirectMap[role] || "/dashboard");
    }

    // Role guard: if route has roles restriction and user's role not in list
    if (to.meta.roles && authStore.isAuthenticated) {
        const role = authStore.user?.user_type;
        if (!to.meta.roles.includes(role)) {
            return next(roleRedirectMap[role] || "/login");
        }
    }

    next();
});

export default router;
