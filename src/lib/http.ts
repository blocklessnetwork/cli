import axios from "axios"
import { getToken } from "../store/db"
import { getConsoleServer } from "./urls"

const consoleServer = getConsoleServer()
const token = getToken()

export const consoleClient = axios.create({
    baseURL: consoleServer,
    headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }
})