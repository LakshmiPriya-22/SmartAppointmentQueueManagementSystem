import { useState } from 'react'
import { bookAppointment, predictWaitTime } from '../services/api'

const SERVICE_OPTIONS = [
    { value: 'general', label: 'General' },
    { value: 'specialist', label: 'Specialist' },
    { value: 'followup', label: 'Follow Up' },
    { value: 'dental', label: 'Dental' },
    { value: 'banking', label: 'Banking' },
    { value: 'government', label: 'Government' },
]

export default function BookingPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        service_type: 'general',
        appointment_date: '',
        appointment_time: '',
    })
    const [token, setToken] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [prediction, setPrediction] = useState(null)
    const [validationErrors, setValidationErrors] = useState({})

    const fetchPrediction = async (serviceType, date) => {
        if (!serviceType || !date) return
        try {
            const response = await predictWaitTime(serviceType, date)
            setPrediction(response.data)
        } catch {
            // silently fail — prediction is optional
        }
    }

    const handleChange = (e) => {
        const updated = { ...formData, [e.target.name]: e.target.value }
        setFormData(updated)
        if (
            (e.target.name === 'service_type' || e.target.name === 'appointment_date') &&
            updated.service_type &&
            updated.appointment_date
        ) {
            fetchPrediction(updated.service_type, updated.appointment_date)
        }
    }

    const validate = () => {
        const errors = {}

        if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters'
        }

        if (!/^\d{10}$/.test(formData.phone)) {
            errors.phone = 'Phone number must be exactly 10 digits'
        }

        const today = new Date().toISOString().split('T')[0]
        if (formData.appointment_date < today) {
            errors.appointment_date = 'Appointment date cannot be in the past'
        }

        if (formData.appointment_time) {
            const hour = parseInt(formData.appointment_time.split(':')[0])
            if (hour < 8 || hour >= 18) {
                errors.appointment_time = 'Appointments only available between 8:00 AM and 6:00 PM'
            }
        }

        return errors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (loading) return

        const errors = validate()
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return
        }
        setValidationErrors({})
        setLoading(true)
        setError(null)
        try {
            const response = await bookAppointment(formData)
            setToken(response.data)
        } catch (err) {
            setError(err.response?.data || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setToken(null)
        setPrediction(null)
        setValidationErrors({})
        setFormData({
            name: '',
            phone: '',
            service_type: 'general',
            appointment_date: '',
            appointment_time: '',
        })
    }

    if (token) {
        return (
            <div className="token-card">
                <h2>Booking Confirmed!</h2>
                <div className="token-number">{token.token_number}</div>
                <p>Name: {token.name}</p>
                <p>Service: {token.service_type}</p>
                <p>Date: {token.appointment_date}</p>
                <p>Time: {token.appointment_time}</p>
                <p>Estimated Wait: {token.estimated_wait} minutes</p>
                <button onClick={handleReset}>Book Another</button>
            </div>
        )
    }

    return (
        <div className="booking-form">
            <h2>Book an Appointment</h2>
            {error && <div className="error">{JSON.stringify(error)}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                    />
                    {validationErrors.name && (
                        <span className="field-error">{validationErrors.name}</span>
                    )}
                </div>

                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter 10-digit phone number"
                    />
                    {validationErrors.phone && (
                        <span className="field-error">{validationErrors.phone}</span>
                    )}
                </div>

                <div className="form-group">
                    <label>Service Type</label>
                    <select name="service_type" value={formData.service_type} onChange={handleChange}>
                        {SERVICE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        name="appointment_date"
                        value={formData.appointment_date}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                    />
                    {validationErrors.appointment_date && (
                        <span className="field-error">{validationErrors.appointment_date}</span>
                    )}
                </div>

                <div className="form-group">
                    <label>Time</label>
                    <input
                        type="time"
                        name="appointment_time"
                        value={formData.appointment_time}
                        onChange={handleChange}
                        required
                        min="08:00"
                        max="18:00"
                    />
                    {validationErrors.appointment_time && (
                        <span className="field-error">{validationErrors.appointment_time}</span>
                    )}
                </div>

                {prediction && (
                    <div className="prediction-box">
                        <p>🤖 AI Prediction</p>
                        <p>Estimated service time: <strong>{prediction.predicted_service_duration} minutes</strong></p>
                        <p>Estimated wait when you arrive: <strong>{prediction.estimated_wait} minutes</strong></p>
                    </div>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? 'Booking...' : 'Book Appointment'}
                </button>
            </form>
        </div>
    )
}