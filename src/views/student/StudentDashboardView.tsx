"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  UploadCloud,
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/views/components/Button";
import { Badge } from "@/views/components/Badge";
import { formatCurrency, formatMonthName } from "@/lib/utils";
import { Payment, Student } from "@/models/types";

export const StudentDashboardView: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const [profileRes, paymentsRes] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/payments"),
        ]);

        const profileData = await profileRes.json();
        const paymentsData = await paymentsRes.json();

        if (profileData.success) setStudent(profileData.student);
        if (paymentsData.success) setPayments(paymentsData.payments || []);
      } catch (err) {
        console.error("Student dashboard load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudentData();
  }, []);

  const janPayment = payments.find((p) => p.payment_month === "2027-01");
  const febPayment = payments.find((p) => p.payment_month === "2027-02");
  const marPayment = payments.find((p) => p.payment_month === "2027-03");

  const verifiedCount = payments.filter((p) => p.payment_status === "VERIFIED").length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Academic Year 2027 • {student?.course_class || "Combined Mathematics A/L"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Hello, {student?.first_name || "Student"}!
          </h1>
          <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed">
            Welcome to your digital tuition portal. Make sure your monthly payment slips are uploaded and verified to gain uninterrupted access to lecture notes, recorded masterclasses, and assignment worksheets.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/student/payments">
              <Button
                variant="primary"
                className="bg-white text-indigo-900 hover:bg-slate-100 font-bold shadow-lg"
                leftIcon={<UploadCloud className="w-4 h-4 text-indigo-600" />}
              >
                Upload Monthly Slip
              </Button>
            </Link>

            <Link href="/student/materials">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Access Learning Materials
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Monthly Access & Fee Status Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Monthly Tuition &amp; Content Access Status
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Learning materials are strictly unlocked upon teacher verification of your monthly bank receipt.
            </p>
          </div>
          <Link href="/student/payments" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            View All Months →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* January 2027 */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono uppercase text-slate-400">
                  Month 01
                </span>
                <Badge status={janPayment?.payment_status || "NOT PAID"} />
              </div>

              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                January 2027
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tuition Fee: {formatCurrency(4500.0)}
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 text-xs">
                {janPayment?.payment_status === "VERIFIED" ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> All Lecture Notes &amp; Videos Unlocked
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-500" /> Materials Locked
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {janPayment?.payment_status === "VERIFIED" ? (
                <Link href="/student/materials?month=2027-01">
                  <Button variant="primary" size="sm" className="w-full" leftIcon={<BookOpen className="w-4 h-4" />}>
                    Open January LMS
                  </Button>
                </Link>
              ) : (
                <Link href="/student/payments">
                  <Button variant="outline" size="sm" className="w-full" leftIcon={<UploadCloud className="w-4 h-4" />}>
                    Upload Deposit Slip
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* February 2027 */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono uppercase text-slate-400">
                  Month 02
                </span>
                <Badge status={febPayment?.payment_status || "NOT PAID"} />
              </div>

              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                February 2027
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tuition Fee: {formatCurrency(4500.0)}
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 text-xs">
                {febPayment?.payment_status === "VERIFIED" ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> All Lecture Notes &amp; Videos Unlocked
                  </span>
                ) : febPayment?.payment_status === "SLIP UPLOADED" ? (
                  <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Slip Uploaded – Awaiting Teacher Verification
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-500" /> Materials Locked
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {febPayment?.payment_status === "VERIFIED" ? (
                <Link href="/student/materials?month=2027-02">
                  <Button variant="primary" size="sm" className="w-full" leftIcon={<BookOpen className="w-4 h-4" />}>
                    Open February LMS
                  </Button>
                </Link>
              ) : (
                <Link href="/student/payments">
                  <Button variant="primary" size="sm" className="w-full" leftIcon={<UploadCloud className="w-4 h-4" />}>
                    {febPayment?.payment_status === "SLIP UPLOADED" ? "View Uploaded Slip" : "Upload February Slip"}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* March 2027 */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono uppercase text-slate-400">
                  Month 03
                </span>
                <Badge status={marPayment?.payment_status || "NOT PAID"} />
              </div>

              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                March 2027
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tuition Fee: {formatCurrency(4500.0)}
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 text-xs">
                {marPayment?.payment_status === "VERIFIED" ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> All Lecture Notes &amp; Videos Unlocked
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-400" /> Payment Required for Access
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link href="/student/payments">
                <Button variant="outline" size="sm" className="w-full" leftIcon={<UploadCloud className="w-4 h-4" />}>
                  Upload March Slip
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
