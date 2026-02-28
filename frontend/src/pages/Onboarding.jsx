import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import AgentThinkingPanel from '../components/AgentThinkingPanel'
import { ChevronRight, ChevronLeft, Check, Compass, Brain, Zap, Target } from 'lucide-react'

// ────────────────────────────────────────────────────────────────
//  COMPREHENSIVE PROFILE-AWARE QUIZ POOL
//  Organized by domain so we can pick based on interests + edu
// ────────────────────────────────────────────────────────────────
const POOL = {
  // ── Logical / Math ───────────────────────────────────────────
  logical: [
    { id:'l1', level:'basic', tag:'Reasoning',
      question:'A shop offers 20% discount on ₹500. How much do you pay?',
      options:['₹400','₹380','₹420','₹450'], answer:'₹400' },
    { id:'l2', level:'basic', tag:'Pattern',
      question:'Complete the series: 2, 6, 18, 54, ___',
      options:['108','162','72','216'], answer:'162' },
    { id:'l3', level:'inter', tag:'Reasoning',
      question:'If inflation is 6% and your savings earn 4%, your real return is:',
      options:['+2%','-2%','10%','0%'], answer:'-2%' },
    { id:'l4', level:'inter', tag:'Math',
      question:'A team of 4 finishes in 8 days. How long for 8 people?',
      options:['16 days','4 days','2 days','8 days'], answer:'4 days' },
    { id:'l5', level:'advanced', tag:'Analytics',
      question:"Revenue grew 15% but profit fell 5%. Most likely reason?",
      options:['Tax increased','Costs grew faster than revenue','Fewer products sold','Management was lazy'], answer:'Costs grew faster than revenue' },
    { id:'l6', level:'advanced', tag:'Reasoning',
      question:'A clock shows 3:45. What is the angle between the hands?',
      options:['142.5°','157.5°','172.5°','127.5°'], answer:'157.5°' },
  ],

  // ── Tech / Coding ─────────────────────────────────────────────
  tech: [
    { id:'t1', level:'basic', tag:'Tech Basics',
      question:'What does "debugging" mean in coding?',
      options:['Adding new features','Finding and fixing errors','Designing the UI','Writing documentation'], answer:'Finding and fixing errors' },
    { id:'t2', level:'basic', tag:'Internet',
      question:'What does HTML stand for?',
      options:['High Text Markup Language','HyperText Markup Language','Home Tool Markup Language','Hyper Transfer Markup Language'], answer:'HyperText Markup Language' },
    { id:'t3', level:'inter', tag:'Problem Solving',
      question:'Which skill helps most in detecting software bugs?',
      options:['Typing speed','Pattern recognition & logical thinking','Good vocabulary','Social media skills'], answer:'Pattern recognition & logical thinking' },
    { id:'t4', level:'inter', tag:'Logic',
      question:'In a loop that runs 100 times, your code crashes at step 47. What do you do first?',
      options:['Restart everything','Check what happens specifically at step 47','Delete the loop','Ask a friend'], answer:'Check what happens specifically at step 47' },
    { id:'t5', level:'advanced', tag:'Systems',
      question:'A website loads slowly for users in Chennai but fast in Mumbai. Most likely cause?',
      options:['Chennai internet is slow','The server is physically closer to Mumbai','Bad code','Browser issue'], answer:'The server is physically closer to Mumbai' },
    { id:'t6', level:'advanced', tag:'Data',
      question:'You have 1 million user records. Which approach finds a specific user fastest?',
      options:['Check every record one by one','Use a binary search on sorted data','Ask users to identify themselves','Random guessing'], answer:'Use a binary search on sorted data' },
  ],

  // ── Business / Entrepreneurship ───────────────────────────────
  business: [
    { id:'bus1', level:'basic', tag:'Business Sense',
      question:'Most important thing when starting a small business?',
      options:['Luck','Understanding customer needs','Big office','Celebrity contacts'], answer:'Understanding customer needs' },
    { id:'bus2', level:'basic', tag:'Finance',
      question:'You invest ₹10,000 and earn ₹12,000 in a year. ROI is:',
      options:['10%','12%','20%','2%'], answer:'20%' },
    { id:'bus3', level:'inter', tag:'Strategy',
      question:'A new cafe opens near yours and halves your customers. Best response?',
      options:['Close down','Lower prices immediately','Identify your unique value and market it','Ignore them'], answer:'Identify your unique value and market it' },
    { id:'bus4', level:'inter', tag:'Management',
      question:'In a group project with conflicting ideas, best approach?',
      options:['Do it your way','List pros/cons of each and vote','Do nothing','Ask someone else to decide'], answer:'List pros/cons of each and vote' },
    { id:'bus5', level:'advanced', tag:'Startup',
      question:'"Product-market fit" means:',
      options:['Product fits in the market physically','Customers actively want and pay for your product','Product is cheaper than competitors','You have a large team'], answer:'Customers actively want and pay for your product' },
    { id:'bus6', level:'advanced', tag:'Finance',
      question:'EBITDA helps investors understand:',
      options:['Tax efficiency','Core operational profitability before finance and tax effects','Employee count','Brand value'], answer:'Core operational profitability before finance and tax effects' },
  ],

  // ── Creative / Design ─────────────────────────────────────────
  creative: [
    { id:'cr1', level:'basic', tag:'Creativity',
      question:'A poster needs to grab attention in 3 seconds. Most important element?',
      options:['Long detailed text','Strong visual contrast and clear headline','Many colors','Company logo only'], answer:'Strong visual contrast and clear headline' },
    { id:'cr2', level:'basic', tag:'Storytelling',
      question:'What makes a story memorable?',
      options:['Lots of characters','Emotional connection and conflict resolution','Long length','Formal language'], answer:'Emotional connection and conflict resolution' },
    { id:'cr3', level:'inter', tag:'Design Thinking',
      question:'UX design primarily focuses on:',
      options:['Making things look beautiful','How easy and enjoyable the product is to use','Writing code','Marketing the product'], answer:'How easy and enjoyable the product is to use' },
    { id:'cr4', level:'inter', tag:'Visual',
      question:'A film director needs to show tension building. Best technique?',
      options:['Fast cuts with loud music','Close-up shots with slow, quiet build-up','Wide landscape shots','Bright, colorful lighting'], answer:'Close-up shots with slow, quiet build-up' },
    { id:'cr5', level:'advanced', tag:'Design',
      question:'In typography, "kerning" refers to:',
      options:['Font size','Space between individual letter pairs','Font weight','Line spacing'], answer:'Space between individual letter pairs' },
    { id:'cr6', level:'advanced', tag:'Media',
      question:'A brand wants to reach 18-25 year olds in India. Most effective channel?',
      options:['Newspaper ads','TV commercials','Instagram Reels and YouTube Shorts','Radio'], answer:'Instagram Reels and YouTube Shorts' },
  ],

  // ── Science / Medical ─────────────────────────────────────────
  science: [
    { id:'sc1', level:'basic', tag:'Biology',
      question:'Which organ produces insulin?',
      options:['Liver','Kidney','Pancreas','Stomach'], answer:'Pancreas' },
    { id:'sc2', level:'basic', tag:'Physics',
      question:'A car moving at 60 km/h doubles its speed. Kinetic energy becomes:',
      options:['Double','Triple','4 times','Same'], answer:'4 times' },
    { id:'sc3', level:'inter', tag:'Problem Solving',
      question:'A patient shows symptoms A and B but not C. What is the doctor\'s next step?',
      options:['Immediately treat for the most common disease','Run targeted tests to narrow down possibilities','Wait and see','Treat all possible diseases at once'], answer:'Run targeted tests to narrow down possibilities' },
    { id:'sc4', level:'inter', tag:'Research',
      question:'What does a "controlled experiment" require?',
      options:['Multiple variables changing at once','Changing one variable while keeping others constant','Only observing, no intervention','Random guessing'], answer:'Changing one variable while keeping others constant' },
    { id:'sc5', level:'advanced', tag:'Medical',
      question:'CRISPR-Cas9 is primarily used for:',
      options:['Blood testing','Editing specific DNA sequences','Vaccine production','X-ray imaging'], answer:'Editing specific DNA sequences' },
    { id:'sc6', level:'advanced', tag:'Chemistry',
      question:'A pH of 3 is how many times more acidic than a pH of 5?',
      options:['2 times','10 times','100 times','1000 times'], answer:'100 times' },
  ],

  // ── Government / Civic ────────────────────────────────────────
  civic: [
    { id:'cv1', level:'basic', tag:'India',
      question:'Which article of the Constitution abolishes untouchability?',
      options:['Article 14','Article 15','Article 17','Article 21'], answer:'Article 17' },
    { id:'cv2', level:'basic', tag:'Economy',
      question:'GST replaced many indirect taxes. What does GST stand for?',
      options:['General Sales Tax','Goods and Services Tax','Government Supply Tax','Gross Service Tax'], answer:'Goods and Services Tax' },
    { id:'cv3', level:'inter', tag:'Governance',
      question:'A district has high infant mortality. As collector, first priority?',
      options:['Build more offices','Analyze root causes: healthcare access, nutrition, safe water','Launch an awareness campaign','Request more budget'], answer:'Analyze root causes: healthcare access, nutrition, safe water' },
    { id:'cv4', level:'inter', tag:'Polity',
      question:'Money Bills can be introduced in:',
      options:['Rajya Sabha only','Lok Sabha only','Either House','Joint session only'], answer:'Lok Sabha only' },
    { id:'cv5', level:'advanced', tag:'Economics',
      question:'If RBI raises repo rate, immediate impact on home loans is:',
      options:['Cheaper EMIs','No change','More expensive EMIs','Loans become unavailable'], answer:'More expensive EMIs' },
    { id:'cv6', level:'advanced', tag:'Analysis',
      question:'Primary deficit = Fiscal deficit minus:',
      options:['Revenue deficit','Capital expenditure','Interest payments','Tax revenue'], answer:'Interest payments' },
  ],

  // ── Situational / Leadership ──────────────────────────────────
  situational: [
    { id:'s1', level:'basic', tag:'Leadership',
      question:'You lead a group and one member isn\'t contributing. You:',
      options:['Ignore them','Do their work yourself','Have a private conversation to understand why','Report them immediately'], answer:'Have a private conversation to understand why' },
    { id:'s2', level:'basic', tag:'Problem Solving',
      question:'Your bus home is cancelled. You:',
      options:['Panic','Wait indefinitely','Check alternatives: app, auto, call someone, ask locals','Go back inside'], answer:'Check alternatives: app, auto, call someone, ask locals' },
    { id:'s3', level:'inter', tag:'Ethics',
      question:'You discover a colleague is taking credit for your work. Best approach?',
      options:['Say nothing','Confront them aggressively in a meeting','Discuss privately first, then escalate to manager if unresolved','Sabotage their next project'], answer:'Discuss privately first, then escalate to manager if unresolved' },
    { id:'s4', level:'inter', tag:'Adaptability',
      question:'Mid-project, the client completely changes requirements. You:',
      options:['Quit the project','Continue with original plan','Reassess scope, communicate impact on timeline/cost, re-plan','Blame the client'], answer:'Reassess scope, communicate impact on timeline/cost, re-plan' },
    { id:'s5', level:'advanced', tag:'Strategy',
      question:'A hospital wants to cut patient wait time. Most effective approach?',
      options:['Hire more receptionists','Analyze patient flow data and optimize scheduling','Build a bigger waiting room','Ask patients to arrive earlier'], answer:'Analyze patient flow data and optimize scheduling' },
    { id:'s6', level:'advanced', tag:'Decision Making',
      question:'You must choose between two equally skilled job candidates. One fits culture perfectly; one has a rare technical skill you need. You hire:',
      options:['Always the culture fit','Always the technical expert','Depends on what\'s harder to find/train — evaluate both factors','Flip a coin'], answer:'Depends on what\'s harder to find/train — evaluate both factors' },
  ],
}

