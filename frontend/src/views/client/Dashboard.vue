<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon upcoming">🗓️</div>
        <div class="stat-info">
          <p class="stat-label">Upcoming</p>
          <h3 class="stat-value">{{ stats.upcoming }}</h3>
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
        <div class="stat-icon completed">✅</div>
        <div class="stat-info">
          <p class="stat-label">Completed</p>
          <h3 class="stat-value">{{ stats.completed }}</h3>
        </div>
      </div>
    </div>

    <div class="book-section">
      <h3>Ready to book?</h3>
      <router-link to="/client/book" class="book-btn">Book Appointment</router-link>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Recent Appointments</h3>
        <router-link to="/client/appointments" class="view-all">View All</router-link>
      </div>
      <div v-if="loading" class="loading">Loading...</div>
      <table v-else class="table">
        <thead>
          <tr><th>Code</th><th>Date</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr v-for="appt in recent" :key="appt.appointment_code">
            <td><code>{{ appt.appointment_code }}</code></td>
            <td>{{ appt.appointment_start_date?.split('T')[0] ?? '—' }}</td>
            <td><span :class="['badge', appt.status]">{{ appt.status }}</span></td>
          </tr>
          <tr v-if="recent.length === 0">
            <td colspan="3" class="empty">No appointments yet</td>
          </tr>
        </tbody>
      </table>
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
const stats = reactive({ upcoming: 0, pending: 0, completed: 0 })
const recent = computed(() => appointments.value.slice(0, 5))

async function fetchAppointments() {
  loading.value = true
  try {
    const userCode = authStore.user?.user_code
    const params = userCode ? { user_code: userCode } : {}
    const res = await api.get('/appointments', { params })
    appointments.value = res.data.data || []
    const now = new Date()
    stats.pending = appointments.value.filter(a => a.status === 'pending').length
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
.dashboard { display: flex; flex-direction: column; gap: 20px; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.stat-card { background: white; padding: 20px; border-radius: 10px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.stat-icon.upcoming  { background: #e0f2fe; }
.stat-icon.pending   { background: #fef3c7; }
.stat-icon.completed { background: #dcfce7; }
.stat-label { margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { margin: 4px 0 0; font-size: 26px; font-weight: 700; color: #1e293b; }

.book-section { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #6366f1, #818cf8); border-radius: 10px; padding: 20px 24px; }
.book-section h3 { margin: 0; color: white; flex: 1; font-size: 16px; }
.book-btn { background: white; color: #6366f1; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 700; white-space: nowrap; }

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
.badge.pending   { background: #fef3c7; color: #d97706; }
.badge.approved  { background: #dcfce7; color: #16a34a; }
.badge.completed { background: #f0fdf4; color: #15803d; }
.badge.rejected, .badge.canceled { background: #fee2e2; color: #dc2626; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
@media (max-width: 800px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
