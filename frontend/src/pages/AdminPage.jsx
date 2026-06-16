import { useState, useEffect, useRef } from 'react'
import { getQueueStatus, callNext, addDelay } from '../services/api'

export default function AdminPage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [queueData, setQueueData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [actionMessage, setActionMessage] = useState(null)
    const [delayInput, setDelayInput] = useState('')
    const [error, setError] = useState(null)
    const intervalRef = useRef(null)

    const fetchQueue = async () => {
        try {
            const response = await getQueueStatus(date)
            setQueueData(response.data)
            setError(null)
        } catch {
            setError('Failed to fetch queue. Is the server running?')
        }
    }

    useEffect(() => {
        setLoading(true)
        fetchQueue().finally(() => setLoading(false))
        intervalRef.current = setInterval(fetchQueue, 5000)
        return () => clearInterval(intervalRef.current)
    }, [date])

    const handleCallNext = async () => {
        try {
            const response = await callNext(date)
            setActionMessage({ type: 'success', text: response.data.message })
            fetchQueue()
        } catch {
            setActionMessage({ type: 'error', text: 'Failed to call next token.' })
        }
        setTimeout(() => setActionMessage(null), 3000)
    }

    const handleAddDelay = async (e) => {
        e.preventDefault()
        if (!delayInput || isNaN(delayInput)) return
        try {
            const response = await addDelay(parseInt(delayInput))
            setActionMessage({
                type: 'success',
                text: `${response.data.message}. Total delay: ${response.data.total_delay} mins`
            })
            setDelayInput('')
            fetchQueue()
        } catch {
            setActionMessage({ type: 'error', text: 'Failed to add delay.' })
        }
        setTimeout(() => setActionMessage(null), 3000)
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Admin Dashboard</h2>
                <div className="date-selector">
                    <label>Date: </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="error">{error}</div>}
            {loading && <p className="loading">Loading...</p>}

            {/* Action message */}
            {actionMessage && (
                <div className={`action-message ${actionMessage.type}`}>
                    {actionMessage.text}
                </div>
            )}

            {queueData && (
                <>
                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <span className="stat-label">Now Serving</span>
                            <span className="stat-value">
                                {queueData.current_token || '—'}
                            </span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Waiting</span>
                            <span className="stat-value">{queueData.queue.length}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Delay Added</span>
                            <span className="stat-value red">{queueData.delay_added} min</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="admin-controls">
                        {/* Call Next */}
                        <div className="control-card">
                            <h3>Queue Control</h3>
                            <p>Currently serving: <strong>{queueData.current_token || 'None'}</strong></p>
                            {queueData.currently_serving && (
                                <p>Patient: <strong>{queueData.currently_serving.name}</strong></p>
                            )}
                            <button
                                className="call-next-btn"
                                onClick={handleCallNext}
                                disabled={queueData.queue.length === 0}
                            >
                                {queueData.queue.length === 0 ? 'Queue Empty' : '▶ Call Next'}
                            </button>
                        </div>

                        {/* Add Delay */}
                        <div className="control-card">
                            <h3>Add Delay</h3>
                            <p>Current total delay: <strong>{queueData.delay_added} minutes</strong></p>
                            <form onSubmit={handleAddDelay} className="delay-form">
                                <input
                                    type="number"
                                    value={delayInput}
                                    onChange={(e) => setDelayInput(e.target.value)}
                                    placeholder="Minutes to add"
                                    min="1"
                                    max="120"
                                />
                                <button type="submit">Add Delay</button>
                            </form>
                            <p className="hint">
                                ⚠️ Appointments waiting 60+ mins will be flagged for reschedule
                            </p>
                        </div>
                    </div>

                    {/* Queue Table */}
                    <div className="admin-queue-table">
                        <h3>Today's Queue</h3>
                        {queueData.queue.length === 0 ? (
                            <p className="empty-queue">No pending appointments for this date.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Position</th>
                                        <th>Token</th>
                                        <th>Name</th>
                                        <th>Wait Time</th>
                                        <th>Reschedule?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {queueData.queue.map((item) => (
                                        <tr key={item.token_number}>
                                            <td>#{item.position}</td>
                                            <td><strong>{item.token_number}</strong></td>
                                            <td>{item.name}</td>
                                            <td>{item.estimated_wait} min</td>
                                            <td>
                                                {item.reschedule_suggested ? (
                                                    <span className="badge warning">Suggested</span>
                                                ) : (
                                                    <span className="badge ok">On Time</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}