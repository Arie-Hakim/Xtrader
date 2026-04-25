import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import type { Analyst } from "@/types";
import { Badge } from "@/components/common/Badge";

interface AnalystCardProps {
  analyst: Analyst;
}

function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
      {initials}
    </div>
  );
}

export function AnalystCard({ analyst }: AnalystCardProps) {
  const navigate = useNavigate();
  const trustScore = (analyst.analyst_weight * 10).toFixed(1);

  return (
    <button
      type="button"
      onClick={() => navigate(`/analysts/${analyst.username}`)}
      className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md text-right"
    >
      <div className="flex items-start gap-3">
        <AvatarFallback name={analyst.display_name} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800 truncate">
            {analyst.display_name}
          </p>
          <p className="text-xs text-slate-400 truncate">@{analyst.username}</p>
        </div>
        <span className="text-sm font-bold text-brand-600 shrink-0">
          {trustScore}/10
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Badge type={analyst.analyst_type} />
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <MessageSquare size={12} />
          {analyst.tweets_learned_count.toLocaleString()} ציוצים
        </span>
      </div>
    </button>
  );
}
