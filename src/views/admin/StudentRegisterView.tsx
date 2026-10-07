"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  ArrowLeft,
  Copy,
  Check,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/views/components/Button";
import { Input } from "@/views/components/Input";
import { Modal } from "@/views/components/Modal";
import { Alert } from "@/views/components/Alert";
import { GeneratedCredentials, StudentRegistrationInput } from "@/models/types";

export const StudentRegisterView: React.FC = () => {
  const [formData, setFormData] = useState<StudentRegistrationInput>({
    studentId: `STU-2027-00${Math.floor(Math.random() * 900) + 100}`,
    fullName: "",
    firstName: "",
    lastName: "",
    nic: "",
    studentPhone: "",
    whatsappPhone: "",
    parentPhone: "",
    address: "",
    email: "",
    courseClass: "Combined Maths 2027 A/L",
    registrationDate: new Date().toISOString().split("T")[0],
    additionalDetails: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Modal state for generated credentials
  const [generatedCreds, setGeneratedCreds] = useState<GeneratedCredentials | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleChange = (field: keyof StudentRegistrationInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-level error on edit
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Auto-split first & last name when Full Name is typed
  const handleFullNameChange = (val: string) => {
    setFormData((prev) => {
      const parts = val.trim().split(/\s+/);
      const first = parts[0] || "";
      const last = parts.length > 1 ? parts[parts.length - 1] : "";
      return {
        ...prev,
        fullName: val,
        firstName: prev.firstName || first,
        lastName: prev.lastName || last,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError(null);
    setErrors({});

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) {
          setErrors(data.errors);
        }
        setServerError(data.message || "Failed to register student. Please check the form.");
        setIsSubmitting(false);
        return;
      }

      // Show the generated credentials card modal immediately!
      setGeneratedCreds(data.credentials);
    } catch (err: any) {
      setServerError("A network error occurred while submitting the registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedCreds) return;
    const text = `Tuition LMS Credentials:\nStudent Name: ${generatedCreds.fullName}\nStudent ID: ${generatedCreds.studentId}\nUsername: ${generatedCreds.username}\nPassword: ${generatedCreds.passwordPlain}\nPortal URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const resetForm = () => {
    setFormData({
      studentId: `STU-2027-00${Math.floor(Math.random() * 900) + 100}`,
      fullName: "",
      firstName: "",
      lastName: "",
      nic: "",
      studentPhone: "",
      whatsappPhone: "",
      parentPhone: "",
      address: "",
      email: "",
      courseClass: "Combined Maths 2027 A/L",
      registrationDate: new Date().toISOString().split("T")[0],
      additionalDetails: "",
    });
    setGeneratedCreds(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Student List
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Register New Student
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter student details. The system will automatically generate their username & initial password.
          </p>
        </div>
      </div>

      {serverError && (
        <Alert
          type="error"
          message={serverError}
          onDismiss={() => setServerError(null)}
        />
      )}

      {/* Registration Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-8"
      >
        {/* Section 1: Academic & Identification */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <span>1. Identification & Enrollment</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Input
              label="Student ID"
              placeholder="e.g. STU-2027-001"
              value={formData.studentId}
              onChange={(e) => handleChange("studentId", e.target.value)}
              error={errors.studentId}
              helperText="Format: STU-YYYY-XXX"
              required
            />

            <Input
              label="NIC Number"
              placeholder="e.g. 200012345678 or 987654321V"
              value={formData.nic}
              onChange={(e) => handleChange("nic", e.target.value)}
              error={errors.nic}
              helperText="12-digit or 9-digit+V/X"
              required
            />

            <Input
              label="Course / Class"
              value={formData.courseClass}
              onChange={(e) => handleChange("courseClass", e.target.value)}
              error={errors.courseClass}
              required
            />
          </div>
        </div>

        {/* Section 2: Personal Details */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            2. Student Personal Information
          </h3>

          <div className="space-y-5">
            <Input
              label="Full Name"
              placeholder="e.g. Kavindu Sangeeth Silpage"
              value={formData.fullName}
              onChange={(e) => handleFullNameChange(e.target.value)}
              error={errors.fullName}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="First Name"
                placeholder="e.g. Kavindu"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                error={errors.firstName}
                helperText="Used as login username"
                required
              />

              <Input
                label="Last Name"
                placeholder="e.g. Silpage"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                error={errors.lastName}
                helperText="Used in password generation formula"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Contact Details */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            3. Contact & Communication
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Input
              label="Student Phone"
              placeholder="e.g. 0712345678"
              value={formData.studentPhone}
              onChange={(e) => handleChange("studentPhone", e.target.value)}
              error={errors.studentPhone}
              required
            />

            <Input
              label="WhatsApp Phone"
              placeholder="e.g. 0712345678"
              value={formData.whatsappPhone}
              onChange={(e) => handleChange("whatsappPhone", e.target.value)}
              error={errors.whatsappPhone}
              required
            />

            <Input
              label="Parent / Guardian Phone"
              placeholder="e.g. 0779876543"
              value={formData.parentPhone}
              onChange={(e) => handleChange("parentPhone", e.target.value)}
              error={errors.parentPhone}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
            <Input
              label="Residential Address"
              placeholder="e.g. No. 45, Temple Road, Nugegoda"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              error={errors.address}
              required
            />

            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="e.g. student@gmail.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
            />
          </div>
        </div>

        {/* Section 4: Extra Details */}
        <div>
          <Input
            label="Additional Notes / Remarks"
            placeholder="e.g. Recommended by student batch 2026, special discount, etc."
            value={formData.additionalDetails}
            onChange={(e) => handleChange("additionalDetails", e.target.value)}
          />
        </div>

        {/* Password Formula Notice */}
        <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-4 text-xs text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-300 flex items-start gap-3">
          <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">Automatic Credential Generation Notice:</span>
            <p className="mt-0.5 leading-relaxed">
              Upon submitting this form, the system generates the student login username from the <strong>First Name</strong>, and the password as <strong>Last 3 chars of Last Name + &quot;@&quot; + First 3 digits of NIC</strong>. You can copy and share the credentials immediately after registration.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link href="/admin/students">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Register Student & Generate Credentials
          </Button>
        </div>
      </form>

      {/* Generated Credentials Success Modal (Section 4 Requirement) */}
      <Modal
        isOpen={Boolean(generatedCreds)}
        onClose={() => resetForm()}
        title="Student Registered Successfully!"
        description="Please copy and provide the following login credentials to the student."
        maxWidth="lg"
      >
        {generatedCreds && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Account Created in System</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Student record has been saved and initial monthly payment record initialized.
                </p>
              </div>
            </div>

            {/* Credential Box */}
            <div className="rounded-2xl bg-slate-900 p-6 text-white border border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Student Login Credentials
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {generatedCreds.studentId}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 block">Student Name:</span>
                  <span className="text-base font-bold text-white">{generatedCreds.fullName}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                      Username:
                    </span>
                    <span className="text-lg font-mono font-bold text-indigo-400">
                      {generatedCreds.username}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                      Password:
                    </span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {generatedCreds.passwordPlain}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full font-bold"
                  onClick={copyToClipboard}
                  leftIcon={isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                  {isCopied ? "Copied Credentials to Clipboard!" : "Copy Student Credentials to Clipboard"}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => resetForm()}
              >
                Register Another Student
              </Button>
              <Link href="/admin/students">
                <Button variant="primary">
                  View All Students
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
