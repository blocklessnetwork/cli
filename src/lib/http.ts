import axios from "axios"
import Chalk from 'chalk'
import { getToken } from "../store/db"
import { getConsoleServer } from "./urls"

const consoleServer = getConsoleServer()

export const consoleClient = axios.create({
    baseURL: consoleServer,
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
    if (error.response.status === 401 && error.response.data && error.response.data.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
        console.log(Chalk.red('Error:'), 'Authorization token has expired, run `bls login` to re-authenticate.')

        // TODO: Add refresh access token logic
    }

    return Promise.reject(error)
})