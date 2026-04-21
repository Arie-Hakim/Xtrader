import { useParams } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'

export function AnalystProfile() {
  const { username } = useParams<{ username: string }>()

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-14 w-14 rounded-full bg-slate-200" />
        <div>
          <h2 className="text-lg font-bold text-slate-800">@{username ?? '...'}</h2>
          <p className="text-sm text-slate-500">טוען פרופיל...</p>
        </div>
        <button className="mr-auto flex items-center gap-2 rounded-lg border border-brand-600 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors">
          <FlaskConical size={16} />
          בדוק מניה לפי השיטה שלו
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">DNA – פרופיל</h3>
          <p className="text-sm text-slate-400">הנתונים יוצגו כאן.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Insights אחרונים</h3>
          <p className="text-sm text-slate-400">הנתונים יוצגו כאן.</p>
        </div>
      </div>
    </div>
  )
}
