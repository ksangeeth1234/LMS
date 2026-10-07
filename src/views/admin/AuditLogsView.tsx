"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, RefreshCw, Clock, Activity, User } from "lucide-react";
import { Button } from "@/views/components/Button";
import { formatDateTime } from "@/lib/utils";
import { AuditLog } from "@/models/types";

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/audit-logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    if (action.includes("VERIFIED") || action.includes("REGISTERED")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400";
    }
    if (action.includes("REJECTED") || action.includes("DELETED") || action.includes("DEACTIVATED")) {
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400";
    }
    if (action.includes("UPLOADED") || action.includes("RESET")) {
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400";
    }
    return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            System Audit Trail &amp; Compliance Logs
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Immutable log of all administrative actions, student registrations, payment slip decisions, and learning material updates.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh Logs
        </Button>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-16 text-center">
            <Activity className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              No audit logs recorded yet
            </h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-850 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Executed By</th>
                  <th className="px-6 py-4">Details &amp; Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ""}
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {log.username || "System"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      {log.details ? (
                        <pre className="font-mono text-[11px] bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800 max-w-md overflow-x-auto">
                          {JSON.stringify(log.details)}
                        </pre>
                      ) : (
                        <span className="text-slate-400 italic">No extra metadata</span>
                      )}
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
