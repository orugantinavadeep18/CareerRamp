import { useEffect, useRef } from 'react'
import { Bot, CheckCircle2, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function AgentThinkingPanel({ className = '' }) {
  const { agentThoughts, agentStatus } = useApp()
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [agentThoughts])

  const statusIcon = {
    idle: null,
    thinking: <Loader2 size={14} className="animate-spin text-amber-400" />,
    done: <CheckCircle2 size={14} className="text-indigo-400" />,
    error: <AlertCircle size={14} className="text-rose-400" />,
  }

  const statusLabel = {
    idle: '',
    thinking: 'Analyzing your profile…',
    done: 'Analysis complete',
    error: 'Something went wrong',
  }

  if (agentStatus === 'idle' || agentThoughts.length === 0) return null

  return (
    <div className={`card border-white/[0.07] p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-amber-400/[0.08] border border-amber-400/20 flex items-center justify-center">
          <Sparkles size={14} className="text-amber-400" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#EDEAE4] tracking-tight">Gemini is analyzing</div>
          <div className="flex items-center gap-1.5 text-xs text-[#45434F] mt-0.5">
            {statusIcon[agentStatus]}
            <span>{statusLabel[agentStatus]}</span>
          </div>
        </div>
      </div>

      {/* Thought steps */}
      <div ref={containerRef} className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {agentThoughts.map((thought, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 animate-slide-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
              i === agentThoughts.length - 1 && agentStatus === 'thinking'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-indigo-400/60'
            }`} />
            <span className="text-xs text-[#7E7C8E] leading-relaxed">{thought}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {agentStatus === 'thinking' && (
        <div className="mt-4 h-0.5 bg-[#1a1a26] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full animate-shimmer"
               style={{ width: `${Math.min(100, (agentThoughts.length / 6) * 100)}%`, transition: 'width 0.5s ease' }} />
        </div>
      )}

      {agentStatus === 'done' && (
        <div className="mt-4 h-[1px] bg-gradient-to-r from-amber-400/40 via-indigo-400/40 to-transparent rounded-full" />
      )}
    </div>
  )
}
