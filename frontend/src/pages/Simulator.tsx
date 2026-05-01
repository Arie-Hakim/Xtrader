import { useState } from "react";
import { Search, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAnalysts, checkStockFit } from "@/services/api";
import { Badge } from "@/components/common/Badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import type { StockFitResult } from "@/types";

const REGIME_LABELS: Record<string, string> = {
  BULL_STRONG: "שורי חזק 🟢",
  BULL_WEAK: "שורי חלש 🟡",
  CHOP: "ניטרלי ⚪",
  BEAR_WEAK: "דובי חלש 🟠",
  BEAR_STRONG: "דובי חזק 🔴",
};

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 7
      ? "text-green-600"
      : score >= 5
        ? "text-amber-500"
        : "text-red-500";
  const ring =
    score >= 7
      ? "border-green-400"
      : score >= 5
        ? "border-amber-400"
        : "border-red-400";
  return (
    <div
      className={`flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 ${ring}`}
    >
      <span className={`text-4xl font-black ${color}`}>{score.toFixed(1)}</span>
      <span className="text-xs text-slate-400">מתוך 10</span>
    </div>
  );
}

function ResultPanel({ result }: { result: StockFitResult }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          ציון התאמה – {result.ticker}
        </p>
        <ScoreCircle score={result.fit_score} />
        <p className="text-xs text-slate-500">
          מצב שוק נוכחי:{" "}
          <span className="font-medium">
            {REGIME_LABELS[result.current_regime]}
          </span>
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <CheckCircle size={15} className="text-green-500" />
          מדוע מתאים
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {result.explanation_he}
        </p>
      </div>

      {result.risks_he.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <AlertTriangle size={15} className="text-amber-500" />
            סיכונים
          </h3>
          <ul className="space-y-1.5">
            {result.risks_he.map((risk, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <span className="mt-0.5 shrink-0 text-amber-400">⚠</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.relevant_tweet_url && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            💬 ציוץ רלוונטי
          </h3>
          {result.relevant_tweet_content && (
            <p className="mb-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 leading-relaxed">
              "{result.relevant_tweet_content}"
            </p>
          )}
          <a
            href={result.relevant_tweet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-brand-500 hover:underline"
          >
            <ExternalLink size={12} />
            פתח ב-X
          </a>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        מידע בלבד. אין זה ייעוץ פיננסי. ביצועי עבר אינם מבטיחים עתיד.
      </p>
    </div>
  );
}

export function Simulator() {
  const [analystId, setAnalystId] = useState("");
  const [ticker, setTicker] = useState("");
  const [result, setResult] = useState<StockFitResult | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { data: analysts = [], isLoading: loadingAnalysts } = useQuery({
    queryKey: ["analysts"],
    queryFn: getAnalysts,
  });

  const selectedAnalyst = analysts.find((a) => a.id === analystId);

  async function handleCheck() {
    if (!analystId || !ticker.trim()) return;
    setIsChecking(true);
    setCheckError(null);
    setResult(null);
    try {
      const { result: fitResult } = await checkStockFit(
        analystId,
        ticker.trim(),
      );
      setResult(fitResult);
    } catch {
      setCheckError("שגיאה בבדיקת ההתאמה. נסה שוב.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-700">
          🔍 DNA Simulator
        </h2>
        <p className="text-xs text-slate-400">
          בחר אנליסט ומניה כדי לבדוק כמה המניה מתאימה לשיטת המסחר שלו.
        </p>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            בחר אנליסט
          </label>
          {loadingAnalysts ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <select
              value={analystId}
              onChange={(e) => {
                setAnalystId(e.target.value);
                setResult(null);
                setCheckError(null);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">-- בחר אנליסט --</option>
              {analysts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.display_name} (@{a.username})
                </option>
              ))}
            </select>
          )}
          {selectedAnalyst && (
            <div className="mt-2 flex items-center gap-2">
              <Badge type={selectedAnalyst.analyst_type} />
              <span className="text-xs text-slate-400">
                {selectedAnalyst.tweets_learned_count.toLocaleString()} ציוצים
                נלמדו
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            סמל מניה
          </label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => {
              setTicker(e.target.value.toUpperCase());
              setResult(null);
              setCheckError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="NVDA"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <button
          type="button"
          disabled={!analystId || !ticker.trim() || isChecking}
          onClick={handleCheck}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-40"
        >
          <Search size={16} />
          {isChecking ? "בודק..." : "בדוק התאמה"}
        </button>
      </div>

      {checkError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">{checkError}</p>
        </div>
      )}

      {result ? (
        <ResultPanel result={result} />
      ) : (
        !checkError && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-400">
              תוצאת ההתאמה תוצג כאן לאחר הבדיקה.
            </p>
          </div>
        )
      )}
    </div>
  );
}
