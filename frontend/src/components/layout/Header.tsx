import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/': 'דשבורד',
  '/analysts': 'אנליסטים',
  '/simulator': 'DNA סימולטור',
  '/settings': 'הגדרות',
}

export function Header() {
  const { pathname } = useLocation()

  const title =
    pageTitles[pathname] ??
    (pathname.startsWith('/analysts/') ? 'פרופיל אנליסט' : 'XTrader')

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
        MVP
      </span>
    </header>
  )
}
