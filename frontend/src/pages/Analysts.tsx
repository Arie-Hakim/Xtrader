import { Search, Plus } from 'lucide-react'

export function Analysts() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="חפש אנליסט..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-9 pl-4 text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors">
          <Plus size={16} />
          הוסף אנליסט
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-400">
          אנליסטים יוצגו כאן לאחר חיבור ה-backend.
        </p>
      </div>
    </div>
  )
}
