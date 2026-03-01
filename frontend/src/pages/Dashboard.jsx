import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import AgentThinkingPanel from '../components/AgentThinkingPanel'
import RadarChart from '../components/RadarChart'
import ChatTutor from '../components/ChatTutor'
import CareerMatchCard from '../components/CareerMatchCard'
import CareerComparison from '../components/CareerComparison'
import RoadmapPlan from '../components/RoadmapPlan'
import SalaryTable from '../components/SalaryTable'
import { Star, Lightbulb, MapPin, TrendingUp, BarChart2, MessageCircle, Map, RefreshCw, History, ChevronLeft, ChevronRight, Trash2, Clock } from 'lucide-react'

function HistorySidebar({ open, onToggle }) {
  const { sessionHistory, loadSession, deleteSession, user } = useApp()

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 hidden sm:flex flex-col transition-all duration-300 ease-in-out
        ${open ? 'w-[240px]' : 'w-10'}
        bg-[#0B0B15] border-r border-white/[0.06]`}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="mt-[60px] ml-auto mr-0 flex items-center justify-center w-6 h-10 bg-[#12121E] border border-white/[0.08] rounded-l-none rounded-r-lg text-[#45434F] hover:text-amber-400 transition-colors"
        title={open ? 'Close history' : 'Open history'}
      >
        {open ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {open && (
        <div className="flex flex-col h-full overflow-hidden px-3 pb-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 mt-2">
            <History size={13} className="text-amber-400/70 shrink-0" />
            <span className="text-xs font-semibold text-[#7E7C8E] uppercase tracking-wider">History</span>
          </div>

          {!user && (
            <p className="text-[11px] text-[#45434F] text-center mt-4 px-1 leading-relaxed">
              Sign in to save and view your past career assessments
            </p>
          )}

          {user && sessionHistory.length === 0 && (
            <p className="text-[11px] text-[#45434F] text-center mt-4 px-1 leading-relaxed">
              No past sessions yet. Complete an assessment to save it here.
            </p>
          )}

          {user && sessionHistory.length > 0 && (
            <ul className="flex-1 overflow-y-auto space-y-1 -mr-1 pr-1 custom-scrollbar">
              {sessionHistory.map(s => (
                <li key={s._id} className="group relative">
                  <button
                    onClick={() => loadSession(s._id)}
                    className="w-full text-left px-2.5 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    <p className="text-[12px] font-medium text-[#EDEAE4] truncate leading-snug">
                      {s.title || 'Career Assessment'}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={10} className="text-[#45434F]" />
                      <span className="text-[10px] text-[#45434F]">
                        {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => deleteSession(s._id)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded text-[#45434F] hover:text-rose-400 transition-all"
                    title="Delete session"
                  >
                    <Trash2 size={11} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Collapsed icon */}
      {!open && (
        <div className="flex flex-col items-center gap-3 mt-3">
          <History size={15} className="text-[#45434F]" />
          {user && sessionHistory.length > 0 && (
            <span className="text-[10px] text-amber-400 font-bold">{sessionHistory.length}</span>
          )}
        </div>
      )}
    </aside>
  )
}

function FeedbackStars({ career }) {
  const { feedbackRatings, addFeedback } = useApp()
  const current = feedbackRatings[career] || 0
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => addFeedback(career, n)}>
          <Star size={14} className={n <= current ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
        </button>
      ))}
    </div>
  )
}

function Section({ id, icon, title, children }) {
  return (
    <section id={id} className="scroll-mt-[120px]">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-amber-400/80">{icon}</span>
        <h2 className="text-[17px] font-bold text-[#EDEAE4] tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function Dashboard() {
  const { profile, careerData, agentThoughts, isAnalyzing, comparisonCareers, setPage, runAnalysis } = useApp()
  const [activeSection, setActiveSection] = useState('matches')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-[#08080D] flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <AgentThinkingPanel thoughts={agentThoughts} isLoading={isAnalyzing} />
        </div>
      </div>
    )
  }

  if (!careerData) {
    return (
      <div className="min-h-screen bg-[#08080D] flex flex-col items-center justify-center text-center p-6">
        <p className="text-[#7E7C8E] mb-5">No career data yet.</p>
        <button onClick={() => setPage('onboarding')} className="btn-primary">Start Assessment</button>
      </div>
    )
  }

  const {
    personalityType, topMatches = [], skillGapAnalysis, roadmap = [],
    salaryComparison = [], careerComparison = [], marketDemand,
    localizedOpportunities, hiddenCareers = [], personalizedAdvice,
    radarData, agentThoughts: aiThoughts = [],
  } = careerData

  const radarFormatted = radarData ? radarData.labels.map((label, i) => ({
    subject: label, value: radarData.scores[i], fullMark: 100,
  })) : []

  const skillGapBars = skillGapAnalysis ? [
    ...(skillGapAnalysis.currentlyHave || []).map(s => ({ name: s, current: 72, required: 80 })),
    ...(skillGapAnalysis.needToLearn || []).map(s => ({ name: s, current: 15, required: 80 })),
  ] : []

  const NAV_ITEMS = [
    { id: 'matches', label: 'Matches' },
    { id: 'radar', label: 'Profile' },
    { id: 'skillgap', label: 'Skill Gap' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'salary', label: 'Salary' },
    { id: 'market', label: 'Market' },
    { id: 'local', label: 'Local' },
    { id: 'chat', label: 'Chat' },
  ]

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setActiveSection(id)
  }

  return (
    <div className="min-h-screen bg-[#08080D] text-[#EDEAE4] flex">
      {/* History sidebar */}
      <HistorySidebar open={sidebarOpen} onToggle={() => setSidebarOpen(p => !p)} />

      {/* Main content — offset by sidebar width on desktop only */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${sidebarOpen ? 'ml-0 sm:ml-[240px]' : 'ml-0 sm:ml-10'}`}>
      <Navbar />

      {/* ── Hero Summary ── */}
      <div className="pt-16 pb-6 px-4 sm:px-8 bg-gradient-to-b from-[#0B0B15] to-[#08080D] border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <p className="section-label mb-2">Analysis complete</p>
              <h1 className="text-2xl font-bold tracking-tight text-[#EDEAE4]">
                {profile.name ? `${profile.name}'s Career GPS` : 'Your Career Report'}
              </h1>
              {personalityType && (
                <p className="text-[#7E7C8E] text-sm mt-1.5">
                  Personality type: <span className="text-indigo-300 font-medium">{personalityType}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => setPage('onboarding')}
              className="btn-ghost text-xs py-2 px-4 shrink-0"
            >
              <RefreshCw size={13} /> Redo Assessment
            </button>
          </div>

          {/* Personalized advice */}
          {personalizedAdvice && (
            <div className="mt-5 bg-amber-400/[0.05] border border-amber-400/15 rounded-xl p-4 flex gap-3">
              <Lightbulb size={15} className="text-amber-400/80 shrink-0 mt-0.5" />
              <p className="text-sm text-[#EDEAE4] leading-relaxed">{personalizedAdvice}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Section Nav ── */}
      <div className="sticky top-[60px] z-40 bg-[#08080D]/95 backdrop-blur-xl border-b border-white/[0.06] overflow-x-auto scrollbar-hide">
        <div className="flex px-3 sm:px-8 gap-0 max-w-5xl mx-auto">
          {NAV_ITEMS.map(n => (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              className={`px-2.5 sm:px-4 py-3.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 flex-shrink-0 ${
                activeSection === n.id
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-[#45434F] hover:text-[#7E7C8E]'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-10 sm:space-y-14">

        {/* ── Agent Thoughts ── */}
        {(aiThoughts.length > 0 || agentThoughts.length > 0) && (
          <details className="group">
            <summary className="cursor-pointer text-xs text-[#45434F] hover:text-[#7E7C8E] flex items-center gap-2 select-none list-none">
              <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
              View AI reasoning process
            </summary>
            <div className="mt-3">
              <AgentThinkingPanel thoughts={aiThoughts.length ? aiThoughts : agentThoughts} isLoading={false} />
            </div>
          </details>
        )}

        {/* ── CAREER MATCHES ── */}
        <Section id="matches" icon={<Star size={18} />} title="Your Career Matches">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMatches.map((career, i) => (
              <div key={career.career}>
                <CareerMatchCard career={career} rank={i} />
                <div className="mt-1.5 flex items-center gap-2 px-1">
                  <span className="text-xs text-gray-500">Rate this match:</span>
                  <FeedbackStars career={career.career} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── CAREER COMPARISON ── */}
        {comparisonCareers.length === 2 && (
          <Section id="compare" icon={<BarChart2 size={18} />} title="Career Comparison">
            <CareerComparison />
          </Section>
        )}

        {/* ── PERSONALITY RADAR ── */}
        {radarFormatted.length > 0 && (
          <Section id="radar" icon={<BarChart2 size={18} />} title="Your Aptitude Radar">
            <div className="card">
              <RadarChart data={radarFormatted} />
            </div>
          </Section>
        )}

        {/* ── SKILL GAP ── */}
        {skillGapBars.length > 0 && (
          <Section id="skillgap" icon={<TrendingUp size={18} />} title={`Skill Gap — ${skillGapAnalysis?.forCareer || 'Top Career'}`}>
            <div className="card">
              {skillGapAnalysis?.required?.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  <span className="text-xs text-[#45434F]">Required:</span>
                  {skillGapAnalysis.required.map(s => (
                    <span key={s} className="text-xs bg-[#0E0E18] border border-white/[0.08] text-[#7E7C8E] px-2.5 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              )}
              {/* Inline bars instead of SkillBars card */}
              <div className="space-y-3">
                {skillGapBars.map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-white font-medium">{item.name}</span>
                      <span className={item.current >= 70 ? 'text-amber-400' : 'text-indigo-300'}>{item.current}%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a26] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${item.current}%`, background: item.current >= 70 ? '#FBBF24' : '#818CF8' }} />
                    </div>
                  </div>
                ))}
              </div>
              {skillGapAnalysis?.difficultyToAcquire && (
                <p className="text-xs text-[#45434F] mt-3">
                  Difficulty: <span className="text-indigo-300">{skillGapAnalysis.difficultyToAcquire}</span>
                </p>
              )}
            </div>
          </Section>
        )}

        {/* ── ROADMAP ── */}
        {roadmap.length > 0 && (
          <Section id="roadmap" icon={<Map size={18} />} title="Your Month-by-Month Roadmap">
            <RoadmapPlan roadmap={roadmap} />
          </Section>
        )}

        {/* ── SALARY TABLE ── */}
        {salaryComparison.length > 0 && (
          <Section id="salary" icon={<BarChart2 size={18} />} title="Salary & Growth Comparison">
            <div className="card">
              <SalaryTable data={salaryComparison} />
            </div>
          </Section>
        )}

        {/* ── MARKET DEMAND ── */}
        {marketDemand && (
          <Section id="market" icon={<TrendingUp size={18} />} title="5-Year Market Intelligence">
            <div className="card space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">{marketDemand.analysis}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-amber-400/80 font-semibold mb-2">↑ Growing Fields</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(marketDemand.growingFields || []).map(f => (
                      <span key={f} className="text-xs bg-amber-400/[0.08] text-amber-300 border border-amber-400/15 px-2.5 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-red-400 font-medium mb-2">↓ Declining Fields</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(marketDemand.decliningFields || []).map(f => (
                      <span key={f} className="text-xs bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
              {marketDemand.prediction && (
                <div className="bg-indigo-400/[0.06] border border-indigo-400/15 rounded-xl p-4">
                  <p className="text-xs text-indigo-300 font-semibold mb-1.5">5-Year Prediction</p>
                  <p className="text-sm text-[#EDEAE4]">{marketDemand.prediction}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ── LOCALIZED OPPORTUNITIES ── */}
        {localizedOpportunities && (
          <Section id="local" icon={<MapPin size={18} />} title={`Opportunities in ${localizedOpportunities.region || profile.location || 'Your Region'}`}>
            <div className="grid sm:grid-cols-2 gap-4">
              {localizedOpportunities.relevantExams?.length > 0 && (
                <div className="card">
                  <p className="text-xs text-amber-400/80 font-semibold mb-2">Competitive Exams</p>
                  <ul className="space-y-1">
                    {localizedOpportunities.relevantExams.map(e => (
                      <li key={e} className="text-sm text-[#EDEAE4]">• {e}</li>
                    ))}
                  </ul>
                </div>
              )}
              {localizedOpportunities.skillPrograms?.length > 0 && (
                <div className="card">
                  <p className="text-xs text-indigo-300/80 font-semibold mb-2">Skill Programs / Schemes</p>
                  <ul className="space-y-1">
                    {localizedOpportunities.skillPrograms.map(p => (
                      <li key={p} className="text-sm text-[#EDEAE4]">• {p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {localizedOpportunities.industries?.length > 0 && (
                <div className="card sm:col-span-2">
                  <p className="text-xs text-indigo-300/80 font-semibold mb-2">Key Industries</p>
                  <div className="flex flex-wrap gap-2">
                    {localizedOpportunities.industries.map(ind => (
                      <span key={ind} className="text-xs bg-[#131320] text-[#EDEAE4] px-3 py-1 rounded-full border border-white/[0.08]">{ind}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ── HIDDEN CAREERS ── */}
        {hiddenCareers.length > 0 && (
          <Section id="hidden" icon={<Lightbulb size={18} />} title="Hidden Gems — Careers Worth Exploring">
            <div className="card">
              <p className="text-sm text-[#7E7C8E] mb-4">Lesser-known paths that match your profile but are often overlooked</p>
              <div className="flex flex-wrap gap-2">
                {hiddenCareers.map(c => (
                  <span key={c} className="text-sm bg-indigo-400/[0.08] border border-indigo-400/20 text-indigo-200 px-3.5 py-1.5 rounded-full">
                    ✦ {c}
                  </span>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ── CHAT TUTOR ── */}
        <Section id="chat" icon={<MessageCircle size={18} />} title="Ask CareerRamp AI">
          <ChatTutor />
        </Section>

      </div>
      </div>{/* end flex main */}
    </div>
  )
}
