<script setup lang="ts">

import { ref } from 'vue'

const notifications = ref([

  {
    id:1,
    title:'New Appointment',
    message:'Ali booked appointment.',
    time:'2 min ago',
    unread:true
  },

  {
    id:2,
    title:'Reminder',
    message:'3 pending appointments.',
    time:'15 min ago',
    unread:true
  },

  {
    id:3,
    title:'Organization Updated',
    message:'Organization modified.',
    time:'30 min ago',
    unread:false
  },

  {
    id:4,
    title:'System Alert',
    message:'Backup completed.',
    time:'1 hr ago',
    unread:false
  }

])

function dismiss(id:number){

  notifications.value =
      notifications.value.filter(
          n=>n.id!==id
      )

}

</script>

<template>

  <div class="dropdown-box">

    <!-- HEADER -->

    <div class="dropdown-header">

      <h6>

        Notifications

      </h6>

      <span class="count">

      {{ notifications.length }}

    </span>

    </div>

    <!-- DAY GROUP -->

    <div class="day-label">

      Today

    </div>

    <!-- SCROLL LIST -->

    <div class="notification-scroll">

      <div
          v-for="item in notifications"
          :key="item.id"
          class="notification-item"
      >

        <button
            class="dismiss-btn"
            @click.stop="dismiss(item.id)"
        >
          <i class="bi bi-x"></i>
        </button>

        <h6>

          {{ item.title }}

          <span
              v-if="item.unread"
              class="red-dot"
          ></span>

        </h6>

        <p>

          {{ item.message }}

        </p>

        <small>

          {{ item.time }}

        </small>

      </div>

    </div>

    <!-- FOOTER -->

    <RouterLink
        to="/notifications"
        class="view-all"
    >

      View All Notifications

    </RouterLink>

  </div>

</template>

<style scoped>

.dropdown-box{

  width:390px;

  background:white;

  border-radius:18px;

  overflow:hidden;

  box-shadow:
      0 20px 50px rgba(0,0,0,.15);

  border:1px solid #eee;
}

.dropdown-header{

  padding:18px 22px;

  display:flex;

  justify-content:space-between;

  border-bottom:1px solid #eee;
}

.count{

  background:#0d6efd;

  color:white;

  border-radius:20px;

  padding:4px 10px;

  font-size:12px;
}

.day-label{

  padding:14px 22px;

  font-weight:600;

  color:#6b7280;

  background:#fafafa;
}

.notification-scroll{

  max-height:240px;

  overflow-y:scroll;

  overflow-x:hidden;
}

/* scrollbar */

.notification-scroll::-webkit-scrollbar{

  width:8px;
}

.notification-scroll::-webkit-scrollbar-track{

  background:#f3f4f6;
}

.notification-scroll::-webkit-scrollbar-thumb{

  background:#94a3b8;

  border-radius:20px;
}

.notification-item{

  position:relative;

  padding:20px 22px;

  border-bottom:1px solid #eee;

  min-height:95px;

  transition:.25s;
}

.notification-item:hover{

  background:#f8fafc;
}

.top-row{

  display:flex;

  justify-content:space-between;
}

.red-dot{

  width:8px;
  height:8px;

  background:red;

  border-radius:50%;

  display:inline-block;

  margin-left:8px;
}

.notification-item p{

  margin:7px 0;

  color:#6b7280;
}

.dismiss-btn{

  position:absolute;

  top:14px;

  right:16px;

  border:none;

  background:none;

  color:#94a3b8;

  cursor:pointer;

  font-size:18px;
}

.dismiss-btn:hover{

  color:#ef4444;
}

.view-all{

  display:block;

  text-align:center;

  padding:16px;

  text-decoration:none;

  font-weight:600;

  color:#0d6efd;
}

.notification-item h6{

  margin-bottom:10px;

  font-weight:600;
}

.notification-item p{

  margin-bottom:10px;

  color:#6b7280;
}


/* DARK MODE */

:global(body.dark-mode .dropdown-box){

  background:#1f2937;

  border-color:#374151;
}

:global(body.dark-mode .dropdown-header){

  border-color:#374151;
}

:global(body.dark-mode .dropdown-header h6){

  color:white;
}

:global(body.dark-mode .day-label){

  background:#111827;

  color:#d1d5db;
}

:global(body.dark-mode .notification-item){

  border-color:#374151;
}

:global(body.dark-mode .notification-item:hover){

  background:#374151;
}

:global(body.dark-mode .notification-item h6){

  color:white;
}

:global(body.dark-mode .notification-item p){

  color:#d1d5db;
}

:global(body.dark-mode .notification-item small){

  color:#9ca3af;
}

:global(body.dark-mode .dismiss-btn){

  color:#d1d5db;
}

:global(body.dark-mode .dismiss-btn:hover){

  color:#ef4444;
}

:global(body.dark-mode .view-all){

  color:#60a5fa;
}

/* SCROLLBAR */

:global(
body.dark-mode
.notification-scroll::-webkit-scrollbar-track
){

  background:#111827;
}

:global(
body.dark-mode
.notification-scroll::-webkit-scrollbar-thumb
){

  background:#4b5563;
}
</style>