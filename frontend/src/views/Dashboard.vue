<template>
  <div>
    <h2>Dashboard</h2>

    <div class="grid">
      <div class="card">Organizations</div>
      <div class="card">Businesses</div>
      <div class="card">Users</div>
      <div class="card">Appointments</div>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-top: 20px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
</style>