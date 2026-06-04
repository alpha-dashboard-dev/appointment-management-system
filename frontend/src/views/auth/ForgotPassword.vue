<template>

  <div class="forgot-page">

    <!-- LEFT SIDE -->

    <div class="forgot-left">

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
                :class="{ 'input-error': emailError }"
                placeholder="Enter your email"
                @blur="validateEmail"
            />

          </div>

          <p v-if="emailError" class="field-error">{{ emailError }}</p>

          <!-- BUTTON -->

          <button
              type="submit"
              class="btn btn-primary w-100 forgot-btn"
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

    <!-- RIGHT SIDE -->

    <div class="forgot-right">

      <div class="overlay">

        <div class="right-content">

          <h1>Appointment Management System</h1>

          <p>
            Manage your appointments efficiently.<br>
            Reset your password to regain access.
          </p>

        </div>

      </div>

    </div>

  </div>

</template>

<script setup>
import { ref } from 'vue'
import { isValidEmail } from '@/utils/validator'

const email = ref('')
const emailError = ref('')

function validateEmail() {
  emailError.value = email.value && isValidEmail(email.value) ? '' : 'A valid email address is required'
}

function resetPassword() {
  validateEmail()
  if (emailError.value) return
  console.log({ email: email.value })
}
</script>

<style scoped>

.forgot-page {

  min-height: 100vh;

  display: flex;

  background: #f4f6f9;
}

/* LEFT SIDE */

.forgot-left {

  width: 50%;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 40px;
}

.forgot-card {

  width: 100%;
  max-width: 500px;

  background: white;

  padding: 50px;

  border-radius: 20px;

  box-shadow: 0 10px 35px rgba(0,0,0,0.08);
}

.forgot-header {

  margin-bottom: 35px;
}

.forgot-header h2 {

  font-size: 32px;
  font-weight: 700;

  color: #111827;
}

.forgot-header p {

  margin-top: 10px;

  color: #6b7280;
}

.form {

  display: flex;

  flex-direction: column;

  gap: 20px;
}

/* INPUT */

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

  border-radius: 12px;

  border: 1px solid #d1d5db;

  font-size: 14px;

  outline: none;

  transition: border-color 0.2s;
}

.custom-input:focus {
  box-shadow: none;
  border-color: #0d6efd;
}

.custom-input.input-error {
  border-color: #ef4444;
}

.field-error {
  color: #ef4444;
  font-size: 12px;
  margin: -12px 0 0 4px;
}

/* BUTTON */

.forgot-btn {

  height: 55px;

  border-radius: 12px;

  font-size: 16px;
  font-weight: 600;
}

/* RETURN */

.return-login {

  margin-top: 25px;

  text-align: center;
}

.login-link {

  text-decoration: none;

  color: #0d6efd;

  font-weight: 500;
}

.login-link:hover {
  text-decoration: underline;
}

/* RIGHT SIDE */

.forgot-right {

  width: 50%;

  background-image:
      url('https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1600');

  background-size: cover;
  background-position: center;

  position: relative;
}

.overlay {

  width: 100%;
  height: 100%;

  background: rgba(13, 110, 253, 0.75);

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 40px;
}

.right-content {

  color: white;

  text-align: center;
}

.right-content h1 {

  font-size: 48px;
  font-weight: 700;
}

.right-content p {

  margin-top: 20px;

  font-size: 18px;

  line-height: 1.7;
}

/* RESPONSIVE */

@media (max-width: 992px) {

  .forgot-right {
    display: none;
  }

  .forgot-left {
    width: 100%;
  }

}

/* DARK MODE */

:global(body.dark-mode .forgot-page){

  background:#111827;
}

:global(body.dark-mode .forgot-card){

  background:#1f2937;

  border-color:#374151;
}

:global(body.dark-mode input){

  background:#111827;

  border-color:#374151;

  color:white;
}

:global(body.dark-mode .forgot-header h1),

:global(body.dark-mode .forgot-header h2),

:global(body.dark-mode .forgot-header p),

:global(body.dark-mode .forgot-header label){

  color:white;
}

</style>