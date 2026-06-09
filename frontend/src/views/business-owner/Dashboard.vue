<template>
  <div class="dashboard">

    <!-- STAT CARDS -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon app">📅</div>
        <div class="stat-info">
          <p class="stat-label">Total Appointments</p>
          <h3 class="stat-value">{{ stats.appointments }}</h3>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending">⏳</div>
        <div class="stat-info">
          <p class="stat-label">Pending</p>
          <h3 class="stat-value">{{ stats.pending }}</h3>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon approved">✅</div>
        <div class="stat-info">
          <p class="stat-label">Approved</p>
          <h3 class="stat-value">{{ stats.approved }}</h3>
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
        <div class="stat-icon svc">⚕️</div>
        <div class="stat-info">
          <p class="stat-label">Services</p>
          <h3 class="stat-value">{{ stats.services }}</h3>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon staff">👤</div>
        <div class="stat-info">
          <p class="stat-label">Staff</p>
          <h3 class="stat-value">{{ stats.staff }}</h3>
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

    <!-- PENDING APPOINTMENT REQUESTS -->
    <div class="card">
      <div class="card-header">
        <h3>Pending Appointment's Requests</h3>
        <router-link to="/business/appointments" class="view-all">View All</router-link>
      </div>
      <div v-if="loading" class="loading">Loading...</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Status</th>
<!--            <th>Actions</th>-->
          </tr>
        </thead>
        <tbody>
          <tr v-for="appt in pendingAppointments" :key="appt.appointment_code">
            <td><code>{{ appt.appointment_code }}</code></td>
            <td>{{ formatDate(appt.appointment_start_date) }}</td>
            <td>{{ formatTime(appt.start_time) }}</td>
            <td>{{ formatTime(appt.end_time) }}</td>
            <td><span :class="['badge', appt.status]">{{ appt.status }}</span></td>
<!--            <td>-->
<!--              <button class="approve-btn" @click="changeStatus(appt, 'approved')">Approve</button>-->
<!--              <button class="reject-btn" @click="changeStatus(appt, 'rejected')">Reject</button>-->
<!--            </td>-->
          </tr>
<!--          <tr v-if="pendingAppointments.length === 0">-->
<!--            <td colspan="6" class="empty">No pending requests</td>-->
<!--          </tr>-->
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'
import formatTime from "../../utils/formatTime.js";
import formatDate from "../../utils/formatDate.js";

const authStore = useAuthStore()
const loading = ref(true)
const appointments = ref([])

const stats = ref({ appointments: 0, pending: 0, approved: 0, clients: 0, services: 0, staff: 0, invoices: 0, locations: 0 })

const pendingAppointments = computed(() => appointments.value.filter(a => a.status === 'pending').slice(0, 8))

async function changeStatus(appt, status) {
  try {
    await api.patch(`/appointments/${appt.appointment_code}/status`, { status })
    appt.status = status
  } catch (err) {
    console.error('Status update failed', err)
  }
}

onMounted(async () => {
  const biz = authStore.user?.business_code
  const [appts, clients, svcs, staff, invs, locs] = await Promise.allSettled([
    api.get('/appointments/get-all-appointments', { params: biz ? { business_code: biz } : {} }),
    api.get('/clients/get-client', { params: biz ? { business_code: biz } : {} }),
    api.get('/services/get-all-services', { params: biz ? { business_code: biz } : {} }),
    api.get('/users/get-all-users', { params: biz ? { business_code: biz } : {} }),
    api.get('/invoices/get-invoice', { params: biz ? { business_code: biz } : {} }),
    api.get('/locations/get-all-locations', { params: biz ? { business_code: biz } : {} }),
  ])

  if (appts.status === 'fulfilled') {
    appointments.value = appts.value.data.data || []
    stats.value.appointments = appointments.value.length
    stats.value.pending = appointments.value.filter(a => a.status === 'pending').length
    stats.value.approved = appointments.value.filter(a => a.status === 'approved').length
  }

  stats.value.clients =
      clients.status === 'fulfilled'
          ? (clients.value.data.data || []).filter(c => c.user_type === 'client').length : 0
  stats.value.services = svcs.status === 'fulfilled' ? (svcs.value.data.data?.length ?? 0) : 0
  stats.value.staff =
      staff.status === 'fulfilled'
          ? (staff.value.data.data || []).filter(
              s => ['operational_staff', 'service_staff'].includes(s.user_type)
          ).length
          : 0
  stats.value.invoices = invs.status === 'fulfilled' ? (invs.value.data.data?.length ?? 0) : 0
  stats.value.locations = locs.status === 'fulfilled' ? (locs.value.data.data?.length ?? 0) : 0
  loading.value = false
})
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 20px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card { background: white; padding: 20px; border-radius: 10px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.stat-icon.app { background: #fef9c3; }
.stat-icon.pending { background: #fef3c7; }
.stat-icon.approved { background: #dcfce7; }
.stat-icon.client { background: #dbeafe; }
.stat-icon.svc { background: #e0f2fe; }
.stat-icon.staff { background: #ffe4e6; }
.stat-icon.inv { background: #f0fdf4; }
.stat-icon.loc { background: #fce7f3; }
.stat-label { margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { margin: 4px 0 0; font-size: 26px; font-weight: 700; color: #1e293b; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-header h3 { margin: 0; font-size: 16px; color: #1e293b; }
.view-all { font-size: 13px; color: #6366f1; text-decoration: none; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: capitalize; }
.badge.pending { background: #fef3c7; color: #d97706; }
.badge.approved { background: #dcfce7; color: #16a34a; }
.badge.rejected { background: #fee2e2; color: #dc2626; }
.badge.canceled { background: #fee2e2; color: #dc2626; }
.badge.completed { background: #f0fdf4; color: #15803d; }
.badge.rescheduled { background: #dbeafe; color: #2563eb; }
.badge.in_progress { background: #e0f2fe; color: #0369a1; }
.approve-btn { background: #dcfce7; color: #166534; border: none; padding: 4px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.reject-btn { background: #fee2e2; color: #dc2626; border: none; padding: 4px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
</style>
