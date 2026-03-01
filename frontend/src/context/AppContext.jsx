import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { playLoginSound, playAnalysisSound } from '../utils/sounds'

const AppContext = createContext(null)

// In dev: Vite proxy forwards /api → localhost:3001 (baseURL = '')
// In prod: uses VITE_API_URL env var, falls back to hardcoded Render URL
const BACKEND_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : 'https://careerramp-1.onrender.com')

export const api = axios.create({
  baseURL: BACKEND_URL,
})

// Register interceptor once at module level — always ready before any request
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('cr_token')
  if (t) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${t}` }
  return cfg
})

export function AppProvider({ children }) {
  // Restore session: if token exists → resume at user-dashboard
  const [page, setPage] = useState(() => {
    try { return localStorage.getItem('cr_token') ? 'user-dashboard' : 'landing' } catch { return 'landing' }
  })

  // ── Auth State ──
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cr_user') || 'null') } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('cr_token') || null)
  const [sessionHistory, setSessionHistory] = useState([])

  // ── Auto-set initial page based on token ──
  useEffect(() => {
    if (token) {
      loadHistory()
    }
  }, [token])

  // ── Career Profile ──
  const [profile, setProfile] = useState({
    name: '', age: '', education: '', stream: '', location: '', language: 'English',
    activities: [], preferences: [],
    quizScore: 0, quizLevel: 'basic',
    financialCondition: '', needJobIn: '', canRelocate: false, studyAbroad: false, canAffordHigherEd: '',
    careerAwareness: [], goal: '',
  })
  const [careerData, setCareerData] = useState(null)
  const [agentThoughts, setAgentThoughts] = useState([])
  const [agentStatus, setAgentStatus] = useState('idle')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [feedbackRatings, setFeedbackRatings] = useState({})
  const [comparisonCareers, setComparisonCareers] = useState([])

  // ── Auth: Login ──
  const login = useCallback(async (phone, password) => {
    try {
      const res = await api.post('/api/auth/login', { phone, password })
      const { token: tk, user: u } = res.data
      localStorage.setItem('cr_token', tk)
      localStorage.setItem('cr_user', JSON.stringify(u))
      setToken(tk)
      setUser(u)
      playLoginSound()
      // load history in background, always go to user-dashboard
      api.get('/api/history', { headers: { Authorization: `Bearer ${tk}` } })
        .then(hist => setSessionHistory(hist.data.sessions || []))
        .catch(() => {})
      setPage('user-dashboard')
      return {}
    } catch (err) {
      return { error: err.response?.data?.error || err.response?.data?.message || 'Login failed' }
    }
  }, [])

  // ── Auth: Register ──
  const register = useCallback(async (phone, password) => {
    try {
      const res = await api.post('/api/auth/register', { phone, password })
      const { token: tk, user: u } = res.data
      localStorage.setItem('cr_token', tk)
      localStorage.setItem('cr_user', JSON.stringify(u))
      setToken(tk)
      setUser(u)
      playLoginSound()
      setPage('onboarding')
      return {}
    } catch (err) {
      return { error: err.response?.data?.error || err.response?.data?.message || 'Registration failed' }
    }
  }, [])

  // ── Auth: Logout ──
  const logout = useCallback(() => {
    localStorage.removeItem('cr_token')
    localStorage.removeItem('cr_user')
    setToken(null)
    setUser(null)
    setSessionHistory([])
    setCareerData(null)
    setChatHistory([])
    setProfile({
      name: '', age: '', education: '', stream: '', location: '', language: 'English',
      activities: [], preferences: [],
      quizScore: 0, quizLevel: 'basic',
      financialCondition: '', needJobIn: '', canRelocate: false, studyAbroad: false, canAffordHigherEd: '',
      careerAwareness: [], goal: '',
    })
    setPage('landing')
  }, [])

  // ── History: Load list ──
  const loadHistory = useCallback(async () => {
    const tk = localStorage.getItem('cr_token')
    if (!tk) return
    try {
      const res = await api.get('/api/history')
      setSessionHistory(res.data.sessions || [])
    } catch { /* ignore */ }
  }, [])

  // ── History: Load one session ──
  const loadSession = useCallback(async (id) => {
    try {
      const res = await api.get(`/api/history/${id}`)
      const { session } = res.data
      if (session.profile) setProfile(session.profile)
      if (session.careerData) setCareerData(session.careerData)
      setChatHistory([])
      setPage('dashboard')
    } catch (err) {
      console.error('Failed to load session', err)
    }
  }, [])

  // ── History: Delete session ──
  const deleteSession = useCallback(async (id) => {
    try {
      await api.delete(`/api/history/${id}`)
      setSessionHistory(prev => prev.filter(s => s._id !== id))
    } catch { /* ignore */ }
  }, [])

  // ── History: Save session (called after analysis) ──
  const saveSession = useCallback(async (profileData, careerResults) => {
    const tk = localStorage.getItem('cr_token')
    if (!tk) return
    try {
      const res = await api.post('/api/history', { profile: profileData, careerData: careerResults })
      const saved = res.data.session || { _id: res.data.sessionId, title: res.data.title, profile: profileData, careerData: careerResults, createdAt: new Date().toISOString() }
      setSessionHistory(prev => [saved, ...prev])
    } catch { /* ignore */ }
  }, [])

  // ── Run Full Career Analysis ──
  const runAnalysis = useCallback(async (profileData) => {
    setIsAnalyzing(true)
    setAgentStatus('analyzing')
    setAgentThoughts([])
    setProfile(profileData)

    const thoughts = [
      'Building your career personality profile from activity preferences...',
      `Mapping aptitude score (${profileData.quizScore}/10) to career requirements...`,
      'Filtering by financial constraints and timeline...',
      `Finding localized opportunities in ${profileData.location || 'your region'}...`,
      'Generating career roadmap and 5-year market demand forecast...',
    ]
    for (let i = 0; i < thoughts.length; i++) {
      await new Promise(r => setTimeout(r, 500))
      setAgentThoughts(prev => [...prev, thoughts[i]])
    }

    try {
      const res = await api.post('/api/analyze', profileData)
      if (res.data.success) {
        const data = res.data.data
        setCareerData(data)
        if (data.agentThoughts?.length) setAgentThoughts(data.agentThoughts)
        await saveSession(profileData, data)
        playAnalysisSound()
        setPage('dashboard')
      }
    } catch (err) {
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
      setAgentStatus('idle')
    }
  }, [saveSession])

  // ── Send Chat ──
  const sendChat = useCallback(async (message) => {
    const userMsg = { role: 'user', content: message, ts: Date.now() }
    setChatHistory(prev => [...prev, userMsg])
    try {
      const res = await api.post('/api/chat', {
        message,
        history: chatHistory.slice(-6),
        context: {
          name: profile.name, age: profile.age,
          education: profile.education, location: profile.location,
          topCareer: careerData?.topMatches?.[0]?.career,
          skillGaps: careerData?.skillGapAnalysis?.needToLearn,
          financialCondition: profile.financialCondition,
        },
      })
      const aiMsg = { role: 'ai', content: res.data.reply, ts: Date.now() }
      setChatHistory(prev => [...prev, aiMsg])
      return res.data.reply
    } catch {
      const errMsg = { role: 'ai', content: "I'm having trouble connecting. Please try again!", ts: Date.now() }
      setChatHistory(prev => [...prev, errMsg])
    }
  }, [profile, careerData, chatHistory])

  const addFeedback = useCallback((careerName, rating) => {
    setFeedbackRatings(prev => ({ ...prev, [careerName]: rating }))
  }, [])

  const toggleComparison = useCallback((career) => {
    setComparisonCareers(prev => {
      if (prev.includes(career)) return prev.filter(c => c !== career)
      if (prev.length >= 2) return [prev[1], career]
      return [...prev, career]
    })
  }, [])

  const skipAuth = useCallback(() => setPage('onboarding'), [])

  const value = {
    page, setPage,
    user, token,
    sessionHistory, loadHistory, loadSession, deleteSession, saveSession,
    login, register, logout, skipAuth,
    profile, setProfile,
    careerData, setCareerData,
    agentThoughts, agentStatus, isAnalyzing,
    chatHistory, setChatHistory,
    feedbackRatings, addFeedback,
    comparisonCareers, toggleComparison,
    runAnalysis, sendChat,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}