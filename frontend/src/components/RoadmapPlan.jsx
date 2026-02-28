// Month-by-month roadmap cards (replaces old step-based RoadmapTimeline for CareerRamp)
import { CheckCircle, Circle, BookOpen, Target } from 'lucide-react'
import { useState } from 'react'

export default function RoadmapPlan({ roadmap = [] }) {
  const [expanded, setExpanded] = useState(0)

  if (!roadmap.length) return null

  return (
    <div>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[1.65rem] top-8 bottom-0 w-px bg-gradient-to-b from-amber-400/30 to-transparent hidden md:block" />

        <div className="space-y-3">
          {roadmap.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              {/* Month indicator */}
              <div className="shrink-0 flex flex-col items-center">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold transition-colors
                  ${idx === expanded ? 'bg-amber-400 border-amber-400 text-gray-950' : 'bg-[#0E0E18] border-white/[0.08] text-[#45434F]'}`}>
                  {idx + 1}
                </div>
              </div>

              {/* Card */}
              <div
                className={`flex-1 card cursor-pointer transition-all ${idx === expanded ? 'border-amber-400/20' : 'hover:border-white/[0.11]'}`}
                onClick={() => setExpanded(idx === expanded ? -1 : idx)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-400/80 font-semibold">{item.month}</p>
                    <h4 className="font-semibold text-[#EDEAE4] mt-0.5">{item.focus}</h4>
                  </div>
                  <div className={`text-[#45434F] transition-transform text-xs ${idx === expanded ? 'rotate-180' : ''}`}>▼</div>
                </div>

                {idx === expanded && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] animate-fade-up space-y-3">
                    {/* Tasks */}
                    <div>
                      <p className="text-[10px] text-[#45434F] font-semibold tracking-widest uppercase mb-2">Tasks</p>
                      <ul className="space-y-1.5">
                        {(item.tasks || []).map((task, ti) => (
                            <li key={ti} className="flex items-start gap-2 text-sm text-[#EDEAE4]">
                            <Circle size={13} className="text-[#45434F] mt-0.5 shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Milestone */}
                    {item.milestone && (
                      <div className="flex items-start gap-2.5 bg-amber-400/[0.05] border border-amber-400/15 rounded-xl p-3">
                        <Target size={14} className="text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-amber-400/80 font-semibold tracking-widest uppercase mb-0.5">Milestone</p>
                          <p className="text-sm text-[#EDEAE4]">{item.milestone}</p>
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {item.resources?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-[#45434F] font-semibold tracking-widest uppercase mb-1.5 flex items-center gap-1">
                          <BookOpen size={11} /> Resources
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.resources.map((r, ri) => (
                            <span key={ri} className="text-xs bg-[#0E0E18] text-indigo-300 px-2.5 py-0.5 rounded-lg border border-white/[0.07]">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
