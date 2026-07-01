import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [accessToken, setAccessToken] = useState(null)
    const [loading, setLoading] = useState(true)

    // Load from localStorage on app start
    useEffect(() => {
        const savedUser = localStorage.getItem('user')
        const savedToken = localStorage.getItem('accessToken')
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser))
            setAccessToken(savedToken)
        }
        setLoading(false)
    }, [])

    const login = (userData, tokens) => {
        setUser(userData)
        setAccessToken(tokens.access)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('accessToken', tokens.access)
    }

    const logout = () => {
        setUser(null)
        setAccessToken(null)
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
    }

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
    }

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}