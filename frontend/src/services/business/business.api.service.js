import api from '@/utils/api'

export default {
    getAll(params) {
        return api.get('/businesses/get-business',
            {
                params: {
                    include: "organization"
                }
            })
    },
    create(data) {
        return api.post('/businesses/create-business', data)
    },

    update(business_code, data) {
        return api.put(`/businesses/update-business/${business_code}`, data)
    },

    deactivate(business_code) {
        return api.patch(`/businesses/update-business-status/${business_code}`,
            {status: 'inactive'})
    },

    remove(business_code) {
        return api.delete(`/businesses/delete-business/${business_code}`)
    }
}