"use client";

import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  Clock,
  XCircle,
  FileImage,
  RefreshCw,
  AlertTriangle,
  Lock,
  Sparkles,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/views/components/Badge";
import { Button } from "@/views/components/Button";
import { Modal } from "@/views/components/Modal";
import { Alert } from "@/views/components/Alert";
import { formatCurrency, formatDate, formatDateTime, formatMonthName, getAllMonthOptions, MONTH_NAMES } from "@/lib/utils";
import { Payment } from "@/models/types";

// Grouped months: { year: number; months: {code, label}[] }[]
function groupedMonths() {
  const allMonths = getAllMonthOptions();
  const years: Record<number, { code: string; label: string }[]> = {};
  allMonths.forEach((m) => {
    if (!years[m.year]) years[m.year] = [];
    years[m.year].push({ code: m.code, label: m.label });
  });
  return Object.entries(years)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, months]) => ({ year: Number(year), months }));
}

export const StudentPaymentView: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyFee, setMonthlyFee] = useState<number>(4500);

  // Filter state
  const [yearFilter, setYearFilter] = useState<number>(2027);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("2027-01");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Slip preview modal
  const [viewingSlip, setViewingSlip] = useState<{ url: string; month: string; status: string } | null>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Failed to load student payments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch student profile to get actual monthly fee
  const fetchStudentProfile = async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      if (data.success && data.student?.monthly_fee) {
        setMonthlyFee(Number(data.student.monthly_fee));
      }
    } catch (err) {
      // Use default
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchStudentProfile();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAlertInfo({ type: "error", message: "File size exceeds 5MB limit. Please upload a smaller image." });
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFilePreview(result);
      setFileUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleReceipt = () => {
    const sampleUrl = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60";
    setFileName(`BOC_Bank_Slip_${selectedMonth}.jpg`);
    setFileUrl(sampleUrl);
    setFilePreview(sampleUrl);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) {
      setAlertInfo({ type: "error", message: "Please select or upload a payment slip file." });
      return;
    }

    setIsUploading(true);
    try {
      const res = await fetch("/api/payments/upload-slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMonth: selectedMonth,
          fileUrl,
          fileName: fileName || `Deposit_Slip_${selectedMonth}.jpg`,
          amount: monthlyFee,
          mimeType: "image/jpeg",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAlertInfo({
          type: "success",
          message: `Payment slip for ${formatMonthName(selectedMonth)} submitted successfully! Waiting for admin verification.`,
        });
        setIsUploadModalOpen(false);
        resetUploadForm();
        fetchPayments();
      } else {
        setAlertInfo({ type: "error", message: data.message || "Failed to upload slip." });
      }
    } catch (err: any) {
      setAlertInfo({ type: "error", message: "Network error occurred." });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setFileName("");
    setFileUrl("");
    setFilePreview(null);
  };

  const openUploadForMonth = (monthCode: string) => {
    setSelectedMonth(monthCode);
    resetUploadForm();
    setIsUploadModalOpen(true);
  };

  const grouped = groupedMonths();
  const currentYearMonths = grouped.find((g) => g.year === yearFilter)?.months || [];

  // Merge payment records
  const monthRows = currentYearMonths.map((m) => {
    const found = payments.find((p) => p.payment_month === m.code);
    return {
      code: m.code,
      label: m.label,
      payment: found || null,
      status: found ? found.payment_status : "NOT PAID",
    };
  });

  const paidCount = payments.filter((p) => p.payment_status === "VERIFIED").length;
  const pendingCount = payments.filter((p) => p.payment_status === "SLIP UPLOADED").length;

  const allMonths = getAllMonthOptions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Monthly Tuition Payments
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Upload your bank deposit slips to unlock each month&apos;s learning materials.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPayments}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const now = new Date();
              const code = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
              openUploadForMonth(code);
            }}
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Upload Slip
          </Button>
        </div>
      </div>

      {alertInfo && (
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          onDismiss={() => setAlertInfo(null)}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Monthly Fee</p>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(monthlyFee)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Set by tutor</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Verified Payments</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{paidCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Materials unlocked</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Pending Review</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting verification</p>
        </div>
      </div>

      {/* Year filter tabs */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="flex flex-col gap-3 p-4 border-b border-slate-100 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              Academic Year Payment Schedule
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monthly tuition fee: <strong>{formatCurrency(monthlyFee)}</strong> (set by tutor)
            </p>
          </div>

          {/* Year selector */}
          <div className="flex items-center gap-1 flex-wrap">
            {grouped.map((g) => (
              <button
                key={g.year}
                onClick={() => setYearFilter(g.year)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  yearFilter === g.year
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {g.year}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile card view */}
        <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {monthRows.map((row) => (
            <div key={row.code} className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{row.label}</span>
                <Badge status={row.status} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Fee: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(monthlyFee)}</strong></span>
                {row.payment?.slip ? (
                  <button
                    onClick={() =>
                      setViewingSlip({
                        url: row.payment!.slip!.file_url,
                        month: row.label,
                        status: row.status,
                      })
                    }
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    <FileImage className="w-3.5 h-3.5" />
                    View Slip
                  </button>
                ) : (
                  <span className="text-slate-400 italic">No slip</span>
                )}
              </div>
              <div className="text-xs">
                {row.status === "VERIFIED" && (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified – Materials Unlocked!
                  </span>
                )}
                {row.status === "SLIP UPLOADED" && (
                  <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Slip Under Review
                  </span>
                )}
                {row.status === "REJECTED" && (
                  <span className="text-rose-700 dark:text-rose-400 font-semibold">
                    Rejected: {row.payment?.rejection_reason || "Please re-upload"}
                  </span>
                )}
                {row.status === "NOT PAID" && (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Pending payment
                  </span>
                )}
              </div>
              {row.status !== "VERIFIED" && (
                <Button
                  variant={row.status === "REJECTED" ? "danger" : "primary"}
                  size="sm"
                  onClick={() => openUploadForMonth(row.code)}
                  leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
                  className="w-full justify-center"
                >
                  {row.status === "SLIP UPLOADED"
                    ? "Re-upload Slip"
                    : row.status === "REJECTED"
                    ? "Fix & Re-upload"
                    : "Upload Slip"}
                </Button>
              )}
              {row.status === "VERIFIED" && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-200 dark:border-emerald-800 text-center">
                  Paid & Active
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-850 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Payment Month</th>
                <th className="px-6 py-4">Fee Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Uploaded Slip</th>
                <th className="px-6 py-4">Verification Remarks</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {monthRows.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{row.label}</td>

                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(monthlyFee)}
                  </td>

                  <td className="px-6 py-4">
                    <Badge status={row.status} />
                  </td>

                  <td className="px-6 py-4">
                    {row.payment?.slip ? (
                      <button
                        onClick={() =>
                          setViewingSlip({
                            url: row.payment!.slip!.file_url,
                            month: row.label,
                            status: row.status,
                          })
                        }
                        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        <FileImage className="w-4 h-4 text-indigo-500" />
                        <span>{row.payment.slip.file_name}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No slip uploaded</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-xs">
                    {row.status === "VERIFIED" && (
                      <div className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified – Materials Unlocked!
                      </div>
                    )}
                    {row.status === "SLIP UPLOADED" && (
                      <div className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Slip Under Review by Teacher
                      </div>
                    )}
                    {row.status === "REJECTED" && (
                      <div className="text-rose-700 dark:text-rose-400 font-semibold">
                        <span>Rejected: </span>
                        <span className="font-normal">{row.payment?.rejection_reason || "Please re-upload clearer slip"}</span>
                      </div>
                    )}
                    {row.status === "NOT PAID" && (
                      <div className="text-slate-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-slate-400" /> Pending payment
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {row.status === "VERIFIED" ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Paid & Active
                      </span>
                    ) : (
                      <Button
                        variant={row.status === "REJECTED" ? "danger" : "primary"}
                        size="sm"
                        onClick={() => openUploadForMonth(row.code)}
                        leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
                      >
                        {row.status === "SLIP UPLOADED"
                          ? "Re-upload Slip"
                          : row.status === "REJECTED"
                          ? "Fix & Re-upload"
                          : "Upload Slip"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Monthly Payment Slip"
        description="Select the tuition month and attach your bank receipt or online transfer screenshot"
        maxWidth="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Select Payment Month *
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              required
            >
              {grouped.map((g) => (
                <optgroup key={g.year} label={`── ${g.year} ──`}>
                  {g.months.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.label} — {formatCurrency(monthlyFee)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              Monthly tuition fee: <strong className="text-indigo-600 dark:text-indigo-400">{formatCurrency(monthlyFee)}</strong> (set by your teacher)
            </p>
          </div>

          {/* File Upload Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Payment Slip (JPG, PNG, PDF) *
            </label>

            <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 text-center bg-slate-50 dark:bg-slate-850 hover:border-indigo-400 transition-colors relative">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {filePreview ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-h-36 mx-auto rounded-lg shadow-sm object-contain"
                  />
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {fileName}
                  </p>
                  <span className="text-[11px] text-slate-400">Click to choose another file</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="mx-auto w-10 h-10 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Click to browse or drag &amp; drop slip image
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports JPG, PNG, or PDF up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Demo Test Slip Button */}
          <div className="rounded-xl bg-indigo-50/60 p-3 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900 flex items-center justify-between">
            <span className="text-xs text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Demo Slip (Assignment Testing)
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSampleReceipt}
              className="text-xs py-1"
            >
              Use Sample Slip
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isUploading}
              disabled={!fileUrl}
            >
              Submit for Verification
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Slip Modal */}
      <Modal
        isOpen={Boolean(viewingSlip)}
        onClose={() => setViewingSlip(null)}
        title={`Uploaded Slip – ${viewingSlip?.month}`}
        description={`Status: ${viewingSlip?.status}`}
        maxWidth="lg"
      >
        {viewingSlip && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-950 p-2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewingSlip.url}
                alt="Deposit Slip"
                className="max-h-[380px] w-auto mx-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setViewingSlip(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
