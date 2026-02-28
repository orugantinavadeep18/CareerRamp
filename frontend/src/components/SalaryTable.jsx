// Salary & career comparison table for CareerRamp dashboard
export default function SalaryTable({ data = [] }) {
  if (!data.length) return null

  const COLS = [
    { key: 'career', label: 'Career' },
    { key: 'entry', label: 'Entry' },
    { key: 'mid', label: 'Mid-Level' },
    { key: 'senior', label: 'Senior' },
    { key: 'growth', label: 'Growth' },
    { key: 'risk', label: 'Risk' },
    { key: 'competition', label: 'Competition' },
  ]

  const BADGE = (val) => {
    if (!val) return <span className="text-gray-500">—</span>
    const map = {
      High: 'bg-amber-400/10 text-amber-300', Surging: 'bg-amber-400/10 text-amber-300',
      Medium: 'bg-yellow-500/15 text-yellow-400', Moderate: 'bg-yellow-500/15 text-yellow-400',
      Low: 'bg-red-500/15 text-red-400',
      'Very High': 'bg-rose-500/15 text-rose-400',
    }
    const cls = map[val] || 'bg-[#0E0E18] text-[#7E7C8E]'
    return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{val}</span>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {COLS.map(c => (
              <th key={c.key} className="text-left text-gray-500 font-medium py-2 pr-4 whitespace-nowrap text-xs">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="py-3 pr-4 font-semibold text-white whitespace-nowrap">{row.career}</td>
              <td className="py-3 pr-4 text-amber-300 whitespace-nowrap">{row.entry}</td>
              <td className="py-3 pr-4 text-sky-300 whitespace-nowrap">{row.mid}</td>
              <td className="py-3 pr-4 text-violet-300 whitespace-nowrap">{row.senior}</td>
              <td className="py-3 pr-4">{BADGE(row.growth)}</td>
              <td className="py-3 pr-4">{BADGE(row.risk)}</td>
              <td className="py-3 pr-4">{BADGE(row.competition)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
