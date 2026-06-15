import { useState, useEffect, useRef } from 'react'
import { getQueueStatus } from '../services/api'

export default function QueueStatusPage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [tokenInput, setTokenInput] = useState('')
    const [trackedToken, setTrackedToken] = useState(null)
    const [queueData, setQueueData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)
    const intervalRef = useRef(null)

    const fetchQueueStatus = async () => {
        try {
            const response = await getQueueStatus(date)
            setQueueData(response.data)
            setLastUpdated(new Date().toLocaleTimeString())
            setError(null)
        } catch {
            setError('Failed to fetch queue status. Is the server running?')
        }
    }

    useEffect(() => {
        if (!trackedToken) return

        setLoading(true)
        fetchQueueStatus().finally(() => setLoading(false))

        // poll every 5 seconds
        intervalRef.current = setInterval(fetchQueueStatus, 5000)

        return () => clearInterval(intervalRef.current)
    }, [trackedToken, date])

    const handleTrack = (e) => {
        e.preventDefault()
        if (!tokenInput.trim()) return
        setTrackedToken(tokenInput.toUpperCase().trim())
    }

    const handleReset = () => {
        setTrackedToken(null)
        setQueueData(null)
        setTokenInput('')
        clearInterval(intervalRef.current)
    }

    // find user's appointment in the queue
    const myAppointment = queueData?.queue?.find(
        (a) => a.token_number === trackedToken
    )

    const isServing = queueData?.currently_serving?.token_number === trackedToken

    return (
        <div className="queue-status-page">
            <h2>Track Your Queue</h2>

            {!trackedToken ? (
                <form onSubmit={handleTrack} className="token-lookup">
                    <div className="form-group">
                        <label>Your Token Number</label>
                        <input
                            type="text"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="e.g. A01"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Track My Token</button>
                </form>
            ) : (
                <div className="queue-result">
                    {loading && <p className="loading">Loading...</p>}
                    {error && <div className="error">{error}</div>}

                    {queueData && (
                        <>
                            {/* Currently serving banner */}
                            <div className="serving-banner">
                                <span>Now Serving</span>
                                <strong>{queueData.current_token || 'None'}</strong>
                            </div>

                            {/* User's status */}
                            {isServing ? (
                                <div className="my-token serving">
                                    <h3>Your Turn!</h3>
                                    <div className="token-number">{trackedToken}</div>
                                    <p>Please proceed to the counter.</p>
                                </div>
                            ) : myAppointment ? (
                                <div className="my-token waiting">
                                    <h3>Your Token</h3>
                                    <div className="token-number">{trackedToken}</div>
                                    <p>Position in queue: <strong>#{myAppointment.position}</strong></p>
                                    <p>Estimated wait: <strong>{myAppointment.estimated_wait} minutes</strong></p>

                                    {/* Reschedule suggestion */}
                                    {myAppointment.reschedule_suggested && (
                                        <div className="reschedule-banner">
                                            <p>⚠️ Your waiting time has increased significantly.</p>
                                            <p>Would you like to reschedule your appointment?</p>
                                            <button
                                                className="reschedule-btn"
                                                onClick={() => alert(`Reschedule request sent for ${trackedToken}`)}
                                            >
                                                Reschedule
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="my-token completed">
                                    <h3>Token: {trackedToken}</h3>
                                    <p>Your appointment is not in the pending queue.</p>
                                    <p>It may have been completed or rescheduled.</p>
                                </div>
                            )}

                            {/* Full queue list */}
                            <div className="queue-list">
                                <h3>Current Queue ({queueData.queue.length} waiting)</h3>
                                {queueData.queue.length === 0 ? (
                                    <p>No one waiting right now.</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Position</th>
                                                <th>Token</th>
                                                <th>Wait Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {queueData.queue.map((item) => (
                                                <tr
                                                    key={item.token_number}
                                                    className={item.token_number === trackedToken ? 'highlight' : ''}
                                                >
                                                    <td>#{item.position}</td>
                                                    <td>{item.token_number}</td>
                                                    <td>{item.estimated_wait} min</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="queue-footer">
                                <p>Last updated: {lastUpdated} (auto-refreshes every 5 seconds)</p>
                                {queueData.delay_added > 0 && (
                                    <p className="delay-notice">⚠️ Current delay: {queueData.delay_added} minutes</p>
                                )}
                                <button className="secondary-btn" onClick={handleReset}>Track Different Token</button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}