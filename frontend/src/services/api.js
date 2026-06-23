import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/appointments'

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const bookAppointment = (data) => api.post('/book/', data)
export const listAppointments = (date) => api.get(`/list/?date=${date}`)
export const getQueueStatus = (date) => api.get(`/queue-status/?date=${date}`)
export const callNext = (date) => api.post(`/call-next/?date=${date}`)
export const addDelay = (minutes) => api.post('/add-delay/', { delay_minutes: minutes })
export const rescheduleAppointment = (token) => api.post(`/reschedule/${token}/`)

export default api

export const predictWaitTime = (serviceType, date) =>
    api.get(`/predict-wait/?service_type=${serviceType}&date=${date}`)

export const resetDelay = () => api.post('/reset-delay/')