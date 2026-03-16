import { useBets } from '../context/BetsContext'
import { Link } from 'react-router-dom'

function StatCard({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { bets } = useBets()

  const settled = bets.filter(b => b.result !== 'pending')
  const wins = settled.filter(b => b.result === 'win')
  const totalStaked = settled.reduce((sum, b) => sum + b.stake, 0)
  const totalReturned = settled.reduce((sum, b) => sum + b.payout, 0)
  const profit = totalReturned - totalStaked
  const roi = totalStaked > 0 ? ((profit / totalStaked) * 100).toFixed(1) : '0.0'
  const winRate = settled.length > 0 ? ((wins.length / settled.length) * 100).toFixed(1) : '0.0'

  const recent = [...bets].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  const resultBadge = (result) => {
    const map = {
      win: 'bg-green-900 text-green-300',
      loss: 'bg-red-900 text-red-300',
      pending: 'bg-yellow-900 text-yellow-300',
    }
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[result]}`}>{result}</span>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/add" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          + Add Bet
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Bets" value={settled.length} />
        <StatCard label="Win Rate" value={`${winRate}%`} color={parseFloat(winRate) >= 50 ? 'text-green-400' : 'text-red-400'} />
        <StatCard label="Profit / Loss" value={`${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`} color={profit >= 0 ? 'text-green-400' : 'text-red-400'} />
        <StatCard label="ROI" value={`${roi}%`} color={parseFloat(roi) >= 0 ? 'text-green-400' : 'text-red-400'} />
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold">Recent Bets</h2>
          <Link to="/history" className="text-indigo-400 hover:text-indigo-300 text-sm">View all →</Link>
        </div>
        <div className="divide-y divide-gray-700">
          {recent.length === 0 && (
            <p className="px-6 py-8 text-gray-500 text-center">No bets yet. <Link to="/add" className="text-indigo-400 hover:underline">Add your first bet</Link></p>
          )}
          {recent.map(bet => (
            <div key={bet.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{bet.description}</p>
                <p className="text-gray-400 text-xs mt-0.5">{bet.sport} · {bet.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-300">${bet.stake}</span>
                {resultBadge(bet.result)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
