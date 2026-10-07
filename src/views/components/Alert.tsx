import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  message,
  className,
  onDismiss,
}) => {
  const config = {
    info: {
      bg: "bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-200",
      icon: <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    },
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
    },
  };

  const { bg, icon } = config[type];

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4 shadow-sm", bg, className)}>
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold">{title}</h4>}
        <p className="mt-0.5 leading-relaxed">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
