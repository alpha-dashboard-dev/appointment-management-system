<template>
  <div class="page">
    <div class="welcome">
      <h2>My Dashboard</h2>
      <p>Welcome, {{ authStore.user?.name }}!</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">{{ stats.today }}</div><div class="stat-label">Today's Appointments</div></div>
      <div class="stat-card"><div class="stat-value">{{ stats.upcoming }}</div><div class="stat-label">Upcoming</div></div>
      <div class="stat-card"><div class="stat-value">{{ stats.completed }}</div><div class="stat-label">Completed</div></div>
    </div>
    <div class="section">
      <h3>Today's Appointments</h3>
      <div class="card">
        <div v-if="loading" class="loading">Loading...</div>
        <table v-else class="table">
          <thead><tr><th>Code</th><th>Start</th><th>End</th><th>Location</th><th>Status</th></tr></thead>
          <tbody>
            <tr v-for="appt in todayAppts" :key="appt.appointment_code">
              <td><code>{{ appt.appointment_code }}</code></td>
              <td>{{ appt.start_time ?? '—' }}</td>
              <td>{{ appt.end_time ?? '—' }}</td>
              <td>{{ appt.location_code ?? '—' }}</td>
              <td><span :class="['badge', appt.status]">{{ appt.status }}</span></td>
            </tr>
            <tr v-if="todayAppts.length === 0"><td colspan="5" class="empty">No appointments today</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="quick-actions">
      <h3>Quick Links</h3>
      <div class="action-row">
        <router-link to="/staff/appointments" class="action-btn">My Appointments</router-link>
        <router-link to="/staff/schedule" class="action-btn">My Schedule</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'

const authStore = useAuthStore()
const appointments = ref([])
const loading = ref(true)
const stats = reactive({ today: 0, upcoming: 0, completed: 0 })

const todayStr = new Date().toISOString().split('T')[0]
const todayAppts = computed(() => appointments.value.filter(a => a.appointment_start_date?.startsWith(todayStr)))

async function fetchAppointments() {
  loading.value = true
  try {
    const biz = authStore.user?.business_code
    const res = await api.get('/appointments', { params: biz ? { business_code: biz } : {} })
    appointments.value = res.data.data || []
    const now = new Date()
    stats.today = appointments.value.filter(a => a.appointment_start_date?.startsWith(todayStr)).length
    stats.completed = appointments.value.filter(a => a.status === 'completed').length
    stats.upcoming = appointments.value.filter(a => {
      if (!a.appointment_start_date) return false
      return new Date(a.appointment_start_date) > now && a.status !== 'completed'
    }).length
  } catch (_) {}
  finally { loading.value = false }
}

onMounted(fetchAppointments)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; }
.welcome h2 { margin: 0; color: #1e293b; }
.welcome p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.stat-card { background: white; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.stat-value { font-size: 28px; font-weight: 700; color: #1e3a5f; }
.stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
.section h3, .quick-actions h3 { margin: 0 0 12px; color: #1e293b; font-size: 16px; }
.card { background: white; border-radius: 10px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 9px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 16px; font-size: 13px; }
.badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.badge.pending { background: #fef3c7; color: #92400e; }
.badge.approved { background: #dcfce7; color: #166534; }
.badge.in_progress { background: #dbeafe; color: #1d4ed8; }
.badge.completed { background: #d1fae5; color: #065f46; }
.badge.rejected, .badge.canceled { background: #fee2e2; color: #991b1b; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.action-row { display: flex; gap: 12px; }
.action-btn { background: #1e3a5f; color: white; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; }
</style>
