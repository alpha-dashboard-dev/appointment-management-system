import { createRouter, createWebHistory } from "vue-router";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import Dashboard from "@/views/Dashboard.vue";
import { useAuthStore } from "@/stores/auth.store";

const routes = [
    { path: "/", redirect: "/dashboard" },
    { path: "/login", component: () => import("@/views/auth/Login.vue") },
    {
        path: "/",
        component: AdminLayout,
        meta: { requiresAuth: true },
        children: [
            { path: "dashboard", component: Dashboard },

            // Organizations
            { path: "organizations", component: () => import("@/views/organization/Organizations.vue") },
            { path: "organizations/create", component: () => import("@/views/organization/CreateOrganization.vue") },

            // Businesses
            { path: "businesses", component: () => import("@/views/business/Businesses.vue") },
            { path: "businesses/create", component: () => import("@/views/business/CreateBusiness.vue") },
            { path: "businesses/:business_code", component: () => import("@/views/business/BusinessDetail.vue") },

            // Clients
            { path: "clients", component: () => import("@/views/client/Clients.vue") },
            { path: "clients/create", component: () => import("@/views/client/CreateClient.vue") },

            // Appointments
            { path: "appointments", component: () => import("@/views/appointments/Appointments.vue") },
            { path: "appointments/create", component: () => import("@/views/appointments/CreateAppointments.vue") },

            // Services
            { path: "services", component: () => import("@/views/service/Services.vue") },
            { path: "services/create", component: () => import("@/views/service/CreateService.vue") },

            // Locations
            { path: "locations", component: () => import("@/views/location/Locations.vue") },
            { path: "locations/create", component: () => import("@/views/location/CreateLocation.vue") },
            { path: "location-services", component: () => import("@/views/location/LocationServices.vue") },

            // Schedules
            { path: "schedules", component: () => import("@/views/schedule/Schedules.vue") },

            // Charges
            { path: "charges", component: () => import("@/views/charge/charges.vue") },

            // Invoices
            { path: "invoices", component: () => import("@/views/invoice/Invoices.vue") },

            // Users
            { path: "users", component: () => import("@/views/users/Users.vue") },
            { path: "users/create", component: () => import("@/views/users/CreateUser.vue") },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next("/login");
    } else if (to.path === "/login" && authStore.isAuthenticated) {
        next("/dashboard");
    } else {
        next();
    }
});

export default router;
