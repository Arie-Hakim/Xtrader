import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Insight } from "@/types";

interface InsightRowProps {
  insight: Insight;
}

const DIRECTION_CONFIG = {
  bullish: { label: "שורי", icon: TrendingUp, color: "text-green-600" },
  bearish: { label: "דובי", icon: TrendingDown, color: "text-red-600" },
  neutral: { label: "ניטרלי", icon: Minus, color: "text-slate-400" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function InsightRow({ insight }: InsightRowProps) {
  const dir = DIRECTION_CONFIG[insight.direction];
  const DirIcon = dir.icon;

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
      <td className="py-3 pr-4 pl-2">
        <span className="font-mono text-sm font-semibold text-slate-800">
          {insight.ticker}
        </span>
      </td>
      <td className="py-3 px-2">
        <span
          className={`flex items-center gap-1 text-sm font-medium ${dir.color}`}
        >
          <DirIcon size={14} />
          {dir.label}
        </span>
      </td>
      <td className="py-3 px-2">
        <span className="text-sm font-semibold text-slate-700">
          {insight.strength}/10
        </span>
      </td>
      <td className="py-3 px-2 max-w-xs">
        <p
          className="truncate text-xs text-slate-500"
          title={insight.reasoning}
        >
          {insight.reasoning}
        </p>
      </td>
      <td className="py-3 pl-4 pr-2 text-left">
        <div className="flex items-center justify-end gap-3">
          <span className="text-xs text-slate-400">
            {formatDate(insight.created_at)}
          </span>
          <a
            href={insight.raw_data.tweet_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-brand-500 hover:text-brand-700 transition-colors"
            aria-label="פתח ציוץ מקורי"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </td>
    </tr>
  );
}
