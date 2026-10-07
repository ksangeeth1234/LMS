"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/views/components/Button";
import { StatCard } from "@/views/components/StatCard";
import { formatCurrency, formatMonthName, getAllMonthOptions } from "@/lib/utils";
import { MonthlyReportRow } from "@/models/report.model";

export const ReportsView: React.FC = () => {
  const [summary, setSummary] = useState<MonthlyReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("ALL");

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const query = selectedMonth !== "ALL" ? `?month=${selectedMonth}` : "";
      const res = await fetch(`/api/reports${query}`);
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary || []);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedMonth]);

  const handleExportCSV = () => {
    const query = selectedMonth !== "ALL" ? `?month=${selectedMonth}&format=csv` : "?format=csv";
    window.location.href = `/api/reports${query}`;
  };

  const totalCollected = summary.reduce((sum, row) => sum + row.totalCollected, 0);
  const totalVerified = summary.reduce((sum, row) => sum + row.verifiedCount, 0);
  const totalPendingSlips = summary.reduce((sum, row) => sum + row.pendingSlipCount, 0);
  const totalUnpaid = summary.reduce((sum, row) => sum + row.unpaidCount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Tuition Reports &amp; Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Comprehensive financial breakdown, verification metrics, and student payment compliance reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Aggregate KPI Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue Collected"
          value={formatCurrency(totalCollected)}
          subtitle="Verified payments across selection"
          icon={<BarChart3 className="w-5 h-5" />}
          variant="brand"
        />

        <StatCard
          title="Verified Count"
          value={totalVerified}
          subtitle="Successful monthly fee payments"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
        />

        <StatCard
          title="Pending Slips"
          value={totalPendingSlips}
          subtitle="Awaiting teacher review"
          icon={<Clock className="w-5 h-5" />}
          variant="warning"
        />

        <StatCard
          title="Unpaid Months"
          value={totalUnpaid}
          subtitle="Missing deposit slips"
          icon={<AlertCircle className="w-5 h-5" />}
          variant="danger"
        />
      </div>

      {/* Filter and Table Card */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Payment Summary
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated monthly collection and compliance statistics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Filter Month:
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">All Available Months</option>
              {(() => {
                const months = getAllMonthOptions();
                const years: Record<number, typeof months> = {};
                months.forEach((m) => { if (!years[m.year]) years[m.year] = []; years[m.year].push(m); });
                return Object.entries(years).sort(([a],[b])=>Number(a)-Number(b)).map(([year, mons]) => (
                  <optgroup key={year} label={`── ${year} ──`}>
                    {mons.map((m) => (<option key={m.code} value={m.code}>{m.label}</option>))}
                  </optgroup>
                ));
              })()}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-850 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Academic Month</th>
                <th className="px-6 py-4">Total Collected</th>
                <th className="px-6 py-4">Verified Students</th>
                <th className="px-6 py-4">Pending Slips</th>
                <th className="px-6 py-4">Unpaid Students</th>
                <th className="px-6 py-4">Rejected Slips</th>
                <th className="px-6 py-4">Collection Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {summary.map((row) => {
                const totalStudentsInMonth = row.verifiedCount + row.pendingSlipCount + row.unpaidCount + row.rejectedCount;
                const collectionPct = totalStudentsInMonth > 0 ? Math.round((row.verifiedCount / totalStudentsInMonth) * 100) : 0;

                return (
                  <tr key={row.month} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {formatMonthName(row.month)}
                    </td>

                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(row.totalCollected)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> {row.verifiedCount}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                        <Clock className="w-4 h-4" /> {row.pendingSlipCount}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
                        <AlertCircle className="w-4 h-4" /> {row.unpaidCount}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                        <XCircle className="w-4 h-4" /> {row.rejectedCount}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all"
                            style={{ width: `${collectionPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {collectionPct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
