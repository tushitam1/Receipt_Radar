import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  return <Dashboard onLogout={() => setIsLoggedIn(false)} />
}

export default App
