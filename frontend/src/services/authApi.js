import axios from 'axios'

const AUTH_BASE = import.meta.env.VITE_API_URL?.replace('/appointments', '') || 'http://localhost:8000/api'

const authApi = axios.create({
    baseURL: AUTH_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const registerUser = (data) => authApi.post('/auth/register/', data)
export const loginUser = (data) => authApi.post('/auth/login/', data)
export const logoutUser = (refreshToken) => authApi.post('/auth/logout/', { refresh: refreshToken })
export const getProfile = (token) => authApi.get('/auth/profile/', {
    headers: { Authorization: `Bearer ${token}` }
})