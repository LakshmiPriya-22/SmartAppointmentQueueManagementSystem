import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import BookingPage from './pages/BookingPage'
import QueueStatusPage from './pages/QueueStatusPage'
import AdminPage from './pages/AdminPage'

function NavBar() {
    const location = useLocation()
    return (
        <header>
            <h1>Smart Appointment System</h1>
            <nav>
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                    Book Appointment
                </Link>
                <Link to="/queue" className={location.pathname === '/queue' ? 'active' : ''}>
                    Queue Status
                </Link>
                <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                    Admin
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
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </main>
        </BrowserRouter>
    )
}