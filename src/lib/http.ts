import axios from "axios"
import { getToken } from "../store/db"
import { getGatewayUrl } from "./urls"

export const consoleClient = axios.create({
    headers: {
        'Content-Type': 'application/json'
    }
})

/**
 * Request interceptor to pass in JWT bearer token
 * 
 */
consoleClient.interceptors.request.use(async (config) => {
    const token = getToken()
    const gatewayUrl = getGatewayUrl()

    config.baseURL = gatewayUrl

    if (token) {
        config.headers = {
            ...config.headers,
            authorization: `Bearer ${token}`,
        }
    }

    return config
}, (error) => Promise.reject(error))

/**
 * Response interceptor
 * 
 */
consoleClient.interceptors.response.use((response) => response, async (error) => {
    if (error.response.status === 401 && error.response.data && error.response.data.error === 'Unauthorized') {
        return Promise.reject(new Error('Authorization token has expired, run `bls login` to re-authenticate.'))
    }

    return Promise.reject(error)
})