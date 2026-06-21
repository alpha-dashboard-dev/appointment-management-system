<script setup lang="ts">

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const props = defineProps({

  user:{
    type:Object,
    required:true
  }

})

const router = useRouter()
const authStore = useAuthStore()

const notificationsEnabled =
    ref(true)

function goToProfile(){

  router.push("/profile")

}

function goToAccountSettings(){

  router.push("/settings")

}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
// function logout(){
//
//   localStorage.clear()
//
//   router.push('/login')
//
// }

</script>

<template>

  <div class="profile-dropdown">

    <div class="profile-header">

      <div class="dropdown-avatar">

        <img
            v-if="user.profileImage"
            :src="user.profileImage"
            class="dropdown-img"
            alt="profile"
        >

        <i
            v-else
            class="bi bi-person-circle"
        ></i>

      </div>

      <div>

        <h4>
          {{ user.name }}
        </h4>

        <span>
          {{ user.role }}
        </span>

      </div>

    </div>

    <div
        class="dropdown-item"
        @click="goToProfile"
    >

      <i class="bi bi-person"></i>

      <span>
        Profile Settings
      </span>

    </div>

    <div
        class="dropdown-item"
        @click="goToAccountSettings"
    >

      <i class="bi bi-sliders"></i>

      <span>
        Account Settings
      </span>

    </div>

    <div class="dropdown-item">

      <i class="bi bi-bell"></i>

      <span>
        Notifications
      </span>

      <label class="switch">

        <input
            type="checkbox"
            v-model="notificationsEnabled"
        >

        <span class="slider"></span>

      </label>

    </div>

    <div
        class="dropdown-item logout"
        @click="handleLogout"
    >

      <i
          class="bi bi-box-arrow-right"
      ></i>

      <span>
        Logout
      </span>

    </div>

  </div>

</template>

<style scoped>

.profile-dropdown{

  position:absolute;

  top:60px;

  right:0;

  width:320px;

  background:white;

  border-radius:18px;

  overflow:hidden;

  border:1px solid #e5e7eb;

  box-shadow:
      0 18px 45px rgba(0,0,0,.12);

  z-index:99999;
}

.profile-header{

  padding:22px;

  display:flex;

  align-items:center;

  gap:16px;

  border-bottom:1px solid #edf0f2;
}

.dropdown-avatar{

  width:60px;

  height:60px;

  border-radius:50%;

  overflow:hidden;

  background:#f3f4f6;

  display:flex;
  justify-content:center;
  align-items:center;
}

.dropdown-avatar i{

  font-size:34px;

  color:#6b7280;
}

.dropdown-img{

  width:100%;
  height:100%;

  object-fit:cover;
}

.profile-header h4{

  margin:0;
}

.profile-header span{

  color:#6b7280;

  font-size:13px;
}

.dropdown-item{

  padding:18px 22px;

  display:flex;

  align-items:center;

  gap:14px;

  cursor:pointer;

  transition:.25s;
}

.dropdown-item:hover{

  background:#f8fafc;
}

.dropdown-item span{

  flex:1;
}

.logout{

  color:#dc3545;
}

.switch{

  position:relative;

  width:46px;

  height:24px;
}

.switch input{

  opacity:0;
}

.slider{

  position:absolute;

  inset:0;

  background:#d1d5db;

  border-radius:50px;
}

.slider::before{

  content:'';

  position:absolute;

  width:18px;
  height:18px;

  left:3px;
  top:3px;

  border-radius:50%;

  background:white;

  transition:.3s;
}

input:checked + .slider{

  background:#0d6efd;
}

input:checked + .slider::before{

  transform:
      translateX(22px);
}

/* DARK MODE */

:global(body.dark-mode .profile-dropdown){

  background:#1f2937;

  border-color:#374151;
}

:global(body.dark-mode .profile-header){

  border-color:#374151;
}

:global(body.dark-mode .dropdown-item:hover){

  background:#374151;
}

:global(body.dark-mode .dropdown-item){

  color:white;
}

:global(body.dark-mode .profile-header h4),

:global(body.dark-mode .profile-header span){

  color:white;
}

</style>