// ────────────────────────────────────────────────────────────────
//  BUILD ADAPTIVE QUIZ BASED ON PROFILE
// ────────────────────────────────────────────────────────────────
function buildProfileQuiz(form) {
  const edu = form.education || ''
  const activities = form.activities || []
  const goal = (form.goal || '').toLowerCase()

  // Determine base difficulty
  const isAdvanced = edu.includes('PG') || edu.includes('Working') || edu.includes('Completed UG')
  const isInter = edu.includes('Pursuing UG') || edu.includes('Diploma') || edu.includes('12th')
  const level = isAdvanced ? 'advanced' : isInter ? 'inter' : 'basic'

  // Determine domain from interests
  const hasTech = activities.some(a => a.toLowerCase().includes('cod') || a.toLowerCase().includes('analyz') || a.toLowerCase().includes('research'))
  const hasBusiness = activities.some(a => a.toLowerCase().includes('business') || a.toLowerCase().includes('organiz') || a.toLowerCase().includes('managing'))
  const hasCreative = activities.some(a => a.toLowerCase().includes('draw') || a.toLowerCase().includes('writ') || a.toLowerCase().includes('perform') || a.toLowerCase().includes('design'))
  const hasScience = edu.includes('PCB') || edu.includes('MBBS') || activities.some(a => a.toLowerCase().includes('lab') || a.toLowerCase().includes('medicine'))
  const hasCivic = goal.includes('upsc') || goal.includes('government') || goal.includes('ias') || goal.includes('civil')

  // Pick 5 questions: 1 logical (always), then domain-specific
  const getQ = (pool, lvl) => {
    const same = pool.filter(q => q.level === lvl)
    const fallback = pool.filter(q => q.level === 'inter')
    const arr = same.length ? same : fallback
    return arr[Math.floor(Math.random() * arr.length)]
  }

  const selected = []
  const used = new Set()

  const pick = (pool, lvl) => {
    const candidates = pool.filter(q => !used.has(q.id) && (q.level === lvl || q.level === 'inter'))
    if (!candidates.length) return null
    const q = candidates[Math.floor(Math.random() * candidates.length)]
    used.add(q.id)
    return q
  }

  // Q1: always logical
  const lq = pick(POOL.logical, level)
  if (lq) selected.push(lq)

  // Q2-Q3: primary domain
  let primaryPool = POOL.situational
  if (hasTech) primaryPool = POOL.tech
  else if (hasBusiness) primaryPool = POOL.business
  else if (hasCreative) primaryPool = POOL.creative
  else if (hasScience) primaryPool = POOL.science
  else if (hasCivic) primaryPool = POOL.civic

  const pq1 = pick(primaryPool, level)
  if (pq1) selected.push(pq1)
  const pq2 = pick(primaryPool, level)
  if (pq2) selected.push(pq2)

  // Q4: secondary domain (rotate)
  const secondaryPools = [POOL.business, POOL.situational, POOL.logical].filter(p => p !== primaryPool)
  const sq = pick(secondaryPools[0], level)
  if (sq) selected.push(sq)

  // Q5: situational (always good for career)
  const sitq = pick(POOL.situational, level)
  if (sitq) selected.push(sitq)

  // Ensure we always have 5 questions
  while (selected.length < 5) {
    const allQ = [...POOL.logical, ...POOL.situational, ...POOL.business]
    const extra = allQ.find(q => !used.has(q.id))
    if (extra) { used.add(extra.id); selected.push(extra) }
    else break
  }

  return selected.slice(0, 5)
}

