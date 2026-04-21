import { TrendingUp, Users, Zap, BarChart2 } from 'lucide-react'

const stats = [
  { label: 'אנליסטים פעילים', value: '—', icon: Users },
  { label: 'מצב שוק', value: '—', icon: TrendingUp },
  { label: 'בדיקות DNA היום', value: '—', icon: Zap },
  { label: 'Insights שנאספו', value: '—', icon: BarChart2 },
]

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
              <Icon size={20} className="text-brand-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-700">
          קונצנזוס בוקר
        </h2>
        <p className="text-sm text-slate-400">הנתונים יוצגו כאן לאחר חיבור ה-backend.</p>
      </div>
    </div>
  )
}
