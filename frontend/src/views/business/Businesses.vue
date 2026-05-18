<template>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <h2>Businesses</h2>

      <router-link to="/businesses/create" class="btn">
        + Create Business
      </router-link>

      <router-link
          :to="`/businesses/${businesses.business_code}`"
          class="view-btn"
      >
        View
      </router-link>
    </div>

    <!-- TABLE -->
    <table class="table">

      <thead>
      <tr>
        <th>Name</th>
        <th>Owner</th>
        <th>Email</th>
        <th>Location</th>
        <th>Status</th>
        <th width="150">Actions</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="business in businesses" :key="business.id">

        <td>{{ business.name }}</td>
        <td>{{ business.ownerName }}</td>
        <td>{{ business.email }}</td>
        <td>{{ business.location }}</td>

        <td>
            <span :class="['status', business.status]">
              {{ business.status }}
            </span>
        </td>

        <td>
          <button
              class="edit-btn"
              @click="openEditModal(business)"
          >
            Edit
          </button>

          <button
              class="delete-btn"
              @click="openDeleteModal(business)"
          >
            Delete
          </button>
        </td>

      </tr>
      </tbody>

    </table>

    <!-- EDIT MODAL -->
    <div v-if="showEditModal" class="modal-overlay">

      <div class="modal">

        <div class="modal-header">
          <h3>Edit Business</h3>

          <button class="close" @click="closeEditModal">
            ✕
          </button>
        </div>

        <form class="form" @submit.prevent="updateBusiness">

          <input v-model="editForm.name" placeholder="Business Name" />

          <input v-model="editForm.ownerName" placeholder="Owner Name" />

          <input v-model="editForm.email" placeholder="Email" />

          <input v-model="editForm.location" placeholder="Location" />

          <select v-model="editForm.status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button type="submit" class="save-btn">
            Save Changes
          </button>

        </form>

      </div>

    </div>

    <!-- DELETE MODAL -->
    <div v-if="showDeleteModal" class="modal-overlay">

      <div class="modal delete-modal">

        <h3>Delete Business</h3>

        <p>
          Are you sure you want to delete
          <strong>{{ selectedBusiness?.name }}</strong>?
        </p>

        <div class="actions">

          <button class="cancel-btn" @click="closeDeleteModal">
            Cancel
          </button>

          <button class="delete-confirm-btn" @click="deleteBusiness">
            Delete
          </button>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const businesses = ref([
  {
    id: 1,
    name: 'City Clinic',
    ownerName: 'Ali Khan',
    email: 'city@clinic.com',
    location: 'Lahore',
    status: 'active'
  },
  {
    id: 2,
    name: 'Health Care Center',
    ownerName: 'John Doe',
    email: 'health@care.com',
    location: 'Karachi',
    status: 'inactive'
  }
])

/* MODALS */
const showEditModal = ref(false)
const showDeleteModal = ref(false)

/* SELECTED */
const selectedBusiness = ref(null)

/* EDIT FORM */
const editForm = reactive({
  id: null,
  name: '',
  ownerName: '',
  email: '',
  location: '',
  status: 'active'
})

/* OPEN EDIT */
function openEditModal(business) {
  selectedBusiness.value = business

  editForm.id = business.id
  editForm.name = business.name
  editForm.ownerName = business.ownerName
  editForm.email = business.email
  editForm.location = business.location
  editForm.status = business.status

  showEditModal.value = true
}

/* CLOSE EDIT */
function closeEditModal() {
  showEditModal.value = false
}

/* UPDATE */

function updateBusiness() {
  const index = businesses.value.findIndex(
      b => b.id === editForm.id
  )

  if (index !== -1) {
    businesses.value[index] = {
      ...editForm
    }
  }

  closeEditModal()

  console.log('Updated:', editForm)

  // API READY
  // await axios.put(`/businesses/${editForm.id}`, editForm)
}

/* DELETE */
function openDeleteModal(business) {
  selectedBusiness.value = business
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
}

function deleteBusiness() {
  businesses.value = businesses.value.filter(
      b => b.id !== selectedBusiness.value.id
  )

  closeDeleteModal()

  console.log('Deleted:', selectedBusiness.value)

  // API READY
  // await axios.delete(`/businesses/${selectedBusiness.value.id}`)
}
</script>

<style scoped>
.page {
  background: white;
  padding: 20px;
  border-radius: 10px;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* BUTTONS */
.btn {
  background: #6366f1;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
}

.edit-btn,
.delete-btn {
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 5px;
}

.edit-btn {
  background: #3b82f6;
  color: white;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

/* TABLE */
.table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.active {
  background: #dcfce7;
  color: #166534;
}

.inactive {
  background: #fee2e2;
  color: #991b1b;
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
  font-size: 18px;
  cursor: pointer;
}

/* FORM */
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

input,
select {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.save-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
}

/* DELETE */
.delete-modal {
  width: 400px;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  background: #e2e8f0;
  border: none;
  padding: 10px;
  border-radius: 6px;
}

.delete-confirm-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
}
</style>