// Side-by-side career comparison for 2 selected careers
import { useApp } from '../context/AppContext'
import { X } from 'lucide-react'

const ROWS = [
  { key: 'studyDuration', label: 'Study Duration' },
  { key: 'cost', label: 'Upfront Cost' },
  { key: 'roi', label: 'Return on Investment' },
  { key: 'competition', label: 'Competition Level' },
  { key: 'jobAvailability', label: 'Job Availability' },
  { key: 'workLifeBalance', label: 'Work-Life Balance' },
]

const BADGE_COLORS = {
  High: 'text-amber-400', Surging: 'text-amber-400', Good: 'text-amber-400',
  Medium: 'text-yellow-400', Average: 'text-yellow-400', Moderate: 'text-yellow-400',
  Low: 'text-red-400', Poor: 'text-red-400',
  'Very High': 'text-rose-400',
}

function Cell({ val }) {
  if (!val) return <span className="text-gray-500">—</span>
  const cls = BADGE_COLORS[val] || 'text-[#7E7C8E]'
  return <span className={`font-medium ${cls}`}>{val}</span>
}

export default function CareerComparison() {
  const { comparisonCareers, toggleComparison, careerData } = useApp()
  if (comparisonCareers.length < 2 || !careerData) return null

  const tableData = careerData.careerComparison || []
  const cols = comparisonCareers.map(name => tableData.find(r => r.career === name) || { career: name })

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white text-lg">Side-by-Side Comparison</h3>
        <button
          onClick={() => { toggleComparison(comparisonCareers[0]); toggleComparison(comparisonCareers[1]) }}
          className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
        >
          <X size={12} /> Clear
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-gray-500 font-medium py-2 pr-6 text-xs w-36">Metric</th>
              {cols.map(c => (
                <th key={c.career} className="text-left py-2 pr-4 text-white font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    {c.career}
                    <button onClick={() => toggleComparison(c.career)} className="text-gray-600 hover:text-gray-400">
                      <X size={12} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => (
              <tr key={row.key} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 pr-6 text-gray-400 text-xs">{row.label}</td>
                {cols.map(c => (
                  <td key={c.career} className="py-2.5 pr-4">
                    <Cell val={c[row.key]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
