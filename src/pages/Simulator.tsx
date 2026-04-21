import { useState } from 'react'
import { Search } from 'lucide-react'

export function Simulator() {
  const [analyst, setAnalyst] = useState('')
  const [ticker, setTicker] = useState('')

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-slate-700">🔍 DNA Simulator</h2>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            בחר אנליסט
          </label>
          <select
            value={analyst}
            onChange={(e) => setAnalyst(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">-- בחר אנליסט --</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            סמל מניה
          </label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="NVDA"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <button
          disabled={!analyst || !ticker}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-40"
        >
          <Search size={16} />
          בדוק התאמה
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-center text-sm text-slate-400">
          תוצאות ההתאמה יוצגו כאן לאחר חיבור ה-backend.
        </p>
      </div>
    </div>
  )
}
