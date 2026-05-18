<template>
  <div class="page">

    <!-- HEADER -->
    <div class="header">

      <div>
        <h2>Appointments</h2>
        <p class="sub">
          Manage all appointment requests
        </p>
      </div>

      <router-link to="/appointments/create" class="btn">
        + New Appointments
      </router-link>

    </div>

    <!-- FILTERS -->
    <div class="filters">

      <select v-model="statusFilter">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="rescheduled">Rescheduled</option>
      </select>

      <input
          v-model="search"
          placeholder="Search client..."
      />

    </div>

    <!-- TABLE -->
    <div class="card">

      <table class="table">

        <thead>
        <tr>
          <th>Client</th>
          <th>Service</th>
          <th>Staff</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
          <th width="280">Actions</th>
        </tr>
        </thead>

        <tbody>

        <tr
            v-for="appointment in filteredAppointments"
            :key="appointment.id"
        >

          <td>{{ appointment.client }}</td>
          <td>{{ appointment.service }}</td>
          <td>{{ appointment.staff }}</td>
          <td>{{ appointment.date }}</td>
          <td>{{ appointment.time }}</td>

          <td>
              <span
                  :class="['badge', appointment.status]"
              >
                {{ appointment.status }}
              </span>
          </td>

          <td>

            <button
                class="view-btn"
                @click="openDetails(appointment)"
            >
              View
            </button>

            <button
                class="approve-btn"
                @click="approveAppointment(appointment)"
                :disabled="appointment.status === 'approved'"
            >
              Approve
            </button>

            <button
                class="reschedule-btn"
                @click="openReschedule(appointment)"
            >
              Reschedule
            </button>

            <button
                class="reject-btn"
                @click="rejectAppointment(appointment)"
            >
              Reject
            </button>

          </td>

        </tr>

        </tbody>

      </table>

    </div>

    <!-- DETAILS MODAL -->
    <div
        v-if="showDetails"
        class="modal-overlay"
    >

      <div class="modal">

        <div class="modal-header">
          <h3>Appointment Details</h3>

          <button
              class="close"
              @click="showDetails = false"
          >
            ✕
          </button>
        </div>

        <div class="details">

          <div>
            <strong>Client:</strong>
            {{ selectedAppointment.client }}
          </div>

          <div>
            <strong>Service:</strong>
            {{ selectedAppointment.service }}
          </div>

          <div>
            <strong>Staff:</strong>
            {{ selectedAppointment.staff }}
          </div>

          <div>
            <strong>Date:</strong>
            {{ selectedAppointment.date }}
          </div>

          <div>
            <strong>Time:</strong>
            {{ selectedAppointment.time }}
          </div>

          <div>
            <strong>Status:</strong>
            {{ selectedAppointment.status }}
          </div>

        </div>

      </div>

    </div>

    <!-- RESCHEDULE MODAL -->
    <div
        v-if="showReschedule"
        class="modal-overlay"
    >

      <div class="modal">

        <div class="modal-header">
          <h3>Reschedule Appointment</h3>

          <button
              class="close"
              @click="closeReschedule"
          >
            ✕
          </button>
        </div>

        <form
            class="form"
            @submit.prevent="submitReschedule"
        >

          <input
              type="date"
              v-model="rescheduleForm.date"
          />

          <input
              type="time"
              v-model="rescheduleForm.time"
          />

          <textarea
              v-model="rescheduleForm.reason"
              placeholder="Reason for reschedule"
          ></textarea>

          <button
              type="submit"
              class="primary-btn"
          >
            Send Reschedule Request
          </button>

        </form>

      </div>

    </div>

  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

/* FILTERS */
const search = ref('')
const statusFilter = ref('')

/* MODALS */
const showDetails = ref(false)
const showReschedule = ref(false)

/* SELECTED */
const selectedAppointment = ref(null)

/* APPOINTMENTS */
const appointments = ref([
  {
    id: 1,
    client: 'Ahmed',
    service: 'Consultation',
    staff: 'Dr. Ali',
    date: '2026-05-20',
    time: '10:00 AM',
    status: 'pending'
  },
  {
    id: 2,
    client: 'Fatima',
    service: 'Dental Checkup',
    staff: 'Sara Khan',
    date: '2026-05-21',
    time: '01:00 PM',
    status: 'approved'
  }
])

/* FILTERED */
const filteredAppointments = computed(() => {
  return appointments.value.filter(a => {

    const matchSearch =
        a.client.toLowerCase()
            .includes(search.value.toLowerCase())

    const matchStatus =
        !statusFilter.value ||
        a.status === statusFilter.value

    return matchSearch && matchStatus
  })
})

/* DETAILS */
function openDetails(appointment) {
  selectedAppointment.value = appointment
  showDetails.value = true
}

/* APPROVE */
function approveAppointment(appointment) {

  // AVAILABILITY CHECK PLACEHOLDER
  const available = true

  if (available) {
    appointment.status = 'approved'
  }

  console.log('Approved:', appointment)

  // API READY
  // await axios.patch(...)
}

/* REJECT */
function rejectAppointment(appointment) {
  appointment.status = 'rejected'

  console.log('Rejected:', appointment)

  // API READY
}

/* RESCHEDULE */
const rescheduleForm = reactive({
  date: '',
  time: '',
  reason: ''
})

function openReschedule(appointment) {
  selectedAppointment.value = appointment
  showReschedule.value = true
}

function closeReschedule() {
  showReschedule.value = false
}

function submitReschedule() {

  selectedAppointment.value.status =
      'rescheduled'

  selectedAppointment.value.date =
      rescheduleForm.date

  selectedAppointment.value.time =
      rescheduleForm.time

  console.log(
      'Rescheduled:',
      selectedAppointment.value
  )

  closeReschedule()

  // API READY
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub {
  color: #64748b;
}

/* FILTERS */
.filters {
  display: flex;
  gap: 10px;
}

.filters input,
.filters select {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

/* CARD */
.card {
  background: white;
  border-radius: 10px;
  padding: 20px;
}

/* TABLE */
.table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

/* BADGES */
.badge {
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.pending {
  background: #fef3c7;
  color: #92400e;
}

.approved {
  background: #dcfce7;
  color: #166534;
}

.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.rescheduled {
  background: #dbeafe;
  color: #1d4ed8;
}

/* BUTTONS */
.primary-btn,
.view-btn,
.approve-btn,
.reject-btn,
.reschedule-btn {
  border: none;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 5px;
}

.btn {
  background: #6366f1;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
}
.primary-btn {
  background: #6366f1;
  color: white;
}

.view-btn {
  background: #0ea5e9;
  color: white;
}

.approve-btn {
  background: #22c55e;
  color: white;
}

.reject-btn {
  background: #ef4444;
  color: white;
}

.reschedule-btn {
  background: #f59e0b;
  color: white;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 999;
}

.modal {
  background: white;
  width: 500px;
  border-radius: 10px;
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close {
  border: none;
  background: none;
  cursor: pointer;
}

/* DETAILS */
.details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

/* FORM */
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.form input,
.form textarea {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

textarea {
  min-height: 100px;
}
</style>