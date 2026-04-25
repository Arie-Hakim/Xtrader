import type { AnalystType } from "@/types";

const LABELS: Record<AnalystType, string> = {
  "trader-scalp": "Scalp",
  "trader-swing": "Swing",
  "trader-position": "Position",
  "investor-value": "Value",
  "investor-growth": "Growth",
  macro: "Macro",
  mixed: "Mixed",
};

const COLORS: Record<AnalystType, string> = {
  "trader-scalp": "bg-red-100 text-red-700",
  "trader-swing": "bg-orange-100 text-orange-700",
  "trader-position": "bg-amber-100 text-amber-700",
  "investor-value": "bg-blue-100 text-blue-700",
  "investor-growth": "bg-green-100 text-green-700",
  macro: "bg-purple-100 text-purple-700",
  mixed: "bg-slate-100 text-slate-600",
};

interface BadgeProps {
  type: AnalystType;
  size?: "sm" | "md";
}

export function Badge({ type, size = "sm" }: BadgeProps) {
  const padding = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span
      className={`inline-block rounded-full font-medium ${padding} ${COLORS[type]}`}
    >
      {LABELS[type]}
    </span>
  );
}
