// CURD Organization API Calls

import { ref } from 'vue'
import organizationService from '@/services/organization/organization.api.service'

export function useOrganization() {

    const organizations = ref([])
    const loading = ref(false)
    const error = ref('')

    async function fetchOrganizations() {

        loading.value = true
        error.value = ''

        try {
            const res = await organizationService.getAll()

            organizations.value = res.data.data || []

        } catch (err) {

            error.value = err.response?.data?.message ||
                'Failed to load organizations'

        } finally {
            loading.value = false
        }
    }

    async function createOrganization(data) {
        return organizationService.create(data)
    }


    async function updateOrganization(code, data) {
        return organizationService.update(code, data)
    }

    async function deactivateOrganization(code) {
        return organizationService.deactivate(code)
    }

    return {
        organizations,
        loading,
        error,
        fetchOrganizations,
        createOrganization,
        updateOrganization,
        deactivateOrganization
    }
}