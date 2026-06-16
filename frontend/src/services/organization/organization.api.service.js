import api from '@/utils/api'

export default {
    getAll(params) {
        return api.get('/organizations/get-all-organizations')
    },

    create(data) {
        return api.post('/organizations/create-organization', data)
    },

    update(organization_code, data) {
        return api.put(`/organizations/update-organization/${organization_code}`, data)
    },

    deactivate(organization_code) {
        return api.patch(`/organizations/update-organization-status/${organization_code}`,
            { status: 'inactive' }
        )
    },

    remove(organization_code) {
        return api.delete(`/organizations/delete-organization/${organization_code}`)
    }
}