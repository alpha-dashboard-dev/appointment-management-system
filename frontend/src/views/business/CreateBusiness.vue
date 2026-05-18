<template>
  <div class="page">

    <h2>Create Business</h2>


    <form class="form" @submit.prevent="submit">

      <input v-model="form.name" placeholder="Business Name" />
      <input v-model="form.ownerName" placeholder="Owner Name" />
      <input v-model="form.email" placeholder="Email" />
      <input v-model="form.phone" placeholder="Phone" />
      <input v-model="form.location" placeholder="Location" />

      <select v-model="form.status">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <button type="submit">Create Business</button>

    </form>

  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  name: '',
  ownerName: '',
  email: '',
  phone: '',
  location: '',
  status: 'active'
})

function submit() {
  console.log('Business Created:', form)

  // API READY PLACEHOLDER
  // await axios.post('/businesses', form)

  router.push('/businesses')
}
</script>

<style scoped>
.page {
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
}

input, select {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
}
</style>