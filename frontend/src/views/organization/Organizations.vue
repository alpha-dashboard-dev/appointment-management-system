<template>
  <div class="ams-page">

    <!-- HEADER -->
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Organizations</h2>
        <p class="text-muted small mb-0">Manage all organizations</p>
      </div>
      <router-link to="/organizations/create" class="btn btn-ams">+ New Organization</router-link>
    </div>

    <!-- TABLE CARD -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Name</th>
              <th>Organization Code</th>
              <th>Status</th>
              <th class="pe-3" style="width:180px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="org in organizations" :key="org.organization_code">
              <td class="ps-3">{{ org.name }}</td>
              <td><strong>{{ org.organization_code }}</strong></td>
              <td><span :class="['ams-badge', org.status]">{{ org.status }}</span></td>
              <td class="pe-3">
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <button class="dropdown-item" @click="openEdit(org)">
                        <i class="bi bi-pencil me-2"></i>
                        Edit
                      </button>
                    </li>

                    <li>
                      <button class="dropdown-item text-danger" @click="openDelete(org)">
                        <i class="bi bi-trash me-2"></i>
                        Deactivate
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="organizations.length === 0">
              <td colspan="4" class="text-center text-muted py-4">No organizations found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Organization</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <form @submit.prevent="submitUpdate(updateOrganization, fetchOrganizations)">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Organization Name *</label>
                <input v-model="editForm.name" class="form-control" placeholder="Organization Name" required />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Status</label>
                <select v-model="editForm.status" class="form-select">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <p v-if="formError" class="text-danger small mb-0">{{ formError }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showEditModal = false">Cancel</button>
              <button type="submit" class="btn btn-ams" :disabled="saving">{{ saving ? 'Saving...' : 'Save Changes' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- DEACTIVATE CONFIRM MODAL -->
    <div v-if="showDeleteModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Deactivate Organization</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-center">
            <p class="mb-0">Deactivate <strong>{{ selected?.name }}</strong>?</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-secondary btn-sm" @click="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger btn-sm" @click="confirmDeactivate(deactivateOrganization, fetchOrganizations)" :disabled="saving">{{ saving ? '...' : 'Deactivate' }}</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'

import { useOrganization } from '@/composables/organization/useOrganization'

import { useOrganizationModals } from '@/composables/organization/useOrganizationModals'

// ---------------- ORGANIZATION ----------------
const {
  organizations,
  loading,
  error,
  fetchOrganizations,
  updateOrganization,
  deactivateOrganization
} = useOrganization()

// ---------------- MODALS ----------------
const {
  showEditModal,
  showDeleteModal,
  selected,
  saving,
  formError,
  editForm,
  openEdit,
  openDelete,
  submitUpdate,
  confirmDeactivate
} = useOrganizationModals()

// ---------------- INIT ----------------
onMounted(() => {
  fetchOrganizations()
})
</script>