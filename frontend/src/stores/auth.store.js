import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || null)
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

    const isAuthenticated = computed(() => !!token.value)

    async function login(email, password) {
        const res = await api.post('/auth/login', { email, password })
        token.value = res.data.data.accessToken
        user.value = res.data.data.user
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(user.value))
        return res.data
    }

    async function logout() {
        try {
            await api.post('/auth/logout')
        } catch (_) {}
        token.value = null
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    return { token, user, isAuthenticated, login, logout }
})
