import { useBets } from '../context/BetsContext'

function Bar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm w-16 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-300 text-sm w-8 text-right">{value}</span>
    </div>
  )
}

export default function Stats() {
  const { bets } = useBets()
  const settled = bets.filter(b => b.result !== 'pending')

  const bySport = {}
  for (const b of settled) {
    if (!bySport[b.sport]) bySport[b.sport] = { wins: 0, total: 0, profit: 0, staked: 0 }
    bySport[b.sport].total++
    bySport[b.sport].staked += b.stake
    if (b.result === 'win') {
      bySport[b.sport].wins++
      bySport[b.sport].profit += b.payout - b.stake
    } else {
      bySport[b.sport].profit -= b.stake
    }
  }

  const sportRows = Object.entries(bySport).sort((a, b) => b[1].total - a[1].total)
  const maxBets = Math.max(...sportRows.map(([, v]) => v.total), 1)

  const totalStaked = settled.reduce((s, b) => s + b.stake, 0)
  const totalReturned = settled.reduce((s, b) => s + b.payout, 0)
  const profit = totalReturned - totalStaked
  const wins = settled.filter(b => b.result === 'win').length
  const losses = settled.filter(b => b.result === 'loss').length
  const pending = bets.filter(b => b.result === 'pending').length

  const biggestWin = settled.filter(b => b.result === 'win').sort((a, b) => (b.payout - b.stake) - (a.payout - a.stake))[0]
  const biggestLoss = settled.filter(b => b.result === 'loss').sort((a, b) => b.stake - a.stake)[0]

  const statRow = (label, value, color = 'text-white') => (
    <div className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  )

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Statistics</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="font-semibold mb-4">Overall Performance</h2>
          {statRow('Total Settled Bets', settled.length)}
          {statRow('Wins / Losses', `${wins} / ${losses}`, wins > losses ? 'text-green-400' : 'text-red-400')}
          {statRow('Pending Bets', pending, 'text-yellow-300')}
          {statRow('Win Rate', settled.length ? `${((wins / settled.length) * 100).toFixed(1)}%` : '—', wins / Math.max(settled.length, 1) >= 0.5 ? 'text-green-400' : 'text-red-400')}
          {statRow('Total Staked', `$${totalStaked.toFixed(2)}`)}
          {statRow('Total Returned', `$${totalReturned.toFixed(2)}`)}
          {statRow('Net Profit/Loss', `${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`, profit >= 0 ? 'text-green-400' : 'text-red-400')}
          {statRow('ROI', totalStaked ? `${((profit / totalStaked) * 100).toFixed(1)}%` : '—', profit >= 0 ? 'text-green-400' : 'text-red-400')}
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="font-semibold mb-4">Notable Bets</h2>
          {biggestWin ? (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-800 rounded-lg">
              <p className="text-xs text-green-400 font-semibold mb-1">Biggest Win</p>
              <p className="text-sm font-medium">{biggestWin.description}</p>
              <p className="text-green-400 text-sm mt-0.5">+${(biggestWin.payout - biggestWin.stake).toFixed(2)}</p>
            </div>
          ) : <p className="text-gray-500 text-sm mb-4">No wins yet.</p>}

          {biggestLoss ? (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
              <p className="text-xs text-red-400 font-semibold mb-1">Biggest Loss</p>
              <p className="text-sm font-medium">{biggestLoss.description}</p>
              <p className="text-red-400 text-sm mt-0.5">-${biggestLoss.stake.toFixed(2)}</p>
            </div>
          ) : <p className="text-gray-500 text-sm">No losses yet.</p>}
        </div>
      </div>

      {sportRows.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="font-semibold mb-5">Performance by Sport</h2>
          <div className="space-y-3 mb-6">
            {sportRows.map(([sport, v]) => (
              <Bar key={sport} label={sport} value={v.total} max={maxBets} color="bg-indigo-500" />
            ))}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left border-b border-gray-700">
                <th className="pb-2 font-medium">Sport</th>
                <th className="pb-2 font-medium text-center">Bets</th>
                <th className="pb-2 font-medium text-center">W/L</th>
                <th className="pb-2 font-medium text-right">Profit</th>
                <th className="pb-2 font-medium text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sportRows.map(([sport, v]) => (
                <tr key={sport}>
                  <td className="py-2.5 font-medium">{sport}</td>
                  <td className="py-2.5 text-center text-gray-300">{v.total}</td>
                  <td className="py-2.5 text-center text-gray-300">{v.wins}/{v.total - v.wins}</td>
                  <td className={`py-2.5 text-right font-medium ${v.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {v.profit >= 0 ? '+' : ''}${v.profit.toFixed(2)}
                  </td>
                  <td className={`py-2.5 text-right ${v.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {v.staked ? `${((v.profit / v.staked) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
