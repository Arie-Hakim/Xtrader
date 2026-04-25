import { TrendingUp, Users, Zap, BarChart2 } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";

const STATS = [
  { label: "אנליסטים פעילים", value: "6", icon: Users, sub: "3 עודכנו היום" },
  { label: "מצב שוק", value: "שורי חזק", icon: TrendingUp, sub: "BULL_STRONG" },
  { label: "בדיקות DNA היום", value: "24", icon: Zap, sub: "+8 משעה שעברה" },
  {
    label: "Insights שנאספו",
    value: "3,241",
    icon: BarChart2,
    sub: "+18 מאמש",
  },
];

const CONSENSUS = [
  {
    ticker: "NVDA",
    score: 8.7,
    reasoning: "פריצה טכנית + AI demand חזק. 3 אנליסטים מסכימים.",
  },
  {
    ticker: "GLD",
    score: 9.1,
    reasoning: "מאקרו תומך – DXY חלש, ריבית ריאלית שלילית. גידור מומלץ.",
  },
  {
    ticker: "META",
    score: 7.8,
    reasoning: "דוחות מעולים + פריצה טכנית. Swing ו-Position traders מסכימים.",
  },
];

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 8
      ? "bg-green-100 text-green-700"
      : score >= 6
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>
      {score.toFixed(1)}
    </span>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            sub={s.sub}
          />
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-700">
          קונצנזוס בוקר
        </h2>
        <div className="divide-y divide-slate-100">
          {CONSENSUS.map((item) => (
            <div
              key={item.ticker}
              className="flex items-start gap-4 py-3 first:pt-0 last:pb-0"
            >
              <span className="mt-0.5 w-14 shrink-0 font-mono text-sm font-bold text-slate-800">
                {item.ticker}
              </span>
              <p className="flex-1 text-sm text-slate-600">{item.reasoning}</p>
              <ScorePill score={item.score} />
            </div>
          ))}
        </div>
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
          מידע בלבד. אין זה ייעוץ פיננסי. ביצועי עבר אינם מבטיחים עתיד.
        </p>
      </div>
    </div>
  );
}
