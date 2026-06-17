<template>
  <div class="ams-page">

    <!-- HEADER -->
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Appointment Recurrence</h2>
        <p class="text-muted small mb-0">Manage recurring appointment rules</p>
      </div>

      <router-link to="/appointment-recurrence/create" class="btn btn-ams">
        + New Recurrence
      </router-link>
    </div>

    <!-- FILTERS -->
    <div class="d-flex gap-2 flex-wrap">

      <select v-model="bizFilter" @change="fetchRecurrences" class="form-select" style="max-width:220px">
        <option value="">All Businesses</option>
        <option v-for="biz in businesses" :key="biz.business_code" :value="biz.business_code">
          {{ biz.name }}
        </option>
      </select>

      <select v-model="statusFilter" @change="fetchRecurrences" class="form-select" style="max-width:180px">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <input
          v-model="search"
          class="form-control"
          style="max-width:240px"
          placeholder="Search appointment code..."
      />

    </div>

    <!-- TABLE -->
    <div class="card shadow-sm border-0">

      <div class="card-body p-0">

        <!-- LOADING / ERROR -->
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">
          {{ error }}
        </div>

        <!-- TABLE -->
        <table v-else class="table table-hover ams-table mb-0">

          <thead class="table-light">
          <tr>
            <th class="ps-3">Business</th>
            <th>Appointment</th>
            <th>Recurrence</th>
            <th>Value</th>
            <th>Auto Cancel</th>
            <th>Reschedule</th>
            <th>Status</th>
            <th class="pe-3" style="width:150px">Actions</th>
          </tr>
          </thead>

          <tbody>

          <tr v-for="rec in filteredRecurrences" :key="rec.id">

            <td class="ps-3">{{ rec.business_name }}</td>
            <td>{{ rec.appointment_code }}</td>
            <td>{{ rec.recurrence_uom }}</td>
            <td>{{ rec.recurrence_value }}</td>
            <td>{{ rec.auto_cancel_after_days ?? '—' }}</td>
            <td>{{ rec.reschedule_after_days ?? '—' }}</td>

            <td>
                <span :class="['ams-badge', rec.status]">
                  {{ rec.status }}
                </span>
            </td>

            <td class="pe-3">

              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>

                <ul class="dropdown-menu dropdown-menu-end">

                  <li>
                    <button class="dropdown-item" @click="openEdit(rec)">
                      <i class="bi bi-pencil me-2"></i>
                      Edit
                    </button>
                  </li>

                  <li>
                    <button class="dropdown-item text-danger" @click="openDelete(rec)">
                      <i class="bi bi-trash me-2"></i>
                      Delete
                    </button>
                  </li>

                </ul>
              </div>

            </td>

          </tr>

          <tr v-if="filteredRecurrences.length === 0">
            <td colspan="8" class="text-center text-muted py-4">
              No recurrence rules found
            </td>
          </tr>

          </tbody>

        </table>

      </div>

    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal d-block" style="background:rgba(0,0,0,0.5);z-index:1050">

      <div class="modal-dialog modal-dialog-centered">

        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">Edit Recurrence</h5>
            <button class="btn-close" @click="showEditModal = false"></button>
          </div>

          <form @submit.prevent="updateRecurrence">

            <div class="modal-body">

              <div class="mb-3">
                <label class="form-label fw-semibold">Recurrence Unit</label>
                <select v-model="editForm.recurrence_uom" class="form-control">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Recurrence Value</label>
                <input v-model.number="editForm.recurrence_value" type="number" class="form-control" min="1" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Status</label>
                <select v-model="editForm.status" class="form-control">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Auto Cancel After Days</label>
                <input v-model.number="editForm.auto_cancel_after_days" type="number" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Reschedule After Days</label>
                <input v-model.number="editForm.reschedule_after_days" type="number" class="form-control" />
              </div>

              <p v-if="formError" class="text-danger small mb-0">{{ formError }}</p>

            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showEditModal = false">
                Cancel
              </button>

              <button class="btn btn-ams" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>

    <!-- DELETE MODAL -->
    <div v-if="showDeleteModal" class="modal d-block" style="background:rgba(0,0,0,0.5);z-index:1050">

      <div class="modal-dialog modal-sm modal-dialog-centered">

        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">Delete Recurrence</h5>
            <button class="btn-close" @click="showDeleteModal = false"></button>
          </div>

          <div class="modal-body text-center">
            <p class="mb-0">
              Delete recurrence for <strong>{{ selected?.appointment_code }}</strong>?
            </p>
          </div>

          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeleteModal = false">
              Cancel
            </button>

            <button class="btn btn-danger btn-sm" @click="deleteRecurrence" :disabled="saving">
              {{ saving ? '...' : 'Delete' }}
            </button>
          </div>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>

import {computed, onMounted, reactive, ref} from "vue";
import {apiHandler} from "../../utils/api/apiHandler.js";

const recurrences = ref([])
const businesses = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const bizFilter = ref('')
const statusFilter = ref('')
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref(null)

const saving = ref(false)
const formError = ref('')

const editForm = reactive({
  recurrence_uom: '',
  recurrence_value: 1,
  status: 'active',
  auto_cancel_after_days: null,
  reschedule_after_days: null
})

async function fetchRecurrences(params = {}) {
  loading.value = true
  error.value = ''

  try {
    const res = await apiHandler("appointment", "getAllAppointmentRecurrences", {
      include: "business"
    })

    console.log(res)

    recurrences.value = (res.data.data || []).map((mapRecurrence) => ({
      ...mapRecurrence,
      business_name: mapRecurrence.business?.name
    }))
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load recurrences'
  } finally {
    loading.value = false
  }
}

async function fetchBusinesses() {

  loading.value = true
  error.value = ''

  try {
    const res = await apiHandler("business", "getAllBusinesses")

    businesses.value = (res.data.data || []).map(
        (business) => ({
          ...business,
          organization_name:
              business.organization?.name || '',
        })
    )
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load Businesses'
  } finally {
    loading.value = false
  }
}

const filteredRecurrences = computed(() => {
  return recurrences.value.filter(r => {

    const matchSearch =
        !search.value ||
        r.appointment_code?.toLowerCase().includes(search.value.toLowerCase())

    const matchBiz = !bizFilter.value || r.business_code === bizFilter.value
    const matchStatus = !statusFilter.value || r.status === statusFilter.value

    return matchSearch && matchBiz && matchStatus
  })
})

function openEdit(rec) {
  selected.value = rec

  editForm.recurrence_uom = rec.recurrence_uom
  editForm.recurrence_value = rec.recurrence_value
  editForm.status = rec.status
  editForm.auto_cancel_after_days = rec.auto_cancel_after_days
  editForm.reschedule_after_days = rec.reschedule_after_days

  formError.value = ''
  showEditModal.value = true
}

function openDelete(rec) {
  selected.value = rec
  showDeleteModal.value = true
}

async function updateRecurrence() {

  saving.value = true
  formError.value = ''

  try {
    await apiHandler('appointment', 'updateAppointmentRecurrence',
        {
          id: selected.value.id,
          ...editForm,
        })
    showEditModal.value = false

  } catch (err) {
    formError.value = err.response?.data?.message || 'Update failed'
  } finally {

    saving.value = false

  }
}

async function deleteRecurrence() {
  saving.value = true

  try {
    await apiHandler("appointment", "deleteAppointmentRecurrence" , {
      id: selected.value.id
    })
    showDeleteModal.value = false
  } catch (err) {
    formError.value = err.response?.data?.message || 'Delete failed'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchRecurrences({
      include: 'business'
    }),
    fetchBusinesses()
  ])
})
</script>