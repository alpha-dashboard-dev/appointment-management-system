<template>
  <div class="ams-page">
    <div><h2 class="mb-0">My Appointments</h2></div>
    <div class="d-flex gap-2">
      <select v-model="statusFilter" @change="fetch" class="form-select" style="max-width:200px">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="rejected">Rejected</option>
        <option value="canceled">Canceled</option>
      </select>
    </div>
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr><th class="ps-3">Code</th><th>Start Date</th><th>Start Time</th><th>End Time</th><th>Location</th><th class="pe-3">Status</th></tr>
          </thead>
          <tbody>
            <tr v-for="appt in appointments" :key="appt.appointment_code">
              <td class="ps-3"><code>{{ appt.appointment_code }}</code></td>
              <td>{{ formatDate(appt.appointment_start_date) }}</td>
              <td>{{ formatTime(appt.start_time) }}</td>
              <td>{{ formatTime(appt.end_time) }}</td>
              <td>{{ appt.location_code ?? '—' }}</td>
              <td class="pe-3"><span :class="['ams-badge', appt.status]">{{ appt.status }}</span></td>
            </tr>
            <tr v-if="appointments.length === 0"><td colspan="6" class="text-center text-muted py-4">No appointments found</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import formatTime from "../../utils/formatTime.js";
import formatDate from "../../utils/formatDate.js";
import {apiHandler} from "../../utils/api/apiHandler.js";

const appointments = ref([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('')

async function fetch() {
  loading.value = true
  error.value = ''
  try {
    const params = {}
    if (statusFilter.value) params.status = statusFilter.value
    const res = await apiHandler("appointment", "getAllAppointments", { params })
    appointments.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}

onMounted(fetch)
</script>

