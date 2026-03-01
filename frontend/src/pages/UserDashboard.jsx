import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import {
  Compass, Home, Clock, Target, MessageCircle, LogOut, Plus, Trash2,
  Heart, Eye, TrendingUp, Calendar, Bell, BellOff, Check,
  ChevronRight, Send, X, Star, Award, Zap, BarChart2, Flag,
  Edit3, CheckCircle2, Circle, RefreshCw, AlarmClock
} from 'lucide-react'
import { playNotificationSound } from '../utils/sounds'

// ── Goal colors ────────────────────────────────────────────────────────────
const GOAL_COLORS = [
  { key: 'amber',   bg: 'bg-amber-400/10',   border: 'border-amber-400/25',   text: 'text-amber-300',   dot: 'bg-amber-400' },
  { key: 'indigo',  bg: 'bg-indigo-400/10',  border: 'border-indigo-400/25',  text: 'text-indigo-300',  dot: 'bg-indigo-400' },
  { key: 'emerald', bg: 'bg-emerald-400/10', border: 'border-emerald-400/25', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  { key: 'rose',    bg: 'bg-rose-400/10',    border: 'border-rose-400/25',    text: 'text-rose-300',    dot: 'bg-rose-400' },
  { key: 'purple',  bg: 'bg-purple-400/10',  border: 'border-purple-400/25',  text: 'text-purple-300',  dot: 'bg-purple-400' },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function formatPhone(p) {
  if (!p) return ''
  const s = String(p)
  return s.length === 10 ? `+91 ${s.slice(0,5)} ${s.slice(5)}` : s
}

function timeAgo(dateStr) {
  const d = new Date(dateStr)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function periodLabel(period) {
  return { daily: 'Every Day', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }[period] || period
}

function nextReminderMs(period) {
  return { daily: 86400000, weekly: 604800000, monthly: 2592000000, yearly: 31536000000 }[period] || 86400000
}

function getNotifKey(goalId) { return `cr_notif_${goalId}` }

function isDue(goal) {
  const lastKey = getNotifKey(goal.id)
  const last = parseInt(localStorage.getItem(lastKey) || '0', 10)
  return Date.now() - last > nextReminderMs(goal.period)
}

function markNotified(goalId) {
  localStorage.setItem(getNotifKey(goalId), String(Date.now()))
}

function goalProgress(goal) {
  const created = new Date(goal.createdAt).getTime()
  const target = goal.targetDate ? new Date(goal.targetDate).getTime() : null
  if (!target) return null
  const now = Date.now()
  const total = target - created
  const elapsed = now - created
  if (total <= 0) return 100
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

function daysLeft(targetDate) {
  if (!targetDate) return null
  const diff = new Date(targetDate).getTime() - Date.now()
  const d = Math.ceil(diff / 86400000)
  if (d < 0) return 'Overdue'
  if (d === 0) return 'Due today'
  return `${d} day${d !== 1 ? 's' : ''} left`
}

// ── Activity heatmap (last 30 days) ───────────────────────────────────────
function ActivityHeatmap({ sessions }) {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toDateString()
  })
  const activeDays = new Set((sessions || []).map(s => new Date(s.createdAt).toDateString()))
  return (
    <div>
      <p className="text-[11px] text-[#45434F] font-semibold tracking-widest uppercase mb-2">Last 30 Days Activity</p>
      <div className="flex flex-wrap gap-1">
        {days.map((d, i) => (
          <div key={i} title={d}
            className={`w-4 h-4 rounded-sm transition-colors ${activeDays.has(d) ? 'bg-amber-400' : 'bg-white/[0.05]'}`} />
        ))}
      </div>
      <p className="text-[10px] text-[#45434F] mt-1.5">{activeDays.size} active day{activeDays.size !== 1 ? 's' : ''}</p>
    </div>
  )
}

// ── Toast notification ─────────────────────────────────────────────────────
function Toast({ toasts, dismiss }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto flex items-start gap-3 bg-[#13121E] border border-white/10 rounded-xl px-4 py-3 shadow-xl max-w-xs animate-fade-up">
          <Bell size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#EDEAE4]">{t.title}</p>
            {t.body && <p className="text-[11px] text-[#7E7C8E] mt-0.5 leading-snug">{t.body}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="text-[#45434F] hover:text-[#EDEAE4] shrink-0">
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function UserDashboard() {
  const { user, sessionHistory, loadHistory, loadSession, deleteSession, logout, setPage, sendChat, careerData, profile } = useApp()

  const [tab, setTab] = useState('overview')
  const [toasts, setToasts] = useState([])
  const [likes, setLikes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cr_likes') || '[]') } catch { return [] }
  })
  const [goals, setGoals] = useState(() => {
    try {
      const uid = user?._id || 'guest'
      return JSON.parse(localStorage.getItem(`cr_goals_${uid}`) || '[]')
    } catch { return [] }
  })
  const [notifPerm, setNotifPerm] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default')

  // ── Chat state ──────────────────────────────────────────────────────────
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatStreaming, setChatStreaming] = useState(false)
  const chatIntervalRef = useRef(null)
  const tabEnterTime = useRef(Date.now())
  const [tabTimings, setTabTimings] = useState(() => {
    try {
      const uid = user?._id || 'guest'
      return JSON.parse(localStorage.getItem(`cr_tab_time_${uid}`) || '{}')
    } catch { return {} }
  })
  const [localChat, setLocalChat] = useState([
    { role: 'ai', content: `Hi ${user?.phone ? formatPhone(user.phone) : 'there'}! 👋 I'm your CareerRamp advisor. Ask me anything about careers, entrance exams, courses, or your assessment results!`, displayed: `Hi ${user?.phone ? formatPhone(user.phone) : 'there'}! 👋 I'm your CareerRamp advisor. Ask me anything about careers, entrance exams, courses, or your assessment results!` }
  ])
  const chatEndRef = useRef(null)

  // ── Goal form state ─────────────────────────────────────────────────────
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [goalForm, setGoalForm] = useState({ title: '', description: '', period: 'daily', targetDate: '', color: 'amber' })

  // History is already loaded by AppContext on mount — no need to reload here

  // ── Persist goals ───────────────────────────────────────────────────────
  useEffect(() => {
    const uid = user?._id || 'guest'
    localStorage.setItem(`cr_goals_${uid}`, JSON.stringify(goals))
  }, [goals, user])

  // ── Persist likes ───────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('cr_likes', JSON.stringify(likes))
  }, [likes])

  // ── Persist tab timings ─────────────────────────────────────────────────
  useEffect(() => {
    const uid = user?._id || 'guest'
    localStorage.setItem(`cr_tab_time_${uid}`, JSON.stringify(tabTimings))
  }, [tabTimings, user])

  // ── Check goal notifications on mount / tab switch ──────────────────────
  useEffect(() => {
    const due = goals.filter(g => !g.completed && isDue(g))
    if (!due.length) return
    due.forEach(g => {
      pushToast(`⏰ Goal Reminder`, `"${g.title}" — ${periodLabel(g.period)} check-in is due!`)
      markNotified(g.id)
      sendBrowserNotif(`Goal Reminder`, `"${g.title}" — ${periodLabel(g.period)} check-in!`)
      playNotificationSound()
    })
  }, [tab, goals])

  // ── Scroll chat to bottom ───────────────────────────────────────────────
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [localChat])
  // cleanup typewriter on unmount
  useEffect(() => () => clearInterval(chatIntervalRef.current), [])

  // ── Helpers ─────────────────────────────────────────────────────────────
  const toastId = useRef(0)
  const pushToast = useCallback((title, body) => {
    const id = ++toastId.current
    setToasts(p => [...p, { id, title, body }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000)
  }, [])
  const dismissToast = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), [])

  const sendBrowserNotif = (title, body) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' })
    }
  }

  const requestNotifPerm = async () => {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setNotifPerm(result)
    if (result === 'granted') pushToast('Notifications enabled', 'You\'ll receive goal reminders!')
  }

  const toggleLike = (id) => {
    setLikes(p => p.includes(id) ? p.filter(l => l !== id) : [...p, id])
  }

  // ── Goal CRUD ────────────────────────────────────────────────────────────
  const openAddGoal = () => {
    setEditingGoal(null)
    setGoalForm({ title: '', description: '', period: 'daily', targetDate: '', color: 'amber' })
    setShowGoalForm(true)
  }
  const openEditGoal = (g) => {
    setEditingGoal(g.id)
    setGoalForm({ title: g.title, description: g.description || '', period: g.period, targetDate: g.targetDate || '', color: g.color || 'amber' })
    setShowGoalForm(true)
  }
  const saveGoal = () => {
    if (!goalForm.title.trim()) return
    if (editingGoal) {
      setGoals(p => p.map(g => g.id === editingGoal ? { ...g, ...goalForm, title: goalForm.title.trim() } : g))
      pushToast('Goal updated', goalForm.title)
    } else {
      const newGoal = { id: `g_${Date.now()}`, ...goalForm, title: goalForm.title.trim(), createdAt: new Date().toISOString(), completed: false }
      setGoals(p => [newGoal, ...p])
      pushToast('Goal added!', goalForm.title)
    }
    setShowGoalForm(false)
  }
  const deleteGoal = (id) => setGoals(p => p.filter(g => g.id !== id))
  const toggleGoalDone = (id) => setGoals(p => p.map(g => g.id === id ? { ...g, completed: !g.completed } : g))

  // ── Tab navigation with implicit time tracking ───────────────────────────
  const gotoTab = useCallback((newTab) => {
    if (newTab === tab) return
    const elapsed = Date.now() - tabEnterTime.current
    setTabTimings(prev => ({ ...prev, [tab]: (prev[tab] || 0) + elapsed }))
    tabEnterTime.current = Date.now()
    setTab(newTab)
  }, [tab])

  // ── Chat send ───────────────────────────────────────────────────────────
  const handleSendChat = async () => {
    const msg = chatInput.trim()
    if (!msg || chatLoading || chatStreaming) return
    setChatInput('')
    setLocalChat(p => [...p, { role: 'user', content: msg, displayed: msg }])
    setChatLoading(true)
    try {
      // Detect repeated / confusion queries and adapt the prompt
      const stopwords = new Set(['what','that','this','have','from','with','about','your','like','into','more','some','when','then','than','they','been','just','also','over','after'])
      const extractKW = (text) => text.toLowerCase().split(/\W+/).filter(w => w.length > 4 && !stopwords.has(w))
      const recentUserMsgs = localChat.filter(m => m.role === 'user').slice(-4)
      const recentKW = new Set(recentUserMsgs.flatMap(m => extractKW(m.content)))
      const newKW = extractKW(msg)
      const overlap = newKW.filter(w => recentKW.has(w))
      const apiMsg = overlap.length >= 2
        ? `${msg}\n\n[AI instruction: The student appears confused — they have asked about similar topics (${overlap.slice(0, 3).join(', ')}) before. Please explain more simply with a step-by-step breakdown and a concrete example.]`
        : msg
      const reply = await sendChat(apiMsg)
      const fullReply = reply || "I'm having trouble connecting. Please try again!"
      // Add empty AI message, then typewrite
      setLocalChat(p => [...p, { role: 'ai', content: fullReply, displayed: '', streaming: true }])
      setChatLoading(false)
      setChatStreaming(true)
      let i = 0
      chatIntervalRef.current = setInterval(() => {
        i++
        setLocalChat(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...updated[updated.length - 1], displayed: fullReply.slice(0, i) }
          return updated
        })
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        if (i >= fullReply.length) {
          clearInterval(chatIntervalRef.current)
          setLocalChat(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { ...updated[updated.length - 1], streaming: false }
            return updated
          })
          setChatStreaming(false)
        }
      }, 12)
    } catch {
      setLocalChat(p => [...p, { role: 'ai', content: 'Connection issue. Please try again!', displayed: 'Connection issue. Please try again!' }])
      setChatLoading(false)
    }
  }

  // ── Computed ─────────────────────────────────────────────────────────────
  const activeGoals = goals.filter(g => !g.completed)
  const doneGoals = goals.filter(g => g.completed)
  const likedSessions = (sessionHistory || []).filter(s => likes.includes(s._id))
  // careerData uses topMatches[].career (from analyze.js response)
  const topCareer = sessionHistory?.[0]?.careerData?.topMatches?.[0]
                 || sessionHistory?.[0]?.careerData?.careerMatches?.[0]

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDERS
  // ─────────────────────────────────────────────────────────────────────────

  const NAV = [
    { key: 'overview', icon: Home, label: 'Overview' },
    { key: 'history',  icon: Clock, label: 'History' },
    { key: 'goals',    icon: Target, label: 'Goals' },
    { key: 'advisor',  icon: MessageCircle, label: 'Advisor' },
  ]

  return (
    <div className="min-h-screen bg-[#08080D] text-[#EDEAE4] flex flex-col">
      <Toast toasts={toasts} dismiss={dismissToast} />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-[#08080D]/80 backdrop-blur-xl border-b border-white/[0.06] h-[58px] flex items-center px-4 sm:px-6 justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_2px_12px_rgba(251,191,36,0.3)]">
            <Compass size={13} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-[15px] tracking-[-0.02em]">
            Career<span className="text-amber-400">Ramp</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-[#45434F] bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.06]">
            {formatPhone(user?.phone)}
          </span>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs text-[#45434F] hover:text-rose-400 transition-colors px-2 py-1.5">
            <LogOut size={13} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Layout ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 pt-[58px]">

        {/* ── Sidebar (desktop) ─────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-white/[0.06] py-6 sticky top-[58px] h-[calc(100vh-58px)]">
          <nav className="flex flex-col gap-1 px-3">
            {NAV.map(n => (
              <button key={n.key} onClick={() => gotoTab(n.key)}
                aria-label={`Navigate to ${n.label}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
                  tab === n.key
                    ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                    : 'text-[#7E7C8E] hover:bg-white/[0.04] hover:text-[#EDEAE4]'
                }`}>
                <n.icon size={15} />
                {n.label}
                {n.key === 'goals' && activeGoals.length > 0 && (
                  <span className="ml-auto text-[10px] bg-amber-400/20 text-amber-300 rounded-full px-1.5 py-0.5 font-bold">{activeGoals.length}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="mt-auto px-3 pb-2">
            <button onClick={() => setPage('onboarding')}
              className="w-full btn-primary py-2.5 text-sm">
              <Plus size={14} /> New Assessment
            </button>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

            {/* ══ OVERVIEW ══════════════════════════════════════════════ */}
            {tab === 'overview' && (
              <div className="space-y-6 animate-fade-up">
                {/* Greeting */}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Welcome back{user?.phone ? `, ${formatPhone(user.phone)}` : ''}! 👋
                  </h1>
                  <p className="text-[#7E7C8E] mt-1 text-sm">Here's your career journey at a glance</p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: BarChart2, label: 'Analyses', val: sessionHistory?.length || 0, color: 'text-amber-300' },
                    { icon: Target, label: 'Active Goals', val: activeGoals.length, color: 'text-indigo-300' },
                    { icon: CheckCircle2, label: 'Goals Done', val: doneGoals.length, color: 'text-emerald-300' },
                    { icon: Heart, label: 'Saved Reports', val: likedSessions.length, color: 'text-rose-300' },
                  ].map(s => (
                    <div key={s.label} className="card flex flex-col gap-2">
                      <s.icon size={16} className={s.color} />
                      <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                      <p className="text-[11px] text-[#45434F]">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Activity heatmap */}
                <div className="card">
                  <ActivityHeatmap sessions={sessionHistory} />
                </div>

                {/* Top career match */}
                {topCareer && (
                  <div className="card border-amber-400/15">
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={14} className="text-amber-400" />
                      <p className="text-xs font-semibold text-amber-300 uppercase tracking-widest">Your Top Career Match</p>
                    </div>
                    <p className="text-lg font-bold">{topCareer.career || topCareer.careerName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-[#7E7C8E]">{topCareer.matchScore || topCareer.match}% match</span>
                      <button onClick={() => gotoTab('history')} className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                        View report <ChevronRight size={11} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick actions */}
                <div>
                  <p className="text-[11px] text-[#45434F] font-semibold tracking-widest uppercase mb-3">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setPage('onboarding')} className="card card-hover flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                        <Zap size={16} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">New Analysis</p>
                        <p className="text-[11px] text-[#45434F]">Get fresh career matches</p>
                      </div>
                    </button>
                    <button onClick={() => gotoTab('advisor')} className="card card-hover flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-xl bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center shrink-0">
                        <MessageCircle size={16} className="text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Ask Advisor</p>
                        <p className="text-[11px] text-[#45434F]">Career questions × AI</p>
                      </div>
                    </button>
                    <button onClick={() => { gotoTab('goals'); openAddGoal() }} className="card card-hover flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                        <Flag size={16} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Add Goal</p>
                        <p className="text-[11px] text-[#45434F]">Set a new milestone</p>
                      </div>
                    </button>
                    <button onClick={requestNotifPerm} className="card card-hover flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center shrink-0">
                        {notifPerm === 'granted' ? <Bell size={16} className="text-purple-400" /> : <BellOff size={16} className="text-purple-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{notifPerm === 'granted' ? 'Notifs On' : 'Enable Notifs'}</p>
                        <p className="text-[11px] text-[#45434F]">Goal reminders</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent history */}
                {sessionHistory?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] text-[#45434F] font-semibold tracking-widest uppercase">Recent Analyses</p>
                      <button onClick={() => gotoTab('history')} className="text-xs text-amber-400 hover:underline">View all</button>
                    </div>
                    <div className="space-y-2">
                      {sessionHistory.slice(0, 3).map(s => (
                        <MiniSessionCard key={s._id} s={s} likes={likes} toggleLike={toggleLike} loadSession={loadSession} deleteSession={(id) => { deleteSession(id); loadHistory() }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming goals */}
                {activeGoals.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] text-[#45434F] font-semibold tracking-widest uppercase">Active Goals</p>
                      <button onClick={() => gotoTab('goals')} className="text-xs text-amber-400 hover:underline">Manage</button>
                    </div>
                    <div className="space-y-2">
                      {activeGoals.slice(0, 3).map(g => <MiniGoalCard key={g.id} g={g} toggleDone={toggleGoalDone} />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ HISTORY ═══════════════════════════════════════════════ */}
            {tab === 'history' && (
              <div className="animate-fade-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Career Analyses</h2>
                    <p className="text-[#7E7C8E] text-sm mt-0.5">{sessionHistory?.length || 0} saved report{sessionHistory?.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={() => setPage('onboarding')} className="btn-primary py-2 px-4 text-sm">
                    <Plus size={13} /> New
                  </button>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-5">
                  {[{k:'all',l:'All'},{k:'liked',l:'❤️ Saved'}].map(f => (
                    <button key={f.k} onClick={() => gotoTab(f.k === 'liked' ? 'liked' : 'history')}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${f.k==='all' ? 'border-amber-400/25 bg-amber-400/10 text-amber-300' : 'border-white/[0.07] text-[#7E7C8E] hover:border-white/15'}`}>
                      {f.l}
                    </button>
                  ))}
                </div>

                {!sessionHistory?.length ? (
                  <div className="text-center py-16 text-[#45434F]">
                    <Clock size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No analyses yet</p>
                    <p className="text-sm mt-1">Complete an assessment to see your career report here</p>
                    <button onClick={() => setPage('onboarding')} className="btn-primary mt-5 py-2.5 px-6 text-sm">Start Assessment</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessionHistory.map(s => (
                      <FullSessionCard key={s._id} s={s} likes={likes} toggleLike={toggleLike}
                        loadSession={loadSession}
                        deleteSession={(id) => { deleteSession(id); loadHistory() }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ LIKED ══════════════════════════════════════════════════ */}
            {tab === 'liked' && (
              <div className="animate-fade-up">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => gotoTab('history')} aria-label="Back to history" className="text-[#7E7C8E] hover:text-[#EDEAE4]"><ChevronRight size={16} className="rotate-180" /></button>
                  <h2 className="text-xl font-bold">Saved Reports</h2>
                </div>
                {!likedSessions.length ? (
                  <div className="text-center py-16 text-[#45434F]">
                    <Heart size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No saved reports yet</p>
                    <p className="text-sm mt-1">Heart a report to save it here</p>
                    <button onClick={() => gotoTab('history')} className="text-amber-400 text-sm mt-3 hover:underline">Browse history →</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {likedSessions.map(s => (
                      <FullSessionCard key={s._id} s={s} likes={likes} toggleLike={toggleLike}
                        loadSession={loadSession}
                        deleteSession={(id) => { deleteSession(id); loadHistory() }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ GOALS ══════════════════════════════════════════════════ */}
            {tab === 'goals' && (
              <div className="animate-fade-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">My Goals</h2>
                    <p className="text-[#7E7C8E] text-sm mt-0.5">{activeGoals.length} active · {doneGoals.length} completed</p>
                  </div>
                  <button onClick={openAddGoal} className="btn-primary py-2 px-4 text-sm">
                    <Plus size={13} /> Add Goal
                  </button>
                </div>

                {/* Notification banner */}
                {notifPerm !== 'granted' && (
                  <div className="flex items-center gap-3 bg-purple-400/[0.07] border border-purple-400/20 rounded-xl px-4 py-3 mb-5">
                    <Bell size={14} className="text-purple-400 shrink-0" />
                    <p className="text-sm text-[#7E7C8E] flex-1">Enable notifications to get goal reminders</p>
                    <button onClick={requestNotifPerm} className="text-xs text-purple-300 hover:underline shrink-0">Enable</button>
                  </div>
                )}

                {!goals.length ? (
                  <div className="text-center py-16 text-[#45434F]">
                    <Target size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No goals yet</p>
                    <p className="text-sm mt-1">Set a goal with a time period and get reminded automatically</p>
                    <button onClick={openAddGoal} className="btn-primary mt-5 py-2.5 px-6 text-sm">Add First Goal</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeGoals.length > 0 && (
                      <>
                        <p className="text-[11px] text-[#45434F] font-semibold tracking-widest uppercase">Active</p>
                        {activeGoals.map(g => (
                          <GoalCard key={g.id} g={g} onEdit={openEditGoal} onDelete={deleteGoal} onToggleDone={toggleGoalDone} />
                        ))}
                      </>
                    )}
                    {doneGoals.length > 0 && (
                      <>
                        <p className="text-[11px] text-[#45434F] font-semibold tracking-widest uppercase mt-6">Completed</p>
                        {doneGoals.map(g => (
                          <GoalCard key={g.id} g={g} onEdit={openEditGoal} onDelete={deleteGoal} onToggleDone={toggleGoalDone} done />
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ══ ADVISOR (Chat) ══════════════════════════════════════════ */}
            {tab === 'advisor' && (
              <div className="animate-fade-up flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
                <div className="mb-4">
                  <h2 className="text-xl font-bold">Career Advisor</h2>
                  <p className="text-[#7E7C8E] text-sm mt-0.5">Ask anything about careers, colleges, entrance exams, or your results</p>
                </div>

                {/* Suggested prompts — first one adapts to the most-visited tab (implicit feedback) */}
                {(() => {
                  const tabPrompts = {
                    history: 'Explain my most recent career analysis',
                    goals: 'Help me plan a learning schedule for my goals',
                    overview: 'What is my overall career readiness right now?',
                  }
                  const topTab = Object.entries(tabTimings).sort((a, b) => b[1] - a[1])[0]?.[0]
                  const dynamicPrompt = tabPrompts[topTab]
                  const basePrompts = ['What entrance exams should I prepare for?', 'How do I improve my resume?', 'Best online courses for my career', 'What salary can I expect?', 'How to switch careers?']
                  const prompts = dynamicPrompt ? [dynamicPrompt, ...basePrompts.slice(0, 4)] : basePrompts
                  return (
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
                      {prompts.map((q, idx) => (
                        <button key={q} onClick={() => setChatInput(q)}
                          aria-label={`Ask: ${q}`}
                          className={`shrink-0 text-xs border rounded-full px-3 py-1.5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
                            idx === 0 && dynamicPrompt
                              ? 'bg-amber-400/10 border-amber-400/25 text-amber-300 hover:bg-amber-400/15'
                              : 'bg-white/[0.04] border-white/[0.08] hover:border-amber-400/25 text-[#7E7C8E] hover:text-[#EDEAE4]'
                          }`}>
                          {idx === 0 && dynamicPrompt ? `★ ${q}` : q}
                        </button>
                      ))}
                    </div>
                  )
                })()}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ minHeight: 0 }}>
                  {localChat.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.role === 'ai' && (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Compass size={12} className="text-white" />
                        </div>
                      )}
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-indigo-500/20 border border-indigo-400/20 text-[#EDEAE4] rounded-tr-sm'
                          : 'bg-[#0E0E18] border border-white/[0.07] text-[#EDEAE4] rounded-tl-sm'
                      }`}>
                        {m.role === 'ai' ? (
                          <>
                            <span dangerouslySetInnerHTML={{ __html: (m.displayed ?? m.content).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                            {m.streaming && <span className="inline-block w-[2px] h-[13px] bg-amber-400 ml-0.5 align-middle animate-pulse" />}
                          </>
                        ) : m.displayed ?? m.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div role="status" aria-label="AI is typing a response" className="flex gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                        <Compass size={12} className="text-white" />
                      </div>
                      <div className="bg-[#0E0E18] border border-white/[0.07] px-4 py-3 rounded-2xl rounded-tl-sm">
                        <div className="flex gap-1.5 items-center h-4">
                          {[0, 150, 300].map(d => (
                            <span key={d} className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                    placeholder="Ask about careers, exams, courses..."
                    disabled={chatLoading || chatStreaming}
                    className="flex-1 input-field py-3"
                  />
                  <button onClick={handleSendChat} disabled={!chatInput.trim() || chatLoading || chatStreaming}
                    aria-label="Send message"
                    className="w-11 h-11 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 shrink-0">
                    <Send size={15} className="text-[#08080D]" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Bottom nav (mobile) ──────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#08080D]/90 backdrop-blur-xl border-t border-white/[0.06] flex items-stretch h-16">
        {NAV.map(n => (
          <button key={n.key} onClick={() => gotoTab(n.key)}
            aria-label={`Navigate to ${n.label}`}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 relative ${
              tab === n.key ? 'text-amber-400' : 'text-[#45434F]'
            }`}>
            <n.icon size={18} />
            <span className="text-[9px] font-medium">{n.label}</span>
            {n.key === 'goals' && activeGoals.length > 0 && tab !== 'goals' && (
              <span className="absolute top-2 right-[calc(50%-14px)] w-3.5 h-3.5 text-[8px] bg-amber-400 text-[#08080D] font-bold rounded-full flex items-center justify-center">{activeGoals.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ══ Goal Form Modal ══════════════════════════════════════════════ */}
      {showGoalForm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E0E18] border border-white/10 rounded-2xl p-5 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">{editingGoal ? 'Edit Goal' : 'New Goal'}</h3>
              <button onClick={() => setShowGoalForm(false)} className="text-[#45434F] hover:text-[#EDEAE4]"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="field-label">Goal Title *</label>
                <input className="input-field" placeholder="e.g. Practice coding 30 min daily" value={goalForm.title} onChange={e => setGoalForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Description</label>
                <input className="input-field" placeholder="What does success look like?" value={goalForm.description} onChange={e => setGoalForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Reminder Period *</label>
                  <select className="input-field" value={goalForm.period} onChange={e => setGoalForm(p => ({ ...p, period: e.target.value }))}>
                    <option value="daily">Every Day</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Target Date</label>
                  <input type="date" className="input-field" value={goalForm.targetDate} onChange={e => setGoalForm(p => ({ ...p, targetDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="field-label">Color Tag</label>
                <div className="flex gap-2 mt-1">
                  {GOAL_COLORS.map(c => (
                    <button key={c.key} onClick={() => setGoalForm(p => ({ ...p, color: c.key }))}
                      className={`w-7 h-7 rounded-full ${c.dot} transition-transform ${goalForm.color === c.key ? 'scale-125 ring-2 ring-white/30' : 'opacity-40 hover:opacity-70'}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowGoalForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-sm text-[#7E7C8E] hover:text-[#EDEAE4] transition-colors">Cancel</button>
              <button onClick={saveGoal} disabled={!goalForm.title.trim()} className="flex-1 btn-primary py-2.5 text-sm">
                {editingGoal ? 'Save Changes' : 'Add Goal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MiniSessionCard({ s, likes, toggleLike, loadSession, deleteSession }) {
  const match = s.careerData?.topMatches?.[0] || s.careerData?.careerMatches?.[0]
  return (
    <div className="flex items-center gap-3 bg-[#0E0E18] border border-white/[0.06] rounded-xl px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{s.title || match?.career || match?.careerName || 'Career Analysis'}</p>
        <p className="text-[11px] text-[#45434F]">{timeAgo(s.createdAt)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => toggleLike(s._id)} aria-label={likes.includes(s._id) ? 'Unlike report' : 'Like report'} className={`transition-colors ${likes.includes(s._id) ? 'text-rose-400' : 'text-[#45434F] hover:text-rose-400'}`}>
          <Heart size={13} fill={likes.includes(s._id) ? 'currentColor' : 'none'} />
        </button>
        <button onClick={() => loadSession(s._id)} aria-label="View report" className="text-[#45434F] hover:text-amber-400 transition-colors"><Eye size={13} /></button>
        <button onClick={() => deleteSession(s._id)} aria-label="Delete report" className="text-[#45434F] hover:text-rose-400 transition-colors"><Trash2 size={13} /></button>
      </div>
    </div>
  )
}

function FullSessionCard({ s, likes, toggleLike, loadSession, deleteSession }) {
  const match = s.careerData?.topMatches?.[0] || s.careerData?.careerMatches?.[0]
  const allMatches = s.careerData?.topMatches?.slice(0, 3) || s.careerData?.careerMatches?.slice(0, 3) || []
  const pct = match?.matchScore || match?.match || 0
  return (
    <div className="card border-white/[0.06] hover:border-white/10 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{s.title || match?.career || match?.careerName || 'Career Analysis'}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {s.profile?.education && <span className="text-[10px] bg-white/[0.05] border border-white/[0.07] rounded-full px-2 py-0.5 text-[#7E7C8E]">{s.profile.education}</span>}
            {s.profile?.location && <span className="text-[10px] bg-white/[0.05] border border-white/[0.07] rounded-full px-2 py-0.5 text-[#7E7C8E]">{s.profile.location}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs font-bold text-amber-300">{pct}% match</span>
          <span className="text-[10px] text-[#45434F]">{timeAgo(s.createdAt)}</span>
        </div>
      </div>
      {allMatches.length > 1 && (
        <div className="flex gap-1.5 mt-3">
          {allMatches.map((m, i) => (
            <span key={i} className="text-[10px] bg-indigo-400/10 border border-indigo-400/15 rounded-full px-2.5 py-1 text-indigo-300">{m.career || m.careerName}</span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
        <button onClick={() => loadSession(s._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 text-sm font-medium hover:bg-amber-400/15 transition-colors">
          <Eye size={13} /> View Report
        </button>
        <button onClick={() => toggleLike(s._id)} aria-label={likes.includes(s._id) ? 'Unlike report' : 'Like report'} className={`px-3 py-2 rounded-xl border transition-colors ${likes.includes(s._id) ? 'border-rose-400/30 bg-rose-400/10 text-rose-300' : 'border-white/[0.07] text-[#45434F] hover:text-rose-400'}`}>
          <Heart size={14} fill={likes.includes(s._id) ? 'currentColor' : 'none'} />
        </button>
        <button onClick={() => deleteSession(s._id)} aria-label="Delete session" className="px-3 py-2 rounded-xl border border-white/[0.07] text-[#45434F] hover:text-rose-400 hover:border-rose-400/20 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function GoalCard({ g, onEdit, onDelete, onToggleDone, done }) {
  const c = GOAL_COLORS.find(x => x.key === g.color) || GOAL_COLORS[0]
  const progress = goalProgress(g)
  const left = daysLeft(g.targetDate)
  return (
    <div className={`card transition-all ${done ? 'opacity-60' : ''} border-white/[0.06]`}>
      <div className="flex items-start gap-3">
        <button onClick={() => onToggleDone(g.id)} aria-label={done ? 'Mark goal as incomplete' : 'Mark goal as complete'} className={`mt-0.5 shrink-0 transition-colors ${done ? 'text-emerald-400' : 'text-[#45434F] hover:text-emerald-400'}`}>
          {done ? <CheckCircle2 size={17} /> : <Circle size={17} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-semibold text-sm ${done ? 'line-through text-[#45434F]' : ''}`}>{g.title}</p>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.border} border ${c.text}`}>{periodLabel(g.period)}</span>
            </div>
          </div>
          {g.description && <p className="text-[12px] text-[#7E7C8E] mt-0.5 leading-snug">{g.description}</p>}
          {progress !== null && !done && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#45434F]">{left}</span>
                <span className={`text-[10px] font-semibold ${c.text}`}>{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full ${c.dot} rounded-full transition-all`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {g.targetDate && (
            <div className="flex items-center gap-1.5 mt-2">
              <Calendar size={10} className="text-[#45434F]" />
              <span className="text-[10px] text-[#45434F]">Target: {new Date(g.targetDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
            </div>
          )}
        </div>
      </div>
      {!done && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
          <button onClick={() => onEdit(g)} className="flex items-center gap-1.5 text-xs text-[#45434F] hover:text-[#EDEAE4] transition-colors">
            <Edit3 size={11} /> Edit
          </button>
          <button onClick={() => onDelete(g.id)} className="flex items-center gap-1.5 text-xs text-[#45434F] hover:text-rose-400 transition-colors ml-auto">
            <Trash2 size={11} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

function MiniGoalCard({ g, toggleDone }) {
  const c = GOAL_COLORS.find(x => x.key === g.color) || GOAL_COLORS[0]
  const left = daysLeft(g.targetDate)
  return (
    <div className={`flex items-center gap-3 bg-[#0E0E18] border border-white/[0.06] rounded-xl px-4 py-3`}>
      <div className={`w-2.5 h-2.5 rounded-full ${c.dot} shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{g.title}</p>
        <p className="text-[11px] text-[#45434F]">{periodLabel(g.period)}{left ? ` · ${left}` : ''}</p>
      </div>
      <button onClick={() => toggleDone(g.id)} aria-label="Mark goal as complete" className="text-[#45434F] hover:text-emerald-400 transition-colors shrink-0">
        <CheckCircle2 size={15} />
      </button>
    </div>
  )
}
