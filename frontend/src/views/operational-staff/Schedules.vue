<template>
  <div class="page">
    <div class="header"><h2>Staff Schedules</h2></div>
    <div class="card">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Staff Code</th>
            <th>Working Days</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in schedules" :key="s.id">
            <td><code>{{ s.user_code }}</code></td>
            <td>{{ s.working_days }}</td>
            <td>{{ formatTime(s.start_time) }}</td>
            <td>{{ formatTime(s.end_time) }}</td>
            <td>{{ s.location_code || '—' }}</td>
          </tr>
          <tr v-if="schedules.length === 0"><td colspan="5" class="empty">No schedules found</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/utils/api'
import formatTime from "../../utils/formatTime.js";

const authStore = useAuthStore()
const schedules = ref([])
const loading = ref(true)
const error = ref('')

async function fetchSchedules() {
  loading.value = true
  error.value = ''
  try {
    const biz = authStore.user?.business_code
    const res = await api.get('/schedules/get-schedule', { params: biz ? { business_code: biz } : {} })
    schedules.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load schedules'
  } finally {
    loading.value = false
  }
}


onMounted(fetchSchedules)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.header h2 { margin: 0; color: #1e293b; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
.table th { color: #64748b; font-weight: 600; }
.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.error-msg { color: #ef4444; font-size: 13px; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
</style>
