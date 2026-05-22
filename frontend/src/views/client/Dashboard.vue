<template>
  <div class="page">
    <div class="welcome">
      <h2>Welcome, {{ authStore.user?.name }}!</h2>
      <p>Manage your appointments easily.</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">{{ stats.upcoming }}</div><div class="stat-label">Upcoming</div></div>
      <div class="stat-card"><div class="stat-value">{{ stats.pending }}</div><div class="stat-label">Pending</div></div>
      <div class="stat-card"><div class="stat-value">{{ stats.completed }}</div><div class="stat-label">Completed</div></div>
    </div>
    <div class="book-section">
      <h3>Ready to book?</h3>
      <router-link to="/client/book" class="book-btn">Book Appointment</router-link>
    </div>
    <div class="section">
      <h3>Recent Appointments</h3>
      <div class="card">
        <div v-if="loading" class="loading">Loading...</div>
        <table v-else class="table">
          <thead><tr><th>Code</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            <tr v-for="appt in recent" :key="appt.appointment_code">
              <td><code>{{ appt.appointment_code }}</code></td>
              <td>{{ appt.appointment_start_date?.split('T')[0] ?? '—' }}</td>
              <td><span :class="['badge', appt.status]">{{ appt.status }}</span></td>
            </tr>
            <tr v-if="recent.length === 0"><td colspan="3" class="empty">No appointments yet</td></tr>
          </tbody>
        </table>
        <router-link to="/client/appointments" class="view-all">View all appointments →</router-link>
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
.page { display: flex; flex-direction: column; gap: 20px; }
.welcome h2 { margin: 0; color: #1e293b; }
.welcome p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.stat-card { background: white; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.stat-value { font-size: 28px; font-weight: 700; color: #7c3aed; }
.stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
.book-section { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #7c3aed, #a855f7); border-radius: 10px; padding: 20px 24px; }
.book-section h3 { margin: 0; color: white; flex: 1; }
.book-btn { background: white; color: #7c3aed; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 700; }
.section h3 { margin: 0 0 12px; color: #1e293b; font-size: 16px; }
.card { background: white; border-radius: 10px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 9px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 16px; font-size: 13px; }
.badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.badge.pending { background: #fef3c7; color: #92400e; }
.badge.approved { background: #dcfce7; color: #166534; }
.badge.completed { background: #d1fae5; color: #065f46; }
.badge.rejected, .badge.canceled { background: #fee2e2; color: #991b1b; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.view-all { display: block; text-align: right; margin-top: 12px; font-size: 13px; color: #7c3aed; text-decoration: none; }
</style>
