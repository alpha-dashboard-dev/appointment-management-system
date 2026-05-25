<template>
  <div class="page">
    <div class="welcome">
      <h2>Operations Dashboard</h2>
      <p>Welcome back, {{ authStore.user?.name }}!</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">{{ stats.pending }}</div><div class="stat-label">Pending Requests</div></div>
      <div class="stat-card"><div class="stat-value">{{ stats.today }}</div><div class="stat-label">Today's Appointments</div></div>
      <div class="stat-card"><div class="stat-value">{{ stats.approved }}</div><div class="stat-label">Approved</div></div>
      <div class="stat-card"><div class="stat-value">{{ stats.total }}</div><div class="stat-label">Total Appointments</div></div>
    </div>
    <div class="section">
      <h3>Pending Requests</h3>
      <div class="card">
        <div v-if="loading" class="loading">Loading...</div>
        <table v-else class="table">
          <thead><tr><th>Code</th><th>Date</th><th>Client</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
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
            <tr v-if="pendingAppts.length === 0"><td colspan="6" class="empty">No pending requests</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="quick-actions">
      <h3>Quick Actions</h3>
      <div class="action-row">
        <router-link to="/operations/appointments" class="action-btn">All Appointments</router-link>
        <router-link to="/operations/pending" class="action-btn">Pending Requests</router-link>
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
.page { display: flex; flex-direction: column; gap: 20px; }
.welcome h2 { margin: 0; color: #1e293b; }
.welcome p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stat-card { background: white; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.stat-value { font-size: 28px; font-weight: 700; color: #064e3b; }
.stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
.section h3, .quick-actions h3 { margin: 0 0 12px; color: #1e293b; font-size: 16px; }
.card { background: white; border-radius: 10px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 9px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 16px; font-size: 13px; }
.badge.pending { background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.approve-btn { background: #dcfce7; color: #166534; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.reject-btn { background: #fee2e2; color: #dc2626; border: none; padding: 4px 9px; border-radius: 5px; cursor: pointer; font-size: 12px; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.action-row { display: flex; gap: 12px; }
.action-btn { background: #064e3b; color: white; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; }
@media (max-width: 800px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
