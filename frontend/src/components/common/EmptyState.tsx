import type { ReactNode } from "react";

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ message, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
      {icon && <div className="text-slate-300">{icon}</div>}
      <p className="text-sm text-slate-400">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
