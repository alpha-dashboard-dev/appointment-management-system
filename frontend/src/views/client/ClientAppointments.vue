<template>
  <div class="page">

    <!-- HEADER -->
    <div class="header">

      <div>
        <h2>Request Appointment</h2>

        <p class="sub">
          Book services from available locations
        </p>
      </div>

      <div>
        <h2> Request Appointment</h2>
        <p class="sub">
          Book services from available locations
        </p>
      </div>

    </div>

    <!-- REQUEST FORM -->
    <div class="card">

      <form
          class="form"
          @submit.prevent="submitAppointment"
      >

        <!-- BUSINESS -->
        <div class="field">
          <label>Business</label>

          <select v-model="form.businessId">
            <option value="">Select Business</option>

            <option
                v-for="business in businesses"
                :key="business.id"
                :value="business.id"
            >
              {{ business.name }}
            </option>

          </select>
        </div>

        <!-- LOCATION -->
        <div class="field">
          <label>Location</label>

          <select v-model="form.locationId">
            <option value="">Select Location</option>

            <option
                v-for="location in filteredLocations"
                :key="location.id"
                :value="location.id"
            >
              {{ location.name }}
            </option>

          </select>
        </div>

        <!-- SERVICE -->
        <div class="field">
          <label>Service</label>

          <select v-model="form.serviceId">
            <option value="">Select Service</option>

            <option
                v-for="service in filteredServices"
                :key="service.id"
                :value="service.id"
            >
              {{ service.name }}
              - ${{ service.price }}
            </option>

          </select>
        </div>

        <!-- DATE -->
        <div class="field">
          <label>Date</label>

          <input
              type="date"
              v-model="form.date"
          />
        </div>

        <!-- TIME -->
        <div class="field">
          <label>Time</label>

          <input
              type="time"
              v-model="form.time"
          />
        </div>

        <!-- NOTES -->
        <div class="field full">
          <label>Notes</label>

          <textarea
              v-model="form.notes"
              placeholder="Optional notes"
          ></textarea>
        </div>

        <!-- SUBMIT -->
        <div class="full">
          <button
              type="submit"
              class="primary-btn"
          >
            Request Appointment
          </button>
        </div>

      </form>

    </div>

    <!-- HISTORY -->
    <div class="card">

      <div class="card-header">
        <h3>My Appointments</h3>
      </div>

      <table class="table">

        <thead>
        <tr>
          <th>Business</th>
          <th>Service</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
        </tr>
        </thead>

        <tbody>

        <tr
            v-for="appointment in appointments"
            :key="appointment.id"
        >

          <td>{{ appointment.business }}</td>

          <td>{{ appointment.service }}</td>

          <td>{{ appointment.date }}</td>

          <td>{{ appointment.time }}</td>

          <td>
              <span
                  :class="['badge', appointment.status]"
              >
                {{ appointment.status }}
              </span>
          </td>

        </tr>

        </tbody>

      </table>

    </div>

  </div>
</template>

<script setup>
import {
  computed,
  reactive,
  ref
} from 'vue'

/* BUSINESSES */
const businesses = ref([
  {
    id: 1,
    name: 'City Clinic'
  },
  {
    id: 2,
    name: 'Health Care Center'
  }
])

/* LOCATIONS */
const locations = ref([
  {
    id: 1,
    businessId: 1,
    name: 'Johar Town'
  },
  {
    id: 2,
    businessId: 1,
    name: 'DHA Lahore'
  },
  {
    id: 3,
    businessId: 2,
    name: 'Clifton Karachi'
  }
])

/* SERVICES */
const services = ref([
  {
    id: 1,
    businessId: 1,
    name: 'Consultation',
    price: 50
  },
  {
    id: 2,
    businessId: 1,
    name: 'Dental Checkup',
    price: 80
  },
  {
    id: 3,
    businessId: 2,
    name: 'Therapy',
    price: 100
  }
])

/* APPOINTMENTS */
const appointments = ref([
  {
    id: 1,
    business: 'City Clinic',
    service: 'Consultation',
    date: '2026-05-20',
    time: '10:00',
    status: 'pending'
  }
])

/* FORM */
const form = reactive({
  businessId: '',
  locationId: '',
  serviceId: '',
  date: '',
  time: '',
  notes: ''
})

/* FILTERED LOCATIONS */
const filteredLocations = computed(() => {
  return locations.value.filter(
      l => l.businessId === form.businessId
  )
})

/* FILTERED SERVICES */
const filteredServices = computed(() => {
  return services.value.filter(
      s => s.businessId === form.businessId
  )
})

/* SUBMIT */
function submitAppointment() {

  const business =
      businesses.value.find(
          b => b.id === form.businessId
      )

  const service =
      services.value.find(
          s => s.id === form.serviceId
      )

  appointments.value.push({
    id: Date.now(),
    business: business?.name,
    service: service?.name,
    date: form.date,
    time: form.time,
    status: 'pending'
  })

  console.log('Appointment Requested:', form)

  // API READY
  // await axios.post('/appointments', form)

  /* RESET */
  form.businessId = ''
  form.locationId = ''
  form.serviceId = ''
  form.date = ''
  form.time = ''
  form.notes = ''
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

/* CARD */
.card {
  background: white;
  border-radius: 10px;
  padding: 20px;
}

/* FORM */
.form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full {
  grid-column: span 2;
}

label {
  font-size: 14px;
  font-weight: 600;
}

input,
select,
textarea {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

textarea {
  min-height: 100px;
}

/* BUTTON */
.primary-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 6px;
  cursor: pointer;
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

/* RESPONSIVE */
@media (max-width: 768px) {

  .form {
    grid-template-columns: 1fr;
  }

  .full {
    grid-column: span 1;
  }

}
</style>