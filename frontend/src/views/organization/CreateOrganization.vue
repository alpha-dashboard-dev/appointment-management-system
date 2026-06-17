<template>
  <div class="page">

    <div class="page-header">
      <h2>New Organization</h2>
      <router-link to="/organizations" class="back-link">← Back</router-link>
    </div>

    <div class="card">
      <form class="form" @submit.prevent="submit">

        <div class="field">
          <label>Organization Name *</label>
          <input v-model="form.name" placeholder="Enter organization name" :class="{ 'field-input-error': errors.name }" @blur="validateField('name')" />
          <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="form-actions">
          <router-link to="/organizations" class="cancel-btn">Cancel</router-link>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Organization' }}
          </button>
        </div>

      </form>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { validateOrganizationForm } from '@/utils/validator'
import {apiHandler} from "../../utils/api/apiHandler.js";

const router = useRouter()

const form = reactive({ name: '', status: 'active' })
const loading = ref(false)
const error = ref('')
const errors = reactive({})

function validateField(field) {
  const result = validateOrganizationForm(form)
  if (result[field]) { errors[field] = result[field] } else { delete errors[field] }
}

async function submit() {
  const validationErrors = validateOrganizationForm(form)
  Object.keys(errors).forEach(k => delete errors[k])
  Object.assign(errors, validationErrors)
  if (Object.keys(errors).length > 0) return

  loading.value = true
  error.value = ''
  try {
    const res = await apiHandler("organization", "createOrganization", form)
    // console.log(res.message)
    router.push('/organizations')
  } catch (err) {
    error.value = err.message || 'Failed to create organization'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-header h2 { margin: 0; color: #1e293b; }
.back-link { font-size: 14px; color: #6366f1; text-decoration: none; }

.card {
  background: white;
  border-radius: 10px;
  padding: 24px;
  max-width: 600px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.form { display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: #374151; }
.field input, .field select {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}
.field input:focus, .field select:focus { border-color: #6366f1; }

.field-input-error { border-color: #ef4444 !important; }
.field-error { color: #ef4444; font-size: 12px; margin: 2px 0 0; }

.error-msg { color: #ef4444; font-size: 13px; margin: 0; }

.form-actions { display: flex; gap: 10px; justify-content: flex-end; }

.cancel-btn {
  padding: 9px 16px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
}

.submit-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 9px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
