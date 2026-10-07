"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Lock,
  CheckCircle2,
  Video,
  FileText,
  FileUp,
  ExternalLink,
  UploadCloud,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/views/components/Badge";
import { Button } from "@/views/components/Button";
import { Modal } from "@/views/components/Modal";
import { formatMonthName, getAllMonthOptions, formatDate } from "@/lib/utils";
import { LearningMaterial } from "@/models/types";

export const StudentMaterialsView: React.FC = () => {
  const searchParams = useSearchParams();
  const now = new Date();
  const currentMonthCode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const initialMonth = searchParams.get("month") || currentMonthCode;

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [isMonthVerified, setIsMonthVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Note Reader & Video Preview Modal
  const [readingMaterial, setReadingMaterial] = useState<LearningMaterial | null>(null);

  const fetchMaterials = async (monthCode: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/materials?month=${monthCode}`);
      const data = await res.json();
      if (data.success) {
        setMaterials(data.materials || []);
        setIsMonthVerified(Boolean(data.isMonthVerified));
      }
    } catch (err) {
      console.error("Failed to load materials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials(selectedMonth);
  }, [selectedMonth]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Learning Management System (LMS)
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Access lecture notes, recorded stream videos, and downloadable worksheets for verified months.
        </p>
      </div>

      {/* Month Selection Dropdown */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Select Month:</span>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
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

      {/* Month Verification Status Banner */}
      <div
        className={`rounded-3xl p-6 border transition-all ${
          isMonthVerified
            ? "bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900"
            : "bg-amber-50/80 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            {isMonthVerified ? (
              <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {formatMonthName(selectedMonth)} Learning Content
                </h3>
                <Badge status={isMonthVerified ? "VERIFIED" : "LOCKED"} />
              </div>

              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {isMonthVerified
                  ? "Tuition payment verified! All lecture materials and lesson recordings are fully unlocked."
                  : "Please complete and verify your monthly tuition payment to access and view these materials."}
              </p>
            </div>
          </div>

          {!isMonthVerified && (
            <Link href="/student/payments">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UploadCloud className="w-4 h-4" />}
                className="shadow-sm"
              >
                Upload {formatMonthName(selectedMonth)} Slip
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Materials Content Section */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          Loading learning materials...
        </div>
      ) : !isMonthVerified ? (
        /* LOCKED STATE (Section 12, 14 Requirement) */
        <div className="rounded-3xl bg-white p-12 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Materials Locked for {formatMonthName(selectedMonth)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              In accordance with tuition policy, learning materials for {formatMonthName(selectedMonth)} remain strictly locked until your payment slip has been verified by the teacher.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/student/payments">
              <Button variant="primary" leftIcon={<UploadCloud className="w-4 h-4" />}>
                Go to Payment &amp; Slip Upload
              </Button>
            </Link>
          </div>
        </div>
      ) : materials.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-center">
          <BookOpen className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            No materials uploaded for {formatMonthName(selectedMonth)} yet
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Your instructor will be publishing new content shortly.
          </p>
        </div>
      ) : (
        /* UNLOCKED MATERIALS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-900 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge status={item.material_type} />
                  <span className="text-[11px] text-slate-400">
                    {formatDate(item.created_at)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {item.material_type === "NOTE" && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full font-bold"
                    onClick={() => setReadingMaterial(item)}
                    leftIcon={<FileText className="w-4 h-4" />}
                  >
                    Open Lecture Note
                  </Button>
                )}

                {item.material_type === "LINK" && item.link && (
                  <a
                    href={item.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full font-bold bg-purple-600 hover:bg-purple-700 shadow-purple-200"
                      leftIcon={<Video className="w-4 h-4" />}
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Watch Video Lecture
                    </Button>
                  </a>
                )}

                {item.material_type === "FILE" && item.attachment && (
                  <a
                    href={item.attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full font-bold bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                      leftIcon={<FileUp className="w-4 h-4" />}
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Download Worksheet / PDF
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Note Reader Modal */}
      <Modal
        isOpen={Boolean(readingMaterial)}
        onClose={() => setReadingMaterial(null)}
        title={readingMaterial?.title || "Lecture Note"}
        description={`Published for ${formatMonthName(readingMaterial?.payment_month || "")} • ${readingMaterial?.course_class}`}
        maxWidth="3xl"
      >
        {readingMaterial?.note && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-850 p-6 border border-slate-200 dark:border-slate-700 max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                {readingMaterial.note.content}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setReadingMaterial(null)}>
                Close Note
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
