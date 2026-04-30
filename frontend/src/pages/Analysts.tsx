import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Users } from "lucide-react";
import { getAnalysts } from "@/services/api";
import type { ApiError } from "@/services/errors";
import { AnalystCard } from "@/components/analyst/AnalystCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export function Analysts() {
  const [query, setQuery] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["analysts"],
    queryFn: ({ signal }) => getAnalysts(signal),
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter(
      (a) =>
        a.display_name.toLowerCase().includes(q) ||
        a.username.toLowerCase().includes(q) ||
        a.analyst_type.includes(q),
    );
  }, [query, data]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש לפי שם, משתמש או סגנון..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-9 pl-4 text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus size={16} />
          הוסף אנליסט
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {error && !isLoading && (
        <ErrorMessage
          message={(error as ApiError).hebrewMessage ?? "אירעה שגיאה"}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !error && (data ?? []).length === 0 && (
        <EmptyState message="אין אנליסטים עדיין" icon={<Users size={40} />} />
      )}

      {!isLoading &&
        !error &&
        filtered.length === 0 &&
        (data ?? []).length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-400">
              לא נמצאו אנליסטים התואמים את החיפוש.
            </p>
          </div>
        )}

      {!isLoading && !error && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((analyst) => (
              <AnalystCard key={analyst.id} analyst={analyst} />
            ))}
          </div>
          <p className="text-center text-xs text-slate-400">
            מוצגים {filtered.length} מתוך {(data ?? []).length} אנליסטים
          </p>
        </>
      )}
    </div>
  );
}
