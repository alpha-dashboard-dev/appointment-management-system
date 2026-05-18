<script setup lang="ts">
// DashboardView — the home screen after login.
// Fetches summary counts for all major entities in parallel and renders stat cards
// alongside short tables of the most recent appointments and invoices.
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StatCard from '@/components/common/StatCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { appointmentApi } from '@/api/appointment.api'
import { clientApi } from '@/api/client.api'
import { userApi } from '@/api/user.api'
import { invoiceApi } from '@/api/invoice.api'
import { organizationApi } from '@/api/organization.api'
import { businessApi } from '@/api/business.api'

const router = useRouter()

// Holds the aggregate counts displayed on the stat cards
const stats = ref({
  organizations: 0,
  businesses: 0,
  users: 0,
  clients: 0,
  appointments: 0,
  invoices: 0,
})

// Short lists for the "recent" tables at the bottom of the page
const recentAppointments = ref<any[]>([])
const recentInvoices = ref<any[]>([])
const loading = ref(true) // show skeleton loaders while data is loading

onMounted(async () => {
  // Fire all API calls simultaneously for the fastest possible load time.
  // Promise.allSettled is used so a single failing endpoint doesn't block the rest.
  try {
    const [orgs, biz, users, clients, appts, invs] = await Promise.allSettled([
      organizationApi.getAll(),
      businessApi.getAll(),
      userApi.getAll(),
      clientApi.getAll(),
      appointmentApi.getAll(),
      invoiceApi.getAll(),
    ])

    // Each result is checked individually — the API may wrap data in .data.data or .data
    if (orgs.status === 'fulfilled') stats.value.organizations = orgs.value.data?.length ?? orgs.value.data?.data?.length ?? 0
    if (biz.status === 'fulfilled')  stats.value.businesses    = biz.value.data?.length  ?? biz.value.data?.data?.length ?? 0
    if (users.status === 'fulfilled') stats.value.users        = users.value.data?.length ?? users.value.data?.data?.length ?? 0
    if (clients.status === 'fulfilled') stats.value.clients    = clients.value.data?.length ?? clients.value.data?.data?.length ?? 0
    if (appts.status === 'fulfilled') {
      const data = appts.value.data?.data ?? appts.value.data ?? []
      stats.value.appointments = Array.isArray(data) ? data.length : 0
      // Keep only the 5 most recent for the preview table
      recentAppointments.value = Array.isArray(data) ? data.slice(0, 5) : []
    }
    if (invs.status === 'fulfilled') {
      const data = invs.value.data?.data ?? invs.value.data ?? []
      stats.value.invoices = Array.isArray(data) ? data.length : 0
      recentInvoices.value = Array.isArray(data) ? data.slice(0, 5) : []
    }
  } finally {
    loading.value = false
  }
})

// Configuration for the 6 stat cards — each references a key from `stats`
const statCards = [
  {
    key: 'organizations',
    title: 'Organizations',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    iconBg: 'bg-indigo-600',
    subtitle: 'Total registered',
    to: '/organizations',
  },
  {
    key: 'businesses',
    title: 'Businesses',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    iconBg: 'bg-orange-500',
    subtitle: 'Active tenants',
    to: '/businesses',
  },
  {
    key: 'users',
    title: 'Staff Users',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    iconBg: 'bg-cyan-500',
    subtitle: 'Registered users',
    to: '/users',
  },
  {
    key: 'clients',
    title: 'Clients',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    iconBg: 'bg-teal-500',
    subtitle: 'Total clients',
    to: '/clients',
  },
  {
    key: 'appointments',
    title: 'Appointments',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    iconBg: 'bg-purple-500',
    subtitle: 'All time total',
    to: '/appointments',
  },
  {
    key: 'invoices',
    title: 'Invoices',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    iconBg: 'bg-green-600',
    subtitle: 'All time total',
    to: '/invoices',
  },
]

// Format an ISO date string into a short human-readable form (e.g. "May 17, 2026")
function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div>
    <!-- Welcome -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      <p class="text-gray-500 text-sm mt-0.5">Welcome back! Here's an overview of your system.</p>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      <div v-for="card in statCards" :key="card.key"
           class="cursor-pointer hover:shadow-md transition-shadow"
           @click="router.push(card.to)">
        <StatCard
          :title="card.title"
          :value="loading ? '—' : stats[card.key as keyof typeof stats]"
          :subtitle="card.subtitle"
          :icon="card.icon"
          :icon-bg="card.iconBg"
        />
      </div>
    </div>

    <!-- Bottom grids -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Recent Appointments -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-gray-800">Recent Appointments</h3>
          <button class="text-sm font-medium hover:underline" style="color: #2e37a4;" @click="router.push('/appointments')">
            View All
          </button>
        </div>
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
        <div v-else-if="!recentAppointments.length" class="py-8 text-center text-gray-400 text-sm">
          No appointments yet
        </div>
        <div v-else class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="apt in recentAppointments" :key="apt.appointment_code">
                <td class="font-mono text-xs text-gray-500">{{ apt.appointment_code }}</td>
                <td>{{ formatDate(apt.appointment_start_date) }}</td>
                <td><StatusBadge :status="apt.status" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Invoices -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-gray-800">Recent Invoices</h3>
          <button class="text-sm font-medium hover:underline" style="color: #2e37a4;" @click="router.push('/invoices')">
            View All
          </button>
        </div>
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
        <div v-else-if="!recentInvoices.length" class="py-8 text-center text-gray-400 text-sm">
          No invoices yet
        </div>
        <div v-else class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Appointment</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in recentInvoices" :key="inv.id">
                <td class="text-gray-500 text-xs">{{ inv.id }}</td>
                <td class="font-mono text-xs text-gray-500">{{ inv.appointmentCode }}</td>
                <td class="font-semibold text-gray-800">{{ inv.total != null ? '$' + inv.total : '—' }}</td>
                <td><StatusBadge :status="inv.status" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Quick links -->
    <div class="mt-6 card">
      <h3 class="text-base font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button v-for="link in [
          { label: 'New Appointment', to: '/appointments', icon: 'M12 4v16m8-8H4' },
          { label: 'Add Client',      to: '/clients',      icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
          { label: 'Create Invoice',  to: '/invoices',     icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { label: 'Add Service',     to: '/services',     icon: 'M12 4v16m8-8H4' },
        ]" :key="link.label"
          class="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer"
          @click="router.push(link.to)"
        >
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background-color: #eff0fc;">
            <svg class="w-5 h-5" style="color: #2e37a4;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="link.icon"/>
            </svg>
          </div>
          <span class="text-xs font-medium text-gray-600 text-center">{{ link.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
