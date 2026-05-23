<template>

  <div class="forgot-page">

    <div class="forgot-card">

      <!-- HEADER -->

      <div class="forgot-header">

        <h2>Forgot Password</h2>

        <p>
          No worries, we'll send you reset instructions
        </p>

      </div>

      <!-- FORM -->

      <form class="form" @submit.prevent="resetPassword">

        <!-- EMAIL -->

        <div class="input-wrapper">

          <i class="bi bi-envelope input-icon"></i>

          <input
              v-model="email"
              type="email"
              class="custom-input"
              placeholder="Enter your email"
              required
          />

        </div>

        <!-- BUTTON -->

        <button
            type="submit"
            class="submit-btn"
        >
          Send Reset Link
        </button>

      </form>

      <!-- RETURN LOGIN -->

      <div class="return-login">

        <RouterLink
            to="/login"
            class="login-link"
        >
          <i class="bi bi-arrow-left"></i>

          Return to Login
        </RouterLink>

      </div>

    </div>

  </div>

</template>

<script setup>
import { ref } from 'vue'

const email = ref('')

function resetPassword() {

  console.log({
    email: email.value,
  })

}
</script>

<style scoped>

.forgot-page {

  min-height: 100vh;

  background: #f4f6f9;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 20px;
}

.forgot-card {

  width: 100%;
  max-width: 500px;

  background: white;

  padding: 50px;

  border-radius: 18px;

  box-shadow: 0 10px 35px rgba(0,0,0,0.08);
}

.forgot-header {

  text-align: center;

  margin-bottom: 35px;
}

.forgot-header h2 {

  font-size: 30px;
  font-weight: 700;

  color: #111827;

  margin-bottom: 10px;
}

.forgot-header p {

  color: #6b7280;

  margin: 0;
}

.form {

  display: flex;

  flex-direction: column;

  gap: 20px;
}

.input-wrapper {

  position: relative;
}

.input-icon {

  position: absolute;

  left: 16px;
  top: 50%;

  transform: translateY(-50%);

  color: #6b7280;

  z-index: 10;
}

.custom-input {

  width: 100%;

  height: 55px;

  padding-left: 45px;

  border: 1px solid #d1d5db;

  border-radius: 12px;

  font-size: 14px;

  outline: none;

  transition: border-color 0.2s;
}

.custom-input:focus {

  border-color: #6366f1;

  box-shadow: none;
}

.submit-btn {

  height: 55px;

  background: #6366f1;

  color: white;

  border: none;

  border-radius: 12px;

  font-size: 16px;

  font-weight: 600;

  cursor: pointer;

  transition: background 0.2s;
}

.submit-btn:hover {

  background: #4f46e5;
}

.return-login {

  margin-top: 25px;

  text-align: center;
}

.login-link {

  text-decoration: none;

  color: #6366f1;

  font-size: 14px;

  font-weight: 500;
}

.login-link:hover {

  text-decoration: underline;
}

/* DARK MODE */

:global(body.dark-mode .forgot-page){

  background:#111827;
}

:global(body.dark-mode .forgot-card){

  background:#1f2937;

  border-color:#374151;
}

:global(body.dark-mode .custom-input){

  background:#111827;

  color:white;

  border-color:#374151;
}

:global(body.dark-mode .forgot-header h2),

:global(body.dark-mode .forgot-header p),

:global(body.dark-mode .login-link){

  color:white;
}

</style>