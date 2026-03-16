import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBets } from '../context/BetsContext'

const SPORTS = ['NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'Tennis', 'MMA', 'Boxing', 'Golf', 'Other']

export default function AddBet() {
  const { addBet } = useBets()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    sport: 'NFL',
    description: '',
    stake: '',
    odds: '',
    result: 'pending',
  })
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.description.trim()) return setError('Please enter a bet description.')
    if (!form.stake || isNaN(form.stake) || Number(form.stake) <= 0) return setError('Enter a valid stake amount.')
    if (!form.odds || isNaN(form.odds)) return setError('Enter valid American odds (e.g. -110 or +150).')
    setError('')
    addBet({ ...form, stake: parseFloat(form.stake), odds: parseInt(form.odds) })
    navigate('/')
  }

  const inputClass = "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5"

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Add New Bet</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-5">
        {error && <p className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg px-4 py-2 text-sm">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Sport</label>
            <select name="sport" value={form.sport} onChange={handleChange} className={inputClass}>
              {SPORTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Bet Description</label>
          <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="e.g. Chiefs -3.5 vs Ravens" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Stake ($)</label>
            <input type="number" name="stake" value={form.stake} onChange={handleChange} placeholder="50" min="0.01" step="0.01" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Odds (American)</label>
            <input type="number" name="odds" value={form.odds} onChange={handleChange} placeholder="-110" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Result</label>
          <select name="result" value={form.result} onChange={handleChange} className={inputClass}>
            <option value="pending">Pending</option>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors">
            Save Bet
          </button>
          <button type="button" onClick={() => navigate('/')} className="px-5 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
