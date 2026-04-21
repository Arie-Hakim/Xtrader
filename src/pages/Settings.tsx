export function Settings() {
  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-slate-700">הגדרות חשבון</h2>
        <p className="text-sm text-slate-400">
          הגדרות המשתמש יוצגו כאן לאחר חיבור מערכת האימות.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-slate-700">תוכנית מנוי</h2>
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
          <span className="text-sm font-medium text-slate-700">חינמי</span>
          <button className="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors">
            שדרג ל-Pro
          </button>
        </div>
      </div>
    </div>
  )
}
