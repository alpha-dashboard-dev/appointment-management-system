import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'
import {apiHandler} from "../utils/api/apiHandler.js";

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || null)
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

    const isAuthenticated = computed(() => !!token.value)
    const role = computed(() => user.value?.user_type || null)

    const dashboardRoute = computed(() => {
        const map = {
            admin: '/dashboard',
            business_owner: '/business/dashboard',
            operational_staff: '/operations/dashboard',
            service_staff: '/staff/dashboard',
            client: '/client/dashboard',
        }
        return map[role.value] || '/dashboard'
    })

    async function login(email, password) {
        const res = await apiHandler("authentication", "login", { email, password })
        console.log(res)
        token.value = res.data.data.accessToken
        user.value = res.data.data.user
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(user.value))
        return res.data
    }

    async function logout() {
        try {
            await apiHandler("authentication", "logout")
        } catch (_) {}
        token.value = null
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    return { token, user, isAuthenticated, role, dashboardRoute, login, logout }
})
