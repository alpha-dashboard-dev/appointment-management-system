<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon pending">⏳</div>
        <div class="stat-info">
          <p class="stat-label">Pending Requests</p>
          <h3 class="stat-value">{{ stats.pending }}</h3>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon today">📅</div>
        <div class="stat-info">
          <p class="stat-label">Today's Appointments</p>
          <h3 class="stat-value">{{ stats.today }}</h3>
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
        <div class="stat-icon total">📊</div>
        <div class="stat-info">
          <p class="stat-label">Total Appointments</p>
          <h3 class="stat-value">{{ stats.total }}</h3>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Pending Requests</h3>
      </div>
      <div v-if="loading" class="loading">Loading...</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Date</th>
            <th>Client</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appt in pendingAppts" :key="appt.appointment_code">
            <td><code>{{ appt.appointment_code }}</code></td>
            <td>{{ appt.appointment_start_date?.split('T')[0] ?? '—' }}</td>
            <td>{{ appt.client_code ?? '—' }}</td>
            <td>{{ appt.location_code ?? '—' }}</td>
            <td><span class="badge pending">Pending</span></td>
            <td>
              <button class="approve-btn" @click="changeStatus(appt, 'approved')">Approve</button>
              <button class="reject-btn" @click="changeStatus(appt, 'rejected')">Reject</button>
            </td>
          </tr>
          <tr v-if="pendingAppts.length === 0">
            <td colspan="6" class="empty">No pending requests</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Quick Actions</h3>
      </div>
      <div class="action-row">
        <router-link to="/operations/appointments" class="action-btn">All Appointments</router-link>
        <router-link to="/operations/appointments/pending" class="action-btn">Pending Requests</router-link>
        <router-link to="/operations/availability" class="action-btn">Check Availability</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'

const authStore = useAuthStore()
const appointments = ref([])
const loading = ref(true)

const stats = reactive({ pending: 0, today: 0, approved: 0, total: 0 })
const pendingAppts = computed(() => appointments.value.filter(a => a.status === 'pending'))

const today = new Date().toISOString().split('T')[0]

async function fetchAppointments() {
  loading.value = true
  try {
    const biz = authStore.user?.business_code
    const res = await api.get('/appointments', { params: biz ? { business_code: biz } : {} })
    appointments.value = res.data.data || []
    stats.total = appointments.value.length
    stats.pending = appointments.value.filter(a => a.status === 'pending').length
    stats.approved = appointments.value.filter(a => a.status === 'approved').length
    stats.today = appointments.value.filter(a => a.appointment_start_date?.startsWith(today)).length
  } catch (_) {}
  finally { loading.value = false }
}

async function changeStatus(appt, status) {
  try {
    await api.patch(`/appointments/${appt.appointment_code}/status`, { status })
    await fetchAppointments()
  } catch (_) {}
}

onMounted(fetchAppointments)
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 20px; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card { background: white; padding: 20px; border-radius: 10px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.stat-icon.pending  { background: #fef3c7; }
.stat-icon.today    { background: #fef9c3; }
.stat-icon.approved { background: #dcfce7; }
.stat-icon.total    { background: #dbeafe; }
.stat-label { margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { margin: 4px 0 0; font-size: 26px; font-weight: 700; color: #1e293b; }

.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-header h3 { margin: 0; font-size: 16px; color: #1e293b; }
.view-all { font-size: 13px; color: #6366f1; text-decoration: none; }
.view-all:hover { text-decoration: underline; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: capitalize; }
.badge.pending  { background: #fef3c7; color: #d97706; }
.badge.approved { background: #dcfce7; color: #16a34a; }
.badge.rejected { background: #fee2e2; color: #dc2626; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.approve-btn { background: #dcfce7; color: #166534; border: none; padding: 4px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.reject-btn  { background: #fee2e2; color: #dc2626; border: none; padding: 4px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; }
.action-row { display: flex; gap: 12px; flex-wrap: wrap; }
.action-btn { background: #6366f1; color: white; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; transition: opacity 0.15s; }
.action-btn:hover { opacity: 0.88; }
@media (max-width: 800px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
