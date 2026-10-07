"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  CheckSquare,
  BookOpen,
  BarChart3,
  ShieldCheck,
  UserCheck,
  UploadCloud,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/models/types";

interface SidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen = false, onClose }) => {
  const pathname = usePathname();

  const adminNav = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Register Student", href: "/admin/students/register", icon: UserPlus },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Verify Slips", href: "/admin/verification", icon: CheckSquare },
    { label: "Learning Materials", href: "/admin/materials", icon: BookOpen },
    { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
  ];

  const studentNav = [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "My Profile", href: "/student/profile", icon: UserCheck },
    { label: "Monthly Payments", href: "/student/payments", icon: UploadCloud },
    { label: "Learning Materials", href: "/student/materials", icon: FileText },
  ];

  const links = role === "ADMIN" ? adminNav : studentNav;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col flex-1 gap-y-6 px-4 py-6 overflow-y-auto">
          <div>
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {role === "ADMIN" ? "Tuition Management" : "Student Portal"}
            </span>
            <nav className="mt-3 space-y-1">
              {links.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 border border-indigo-100 dark:from-slate-800 dark:to-slate-800/50 dark:border-slate-700">
            <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              IT 403061 – LMS System
            </h4>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
              Enterprise MVC Architecture • Supabase PostgreSQL & Storage
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
