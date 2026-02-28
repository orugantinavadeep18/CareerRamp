import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, PlayCircle, BookOpen, ChevronDown, ChevronUp, Zap, AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'

const STATUS_CONFIG = {
  pending:  { label: 'Pending',     icon: Clock,         class: 'status-pending',  dot: 'bg-[#8888aa]' },
  progress: { label: 'In Progress', icon: PlayCircle,    class: 'status-progress', dot: 'bg-amber-400 animate-pulse' },
  done:     { label: 'Completed',   icon: CheckCircle2,  class: 'status-done',     dot: 'bg-indigo-400' },
  failed:   { label: 'Needs Review',icon: AlertTriangle, class: 'status-failed',   dot: 'bg-rose-400' },
}

const PRIORITY_CONFIG = {
  critical: { label: 'Critical',  class: 'badge-rose' },
  high:     { label: 'High',      class: 'badge-amber' },
  medium:   { label: 'Medium',    class: 'bg-purple-500/10 border border-purple-500/20 text-purple-400' },
  bonus:    { label: 'Bonus',     class: 'badge-teal' },
}

function StepCard({ step, index, onQuizRequest }) {
  const { updateStepStatus, quizScores } = useApp()
  const [expanded, setExpanded] = useState(false)

  const cfg = STATUS_CONFIG[step.status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  const priorityCfg = PRIORITY_CONFIG[step.priority] || PRIORITY_CONFIG.medium
  const quizScore = quizScores[step.id]

  return (
    <div
      className={`card p-5 cursor-pointer border transition-all duration-200 ${
        step.status === 'done' ? 'opacity-60 border-indigo-400/20' :
        step.status === 'failed' ? 'border-rose-500/20' :
        step.status === 'progress' ? 'border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : ''
      } ${expanded ? 'ring-1 ring-white/10' : ''}`}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start gap-4">
        {/* Week badge */}
        <div className="min-w-[54px] text-center bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5 flex-shrink-0">
          <div className="font-display font-bold text-amber-400 text-[10px] leading-tight tracking-wide">
            {step.week}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`font-display font-bold text-sm ${step.status === 'done' ? 'line-through text-[#8888aa]' : 'text-white'}`}>
              {step.title}
            </span>
            {step.isNew && <span className="badge-teal badge text-[9px]">NEW</span>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className={`badge text-[10px] ${cfg.class} flex items-center gap-1`}>
              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </div>
            <div className={`badge text-[10px] ${priorityCfg.class}`}>{priorityCfg.label}</div>
            {step.estimatedHours && (
              <span className="text-[10px] text-[#8888aa]">~{step.estimatedHours}h</span>
            )}
            {quizScore !== undefined && (
              <span className={`badge text-[10px] ${quizScore >= 75 ? 'badge-teal' : 'badge-rose'}`}>
                Quiz: {quizScore}%
              </span>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <div className="text-[#8888aa] flex-shrink-0 mt-0.5">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] animate-fade-up" onClick={e => e.stopPropagation()}>
          <p className="text-sm text-[#8888aa] leading-relaxed mb-4">{step.description}</p>

          {/* Tags */}
          {step.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {step.tags.map((t, i) => (
                <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-[#1a1a26] border border-white/[0.06] text-[#8888aa]">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Resources */}
          {step.resources?.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#8888aa] mb-2">
                <BookOpen size={12} /> Resources
              </div>
              <ul className="space-y-1">
                {step.resources.map((r, i) => (
                  <li key={i} className="text-xs text-amber-400/80 flex items-center gap-1.5">
                    <span className="text-[#8888aa]">→</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {step.status === 'pending' && (
              <button
                onClick={() => updateStepStatus(step.id, 'progress')}
                className="btn-ghost text-xs py-2 px-4"
              >
                <PlayCircle size={12} className="mr-1.5" /> Start
              </button>
            )}
            {step.status === 'progress' && (
              <>
                {step.verificationQuiz ? (
                  <button
                    onClick={() => onQuizRequest(step.id)}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    <Zap size={12} className="mr-1.5" /> Take Verification Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => updateStepStatus(step.id, 'done')}
                    className="btn-teal text-xs py-2 px-4"
                  >
                    <CheckCircle2 size={12} className="mr-1.5" /> Mark Complete
                  </button>
                )}
              </>
            )}
            {(step.status === 'done' || step.status === 'failed') && (
              <button
                onClick={() => updateStepStatus(step.id, 'pending')}
                className="text-xs text-[#8888aa] hover:text-white transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function RoadmapTimeline({ onQuizRequest }) {
  const { roadmap, completedCount, totalSteps } = useApp()

  if (!roadmap.length) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="section-label">Learning Path</div>
          <div className="font-display font-bold text-2xl text-white tracking-tight">
            Your AI Roadmap
          </div>
        </div>
        <div className="text-right">
          <div className="font-display font-bold text-2xl text-amber-400">{completedCount}/{totalSteps}</div>
          <div className="text-xs text-[#8888aa]">Steps done</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#1a1a26] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-indigo-400 rounded-full transition-all duration-700"
          style={{ width: `${totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {roadmap.map((step, i) => (
          <StepCard key={step.id || i} step={step} index={i} onQuizRequest={onQuizRequest} />
        ))}
      </div>
    </div>
  )
}
