import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
      <AlertCircle size={32} className="text-red-400" />
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          נסה שוב
        </button>
      )}
    </div>
  );
}
