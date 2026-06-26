import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import BookingPage from './pages/BookingPage'
import QueueStatusPage from './pages/QueueStatusPage'
import AdminPage from './pages/AdminPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'

function NavBar() {
    const location = useLocation()
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <header>
            <h1>Smart Appointment System</h1>
            <nav>
                {user ? (
                    <>
                        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                            Book
                        </Link>
                        <Link to="/queue" className={location.pathname === '/queue' ? 'active' : ''}>
                            Queue
                        </Link>
                        {user.is_staff && (
                            <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                                Admin
                            </Link>
                        )}
                        <span className="nav-user">👤 {user.first_name}</span>
                        <button className="nav-logout" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
                            Login
                        </Link>
                        <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>
                            Register
                        </Link>
                    </>
                )}
            </nav>
        </header>
    )
}

function NotFound() {
    return (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>404 — Page Not Found</h2>
            <Link to="/" style={{ color: '#2563eb' }}>Go back home</Link>
        </div>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <NavBar />
                <main>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/" element={
                            <ProtectedRoute><BookingPage /></ProtectedRoute>
                        } />
                        <Route path="/queue" element={
                            <ProtectedRoute><QueueStatusPage /></ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>
                        } />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
            </BrowserRouter>
        </AuthProvider>
    )
}