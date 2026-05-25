<script setup lang="ts">
import { ref } from 'vue'

const activeSection = ref('profile')

const sections = [
  {
    title: 'Account Settings',
    icon: 'bi bi-person-gear',
    items: [
      'Profile',
      'Security',
      'Notifications'
    ]
  },

  {
    title: 'Organization Settings',
    icon: 'bi bi-buildings',
    items: ['General']
  },

  {
    title: 'Appointment Settings',
    icon: 'bi bi-calendar-check',
    items: ['General']
  },

  {
    title: 'System Settings',
    icon: 'bi bi-gear',
    items: ['General']
  },
]
</script>

<template>

  <div class="settings-page">

    <!-- HEADER -->

    <div class="page-header">

      <h2>Settings</h2>

      <p>
        Manage your application preferences and account settings
      </p>

    </div>

    <!-- MAIN LAYOUT -->

    <div class="settings-layout">

      <!-- LEFT SIDEBAR -->

      <div class="settings-sidebar">

        <div
            v-for="section in sections"
            :key="section.title"
            class="settings-group"
        >

          <details open>

            <summary>

              <div class="summary-left">

                <i :class="section.icon"></i>

                <span>
                  {{ section.title }}
                </span>

              </div>

              <i class="bi bi-chevron-down"></i>

            </summary>

            <ul>

              <li
                  v-for="item in section.items"
                  :key="item"

                  :class="{
                    active:
                    activeSection === item.toLowerCase()
                  }"

                  @click="
                    activeSection =
                    item.toLowerCase()
                  "
              >

                <span class="dot"></span>

                {{ item }}

              </li>

            </ul>

          </details>

        </div>

      </div>

      <!-- RIGHT CONTENT -->

      <div class="settings-content">

        <!-- PROFILE -->

        <div
            v-if="activeSection === 'profile'"
            class="content-card"
        >

          <!-- HEADER -->

          <div class="content-header">

            <h3>Basic Information</h3>

            <p>
              Update your profile and personal details
            </p>

          </div>

          <!-- PROFILE -->

          <div class="profile-upload">

            <div class="profile-image">

              <i class="bi bi-person-circle"></i>

            </div>

            <button class="btn btn-light upload-btn">

              <i class="bi bi-camera"></i>

              Upload Photo

            </button>

          </div>

          <!-- BASIC INFO -->

          <div class="section-title">

            <h5>Basic Information</h5>

          </div>

          <div class="row g-3">

            <div class="col-md-6">

              <label class="form-label">
                First Name
                <span class="required">*</span>
              </label>

              <input
                  type="text"
                  class="form-control custom-input"
              >

            </div>

            <div class="col-md-6">

              <label class="form-label">
                Last Name
                <span class="required">*</span>
              </label>

              <input
                  type="text"
                  class="form-control custom-input"
              >

            </div>

            <div class="col-md-6">

              <label class="form-label">
                Email
                <span class="required">*</span>
              </label>

              <input
                  type="email"
                  class="form-control custom-input"
              >

            </div>

            <!-- PHONE -->

            <div class="col-md-6">

              <label class="form-label">
                Phone Number
                <span class="required">*</span>
              </label>

              <div class="phone-wrapper">

                <select class="form-select country-code">

                  <option>+92</option>
                  <option>+1</option>
                  <option>+44</option>
                  <option>+971</option>

                </select>

                <input
                    type="text"
                    class="form-control phone-input"
                    placeholder="3001234567"
                >

              </div>

            </div>

          </div>

          <!-- ADDRESS -->

          <div class="section-title address-title">

            <h5>Address Information</h5>

          </div>

          <div class="row g-3">

            <div class="col-md-6">

              <label class="form-label">
                Address Line 1
              </label>

              <input
                  type="text"
                  class="form-control custom-input"
              >

            </div>

            <div class="col-md-6">

              <label class="form-label">
                Address Line 2
              </label>

              <input
                  type="text"
                  class="form-control custom-input"
              >

            </div>

            <!-- COUNTRY -->

            <div class="col-md-6">

              <label class="form-label">
                Country
              </label>

              <select class="form-select custom-input">

                <option>Pakistan</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>UAE</option>
                <option>Canada</option>

              </select>

            </div>

            <!-- STATE -->

            <div class="col-md-6">

              <label class="form-label">
                State
              </label>

              <select class="form-select custom-input">

                <option>Punjab</option>
                <option>Sindh</option>
                <option>KPK</option>
                <option>Balochistan</option>

              </select>

            </div>

            <!-- CITY -->

            <div class="col-md-6">

              <label class="form-label">
                City
              </label>

              <select class="form-select custom-input">

                <option>Lahore</option>
                <option>Karachi</option>
                <option>Islamabad</option>
                <option>Peshawar</option>

              </select>

            </div>

            <div class="col-md-6">

              <label class="form-label">
                Postal Code
              </label>

              <input
                  type="text"
                  class="form-control custom-input"
              >

            </div>

          </div>

          <!-- BUTTONS -->

          <div class="action-buttons">

            <button class="btn btn-light">
              Cancel
            </button>

            <button class="btn btn-primary">
              Save Changes
            </button>

          </div>

        </div>

        <!-- SECURITY -->

        <div
            v-else-if="activeSection === 'security'"
            class="content-card"
        >

          <div class="content-header">

            <h3>Security Settings</h3>

            <p>
              Manage your password and security preferences
            </p>

          </div>

        </div>

        <!-- NOTIFICATIONS -->

        <div
            v-else-if="activeSection === 'notifications'"
            class="content-card"
        >

          <div class="content-header">

            <h3>Notification Settings</h3>

            <p>
              Manage notifications and alerts
            </p>

          </div>

        </div>

        <!-- DEFAULT -->

        <div
            v-else
            class="content-card"
        >

          <div class="content-header">

            <h3>{{ activeSection }}</h3>

            <p>
              Content will be added later
            </p>

          </div>

        </div>

      </div>

    </div>

  </div>

