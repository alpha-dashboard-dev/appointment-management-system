import { createRouter, createWebHistory } from "vue-router";

import AdminLayout from "@/components/layout/AdminLayout.vue";
import Dashboard from "@/views/Dashboard.vue";

const routes = [
    {
        path: "/",
        redirect: "/dashboard",
    },
    {
        path: "/",
        component: AdminLayout,
        children: [
            { path: "dashboard", component: Dashboard },
            { path: "organizations", component: () => import('@/views/organization/Organizations.vue') },
            { path: "organizations/create", component: () => import('@/views/organization/CreateOrganization.vue') },
            { path: "businesses", component: () => import('@/views/business/Businesses.vue') },
            { path: "businesses/create", component: () => import('@/views/business/CreateBusiness.vue') },
            { path: 'businesses/:business_code', component: () => import('@/views/business/BusinessDetail.vue')},
            { path: "users", component: () => import('@/views/users/Users.vue') },
            { path: "users/create", component: () => import('@/views/users/CreateUser.vue')},
            { path: "appointments", component: () => import('@/views/appointments/Appointments.vue') },
            { path: "appointments/create", component: () => import('@/views/appointments/CreateAppointments.vue')},
            { path: '/client/appointments', component: () => import('@/views/client/ClientAppointments.vue')}
        ],
    },
];

export default createRouter({
    history: createWebHistory(),
    routes,
});