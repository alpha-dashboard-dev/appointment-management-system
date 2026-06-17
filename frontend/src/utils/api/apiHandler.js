import api from '@/utils/api'
import { API_CONFIG } from './apiConfig.js'

export async function apiHandler(section, action, data = {}) {

    // console.log('apiHandler', section, action, data)

    const config = API_CONFIG?.[section]?.[action]

    if (!config) {
        throw new Error(`API not found: ${section}.${action}`)
    }

    let endpoint = config.endpoint
    const payload = { ...data }

    Object.keys(data).forEach(key => {
        if (endpoint.includes(`:${key}`)) {
            endpoint = endpoint.replace(`:${key}`, data[key])
            delete payload[key]
        }
    })

    const requestConfig = {
        url: endpoint,
        method: config.method
    }

    const method = config.method.toUpperCase()

    if (method === 'GET' || method === 'DELETE') {
        requestConfig.params = payload
    } else {
        requestConfig.data = payload
    }

    try {

        const response = await api(requestConfig)

        // Execute configured success callback
        config.onSuccess?.(response)

        return {
            ...response,
            message: response.data?.message || config.successMessage
        }

    } catch (error) {

        // Execute configured error callback
        config.onError?.(error)

        error.message = error.response?.data?.message || config.errorMessage || error.message
        throw error
    }

    // return api(requestConfig)
}