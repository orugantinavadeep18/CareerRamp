import { useEffect, useRef } from 'react'

export default function SkillBars({ skillBars = [] }) {
  const barsRef = useRef([])

  useEffect(() => {
    const timeout = setTimeout(() => {
      barsRef.current.forEach(bar => {
        if (bar) bar.style.width = bar.dataset.width
      })
    }, 300)
    return () => clearTimeout(timeout)
  }, [skillBars])

  if (!skillBars.length) return null

  return (
    <div className="card p-6">
      <div className="section-label">Proficiency</div>
      <div className="font-display font-bold text-lg text-white mb-5">Skill Levels</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {skillBars.map((skill, i) => {
          const gap = (skill.required || 80) - (skill.current || 0)
          return (
            <div key={i} className="space-y-2 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-white">{skill.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-display font-bold">{skill.current}%</span>
                  {gap > 0 && (
                    <span className="text-[#8888aa]">↑ {gap}% needed</span>
                  )}
                </div>
              </div>

              {/* Track */}
              <div className="relative h-2 bg-[#1a1a26] rounded-full overflow-hidden">
                {/* Required marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-400/60 z-10"
                  style={{ left: `${skill.required || 80}%` }}
                />
                {/* Current */}
                <div
                  ref={el => barsRef.current[i] = el}
                  data-width={`${skill.current}%`}
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: '0%',
                    background: skill.current >= (skill.required || 80)
                      ? 'linear-gradient(90deg, #14b8a6, #14b8a6)'
                      : 'linear-gradient(90deg, #f59e0b, #f43f5e)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-5 text-[10px] text-[#8888aa]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1 bg-gradient-to-r from-amber-400 to-rose-400 rounded" />
          <span>Current level</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-0.5 h-3 bg-rose-400/60" />
          <span>Required for role</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1 bg-indigo-400 rounded" />
          <span>Met requirement</span>
        </div>
      </div>
    </div>
  )
}
