"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Video,
  FileText,
  FileUp,
  Trash2,
  ExternalLink,
  RefreshCw,
  Eye,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { Badge } from "@/views/components/Badge";
import { Button } from "@/views/components/Button";
import { Input } from "@/views/components/Input";
import { Modal } from "@/views/components/Modal";
import { Alert } from "@/views/components/Alert";
import { formatMonthName, getUpcomingMonths, formatDate } from "@/lib/utils";
import { LearningMaterial, MaterialType } from "@/models/types";

export const MaterialManagerView: React.FC = () => {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState("ALL");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<MaterialType>("NOTE");
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Add Form State
  const [formMonth, setFormMonth] = useState("2027-01");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formPlatform, setFormPlatform] = useState("YouTube");
  const [formContent, setFormContent] = useState("");
  const [formFileUrl, setFormFileUrl] = useState("");
  const [formFileName, setFormFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (monthFilter !== "ALL") query.set("month", monthFilter);

      const res = await fetch(`/api/materials?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMaterials(data.materials || []);
      }
    } catch (err) {
      console.error("Fetch materials error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [monthFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        paymentMonth: formMonth,
        title: formTitle,
        description: formDesc,
        materialType: selectedType,
        courseClass: "Combined Maths 2027 A/L",
        url: formUrl,
        platform: formPlatform,
        content: formContent,
        fileUrl: formFileUrl || (selectedType === "FILE" ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" : undefined),
        fileName: formFileName || (selectedType === "FILE" ? `${formTitle.replace(/\s+/g, "_")}.pdf` : undefined),
        isPublished: true,
      };

      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setAlertInfo({ type: "success", message: `Learning ${selectedType.toLowerCase()} published successfully!` });
        setIsAddModalOpen(false);
        resetForm();
        fetchMaterials();
      } else {
        setAlertInfo({ type: "error", message: data.message || "Failed to create material." });
      }
    } catch (err: any) {
      setAlertInfo({ type: "error", message: "Network error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this learning material?")) return;

    try {
      const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAlertInfo({ type: "success", message: "Learning material deleted." });
        fetchMaterials();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDesc("");
    setFormUrl("");
    setFormContent("");
    setFormFileUrl("");
    setFormFileName("");
  };

  const openAddWithType = (type: MaterialType) => {
    setSelectedType(type);
    resetForm();
    setIsAddModalOpen(true);
  };

  const openPreview = (mat: LearningMaterial) => {
    setSelectedMaterial(mat);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Learning Materials Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Publish lecture notes, video masterclass links, and downloadable tutorial sheets categorized by month.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openAddWithType("NOTE")}
            leftIcon={<FileText className="w-4 h-4 text-indigo-500" />}
          >
            Add Note
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => openAddWithType("LINK")}
            leftIcon={<Video className="w-4 h-4 text-purple-500" />}
          >
            Add Video Link
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => openAddWithType("FILE")}
            leftIcon={<FileUp className="w-4 h-4 text-emerald-300" />}
          >
            Add PDF / File
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

      {/* Filter Bar */}
      <div className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Filter Month:
          </span>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All Available Months</option>
            {getUpcomingMonths(6).map((m) => (
              <option key={m.code} value={m.code}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchMaterials}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <BookOpen className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            No learning materials for this month
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Click &apos;Add Note&apos;, &apos;Add Video Link&apos;, or &apos;Add PDF / File&apos; to publish content.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Badge status={item.material_type} />
                  <span className="text-[11px] font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                    {formatMonthName(item.payment_month)}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {formatDate(item.created_at)}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openPreview(item)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Preview
                  </Button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Delete Material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Material Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add New ${selectedType === "NOTE" ? "Lecture Note" : selectedType === "LINK" ? "Video / Resource Link" : "Downloadable File"}`}
        description="This content will automatically unlock for students who complete and verify payment for the selected month."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Material Type Selector */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(["NOTE", "LINK", "FILE"] as MaterialType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedType === type
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                {type === "NOTE" && "📘 Note"}
                {type === "LINK" && "🎥 Video Link"}
                {type === "FILE" && "📄 PDF / File"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Payment Month *
              </label>
              <select
                value={formMonth}
                onChange={(e) => setFormMonth(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                required
              >
                {getUpcomingMonths(6).map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.label} ({m.code})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Title *"
              placeholder="e.g. Week 01 – Introduction to Limits"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
          </div>

          <Input
            label="Brief Description"
            placeholder="e.g. Theoretical foundation and worked examples"
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
          />

          {/* Conditional Fields based on Material Type */}
          {selectedType === "LINK" && (
            <div className="space-y-4">
              <Input
                label="Resource / Stream URL *"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Platform
                </label>
                <select
                  value={formPlatform}
                  onChange={(e) => setFormPlatform(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="YouTube">YouTube</option>
                  <option value="Google Drive">Google Drive</option>
                  <option value="Zoom Recording">Zoom Recording</option>
                  <option value="External LMS">External Portal</option>
                </select>
              </div>
            </div>
          )}

          {selectedType === "NOTE" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Note Lesson Content (Markdown Supported) *
              </label>
              <textarea
                rows={8}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="# Chapter Title&#10;&#10;## Key Concept&#10;Write comprehensive lesson notes here with mathematical proofs and worked problems..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                required
              />
            </div>
          )}

          {selectedType === "FILE" && (
            <div className="space-y-4">
              <Input
                label="File Name"
                placeholder="e.g. Pure_Maths_Tutorial_Sheet_01.pdf"
                value={formFileName}
                onChange={(e) => setFormFileName(e.target.value)}
              />
              <Input
                label="File Download / Storage URL *"
                placeholder="https://your-storage.supabase.co/... or external PDF URL"
                value={formFileUrl}
                onChange={(e) => setFormFileUrl(e.target.value)}
                helperText="Leave empty to use sample university PDF file"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Publish Learning Content
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={selectedMaterial?.title || "Material Preview"}
        description={`${selectedMaterial?.material_type} • Required Month: ${formatMonthName(selectedMaterial?.payment_month || "")}`}
        maxWidth="3xl"
      >
        {selectedMaterial && (
          <div className="space-y-6">
            {selectedMaterial.material_type === "NOTE" && selectedMaterial.note && (
              <div className="prose dark:prose-invert max-w-none rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-6 border border-slate-200 dark:border-slate-700 max-h-[450px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 dark:text-slate-200">
                  {selectedMaterial.note.content}
                </pre>
              </div>
            )}

            {selectedMaterial.material_type === "LINK" && selectedMaterial.link && (
              <div className="rounded-2xl bg-slate-900 p-6 text-white text-center space-y-4">
                <Video className="w-12 h-12 text-indigo-400 mx-auto" />
                <h4 className="text-base font-bold">External Stream Link</h4>
                <p className="text-xs text-slate-400 font-mono break-all">
                  {selectedMaterial.link.url}
                </p>
                <a
                  href={selectedMaterial.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Open In New Tab
                </a>
              </div>
            )}

            {selectedMaterial.material_type === "FILE" && selectedMaterial.attachment && (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-6 border border-slate-200 dark:border-slate-700 text-center space-y-4">
                <FileUp className="w-12 h-12 text-blue-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedMaterial.attachment.file_name}
                </h4>
                <a
                  href={selectedMaterial.attachment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Download / View File
                </a>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setIsPreviewModalOpen(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
