import type { AnalystDNA } from "@/types";

interface DNAViewerProps {
  dna: AnalystDNA;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-medium text-slate-700">
          {value.toFixed(1)}/10
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div
          className="h-1.5 rounded-full bg-brand-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const REGIME_LABELS: Record<string, string> = {
  BULL_STRONG: "שורי חזק",
  BULL_WEAK: "שורי חלש",
  CHOP: "ניטרלי",
  BEAR_WEAK: "דובי חלש",
  BEAR_STRONG: "דובי חזק",
};

export function DNAViewer({ dna }: DNAViewerProps) {
  const { profile_data: pd } = dna;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600 leading-relaxed">{pd.summary_he}</p>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          סגנון מסחר
        </p>
        <p className="text-sm text-slate-700">{pd.core_style}</p>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          אופק זמן טיפוסי
        </p>
        <p className="text-sm text-slate-700">{pd.typical_horizon}</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          אינדיקטורים מועדפים
        </p>
        <div className="flex flex-wrap gap-1.5">
          {pd.preferred_indicators.map((ind) => (
            <span
              key={ind}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
            >
              {ind}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          ניהול סיכון
        </p>
        <p className="text-sm text-slate-700">{pd.risk_management}</p>
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          ביצועים לפי מצב שוק
        </p>
        {Object.entries(pd.regime_performance).map(([regime, score]) => (
          <div key={regime}>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>{REGIME_LABELS[regime] ?? regime}</span>
              <span className="font-medium text-slate-700">
                {Math.round((score ?? 0) * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-brand-500"
                style={{ width: `${Math.round((score ?? 0) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2.5">
        <ScoreBar label="עוצמה ממוצעת" value={pd.avg_strength} />
        <ScoreBar label="ביטחון ממוצע" value={pd.avg_confidence} />
      </div>
    </div>
  );
}
