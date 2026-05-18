<template>
  <div class="page">

    <!-- HEADER -->
    <div class="header">

      <div>
        <h2>{{ business.name }}</h2>

        <div class="meta">
          {{ business.location }} • {{ business.email }}
        </div>
      </div>

      <span :class="['status', business.status]">
        {{ business.status }}
      </span>

    </div>

    <!-- TABS -->
    <div class="tabs">

      <button
          v-for="tab in tabs"
          :key="tab"
          :class="['tab', activeTab === tab ? 'active' : '']"
          @click="activeTab = tab"
      >
        {{ tab }}
      </button>

    </div>

    <!-- TAB CONTENT -->

    <!-- SERVICES -->
    <div v-if="activeTab === 'Services'" class="card">

      <div class="card-header">
        <h3>Services</h3>

        <button class="primary-btn">
          + Add Service
        </button>
      </div>

      <table class="table">
        <thead>
        <tr>
          <th>Name</th>
          <th>Duration</th>
          <th>Price</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="service in services" :key="service.id">
          <td>{{ service.name }}</td>
          <td>{{ service.duration }}</td>
          <td>${{ service.price }}</td>
        </tr>
        </tbody>
      </table>

    </div>

    <!-- STAFF -->
    <div v-if="activeTab === 'Staff'" class="card">

      <div class="card-header">
        <h3>Staff Members</h3>

        <button class="primary-btn">
          + Add Staff
        </button>
      </div>

      <table class="table">
        <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Email</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="staff in staffMembers" :key="staff.id">
          <td>{{ staff.name }}</td>
          <td>{{ staff.role }}</td>
          <td>{{ staff.email }}</td>
        </tr>
        </tbody>
      </table>

    </div>

    <!-- LOCATIONS -->
    <div v-if="activeTab === 'Locations'" class="card">

      <div class="card-header">
        <h3>Locations</h3>

        <button class="primary-btn">
          + Add Location
        </button>
      </div>

      <table class="table">
        <thead>
        <tr>
          <th>Branch</th>
          <th>Address</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="location in locations" :key="location.id">
          <td>{{ location.name }}</td>
          <td>{{ location.address }}</td>
        </tr>
        </tbody>
      </table>

    </div>

    <!-- APPOINTMENTS -->
    <div v-if="activeTab === 'Appointments'" class="card">

      <div class="card-header">
        <h3>Appointments</h3>
      </div>

      <table class="table">
        <thead>
        <tr>
          <th>Client</th>
          <th>Service</th>
          <th>Date</th>
          <th>Status</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="appointment in appointments" :key="appointment.id">

          <td>{{ appointment.client }}</td>
          <td>{{ appointment.service }}</td>
          <td>{{ appointment.date }}</td>

          <td>
              <span :class="['badge', appointment.status]">
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
import { ref } from 'vue'

/* BUSINESS */
const business = ref({
  id: 1,
  name: 'City Clinic',
  email: 'city@clinic.com',
  location: 'Lahore',
  status: 'active'
})

/* TABS */
const tabs = [
  'Services',
  'Staff',
  'Locations',
  'Appointments'
]

const activeTab = ref('Services')

/* SERVICES */
const services = ref([
  {
    id: 1,
    name: 'Dental Checkup',
    duration: '30 mins',
    price: 50
  },
  {
    id: 2,
    name: 'Consultation',
    duration: '45 mins',
    price: 80
  }
])

/* STAFF */
const staffMembers = ref([
  {
    id: 1,
    name: 'Dr. Ali',
    role: 'Dentist',
    email: 'ali@mail.com'
  },
  {
    id: 2,
    name: 'Sara Khan',
    role: 'Receptionist',
    email: 'sara@mail.com'
  }
])

/* LOCATIONS */
const locations = ref([
  {
    id: 1,
    name: 'Main Branch',
    address: 'Johar Town Lahore'
  },
  {
    id: 2,
    name: 'North Branch',
    address: 'DHA Lahore'
  }
])

/* APPOINTMENTS */
const appointments = ref([
  {
    id: 1,
    client: 'Ahmed',
    service: 'Consultation',
    date: '2026-05-18',
    status: 'approved'
  },
  {
    id: 2,
    client: 'Fatima',
    service: 'Dental Checkup',
    date: '2026-05-20',
    status: 'pending'
  }
])
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* HEADER */
.header {
  background: white;
  padding: 20px;
  border-radius: 10px;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta {
  color: #64748b;
  margin-top: 5px;
}

.status {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
}

.active {
  background: #dcfce7;
  color: #166534;
}

/* TABS */
.tabs {
  display: flex;
  gap: 10px;
}

.tab {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.tab.active {
  background: #6366f1;
  color: white;
}

/* CARD */
.card {
  background: white;
  padding: 20px;
  border-radius: 10px;
}

/* CARD HEADER */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

/* BUTTON */
.primary-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 8px 12px;
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
  padding: 4px 8px;
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
</style>