<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from "../../stores/auth.store.js"
import NotificationDropdown from '@/components/notifications/Notification.vue'
import ProfileDropdown from '@/components/layout/Profile.vue'

const router = useRouter()
const authStore = useAuthStore()

const darkMode = ref(false)

const showNotifications = ref(false)
const showProfile = ref(false)

const dropdownRef = ref<HTMLElement | null>(null)

const unreadNotifications = ref(true)

const search = ref('')

const user = computed(() => ({
  name: authStore.user?.name || authStore.user?.email || 'User',
  role: authStore.user?.user_type || 'User',
  profileImage: authStore.user?.profile_image || ''
}))

const userInitials = computed(() => {
  const name = user.value.name
  return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
})

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  showProfile.value = false
}

function toggleProfile() {
  showProfile.value = !showProfile.value
  showNotifications.value = false
}

function goToSettings() {
  router.push('/settings')
}

function goToProfile() {
  router.push('/profile')
}

function logout() {
  authStore.logout()
  router.push('/login')
}

function toggleDarkMode() {
  darkMode.value = !darkMode.value
  document.body.classList.toggle('dark-mode', darkMode.value)
  localStorage.setItem('darkMode', String(darkMode.value))
}

function handleClickOutside(event: MouseEvent) {
  if (!dropdownRef.value) return

  if (!dropdownRef.value.contains(event.target as Node)) {
    showNotifications.value = false
    showProfile.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  const saved = localStorage.getItem('darkMode')
  if (saved === 'true') {
    darkMode.value = true
    document.body.classList.add('dark-mode')
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <nav class="custom-navbar">

    <!-- LEFT -->
    <div class="navbar-left">

      <div class="search-wrapper">
        <i class="bi bi-search search-icon"></i>

        <input
            v-model="search"
            type="text"
            class="search-input"
            placeholder="Search appointments, clients..."
        />
      </div>

    </div>

    <!-- RIGHT -->
    <div ref="dropdownRef" class="navbar-right">

      <!-- QUICK ACTION -->
      <button class="nav-icon-btn" @click="router.push('/appointments/create')">
        <i class="bi bi-calendar-plus"></i>
      </button>

      <!-- SETTINGS -->
      <button class="nav-icon-btn" @click="goToSettings">
        <i class="bi bi-gear"></i>
      </button>

      <!-- DARK MODE -->
      <button class="nav-icon-btn" @click="toggleDarkMode">
        <i :class="darkMode ? 'bi bi-sun' : 'bi bi-moon'"></i>
      </button>

      <!-- NOTIFICATIONS -->
      <div class="notification-wrapper">

        <button class="nav-icon-btn notification-btn" @click.stop="toggleNotifications">
          <i class="bi bi-bell"></i>

          <span v-if="unreadNotifications" class="notification-dot"></span>
        </button>

        <div v-if="showNotifications" class="notification-popup">
          <NotificationDropdown />
        </div>

      </div>

      <!-- PROFILE -->
      <div class="profile-wrapper">

        <button class="profile-btn" @click.stop="toggleProfile">

          <img
              v-if="user.profileImage"
              :src="user.profileImage"
              class="profile-avatar"
          />

          <div v-else class="avatar-fallback">
            {{ userInitials }}
          </div>

        </button>

        <ProfileDropdown v-if="showProfile" :user="user" />

      </div>

    </div>

  </nav>
</template>

<style scoped>
.custom-navbar {
  height: 75px;
  background: var(--color-nav, white);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

/* SEARCH */
.search-wrapper {
  position: relative;
  width: 340px;
}

.search-input {
  width: 100%;
  height: 44px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding-left: 42px;
  outline: none;
  background: var(--color-surface, white);
  color: var(--color-text);
  transition: border-color .2s;
}

.search-input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13,110,253,.12);
}

.search-input::placeholder { color: var(--color-placeholder); }

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted);
}

/* RIGHT */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-icon-btn {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  background: var(--color-border-light, #f3f4f6);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: .2s;
}

.nav-icon-btn:hover {
  background: var(--color-border);
}

.nav-icon-btn i {
  font-size: 18px;
}

/* NOTIFICATIONS */
.notification-wrapper {
  position: relative;
}

.notification-popup {
  position: absolute;
  top: 55px;
  right: 0;
  z-index: 9999;
}

.notification-dot {
  width: 10px;
  height: 10px;
  background: #ef4444;
  border-radius: 50%;
  position: absolute;
  top: 8px;
  right: 8px;
  pointer-events: none;
}

/* PROFILE */
.profile-wrapper {
  position: relative;
}

.profile-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #0d6efd;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-weight: 600;
}
</style>
<!--<template>-->
<!--  <header class="topbar">-->
<!--    <div class="topbar-left">-->
<!--      <h3 class="page-title">{{ pageTitle }}</h3>-->
<!--    </div>-->
<!--    <div class="topbar-right">-->
<!--      <span class="user-name">{{ authStore.user?.name || authStore.user?.email || 'Admin' }}</span>-->
<!--      <span class="user-role">{{ authStore.user?.user_type || 'admin' }}</span>-->
<!--    </div>-->
<!--  </header>-->
<!--</template>-->

<!--<script setup>-->
<!--import { computed } from 'vue'-->
<!--import { useRoute } from 'vue-router'-->
<!--import { useAuthStore } from '@/stores/auth.store'-->

<!--const route = useRoute()-->
<!--const authStore = useAuthStore()-->

<!--const pageTitle = computed(() => {-->
<!--  const map = {-->
<!--    '/dashboard': 'Dashboard',-->
<!--    '/organizations': 'Organizations',-->
<!--    '/organizations/create': 'New Organization',-->
<!--    '/businesses': 'Businesses',-->
<!--    '/businesses/create': 'New Business',-->
<!--    '/clients': 'Clients',-->
<!--    '/clients/create': 'New Client',-->
<!--    '/appointments': 'Appointments',-->
<!--    '/appointments/create': 'New appointment',-->
<!--    '/services': 'Services',-->
<!--    '/services/create': 'New Service',-->
<!--    '/locations': 'Locations',-->
<!--    '/locations/create': 'New Location',-->
<!--    '/schedules': 'Schedules',-->
<!--    '/charges': 'Charges',-->
<!--    '/invoices': 'Invoices',-->
<!--    '/users': 'Users',-->
<!--    '/users/create': 'New User',-->
<!--  }-->
<!--  return map[route.path] || 'AMS Portal'-->
<!--})-->
<!--</script>-->

<!--<style scoped>-->
<!--.topbar {-->
<!--  height: 60px;-->
<!--  background: white;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: space-between;-->
<!--  padding: 0 24px;-->
<!--  border-bottom: 1px solid #e2e8f0;-->
<!--  flex-shrink: 0;-->
<!--}-->

<!--.page-title {-->
<!--  margin: 0;-->
<!--  font-size: 18px;-->
<!--  font-weight: 600;-->
<!--  color: #1e293b;-->
<!--}-->

<!--.topbar-right {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  align-items: flex-end;-->
<!--}-->

<!--.user-name {-->
<!--  font-size: 14px;-->
<!--  font-weight: 600;-->
<!--  color: #1e293b;-->
<!--}-->

<!--.user-role {-->
<!--  font-size: 12px;-->
<!--  color: #64748b;-->
<!--  text-transform: capitalize;-->
<!--}-->
<!--</style>-->
