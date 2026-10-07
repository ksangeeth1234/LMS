"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  UserPlus,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/views/components/StatCard";
import { Badge } from "@/views/components/Badge";
import { Button } from "@/views/components/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DashboardStats } from "@/models/report.model";
import { Payment } from "@/models/types";

export const AdminDashboardView: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, paymentsRes] = await Promise.all([
        fetch("/api/reports/dashboard"),
        fetch("/api/payments?status=SLIP%20UPLOADED"),
      ]);

      const statsData = await statsRes.json();
      const paymentsData = await paymentsRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (paymentsData.success) setPendingPayments(paymentsData.payments || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Tuition Management Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back! Here is an overview of registered students, monthly tuition collections, and academic content.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>

          <Link href="/admin/students/register">
            <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
              Register Student
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          subtitle="Registered in system"
          icon={<Users className="w-5 h-5" />}
          variant="brand"
        />

        <StatCard
          title="Active Students"
          value={stats?.activeStudents ?? 0}
          subtitle="Enrolled & active"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
        />

        <StatCard
          title="Pending Slips"
          value={stats?.pendingSlips ?? 0}
          subtitle="Needs verification"
          icon={<Clock className="w-5 h-5" />}
          variant="warning"
        />

        <StatCard
          title="Verified Payments"
          value={stats?.verifiedPayments ?? 0}
          subtitle="Unlocked materials"
          icon={<FileCheck className="w-5 h-5" />}
          variant="success"
        />

        <StatCard
          title="Unpaid Months"
          value={stats?.pendingPayments ?? 0}
          subtitle="Awaiting slip upload"
          icon={<ShieldAlert className="w-5 h-5" />}
          variant="danger"
        />

        <StatCard
          title="Learning Materials"
          value={stats?.totalMaterials ?? 0}
          subtitle="Notes, links & files"
          icon={<BookOpen className="w-5 h-5" />}
          variant="default"
        />
      </div>

      {/* Action shortcuts & revenue card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Card */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Total Verified Tuition
              </span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
              {formatCurrency(stats?.totalRevenue ?? 0)}
            </h2>
            <p className="mt-1 text-xs text-indigo-200">
              Across all verified monthly fees
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-indigo-800/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-indigo-300 block">Notes Published</span>
              <span className="font-bold text-white text-base">{stats?.notesCount ?? 0}</span>
            </div>
            <div>
              <span className="text-indigo-300 block">Video Links</span>
              <span className="font-bold text-white text-base">{stats?.linksCount ?? 0}</span>
            </div>
            <div>
              <span className="text-indigo-300 block">Downloadable Files</span>
              <span className="font-bold text-white text-base">{stats?.filesCount ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Operations Bar */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 lg:col-span-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Quick Actions & Workflows
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Execute primary administrative duties with a single click
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/admin/students/register"
              className="flex items-center justify-between p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-200 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 transition-all group"
            >
              <div>
                <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                  Register Student
                </h4>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">
                  Generate login auto-password
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            <Link
              href="/admin/verification"
              className="flex items-center justify-between p-4 rounded-2xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-200 dark:border-amber-900/50 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 transition-all group"
            >
              <div>
                <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  Verify Payment Slips
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                  {stats?.pendingSlips ?? 0} slips awaiting review
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            <Link
              href="/admin/materials"
              className="flex items-center justify-between p-4 rounded-2xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-200 dark:border-purple-900/50 dark:bg-purple-950/20 dark:hover:bg-purple-950/40 transition-all group"
            >
              <div>
                <h4 className="text-sm font-bold text-purple-950 dark:text-purple-200">
                  Add Learning Material
                </h4>
                <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-0.5">
                  Add Note, Link, or PDF
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Slips Verification Table */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Pending Payment Slips Awaiting Review</span>
              <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-bold dark:bg-amber-950 dark:text-amber-300">
                {pendingPayments.length}
              </span>
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Students who have uploaded bank deposit slips waiting for access activation
            </p>
          </div>

          <Link href="/admin/verification">
            <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              Open Verification Portal
            </Button>
          </Link>
        </div>

        {pendingPayments.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="mx-auto w-10 h-10 text-emerald-500" />
            <h4 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              All payment slips verified!
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              There are no pending student deposit slips waiting for verification.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-850 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Student ID & Name</th>
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4">Fee Amount</th>
                  <th className="px-6 py-4">Uploaded Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingPayments.slice(0, 5).map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {payment.student?.full_name}
                      </div>
                      <div className="text-xs font-mono text-slate-500">
                        {payment.student?.student_id} • {payment.student?.student_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {payment.payment_month}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={payment.payment_status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href="/admin/verification">
                        <Button variant="primary" size="sm">
                          Review Slip
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
