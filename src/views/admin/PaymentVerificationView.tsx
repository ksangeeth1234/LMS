"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  FileImage,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Clock,
  Eye,
} from "lucide-react";
import { Badge } from "@/views/components/Badge";
import { Button } from "@/views/components/Button";
import { Modal } from "@/views/components/Modal";
import { Alert } from "@/views/components/Alert";
import { Input } from "@/views/components/Input";
import { formatCurrency, formatDate, formatDateTime, formatMonthName, getUpcomingMonths } from "@/lib/utils";
import { Payment } from "@/models/types";

export const PaymentVerificationView: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("SLIP UPLOADED");
  const [monthFilter, setMonthFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Slip preview & action modal state
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [verificationRemarks, setVerificationRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "ALL") query.set("status", statusFilter);
      if (monthFilter !== "ALL") query.set("month", monthFilter);
      if (search) query.set("search", search);

      const res = await fetch(`/api/payments?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, monthFilter]);

  const handleVerify = async (payment: Payment) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.id,
          action: "VERIFY",
          remarks: verificationRemarks || "Bank deposit slip verified. Full access granted.",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAlertInfo({
          type: "success",
          message: `Payment verified for ${payment.student?.full_name} (${formatMonthName(payment.payment_month)}). Monthly materials are now unlocked!`,
        });
        setIsPreviewOpen(false);
        fetchPayments();
      } else {
        setAlertInfo({ type: "error", message: data.message || "Failed to verify payment." });
      }
    } catch (err: any) {
      setAlertInfo({ type: "error", message: "Network error occurred." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          action: "REJECT",
          rejectionReason: rejectionReason.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAlertInfo({
          type: "success",
          message: `Payment slip rejected for ${selectedPayment.student?.full_name}. Student notified with the reason.`,
        });
        setIsRejectModalOpen(false);
        setIsPreviewOpen(false);
        setRejectionReason("");
        fetchPayments();
      } else {
        setAlertInfo({ type: "error", message: data.message || "Failed to reject payment." });
      }
    } catch (err: any) {
      setAlertInfo({ type: "error", message: "Network error occurred." });
    } finally {
      setIsProcessing(false);
    }
  };

  const openSlipReview = (payment: Payment) => {
    setSelectedPayment(payment);
    setVerificationRemarks("");
    setRejectionReason("Slip image is unclear or transaction reference is missing. Please upload a clear receipt.");
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Payment Slip Verification
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review uploaded bank receipts. Approving will automatically unlock the student&apos;s monthly learning materials.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchPayments}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh List
        </Button>
      </div>

      {alertInfo && (
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          onDismiss={() => setAlertInfo(null)}
        />
      )}

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search student name, ID or NIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Button variant="secondary" onClick={fetchPayments}>
            Filter
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="SLIP UPLOADED">Pending Slips Only</option>
            <option value="VERIFIED">Verified Payments</option>
            <option value="REJECTED">Rejected Slips</option>
            <option value="NOT PAID">Unpaid / Missing Slips</option>
            <option value="ALL">All Statuses</option>
          </select>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All Months</option>
            {getUpcomingMonths(6).map((m) => (
              <option key={m.code} value={m.code}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        {payments.length === 0 ? (
          <div className="py-16 text-center">
            <CheckSquare className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              No payments match the selected criteria
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try switching the status filter or month selection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-850 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Payment Month</th>
                  <th className="px-6 py-4">Fee Amount</th>
                  <th className="px-6 py-4">Payment Slip</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Verification Info</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {payment.student?.full_name}
                      </div>
                      <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                        {payment.student?.student_id} • {payment.student?.student_phone}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                      {formatMonthName(payment.payment_month)}
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="px-6 py-4">
                      {payment.slip ? (
                        <button
                          onClick={() => openSlipReview(payment)}
                          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold dark:text-indigo-400 hover:underline"
                        >
                          <FileImage className="w-4 h-4 text-indigo-500" />
                          <span>{payment.slip.file_name || "View Deposit Slip"}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No slip uploaded</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={payment.payment_status} />
                    </td>

                    <td className="px-6 py-4 text-xs">
                      {payment.payment_status === "VERIFIED" && (
                        <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                          Verified on {formatDateTime(payment.verified_at)}
                        </div>
                      )}
                      {payment.payment_status === "REJECTED" && (
                        <div className="text-rose-700 dark:text-rose-400 font-medium">
                          Reason: {payment.rejection_reason}
                        </div>
                      )}
                      {payment.payment_status === "SLIP UPLOADED" && (
                        <div className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Review
                        </div>
                      )}
                      {payment.payment_status === "NOT PAID" && (
                        <div className="text-slate-400">Pending Student Upload</div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {payment.payment_status === "SLIP UPLOADED" ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openSlipReview(payment)}
                          leftIcon={<Eye className="w-4 h-4" />}
                        >
                          Review & Verify
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSlipReview(payment)}
                        >
                          View Details
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slip Review Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Payment Slip Review"
        description={`Reviewing tuition deposit for ${selectedPayment?.student?.full_name}`}
        maxWidth="2xl"
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* Meta Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block uppercase font-semibold">Student</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedPayment.student?.full_name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold">Month</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatMonthName(selectedPayment.payment_month)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold">Amount</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedPayment.amount)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold">Current Status</span>
                <Badge status={selectedPayment.payment_status} />
              </div>
            </div>

            {/* Slip Image Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Uploaded Slip Image / Document
              </span>
              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-950 flex flex-col items-center justify-center p-2 min-h-[260px] max-h-[420px]">
                {selectedPayment.slip?.file_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedPayment.slip.file_url}
                      alt="Bank Deposit Slip"
                      className="max-h-[380px] w-auto object-contain rounded-lg"
                    />
                    <a
                      href={selectedPayment.slip.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs font-medium backdrop-blur-sm transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Full Image
                    </a>
                  </>
                ) : (
                  <div className="text-center p-8 text-slate-400">
                    <FileImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No payment slip file attached to this record.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="danger"
                onClick={() => setIsRejectModalOpen(true)}
                leftIcon={<XCircle className="w-4 h-4" />}
                disabled={isProcessing}
              >
                Reject Slip
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </Button>

                <Button
                  variant="success"
                  onClick={() => handleVerify(selectedPayment)}
                  isLoading={isProcessing}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Verify & Unlock Materials
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Payment Slip"
        description="Provide a clear explanation to the student for the rejection"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-900 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>The student will see this rejection reason in their portal and will be allowed to upload a new slip.</span>
          </div>

          <Input
            label="Rejection Reason"
            placeholder="e.g. Slip is blurry, deposit amount does not match, etc."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              isLoading={isProcessing}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
