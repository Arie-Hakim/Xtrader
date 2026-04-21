import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, FlaskConical, Settings } from 'lucide-react'

const navItems = [
  { to: '/', label: 'דשבורד', icon: LayoutDashboard, end: true },
  { to: '/analysts', label: 'אנליסטים', icon: Users },
  { to: '/simulator', label: 'DNA סימולטור', icon: FlaskConical },
  { to: '/settings', label: 'הגדרות', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col bg-slate-900 text-slate-100">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-700">
        <span className="text-xl font-bold tracking-tight text-white">XTrader</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700 px-5 py-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          מידע בלבד. אין זה ייעוץ פיננסי.
        </p>
      </div>
    </aside>
  )
}
