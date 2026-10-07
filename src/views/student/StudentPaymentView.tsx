"use client";

import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  Clock,
  XCircle,
  FileImage,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Lock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/views/components/Badge";
import { Button } from "@/views/components/Button";
import { Modal } from "@/views/components/Modal";
import { Alert } from "@/views/components/Alert";
import { Input } from "@/views/components/Input";
import { formatCurrency, formatDate, formatDateTime, formatMonthName, getUpcomingMonths } from "@/lib/utils";
import { Payment } from "@/models/types";

export const StudentPaymentView: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("2027-02");
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

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAlertInfo({ type: "error", message: "File size exceeds 5MB limit. Please upload a smaller image." });
      return;
    }

    setFileName(file.name);

    // Create browser base64 data preview
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
          amount: 4500.0,
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

  // Compile months array (upcoming 6 months) and merge with existing payment records
  const allMonths = getUpcomingMonths(6).map((m) => {
    const found = payments.find((p) => p.payment_month === m.code);
    return {
      code: m.code,
      label: m.label,
      payment: found || null,
      status: found ? found.payment_status : "NOT PAID",
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Monthly Tuition Payments &amp; Slip Upload
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Upload your bank deposit slips or online transfer receipts to unlock each month&apos;s learning materials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPayments}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Status
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => openUploadForMonth("2027-02")}
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Upload Payment Slip
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

      {/* Payment Month Records Table */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Academic Year 2027 – Tuition Schedule
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monthly tuition fee: <strong>LKR 4,500.00</strong>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-850 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Payment Month</th>
                <th className="px-6 py-4">Fee Amount</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4">Uploaded Slip</th>
                <th className="px-6 py-4">Verification Status &amp; Remarks</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {allMonths.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    {row.label}
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(4500.0)}
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
                        Paid &amp; Active
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
              {getUpcomingMonths(6).map((m) => (
                <option key={m.code} value={m.code}>
                  {m.label} – LKR 4,500.00
                </option>
              ))}
            </select>
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
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Instant Demo Slip Sample
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSampleReceipt}
              className="text-xs py-1"
            >
              Use Sample Bank Slip
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
              Submit Slip for Verification
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
