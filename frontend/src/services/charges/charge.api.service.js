import api from '@/utils/api'

export default {
    getAll(params) {
        return api.get('/charges/get-charge',
            {
                params: {
                    include: "business"
                }
            })
    },

    getByCode(charge_code) {
        return api.get('/charges/get-one-charge/${charge_code}')
    },

    create(data) {
        return api.post('/charges/create-charge', data)
    },

    update(charge_code, data) {
        return api.put(`/charges/update-charge/${charge_code}`, data)
    },

    deactivate(charge_code) {
        return api.put(`/charges/update-charge/${charge_code}`,
            {status: 'inactive'})
    },

    remove(charge_code) {
        return api.delete(`/businesses/delete-business/${charge_code}`)
    }
}