// ────────────────────────────────────────────────────────────────
//  STATIC DATA
// ────────────────────────────────────────────────────────────────
const ACTIVITIES_LIST = [
  'Solving math problems', 'Drawing or designing', 'Helping classmates/friends', 'Coding or fixing gadgets',
  'Writing stories or poems', 'Organizing events', 'Performing on stage', 'Starting mini businesses',
  'Researching topics online', 'Working outdoors/with hands', 'Teaching others', 'Analyzing data or patterns',
]
const PREFERENCE_LIST = [
  'Stable, predictable job', 'High-risk high-reward', 'Government / Sarkari Naukri', 'Creative freedom',
  'Working alone', 'Working with many people', 'Remote work / freelancing', 'Travel frequently',
]
const CAREER_AWARENESS_LIST = [
  'Engineering (CSE/ECE/Mech)', 'Medicine / MBBS', 'CA / CMA / Finance', 'Data Science / AI',
  'UX/UI Design', 'Animation & Film', 'Law (LLB)', 'UPSC / IAS',
  'SSC / Banking Exams', 'MBA / Management', 'Psychology / Counselling', 'Agriculture Tech',
  'Defense (NDA/CDS/AFCAT)', 'Skilled Trades (Electrician/Plumber/CNC)', 'Hotel Management',
  'Teaching / Education Tech', 'Social Work / NGO', 'Journalism / Media', 'Entrepreneurship',
  'Renewable Energy / Sustainability', 'Drone Tech / Aviation', 'Healthcare (Nursing/Physio/Pharmacy)',
  'Architecture / Interior Design',
]
const STEPS = ['Basic', 'Interests', 'Skill Quiz', 'Constraints', 'Awareness']

