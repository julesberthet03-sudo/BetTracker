import { createContext, useContext, useState } from 'react'

const BetsContext = createContext(null)

const SAMPLE_BETS = [
  { id: 1, date: '2026-03-10', sport: 'NFL', description: 'Chiefs -3.5 vs Ravens', stake: 50, odds: -110, result: 'win', payout: 95.45 },
  { id: 2, date: '2026-03-11', sport: 'NBA', description: 'Lakers ML vs Celtics', stake: 30, odds: 140, result: 'loss', payout: 0 },
  { id: 3, date: '2026-03-13', sport: 'MLB', description: 'Yankees -1.5 vs Red Sox', stake: 25, odds: -130, result: 'win', payout: 44.23 },
  { id: 4, date: '2026-03-15', sport: 'NHL', description: 'Oilers ML vs Flames', stake: 40, odds: -115, result: 'pending', payout: 0 },
]

export function BetsProvider({ children }) {
  const [bets, setBets] = useState(SAMPLE_BETS)
  const [nextId, setNextId] = useState(SAMPLE_BETS.length + 1)

  function addBet(bet) {
    const payout = bet.result === 'win'
      ? bet.stake + (bet.odds > 0
          ? (bet.stake * bet.odds) / 100
          : bet.stake / (Math.abs(bet.odds) / 100))
      : 0

    setBets(prev => [...prev, { ...bet, id: nextId, payout: parseFloat(payout.toFixed(2)) }])
    setNextId(n => n + 1)
  }

  function updateBetResult(id, result) {
    setBets(prev => prev.map(b => {
      if (b.id !== id) return b
      const payout = result === 'win'
        ? b.stake + (b.odds > 0
            ? (b.stake * b.odds) / 100
            : b.stake / (Math.abs(b.odds) / 100))
        : 0
      return { ...b, result, payout: parseFloat(payout.toFixed(2)) }
    }))
  }

  function deleteBet(id) {
    setBets(prev => prev.filter(b => b.id !== id))
  }

  return (
    <BetsContext.Provider value={{ bets, addBet, updateBetResult, deleteBet }}>
      {children}
    </BetsContext.Provider>
  )
}

export function useBets() {
  return useContext(BetsContext)
}
