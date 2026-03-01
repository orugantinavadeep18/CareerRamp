import { TrendingUp, AlertTriangle, DollarSign, Clock, PlusCircle, MinusCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

const DOMAIN_COLORS = {
  'Tech Careers':   'bg-indigo-400/10 text-indigo-300 border-indigo-400/20',
  'Government':     'bg-amber-400/10 text-amber-300 border-amber-400/20',
  'Creative':       'bg-rose-400/10 text-rose-300 border-rose-400/20',
  'Business':       'bg-orange-400/10 text-orange-300 border-orange-400/20',
  'Skilled Trades': 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  'Academic':       'bg-violet-400/10 text-violet-300 border-violet-400/20',
  'Emerging':       'bg-sky-400/10 text-sky-300 border-sky-400/20',
}

const GROWTH_COLORS = { High: 'text-amber-400', Surging: 'text-amber-400', Medium: 'text-indigo-300', Low: 'text-rose-400', Stable: 'text-[#7E7C8E]' }
const RISK_COLORS   = { Low: 'text-amber-300', Medium: 'text-indigo-300', High: 'text-rose-400' }

function MatchArc({ score }) {
  const radius = 36, circumference = 2 * Math.PI * radius
  const filled = (score / 100) * circumference
  const color = score >= 80 ? '#FBBF24' : score >= 60 ? '#818CF8' : '#F97316'
  return (
    <svg width={96} height={96}>
      <circle cx={48} cy={48} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={7} />
      <circle cx={48} cy={48} r={radius} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${filled} ${circumference}`} strokeDashoffset={circumference * 0.25}
        strokeLinecap="round" className="transition-all duration-1000" />
      <text x={48} y={48} textAnchor="middle" dy="0.35em" fill={color} fontSize={17} fontWeight="700">{score}%</text>
    </svg>
  )
}

export default function CareerMatchCard({ career, rank }) {
  const { comparisonCareers, toggleComparison } = useApp()
  const inComparison = comparisonCareers.includes(career.career)
  const badgeClass = DOMAIN_COLORS[career.domain] || 'bg-gray-700 text-gray-300 border-gray-600'

  return (
    <div className={`card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] ${
      rank === 0 ? 'border-amber-400/25 shadow-[0_4px_20px_rgba(251,191,36,0.06)]' : 'hover:border-white/[0.11]'
    }`}>
      {rank === 0 && (
        <div className="mb-3 inline-flex items-center gap-1.5 bg-amber-400/10 text-amber-300 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-amber-400/25">
          ✦ Best Match
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[17px] text-[#EDEAE4] truncate tracking-tight">{career.career}</h3>
          <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border mt-1.5 ${badgeClass}`}>
            {career.domain}
          </span>
          <p className="text-[#7E7C8E] text-sm mt-2.5 leading-relaxed line-clamp-2">{career.whyFit}</p>
        </div>
        {/* Score Arc */}
        <div className="shrink-0 scale-75 sm:scale-100 origin-top-right -mt-1 -mr-1 sm:mt-0 sm:mr-0">
          <MatchArc score={career.matchScore} />
          <p className="text-center text-[10px] text-[#45434F] mt-0.5">match</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3.5 border-t border-white/[0.06] text-xs">
        <div>
          <p className="text-[#45434F] mb-0.5 flex items-center gap-1"><DollarSign size={10} /> Entry Salary</p>
          <p className="font-semibold text-[#EDEAE4]">{career.avgEntrySalary}</p>
        </div>
        <div>
          <p className="text-[#45434F] mb-0.5 flex items-center gap-1"><DollarSign size={10} /> Mid Salary</p>
          <p className="font-semibold text-[#EDEAE4]">{career.avgMidSalary}</p>
        </div>
        <div>
          <p className="text-[#45434F] mb-0.5 flex items-center gap-1"><TrendingUp size={10} /> Growth</p>
          <p className={`font-semibold ${GROWTH_COLORS[career.growthRate] || 'text-[#EDEAE4]'}`}>{career.growthRate}</p>
        </div>
        <div>
          <p className="text-[#45434F] mb-0.5 flex items-center gap-1"><AlertTriangle size={10} /> Risk</p>
          <p className={`font-semibold ${RISK_COLORS[career.risk] || 'text-[#EDEAE4]'}`}>{career.risk}</p>
        </div>
        <div>
          <p className="text-[#45434F] mb-0.5 flex items-center gap-1"><Clock size={10} /> Duration</p>
          <p className="font-semibold text-[#EDEAE4]">{career.studyDuration}</p>
        </div>
        <div>
          <p className="text-[#45434F] mb-0.5">5-Yr Demand</p>
          <p className={`font-semibold ${GROWTH_COLORS[career.demandIn5Years] || 'text-[#EDEAE4]'}`}>{career.demandIn5Years}</p>
        </div>
      </div>

      {/* Local opportunities */}
      {career.localOpportunities?.length > 0 && (
        <div className="mt-3.5 pt-3.5 border-t border-white/[0.06]">
          <p className="text-[10px] text-[#45434F] font-semibold tracking-widest uppercase mb-2">Local Opportunities</p>
          <div className="flex flex-wrap gap-1.5">
            {career.localOpportunities.slice(0, 3).map((op, i) => (
              <span key={i} className="text-[11px] bg-[#0E0E18] text-[#7E7C8E] px-2.5 py-0.5 rounded-full border border-white/[0.07]">{op}</span>
            ))}
          </div>
        </div>
      )}

      {/* Compare toggle */}
      <button
        onClick={() => toggleComparison(career.career)}
        className={`mt-3 w-full flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg border transition-colors ${
          inComparison
            ? 'border-violet-500/40 text-violet-400 bg-violet-500/10 hover:bg-violet-500/20'
            : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
        }`}
      >
        {inComparison ? <MinusCircle size={12} /> : <PlusCircle size={12} />}
        {inComparison ? 'Remove from compare' : 'Add to compare'}
      </button>
    </div>
  )
}
