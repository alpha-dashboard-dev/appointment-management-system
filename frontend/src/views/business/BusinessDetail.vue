<template>
  <div class="page">

    <div v-if="loading" class="loading-full">Loading...</div>

    <template v-else>

      <!-- HEADER -->
      <div class="header-card">
        <div>
          <h2>{{ business?.name }}</h2>
          <p class="meta">Organization: {{ organization?.name }}</p>
        </div>
        <span :class="['badge', business?.status]">
          {{ business?.status }}
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

      <!-- SERVICES -->
      <div v-if="activeTab === 'Services'" class="card">
        <div class="card-header">
          <h3>Services</h3>
          <router-link to="/services/create" class="primary-btn">
            + Add Service
          </router-link>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
          <tr v-for="svc in services" :key="svc.service_code">
            <td>{{ svc.name }}</td>
            <td>{{ svc.description }}</td>
            <td>{{ svc.price ?? '—' }}</td>
            <td>
                <span :class="['badge', svc.status]">
                  {{ svc.status }}
                </span>
            </td>
          </tr>

          <tr v-if="services.length === 0">
            <td colspan="4" class="empty">No services</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- STAFF -->
      <div v-if="activeTab === 'Staff'" class="card">
        <div class="card-header">
          <h3>Staff Members</h3>
          <router-link to="/users/create?staffOnly=true" class="primary-btn">
            + Add Staff
          </router-link>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
          <tr v-for="user in staff" :key="user.user_code">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.user_type }}</td>
            <td>
                <span :class="['badge', user.is_active ? 'active' : 'inactive']">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
            </td>
          </tr>

          <tr v-if="staff.length === 0">
            <td colspan="4" class="empty">No staff members</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- LOCATIONS -->
      <div v-if="activeTab === 'Locations'" class="card">
        <div class="card-header">
          <h3>Locations</h3>
          <router-link to="/locations/create" class="primary-btn">
            + Add Location
          </router-link>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Street</th>
              <th>City</th>
              <th>Country</th>
              <th>Location Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
          <tr v-for="loc in locations" :key="loc.location_code">
            <td>{{ loc.address }}</td>
            <td>{{ loc.street }}</td>
            <td>{{ loc.city }}</td>
            <td>{{ loc.country }}</td>
            <td>{{ loc.location_type }}</td>
            <td><span :class="['badge', loc.status]">
                  {{ loc.status }}
                </span></td>
          </tr>

          <tr v-if="locations.length === 0">
            <td colspan="6" class="empty">No locations</td>
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
              <th>Appointment Code</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Start time</th>
              <th>End time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
          <tr v-for="appt in appointments"  :key="appt.appointment_code">
            <td><code>{{ appt.appointment_code}}</code></td>
            <td>{{ formatDate(appt.appointment_start_date) }}</td>
            <td>{{ formatDate(appt.appointment_end_date) }}</td>
            <td>{{formatTime(appt.start_time)}}</td>
            <td>{{formatTime(appt.end_time)}}</td>

            <td>
                <span :class="['badge', appt.status]">
                  {{ appt.status }}
                </span>
            </td>
          </tr>

          <tr v-if="appointments.length === 0">
            <td colspan="6" class="empty">No appointments</td>
          </tr>
          </tbody>
        </table>
      </div>

    </template>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import { useRoute } from 'vue-router'
import formatDate from "../../utils/formatDate.js";
import formatTime from "../../utils/formatTime.js";
import {apiHandler} from "../../utils/api/apiHandler.js";

const route = useRoute()
const businessCode = route.params.business_code
const loading = ref(false)

const business = ref(null)

const tabs = ['Services', 'Staff', 'Locations', 'Appointments']

const activeTab = ref('Services')
const organization = computed( () =>
    business.value?.organization || []
)

const services = computed(() =>
    business.value?.services || []
)

const staff = computed(() => {
  const users = business.value?.users || []
  return users.filter(
      u =>
          u.user_type === 'operational_staff' ||
          u.user_type === 'service_staff'
  )
})

const locations = computed(() =>
    business.value?.locations || []
)

const appointments = computed(() =>
    business.value?.appointments || []
)

async function fetchBusiness(code) {

  loading.value = true

  try {
    const res = await apiHandler("business", "getOneBusiness", {
      code: businessCode,
    })

    // console.log(res)

    business.value = res.data.data || {}
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchBusiness()
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }

.loading-full { text-align: center; padding: 40px; color: #94a3b8; }

.header-card {
  background: white;
  padding: 20px 24px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.header-card h2 { margin: 0; color: #1e293b; }
.meta { margin: 4px 0 0; font-size: 13px; color: #64748b; }

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tab {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  font-size: 13px;
  color: #64748b;
  transition: all 0.2s;
}
.tab.active { background: #6366f1; color: white; border-color: #6366f1; }

.card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.card-header h3 { margin: 0; color: #1e293b; }

.primary-btn {
  background: #6366f1;
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
}

.table { width: 100%; border-collapse: collapse; }
.table th, .table td {
  text-align: left;
  padding: 10px 12px;
  font-size: 13px;
  border-bottom: 1px solid #f1f5f9;
}
.table th { color: #64748b; font-weight: 600; }

.badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}
.badge.active     { background: #dcfce7; color: #16a34a; }
.badge.inactive   { background: #fee2e2; color: #dc2626; }
.badge.pending    { background: #fef3c7; color: #d97706; }
.badge.approved   { background: #dcfce7; color: #16a34a; }
.badge.rejected   { background: #fee2e2; color: #dc2626; }
.badge.rescheduled { background: #dbeafe; color: #2563eb; }

.loading, .empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
</style>
