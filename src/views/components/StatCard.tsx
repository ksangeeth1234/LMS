import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  variant?: "default" | "success" | "warning" | "danger" | "brand";
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  onClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "brand":
        return {
          iconBg: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-400",
          border: "border-indigo-100 hover:border-indigo-300 dark:border-indigo-900/50",
          ring: "hover:ring-indigo-500/20",
        };
      case "success":
        return {
          iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400",
          border: "border-emerald-100 hover:border-emerald-300 dark:border-emerald-900/50",
          ring: "hover:ring-emerald-500/20",
        };
      case "warning":
        return {
          iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-400",
          border: "border-amber-100 hover:border-amber-300 dark:border-amber-900/50",
          ring: "hover:ring-amber-500/20",
        };
      case "danger":
        return {
          iconBg: "bg-rose-500/10 text-rose-600 dark:bg-rose-400/20 dark:text-rose-400",
          border: "border-rose-100 hover:border-rose-300 dark:border-rose-900/50",
          ring: "hover:ring-rose-500/20",
        };
      default:
        return {
          iconBg: "bg-slate-500/10 text-slate-600 dark:bg-slate-400/20 dark:text-slate-400",
          border: "border-slate-200 hover:border-slate-300 dark:border-slate-800",
          ring: "hover:ring-slate-500/20",
        };
    }
  };

  const v = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border transition-all duration-300",
        v.border,
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        "dark:bg-slate-900"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={cn("p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110", v.iconBg)}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};
