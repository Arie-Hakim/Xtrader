import { useParams, useNavigate } from "react-router-dom";
import { FlaskConical, ExternalLink, ArrowRight } from "lucide-react";
import { getMockAnalystByUsername } from "@/data/mockAnalysts";
import { Badge } from "@/components/common/Badge";
import { DNAViewer } from "@/components/analyst/DNAViewer";
import { InsightRow } from "@/components/analyst/InsightRow";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}

export function AnalystProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const data = username ? getMockAnalystByUsername(username) : null;

  if (!data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-slate-500">אנליסט לא נמצא.</p>
        <button
          type="button"
          onClick={() => navigate("/analysts")}
          className="mt-4 flex items-center gap-1 text-sm text-brand-600 hover:underline mx-auto"
        >
          <ArrowRight size={14} />
          חזור לרשימת האנליסטים
        </button>
      </div>
    );
  }

  const { analyst, dna, insights, quotes } = data;
  const trustScore = (analyst.analyst_weight * 10).toFixed(1);
  const topTickers = dna.profile_data.top_tickers;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
          {analyst.display_name
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">
              {analyst.display_name}
            </h2>
            <Badge type={analyst.analyst_type} size="md" />
          </div>
          <p className="text-sm text-slate-500">@{analyst.username}</p>
          <p className="mt-1 text-sm text-slate-600">
            ציון אמינות:{" "}
            <span className="font-bold text-brand-600">{trustScore}/10</span>
            <span className="mx-2 text-slate-300">·</span>
            {analyst.tweets_learned_count.toLocaleString()} ציוצים נלמדו
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/simulator?analyst=${analyst.id}`)}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-brand-600 px-4 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
        >
          <FlaskConical size={16} />
          בדוק התאמת מניה
        </button>
      </div>

      {/* DNA + Stocks */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="🧬 DNA – פרופיל מסחר">
            <DNAViewer dna={dna} />
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="📈 מניות מובילות">
            <div className="flex flex-wrap gap-2">
              {topTickers.map((ticker) => (
                <span
                  key={ticker}
                  className="rounded-md bg-brand-50 px-3 py-1 font-mono text-sm font-semibold text-brand-700"
                >
                  {ticker}
                </span>
              ))}
            </div>
          </Section>

          <Section title="💬 ציטוטים בולטים">
            <div className="space-y-3">
              {quotes.map((q) => (
                <blockquote
                  key={q.id}
                  className="border-r-2 border-brand-300 pr-3"
                >
                  <p className="text-sm text-slate-600 leading-relaxed">
                    "{q.content}"
                  </p>
                  <a
                    href={q.tweet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-xs text-brand-500 hover:underline"
                  >
                    <ExternalLink size={11} />
                    {q.date}
                  </a>
                </blockquote>
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* Insights table */}
      <Section title="📊 Insights אחרונים">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="pb-2 pr-4 pl-2">מניה</th>
                <th className="pb-2 px-2">כיוון</th>
                <th className="pb-2 px-2">עוצמה</th>
                <th className="pb-2 px-2">נימוק</th>
                <th className="pb-2 pl-4 pr-2 text-left">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {insights.map((insight) => (
                <InsightRow key={insight.id} insight={insight} />
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <p className="text-center text-xs text-slate-400">
        מידע בלבד. אין זה ייעוץ פיננסי. ביצועי עבר אינם מבטיחים עתיד.
      </p>
    </div>
  );
}
