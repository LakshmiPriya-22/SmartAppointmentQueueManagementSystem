import { useState } from 'react'
import { bookAppointment } from '../services/api'

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
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
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter your phone number"
                    />
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
                    />
                </div>
                <div className="form-group">
                    <label>Time</label>
                    <input
                        type="time"
                        name="appointment_time"
                        value={formData.appointment_time}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Booking...' : 'Book Appointment'}
                </button>
            </form>
        </div>
    )
}