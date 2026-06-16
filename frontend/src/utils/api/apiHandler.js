import api from '@/utils/api'
import { API_CONFIG } from './apiConfig.js'

export async function apiHandler(section, action,
    {
        params = {},
        body = {},
        pathParams = {}
    } = {}
) {

    console.log(section, action)

    const config = API_CONFIG?.[section]?.[action]

    if (!config) {
        throw new Error(`API not found: ${section}.${action}`)
    }

    let endpoint = config.endpoint

    Object.entries(pathParams).forEach(([key, value]) => {
        endpoint = endpoint.replace(`:${key}`, value)
    })

    const requestConfig = {
        url: endpoint,
        method: config.method,
        params
    }

    if (
        ['POST', 'PUT', 'PATCH'].includes(
            config.method.toUpperCase()
        )
    ) {
        requestConfig.data = body
    }

    return api(requestConfig)
}