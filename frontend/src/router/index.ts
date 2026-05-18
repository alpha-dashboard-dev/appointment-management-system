// Vue Router configuration for the entire application.
// All routes are defined here with lazy-loaded components for code splitting.
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  // Uses the HTML5 History API so URLs look like /dashboard instead of /#/dashboard
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // Public login page — does NOT require authentication
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { public: true }, // flag: redirect to dashboard if already logged in
    },
    {
      // Protected shell: wraps all authenticated pages inside AppLayout (sidebar + header)
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true }, // flag: redirect to login if no token
      children: [
        {
          // Redirect bare "/" to the dashboard
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          // Multi-tenant top-level organizations
          path: 'organizations',
          name: 'organizations',
          component: () => import('@/views/organizations/OrganizationsView.vue'),
        },
        {
          // Businesses that belong to an organization
          path: 'businesses',
          name: 'businesses',
          component: () => import('@/views/businesses/BusinessesView.vue'),
        },
        {
          // Staff / admin user accounts
          path: 'users',
          name: 'users',
          component: () => import('@/views/users/UsersView.vue'),
        },
        {
          // End-customers who book appointments
          path: 'clients',
          name: 'clients',
          component: () => import('@/views/clients/ClientsView.vue'),
        },
        {
          // Catalog of services offered by businesses
          path: 'services',
          name: 'services',
          component: () => import('@/views/services/ServicesView.vue'),
        },
        {
          // Physical or virtual locations where services are provided
          path: 'locations',
          name: 'locations',
          component: () => import('@/views/locations/LocationsView.vue'),
        },
        {
          // Staff availability / working-hours schedules
          path: 'schedules',
          name: 'schedules',
          component: () => import('@/views/schedules/SchedulesView.vue'),
        },
        {
          // Core feature: booking appointments between clients and staff
          path: 'appointments',
          name: 'appointments',
          component: () => import('@/views/appointments/AppointmentsView.vue'),
        },
        {
          // Fee / charge catalog (e.g. consultation fee, cancellation fee)
          path: 'charges',
          name: 'charges',
          component: () => import('@/views/charges/ChargesView.vue'),
        },
        {
          // Invoice management for billing clients
          path: 'invoices',
          name: 'invoices',
          component: () => import('@/views/invoices/InvoicesView.vue'),
        },
        {
          // RBAC: fine-grained permission assignments per user
          path: 'user-abilities',
          name: 'user-abilities',
          component: () => import('@/views/abilities/AbilitiesView.vue'),
        },
      ],
    },
    {
      // Catch-all: any unknown path falls back to the dashboard
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

// Global navigation guard — runs before every route change.
// • Unauthenticated users trying to reach a protected route are sent to /login.
// • Already-authenticated users trying to visit /login are sent to /dashboard.
router.beforeEach((to) => {
  const token = localStorage.getItem('accessToken')
  if (to.meta.requiresAuth && !token) {
    return { name: 'login' }
  }
  if (to.meta.public && token) {
    return { name: 'dashboard' }
  }
})

export default router
