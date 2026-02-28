import { useApp } from '../context/AppContext'
import { Compass, ArrowLeft, BarChart3, LogOut, UserCircle2 } from 'lucide-react'

function maskPhone(phone) {
  if (!phone || phone.length < 6) return phone
  return phone.slice(0, 2) + '****' + phone.slice(-4)
}

export default function Navbar() {
  const { page, setPage, profile, user, logout, sessionHistory } = useApp()

  // On dashboard, back goes to 'user-dashboard' if logged in, else 'onboarding'
  const backDestination = user ? 'user-dashboard' : 'onboarding'

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-5 sm:px-8 py-3.5 border-b border-white/[0.06] bg-[#08080D]/80 backdrop-blur-xl">
      {/* Wordmark */}
      <div className="flex items-center gap-2.5">
        {page === 'dashboard' && (
          <button
            onClick={() => setPage(backDestination)}
            className="mr-1 p-1.5 rounded-lg text-[#45434F] hover:text-[#EDEAE4] hover:bg-white/5 transition-all"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_2px_12px_rgba(251,191,36,0.3)]">
          <Compass size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-[16px] tracking-[-0.02em] text-[#EDEAE4]">
          Career<span className="text-amber-400">Ramp</span>
        </span>
      </div>

      {/* Center — dashboard only */}
      {page === 'dashboard' && profile && (
        <div className="hidden md:flex items-center gap-2 text-sm text-[#45434F]">
          <BarChart3 size={14} className="text-amber-400/70" />
          <span className="font-medium text-[#EDEAE4]">{profile.name || 'Your Profile'}</span>
          <span>·</span>
          <span className="text-indigo-300">{profile.location || 'Career Navigator'}</span>
        </div>
      )}

      {/* Right */}
      <div className="flex items-center gap-2">
        {page === 'dashboard' && (
          <div className="hidden sm:flex items-center gap-2 bg-[#0E0E18] border border-white/[0.07] rounded-full px-3.5 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-[#7E7C8E]">Analysis ready</span>
          </div>
        )}

        {/* Logged-in user indicator */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#45434F] bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1.5">
              <UserCircle2 size={13} className="text-indigo-400" />
              <span>{maskPhone(user.phone)}</span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-[#45434F] hover:text-rose-400 hover:bg-rose-500/[0.08] transition-all"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

        {/* Get Started — only on landing when not logged in */}
        {page === 'landing' && !user && (
          <button
            onClick={() => setPage('auth')}
            className="btn-primary text-sm px-5 py-2"
          >
            Get Started
          </button>
        )}

        {/* If logged in on landing */}
        {page === 'landing' && user && (
          <button
            onClick={() => setPage('onboarding')}
            className="btn-primary text-sm px-5 py-2"
          >
            New Assessment
          </button>
        )}
      </div>
    </nav>
  )
}