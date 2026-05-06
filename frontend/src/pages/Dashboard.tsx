import { useQuery } from "@tanstack/react-query";
import { BarChart2, TrendingUp, Users, Zap } from "lucide-react";
import { getAnalysts } from "@/services/api";
import { StatCard } from "@/components/common/StatCard";

export function Dashboard() {
  const { data: analysts, isLoading: analystsLoading } = useQuery({
    queryKey: ["analysts"],
    queryFn: getAnalysts,
  });

  const analystCount = analystsLoading ? "..." : String(analysts?.length ?? 0);

  const STATS = [
    {
      label: "אנליסטים פעילים",
      value: analystCount,
      icon: Users,
      sub: analystsLoading ? "טוען..." : 'סה"כ במערכת',
    },
    {
      label: "מצב שוק",
      value: "—",
      icon: TrendingUp,
      sub: "בקרוב...",
    },
    {
      label: "בדיקות DNA היום",
      value: "—",
      icon: Zap,
      sub: "בקרוב...",
    },
    {
      label: "Insights שנאספו",
      value: "—",
      icon: BarChart2,
      sub: "בקרוב...",
    },
  ];

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
        {/* TODO: requires recommender-agent integration */}
        <p className="text-sm text-slate-400">בקרוב...</p>
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
          מידע בלבד. אין זה ייעוץ פיננסי. ביצועי עבר אינם מבטיחים עתיד.
        </p>
      </div>
    </div>
  );
}
