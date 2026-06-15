import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import BookingPage from './pages/BookingPage'
import QueueStatusPage from './pages/QueueStatusPage'

function NavBar() {
    const location = useLocation()
    return (
        <header>
            <h1>Smart Appointment System</h1>
            <nav>
                <Link
                    to="/"
                    className={location.pathname === '/' ? 'active' : ''}
                >
                    Book Appointment
                </Link>
                <Link
                    to="/queue"
                    className={location.pathname === '/queue' ? 'active' : ''}
                >
                    Queue Status
                </Link>
            </nav>
        </header>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <NavBar />
            <main>
                <Routes>
                    <Route path="/" element={<BookingPage />} />
                    <Route path="/queue" element={<QueueStatusPage />} />
                </Routes>
            </main>
        </BrowserRouter>
    )
}