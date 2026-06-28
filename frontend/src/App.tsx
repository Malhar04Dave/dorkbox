import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  )

  if (!token) {
    return <Login onLogin={(t) => {
      localStorage.setItem('token', t)
      setToken(t)
    }} />
  }

  return <Dashboard onLogout={() => {
    localStorage.removeItem('token')
    setToken(null)
  }} />
}