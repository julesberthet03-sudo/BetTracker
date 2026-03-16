import { useState } from 'react'
import { useBets } from '../context/BetsContext'

export default function History() {
  const { bets, updateBetResult, deleteBet } = useBets()
  const [sportFilter, setSportFilter] = useState('All')
  const [resultFilter, setResultFilter] = useState('All')
  const [sortBy, setSortBy] = useState('date-desc')

  const sports = ['All', ...Array.from(new Set(bets.map(b => b.sport))).sort()]

  let filtered = bets
  if (sportFilter !== 'All') filtered = filtered.filter(b => b.sport === sportFilter)
  if (resultFilter !== 'All') filtered = filtered.filter(b => b.result === resultFilter)

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return b.date.localeCompare(a.date)
    if (sortBy === 'date-asc') return a.date.localeCompare(b.date)
    if (sortBy === 'stake-desc') return b.stake - a.stake
    return a.stake - b.stake
  })

  const resultBadge = (result) => {
    const map = {
      win: 'bg-green-900 text-green-300',
      loss: 'bg-red-900 text-red-300',
      pending: 'bg-yellow-900 text-yellow-300',
    }
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[result]}`}>{result}</span>
  }

  const selectClass = "bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bet History</h1>

      <div className="flex flex-wrap gap-3">
        <select value={sportFilter} onChange={e => setSportFilter(e.target.value)} className={selectClass}>
          {sports.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={resultFilter} onChange={e => setResultFilter(e.target.value)} className={selectClass}>
          {['All', 'win', 'loss', 'pending'].map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectClass}>
          <option value="date-desc">Date (newest)</option>
          <option value="date-asc">Date (oldest)</option>
          <option value="stake-desc">Stake (high)</option>
          <option value="stake-asc">Stake (low)</option>
        </select>
        <span className="text-gray-400 text-sm self-center ml-auto">{filtered.length} bets</span>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No bets match your filters.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Sport</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Stake</th>
                <th className="px-4 py-3 font-medium text-right">Odds</th>
                <th className="px-4 py-3 font-medium text-right">Payout</th>
                <th className="px-4 py-3 font-medium text-center">Result</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filtered.map(bet => (
                <tr key={bet.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3 text-gray-300">{bet.date}</td>
                  <td className="px-4 py-3 text-gray-300">{bet.sport}</td>
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{bet.description}</td>
                  <td className="px-4 py-3 text-right text-gray-300">${bet.stake}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{bet.odds > 0 ? '+' : ''}{bet.odds}</td>
                  <td className="px-4 py-3 text-right">
                    {bet.result === 'win' ? <span className="text-green-400">+${bet.payout.toFixed(2)}</span>
                      : bet.result === 'loss' ? <span className="text-red-400">-${bet.stake.toFixed(2)}</span>
                      : <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">{resultBadge(bet.result)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {bet.result === 'pending' && (
                        <>
                          <button onClick={() => updateBetResult(bet.id, 'win')} className="text-green-400 hover:text-green-300 text-xs px-2 py-1 rounded border border-green-800 hover:border-green-600 transition-colors">W</button>
                          <button onClick={() => updateBetResult(bet.id, 'loss')} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded border border-red-800 hover:border-red-600 transition-colors">L</button>
                        </>
                      )}
                      <button onClick={() => deleteBet(bet.id)} className="text-gray-500 hover:text-red-400 text-xs transition-colors">✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