function getDomainLabel(activities) {
  if (!activities?.length) return null
  const a = activities.join(' ').toLowerCase()
  if (a.includes('cod') || a.includes('analyz') || a.includes('research')) return { label: 'Tech & Analytical', color: 'text-indigo-300' }
  if (a.includes('business') || a.includes('organiz')) return { label: 'Business & Management', color: 'text-amber-300' }
  if (a.includes('draw') || a.includes('writ') || a.includes('perform')) return { label: 'Creative & Communication', color: 'text-pink-300' }
  return { label: 'Leadership & People', color: 'text-emerald-300' }
}

// ────────────────────────────────────────────────────────────────
//  COMPONENT
// ────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const { runAnalysis, isAnalyzing, agentThoughts, agentStatus, setPage, user } = useApp()
  const topRef = useRef(null)

  const [step, setStep] = useState(0)
  const [quiz, setQuiz] = useState(null) // null = not yet built
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState([])
  const [quizScoreCalc, setQuizScoreCalc] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const [form, setForm] = useState({
    name: '', age: '', education: '', stream: '', location: '', language: 'English',
    activities: [], preferences: [],
    quizScore: 0, quizLevel: 'basic',
    financialCondition: '', needJobIn: '', canRelocate: false, studyAbroad: false, canAffordHigherEd: '',
    careerAwareness: [], goal: '',
  })

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const toggleArr = (key, val) => setForm(p => {
    const arr = p[key]
    return { ...p, [key]: arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val] }
  })

  const scrollTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goNext = () => {
    // Build quiz when arriving at step 2
    if (step === 1) {
      setQuiz(buildProfileQuiz(form))
      setQuizIdx(0)
      setQuizAnswers([])
      setQuizScoreCalc(0)
      setSelectedOption(null)
      setShowResult(false)
    }
    setStep(s => s + 1)
    scrollTop()
  }

  const goBack = () => {
    if (step > 0) { setStep(s => s - 1); scrollTop() }
    else setPage(user ? 'user-dashboard' : 'landing')
  }

  // ── Quiz: tap option (show visual feedback first, then advance) ──
  const handleOptionTap = (opt) => {
    if (selectedOption !== null) return // already answered
    setSelectedOption(opt)
    setShowResult(true)

    const correct = (quiz[quizIdx].answer === opt) ? 1 : 0
    const newScore = quizScoreCalc + correct
    const newAnswers = [...quizAnswers, { qid: quiz[quizIdx].id, selected: opt, correct: !!correct }]

    setTimeout(() => {
      setQuizAnswers(newAnswers)
      setQuizScoreCalc(newScore)
      setSelectedOption(null)
      setShowResult(false)

      if (quizIdx + 1 < quiz.length) {
        setQuizIdx(quizIdx + 1)
        scrollTop()
      } else {
        const pct = (newScore / quiz.length) * 10
        const level = pct >= 7 ? 'advanced' : pct >= 4 ? 'intermediate' : 'basic'
        update('quizScore', Math.round(pct))
        update('quizLevel', level)
        setStep(3)
        scrollTop()
      }
    }, 900)
  }

  const canNext = () => {
    if (step === 0) return form.education && form.location
    if (step === 1) return form.activities.length >= 2 && form.preferences.length >= 1
    if (step === 2) return quiz && quizAnswers.length === quiz.length
    if (step === 3) return form.financialCondition && form.needJobIn
    if (step === 4) return form.careerAwareness.length >= 1
    return true
  }

  const handleSubmit = () => {
    scrollTop()
    runAnalysis(form)
  }

  if (isAnalyzing || agentStatus === 'analyzing') {
    return (
      <div className="min-h-screen bg-[#08080D] flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <AgentThinkingPanel thoughts={agentThoughts} isLoading={isAnalyzing} />
        </div>
      </div>
    )
  }

  const domainLabel = step >= 2 ? getDomainLabel(form.activities) : null
  const currentQuiz = quiz ? quiz[quizIdx] : null

  return (
    <div ref={topRef} className="min-h-screen bg-[#08080D] text-[#EDEAE4] flex flex-col">

      {/* ── Top bar ── */}
      <div className="px-5 sm:px-8 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-[#7E7C8E] hover:text-[#EDEAE4] transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Compass size={11} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xs font-medium text-[#7E7C8E]">
            Step <span className="text-[#EDEAE4]">{step + 1}</span> / {STEPS.length}
          </span>
        </div>
        <div className="w-14" />
      </div>

      {/* ── Progress bar ── */}
      <div className="h-[2px] bg-[#0E0E18]">
        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      {/* ── Step pills ── */}
      <div className="flex justify-center gap-2 py-4 px-5 overflow-x-auto scrollbar-hide">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
            i < step ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
            : i === step ? 'bg-indigo-400/10 text-indigo-300 border border-indigo-400/25'
            : 'bg-[#0E0E18] text-[#45434F] border border-white/[0.05]'
          }`}>
            {i < step && <Check size={9} strokeWidth={3} />}{s}
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-xl mx-auto">

          {/* STEP 0: Background */}
          {step === 0 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold tracking-tight mb-1">Tell us about yourself</h2>
              <p className="text-[#7E7C8E] text-sm mb-7">Basic background to calibrate your career GPS</p>
              <div className="space-y-4">
                <div>
                  <label className="field-label">Your Name</label>
                  <input className="input-field" placeholder="e.g. Priya Sharma" value={form.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Age Group *</label>
                    <select className="input-field" value={form.age} onChange={e => update('age', e.target.value)}>
                      <option value="">Select</option>
                      {['Under 15','15–17','18–21','22–25','26–30','30+'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Language</label>
                    <select className="input-field" value={form.language} onChange={e => update('language', e.target.value)}>
                      {['English','Hindi','Telugu','Tamil','Kannada','Marathi','Bengali','Gujarati'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="field-label">Current Education Level *</label>
                  <select className="input-field" value={form.education} onChange={e => update('education', e.target.value)}>
                    <option value="">Select education</option>
                    {['10th Grade','12th Grade (PCM)','12th Grade (PCB)','12th Grade (Commerce)','12th Grade (Arts)','Diploma','Pursuing UG','Completed UG','Pursuing PG','Completed PG','Working Professional'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">City / State *  <span className="text-[#45434F]">(for local opportunities)</span></label>
                  <input className="input-field" placeholder="e.g. Hyderabad, Telangana" value={form.location} onChange={e => update('location', e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Career Goal <span className="text-[#45434F]">(optional)</span></label>
                  <input className="input-field" placeholder="e.g. Stable govt job, start a startup..." value={form.goal} onChange={e => update('goal', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Interests */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold tracking-tight mb-1">What drives you?</h2>
              <p className="text-[#7E7C8E] text-sm mb-7">Select at least 2 activities you genuinely enjoy</p>
              <p className="text-[11px] text-[#45434F] font-semibold tracking-widest uppercase mb-3">
                Activities I enjoy <span className="text-amber-400/60">(pick 2+)</span>
              </p>
              <div className="flex flex-wrap gap-2 mb-7">
                {ACTIVITIES_LIST.map(act => (
                  <button key={act} onClick={() => toggleArr('activities', act)}
                    className={`chip ${form.activities.includes(act) ? 'chip-active' : ''}`}>
                    {form.activities.includes(act) && <Check size={10} strokeWidth={3} />}{act}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#45434F] font-semibold tracking-widest uppercase mb-3">
                Work style preferences <span className="text-indigo-400/60">(pick 1+)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {PREFERENCE_LIST.map(pref => (
                  <button key={pref} onClick={() => toggleArr('preferences', pref)}
                    className={`chip ${form.preferences.includes(pref) ? 'chip-active-cool' : ''}`}>
                    {form.preferences.includes(pref) && <Check size={10} strokeWidth={3} />}{pref}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Quiz */}
          {step === 2 && (
            <div className="animate-fade-up">
              <div className="flex items-center gap-2.5 mb-1">
                <Brain size={18} className="text-indigo-400" />
                <h2 className="text-2xl font-bold tracking-tight">Aptitude Check</h2>
              </div>
              {domainLabel && (
                <div className="flex items-center gap-2 mb-2">
                  <Target size={12} className="text-[#45434F]" />
                  <span className="text-xs text-[#45434F]">Calibrated for your profile: <span className={`font-semibold ${domainLabel.color}`}>{domainLabel.label}</span></span>
                </div>
              )}
              <p className="text-[#7E7C8E] text-sm mb-6">5 questions tailored to your education and interests</p>

              {quiz && quizAnswers.length < quiz.length && currentQuiz ? (
                <div>
                  {/* Progress dots */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-1.5">
                      <Zap size={12} className="text-amber-400" />
                      <span className="text-xs text-[#45434F]">Q{quizIdx + 1} of {quiz.length}</span>
                      <span className="text-[10px] text-[#45434F] bg-white/[0.04] px-2 py-0.5 rounded-full ml-1">{currentQuiz.tag}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {quiz.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all ${
                          i < quizAnswers.length ? 'w-5 bg-amber-400'
                          : i === quizIdx ? 'w-5 bg-indigo-400 animate-pulse'
                          : 'w-3 bg-white/10'
                        }`} />
                      ))}
                    </div>
                  </div>

                  {/* Question card */}
                  <div className="card mb-5 border-indigo-400/15">
                    <p className="text-[#EDEAE4] font-medium leading-relaxed">{currentQuiz.question}</p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentQuiz.options.map(opt => {
                      const isSelected = selectedOption === opt
                      const isCorrect = currentQuiz.answer === opt
                      let cls = 'w-full text-left px-5 py-3.5 min-h-[52px] rounded-xl border transition-all text-sm '
                      if (!showResult) {
                        cls += 'border-white/[0.07] bg-[#0E0E18] text-[#7E7C8E] hover:border-amber-400/25 hover:bg-amber-400/5 hover:text-[#EDEAE4]'
                      } else if (isCorrect) {
                        cls += 'border-emerald-400/40 bg-emerald-400/[0.08] text-emerald-300'
                      } else if (isSelected) {
                        cls += 'border-rose-400/40 bg-rose-400/[0.08] text-rose-300'
                      } else {
                        cls += 'border-white/[0.04] bg-[#0E0E18]/50 text-[#45434F]'
                      }
                      return (
                        <button key={opt} onClick={() => handleOptionTap(opt)} disabled={showResult} className={cls}>
                          <span className="flex items-center gap-2">
                            {showResult && isCorrect && <Check size={14} className="text-emerald-400 shrink-0" strokeWidth={3} />}
                            {opt}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : quiz && quizAnswers.length === quiz.length ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4">
                    <Check size={28} className="text-amber-400" strokeWidth={2.5} />
                  </div>
                  <p className="text-lg font-bold">Quiz Complete!</p>
                  <p className="text-[#7E7C8E] mt-2 text-sm">
                    Score: <span className="text-amber-300 font-semibold">{quizScoreCalc}/{quiz.length}</span>
                    {' · '}Level: <span className="text-indigo-300 font-semibold capitalize">{form.quizLevel}</span>
                  </p>
                  <div className="mt-5 flex justify-center gap-2">
                    {quiz.map((q, i) => (
                      <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        quizAnswers[i]?.correct ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-rose-400/10 text-rose-400 border border-rose-400/20'
                      }`}>{i+1}</div>
                    ))}
                  </div>
                  <p className="text-xs text-[#45434F] mt-4">Click Continue to proceed</p>
                </div>
              ) : (
                <div className="text-center py-10 text-[#45434F]">Loading questions...</div>
              )}
            </div>
          )}

          {/* STEP 3: Constraints */}
          {step === 3 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold tracking-tight mb-1">Your real-life constraints</h2>
              <p className="text-[#7E7C8E] text-sm mb-7">We won't suggest paths you can't realistically take</p>
              <div className="space-y-4">
                <div>
                  <label className="field-label">Financial Situation *</label>
                  <select className="input-field" value={form.financialCondition} onChange={e => update('financialCondition', e.target.value)}>
                    <option value="">Select</option>
                    {['Need scholarship to continue','Can self-fund short courses only','Family can support 1–2 year course','Family can support 4-year degree','Budget is not a limitation'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">When do you need income? *</label>
                  <select className="input-field" value={form.needJobIn} onChange={e => update('needJobIn', e.target.value)}>
                    <option value="">Select</option>
                    {['ASAP — within 6 months','Within 1 year','1–2 years','2–4 years','Flexible, no rush'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Higher Education Budget</label>
                  <select className="input-field" value={form.canAffordHigherEd} onChange={e => update('canAffordHigherEd', e.target.value)}>
                    <option value="">Select</option>
                    {['No — need free options only','Under ₹50,000 (certification courses)','Up to ₹2 lakh','Up to ₹5 lakh','Up to ₹15 lakh','No budget limit'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="field-label">Can you relocate?</p>
                    <div className="flex gap-2">
                      {[true,false].map(v => (
                        <button key={String(v)} onClick={() => update('canRelocate', v)}
                          className={`flex-1 py-2.5 rounded-xl text-sm border transition-colors ${
                            form.canRelocate === v ? 'border-amber-400/40 bg-amber-400/[0.08] text-amber-300'
                            : 'border-white/[0.07] text-[#7E7C8E] bg-[#0E0E18] hover:border-white/15'}`}>
                          {v ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="field-label">Study abroad?</p>
                    <div className="flex gap-2">
                      {[true,false].map(v => (
                        <button key={String(v)} onClick={() => update('studyAbroad', v)}
                          className={`flex-1 py-2.5 rounded-xl text-sm border transition-colors ${
                            form.studyAbroad === v ? 'border-indigo-400/40 bg-indigo-400/[0.08] text-indigo-300'
                            : 'border-white/[0.07] text-[#7E7C8E] bg-[#0E0E18] hover:border-white/15'}`}>
                          {v ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Career Awareness */}
          {step === 4 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold tracking-tight mb-1">What careers do you know?</h2>
              <p className="text-[#7E7C8E] text-sm mb-7">Tick ones you've considered — we'll surface paths you haven't thought of</p>
              <div className="flex flex-wrap gap-2">
                {CAREER_AWARENESS_LIST.map(c => (
                  <button key={c} onClick={() => toggleArr('careerAwareness', c)}
                    className={`chip ${form.careerAwareness.includes(c) ? 'chip-active-cool' : ''}`}>
                    {form.careerAwareness.includes(c) && <Check size={10} strokeWidth={3} />}{c}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Footer Nav ── */}
      <div className="px-5 sm:px-8 py-4 border-t border-white/[0.06] bg-[#08080D]">
        <div className="max-w-xl mx-auto">
          {step === 4 ? (
            <button onClick={handleSubmit} disabled={!canNext()} className="btn-primary w-full py-3.5 text-[15px]">
              Launch My Career Analysis <ChevronRight size={18} />
            </button>
          ) : step === 2 && quiz && quizAnswers.length < quiz.length ? (
            <p className="text-center text-sm text-[#45434F]">Answer all {quiz?.length || 5} questions to continue</p>
          ) : (
            <button onClick={goNext} disabled={!canNext()} className="btn-primary w-full py-3.5 text-[15px]">
              Continue <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}