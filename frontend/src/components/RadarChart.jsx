import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a26] border border-white/[0.07] rounded-xl px-3 py-2 text-xs">
      <div className="text-white font-semibold mb-1">{payload[0]?.payload?.subject}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value}%</div>
      ))}
    </div>
  )
}

export default function SkillRadarChart({ radarData }) {
  if (!radarData) return null

  const chartData = radarData.labels.map((label, i) => ({
    subject: label,
    you: radarData.current[i] || 0,
    target: radarData.target[i] || 0,
  }))

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="section-label">Skill Gap</div>
          <div className="font-display font-bold text-lg text-white">Radar Analysis</div>
        </div>
        <div className="flex flex-col gap-1.5 text-xs text-[#8888aa]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-amber-400 rounded" />
            <span>You now</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-rose-400 rounded border-dashed" />
            <span>Target</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadar data={chartData} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#8888aa', fontSize: 11, fontFamily: 'DM Sans' }}
          />
          <Radar
            name="You"
            dataKey="you"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 3 }}
          />
          <Radar
            name="Target"
            dataKey="target"
            stroke="#f43f5e"
            fill="#f43f5e"
            fillOpacity={0.06}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ fill: '#f43f5e', r: 3 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  )
}
