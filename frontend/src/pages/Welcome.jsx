import { useApp } from '../context/AppContext'
import { Compass, Clock, MapPin, GraduationCap, ChevronRight, Plus, Trash2, BarChart3, Sparkles, UserCircle2, LogOut } from 'lucide-react'

function maskPhone(phone) {
  if (!phone || phone.length < 6) return phone
  return phone.slice(0, 2) + '****' + phone.slice(-4)
}

function SessionCard({ session, onLoad, onDelete }) {
  const topCareer = session.careerData?.topMatches?.[0]
  const profile = session.profile || {}
  const dateStr = new Date(session.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="card group relative flex flex-col gap-4 hover:border-amber-400/20 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-400/80 shrink-0" />
            <span className="text-[11px] text-amber-400/70 font-semibold uppercase tracking-wider">Career Analysis</span>
          </div>
          <h3 className="text-[15px] font-bold text-[#EDEAE4] truncate leading-snug">
            {session.title || 'Career Assessment'}
          </h3>
        </div>
        <button
          onClick={() => onDelete(session._id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#45434F] hover:text-rose-400 hover:bg-rose-500/[0.08] transition-all shrink-0"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Profile info */}
      <div className="flex flex-wrap gap-2">
        {profile.name && (
          <span className="flex items-center gap-1 text-[11px] text-[#7E7C8E] bg-white/[0.04] px-2.5 py-1 rounded-full">
            <UserCircle2 size={10} className="text-indigo-400" /> {profile.name}
          </span>
        )}
        {profile.education && (
          <span className="flex items-center gap-1 text-[11px] text-[#7E7C8E] bg-white/[0.04] px-2.5 py-1 rounded-full">
            <GraduationCap size={10} className="text-amber-400/60" /> {profile.education}
          </span>
        )}
        {profile.location && (
          <span className="flex items-center gap-1 text-[11px] text-[#7E7C8E] bg-white/[0.04] px-2.5 py-1 rounded-full">
            <MapPin size={10} className="text-indigo-400/70" /> {profile.location}
          </span>
        )}
      </div>

      {/* Top career match */}
      {topCareer && (
        <div className="bg-[#0E0E1A] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-[#45434F] mb-0.5">Top Match</p>
            <p className="text-[13px] font-semibold text-[#EDEAE4]">{topCareer.career}</p>
          </div>
          {topCareer.matchScore && (
            <div className="shrink-0 flex flex-col items-center">
              <span className="text-xl font-bold text-amber-400">{topCareer.matchScore}<span className="text-sm font-normal text-amber-400/60">%</span></span>
              <span className="text-[9px] text-[#45434F]">match</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="flex items-center gap-1.5 text-[11px] text-[#45434F]">
          <Clock size={10} /> {dateStr}
        </span>
        <button
          onClick={() => onLoad(session._id)}
          className="flex items-center gap-1.5 text-[12px] font-medium text-amber-400 hover:text-amber-300 transition-colors"
        >
          View Report <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}

export default function Welcome() {
  const { user, logout, sessionHistory, loadSession, deleteSession, setPage } = useApp()

  return (
    <div className="min-h-screen bg-[#08080D] text-[#EDEAE4]">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed top-0 left-0 w-[600px] h-[400px] bg-amber-400/[0.03] rounded-full blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-3xl" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 sm:px-8 py-3.5 border-b border-white/[0.06] bg-[#08080D]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_2px_12px_rgba(251,191,36,0.3)]">
            <Compass size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-[16px] tracking-[-0.02em] text-[#EDEAE4]">
            Career<span className="text-amber-400">Ramp</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#45434F] bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1.5">
                <UserCircle2 size={13} className="text-indigo-400" />
                {maskPhone(user.phone)}
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-lg text-[#45434F] hover:text-rose-400 hover:bg-rose-500/[0.08] transition-all"
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">

        {/* Hero greeting */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/[0.08] border border-amber-400/20 rounded-full px-3.5 py-1.5 mb-4">
            <Sparkles size={12} className="text-amber-400" />
            <span className="text-xs font-medium text-amber-300">Welcome back</span>
          </div>
          <h1 className="text-[28px] sm:text-3xl font-bold tracking-tight text-[#EDEAE4] mb-2">
            {user?.phone ? `Hey, ${maskPhone(user.phone)} 👋` : 'Welcome back!'}
          </h1>
          <p className="text-[#7E7C8E] text-[15px] max-w-lg">
            Pick up where you left off or start a fresh career assessment.
          </p>
        </div>

        {/* New assessment CTA */}
        <button
          onClick={() => setPage('onboarding')}
          className="btn-primary w-full sm:w-auto text-[15px] px-8 py-3.5 flex items-center justify-center gap-2.5 mb-12"
        >
          <Plus size={17} />
          Start New Career Assessment
        </button>

        {/* History section */}
        {sessionHistory.length > 0 ? (
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <BarChart3 size={16} className="text-amber-400/70" />
              <h2 className="text-[17px] font-bold text-[#EDEAE4] tracking-tight">Your Past Analyses</h2>
              <span className="text-xs text-[#45434F] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
                {sessionHistory.length}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessionHistory.map(s => (
                <SessionCard
                  key={s._id}
                  session={s}
                  onLoad={loadSession}
                  onDelete={deleteSession}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={22} className="text-[#45434F]" />
            </div>
            <p className="text-[#7E7C8E] text-sm">No past analyses yet. Complete your first assessment above.</p>
          </div>
        )}
      </div>
    </div>
  )
}