import { useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import Welcome from './pages/Welcome'
import UserDashboard from './pages/UserDashboard'

function Router() {
  const { page, skipAuth } = useApp()

  // Reset scroll position on every page transition
  useEffect(() => { window.scrollTo(0, 0) }, [page])

  if (typeof window !== 'undefined') window.__skipAuth = skipAuth

  if (page === 'user-dashboard') return <UserDashboard />
  if (page === 'dashboard') return <Dashboard />
  if (page === 'welcome') return <Welcome />
  if (page === 'onboarding') return <Onboarding />
  if (page === 'auth') return <Auth />
  return <Landing />
}

export default function App() {
  return (
    <AppProvider>
      <div className="relative min-h-screen">
        <Router />
      </div>
    </AppProvider>
  )
}
