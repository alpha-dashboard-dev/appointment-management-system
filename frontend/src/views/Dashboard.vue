<template>
  <div class="dashboard">

    <!-- STAT CARDS -->
    <div class="stats-grid">

      <div class="stat-card">
        <div class="stat-icon org">🏢</div>
        <div class="stat-info">
          <p class="stat-label">Organizations</p>
          <h3 class="stat-value">{{ stats.organizations }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon biz">🏪</div>
        <div class="stat-info">
          <p class="stat-label">Businesses</p>
          <h3 class="stat-value">{{ stats.businesses }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon client">👥</div>
        <div class="stat-info">
          <p class="stat-label">Clients</p>
          <h3 class="stat-value">{{ stats.clients }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon app">📅</div>
        <div class="stat-info">
          <p class="stat-label">Appointments</p>
          <h3 class="stat-value">{{ stats.appointments }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon usr">👤</div>
        <div class="stat-info">
          <p class="stat-label">Users</p>
          <h3 class="stat-value">{{ stats.users }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon svc">⚕️</div>
        <div class="stat-info">
          <p class="stat-label">Services</p>
          <h3 class="stat-value">{{ stats.services }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon inv">🧾</div>
        <div class="stat-info">
          <p class="stat-label">Invoices</p>
          <h3 class="stat-value">{{ stats.invoices }}</h3>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon loc">📍</div>
        <div class="stat-info">
          <p class="stat-label">Locations</p>
          <h3 class="stat-value">{{ stats.locations }}</h3>
        </div>
      </div>

    </div>

    <!-- RECENT APPOINTMENTS -->
    <div class="card">
      <div class="card-header">
        <h3>Recent Appointments</h3>
        <router-link to="/appointments" class="view-all">View All</router-link>
      </div>

      <div v-if="loading" class="loading">Loading...</div>

      <table v-else class="table">
        <thead>
        <tr>
          <th>Appointment Code</th>
          <th>Business Name</th>
          <th>Appointment Notes</th>
          <th>Start Date</th>
          <th>Start Time</th>
          <th>Status</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="appt in recentAppointments" :key="appt.appointment_code">
          <td>{{ appt.appointment_code }}</td>
          <td>{{ appt.business_name}}</td>
          <td>{{ appt.notes || '—' }}</td>
          <td>{{ formatDate(appt.appointment_start_date) }}</td>
          <td>{{ formatTime(appt.start_time) }}</td>
          <td>
            <span :class="['badge', appt.status]">{{ appt.status }}</span>
          </td>
        </tr>
        <tr v-if="recentAppointments.length === 0">
          <td colspan="5" class="empty">No appointments found</td>
        </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import formatTime from "../utils/formatTime.js";
import formatDate from "../utils/formatDate.js";

const loading = ref(true)
const recentAppointments = ref([])

const stats = ref({
  organizations: 0,
  businesses: 0,
  clients: 0,
  appointments: 0,
  users: 0,
  services: 0,
  invoices: 0,
  locations: 0,
})


onMounted(async () => {
  try {
    const [orgs, bizs, clients, appts, users, svcs, invs, locs] = await Promise.allSettled([
      api.get('/organizations/get-organization'),
      api.get('/businesses/get-business'),
      api.get('/clients/get-client'),
      api.get('/appointments'),
      api.get('/users/get-users'),
      api.get('/services/get-service'),
      api.get('/invoices/get-invoice'),
      api.get('/locations/get-location'),
    ])

    stats.value.organizations = orgs.status === 'fulfilled' ? (orgs.value.data.data?.length ?? 0) : 0
    stats.value.businesses = bizs.status === 'fulfilled' ? (bizs.value.data.data?.length ?? 0) : 0
    stats.value.clients = clients.status === 'fulfilled' ? (clients.value.data.data?.length ?? 0) : 0
    stats.value.appointments = appts.status === 'fulfilled' ? (appts.value.data.data?.length ?? 0) : 0
    stats.value.users = users.status === 'fulfilled' ? (users.value.data.data?.length ?? 0) : 0
    stats.value.services = svcs.status === 'fulfilled' ? (svcs.value.data.data?.length ?? 0) : 0
    stats.value.invoices = invs.status === 'fulfilled' ? (invs.value.data.data?.length ?? 0) : 0
    stats.value.locations = locs.status === 'fulfilled' ? (locs.value.data.data?.length ?? 0) : 0

    const business =
        bizs.status === 'fulfilled'
            ? bizs.value.data.data || []
            : []

    const businessNameByCode = new Map(
        business.map((bus) => [bus.business_code, bus.name])
    )

    if (appts.status === 'fulfilled') {
      recentAppointments.value = (appts.value.data.data || [])
          .slice(0, 5)
          .map((appt) => ({
            ...appt,
            business_name:
                businessNameByCode.get(appt.business_code) ||
                appt.business_name ||
                '',
          }))
    }
  } finally {
    loading.value = false
  }
})

</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.stat-icon.org   { background: #ede9fe; }
.stat-icon.biz   { background: #dbeafe; }
.stat-icon.client { background: #dcfce7; }
.stat-icon.app   { background: #fef9c3; }
.stat-icon.usr   { background: #ffe4e6; }
.stat-icon.svc   { background: #e0f2fe; }
.stat-icon.inv   { background: #f0fdf4; }
.stat-icon.loc   { background: #fdf4ff; }

.stat-label {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  margin: 4px 0 0;
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1e293b;
}

.view-all {
  font-size: 13px;
  color: #6366f1;
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  text-align: left;
  padding: 10px 12px;
  font-size: 13px;
  border-bottom: 1px solid #f1f5f9;
}

.table th {
  color: #64748b;
  font-weight: 600;
}

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.badge.pending     { background: #fef3c7; color: #d97706; }
.badge.approved    { background: #dcfce7; color: #16a34a; }
.badge.rejected    { background: #fee2e2; color: #dc2626; }
.badge.canceled    { background: #fee2e2; color: #dc2626; }
.badge.rescheduled { background: #dbeafe; color: #2563eb; }
.badge.completed   { background: #f0fdf4; color: #15803d; }
.badge.in_progress { background: #e0f2fe; color: #0369a1; }

.loading, .empty {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
  font-size: 14px;
}
</style>