</template>

<style scoped>

.settings-page {
  padding: 30px;
  background: #f4f6f9;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 25px;
}

.page-header h2 {
  font-size: 30px;
  font-weight: 700;
  color: #111827;
}

.page-header p {
  color: #6b7280;
  margin-top: 6px;
}

.settings-layout {
  display: flex;
  gap: 24px;
  align-items: stretch;
}

.settings-sidebar {
  width: 320px;
  background: white;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.settings-group {
  margin-bottom: 16px;
}

details summary {
  list-style: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  transition: 0.3s;
}

details summary:hover {
  background: #f3f4f6;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-left i {
  font-size: 18px;
  color: #0d6efd;
}

.summary-left span {
  font-weight: 600;
}

ul {
  list-style: none;
  padding-left: 20px;
  margin-top: 10px;
}

li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
  color: #4b5563;
}

li:hover {
  background: #f3f4f6;
}

li.active {
  background: rgba(13,110,253,0.1);
  color: #0d6efd;
  font-weight: 600;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.settings-content {
  flex: 1;
  display: flex;
}

.content-card {
  width: 100%;
  background: white;
  border-radius: 18px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.content-header {
  margin-bottom: 30px;
}

.content-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.content-header p {
  color: #6b7280;
  margin-top: 6px;
}

.profile-upload {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 35px;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-image i {
  font-size: 60px;
  color: #9ca3af;
}

.upload-btn {
  height: 45px;
  border-radius: 10px;
}

.section-title {
  margin-bottom: 20px;
}

.section-title h5 {
  font-weight: 700;
  color: #111827;
}

.custom-input {
  height: 52px;
  border-radius: 12px;
}

.custom-input:focus {
  box-shadow: none;
  border-color: #0d6efd;
}

.action-buttons {
  margin-top: 35px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 992px) {

  .settings-layout {
    flex-direction: column;
  }

  .settings-sidebar {
    width: 100%;
  }

}

/* REQUIRED */

.required {

  color: red;
}

/* LESS SPACING */

.content-header {
  margin-bottom: 20px;
}

.profile-upload {
  margin-bottom: 25px;
}

.section-title {
  margin-bottom: 12px;
}

.address-title {
  margin-top: 28px;
}

/* PHONE */

.phone-wrapper {

  display: flex;

  gap: 10px;
}

.country-code {

  width: 110px;

  height: 52px;

  border-radius: 12px;
}

.phone-input {

  height: 52px;

  border-radius: 12px;
}

/* SMALLER CARD SPACING */

.content-card {

  padding: 24px;
}

/* REMOVE EXTRA HEIGHT */

.settings-content {
  align-items: stretch;
}

.content-card {
  min-height: 100%;
}

/* DARK MODE */

/* DARK MODE */

:global(body.dark-mode .settings-page){

  background:#111827;
}

/* SIDEBAR */

:global(body.dark-mode .settings-sidebar){

  background:#1f2937;

  border-color:#374151;
}

/* CONTENT */

:global(body.dark-mode .content-card){

  background:#1f2937;

  border-color:#374151;
}

/* HEADER TEXT */

:global(body.dark-mode .page-header h2),

:global(body.dark-mode .page-header p),

:global(body.dark-mode .content-header h3),

:global(body.dark-mode .content-header p),

:global(body.dark-mode .section-title h5),

:global(body.dark-mode .summary-left span),

:global(body.dark-mode details summary),

:global(body.dark-mode li),

:global(body.dark-mode label){

  color:white;
}

/* SIDEBAR HOVER */

:global(body.dark-mode details summary:hover){

  background:#374151;
}

:global(body.dark-mode li:hover){

  background:#374151;
}

/* ACTIVE MENU */

:global(body.dark-mode li.active){

  background:rgba(59,130,246,.18);

  color:#60a5fa;
}

/* ICONS */

:global(body.dark-mode .summary-left i){

  color:#60a5fa;
}

/* PROFILE IMAGE BOX */

:global(body.dark-mode .profile-image){

  background:#111827;
}

:global(body.dark-mode .profile-image i){

  color:#9ca3af;
}

/* FORMS */

:global(body.dark-mode input),

:global(body.dark-mode textarea),

:global(body.dark-mode select){

  background:#111827;

  border-color:#374151;

  color:white;
}

/* PLACEHOLDER */

:global(body.dark-mode input::placeholder){

  color:#9ca3af;
}

/* BOOTSTRAP INPUTS */

:global(body.dark-mode .form-control),

:global(body.dark-mode .form-select){

  background:#111827;

  border-color:#374151;

  color:white;
}

/* BUTTONS */

:global(body.dark-mode .btn-light){

  background:#374151;

  color:white;

  border-color:#4b5563;
}

:global(body.dark-mode .btn-light:hover){

  background:#4b5563;
}

/* UPLOAD BUTTON */

:global(body.dark-mode .upload-btn){

  background:#374151;

  color:white;
}

</style>