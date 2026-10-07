"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  CreditCard,
  Mail,
  Shield,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/views/components/Badge";
import { formatDate } from "@/lib/utils";
import { Student } from "@/models/types";

export const StudentProfileView: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/students");
        const data = await res.json();
        if (data.success) {
          setStudent(data.student);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading student profile...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-20 text-center text-rose-500">
        Student profile not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          My Student Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your official academic registration and contact details recorded in the tuition system.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-indigo-700 to-violet-800 p-8 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white text-2xl font-bold border border-white/20">
              {student.first_name[0]}
              {student.last_name[0]}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {student.full_name}
              </h2>
              <p className="text-xs text-indigo-200 font-mono mt-0.5">
                Student ID: {student.student_id} • Username: @{student.username || student.first_name}
              </p>
            </div>
          </div>

          <Badge status={student.is_active ? "ACTIVE" : "INACTIVE"} className="self-start sm:self-auto" />
        </div>

        {/* Info Grid */}
        <div className="p-8 space-y-8">
          {/* Academic Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Academic &amp; Enrollment Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">Enrolled Course</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                  {student.course_class}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">NIC Number</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white mt-1 block">
                  {student.nic}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">Registration Date</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 mt-1 block">
                  {formatDate(student.registration_date)}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">Student Phone</span>
                <span className="font-medium text-slate-900 dark:text-white mt-1 block flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" /> {student.student_phone}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">WhatsApp Number</span>
                <span className="font-medium text-slate-900 dark:text-white mt-1 block flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> {student.whatsapp_phone}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">Parent / Guardian Phone</span>
                <span className="font-medium text-slate-900 dark:text-white mt-1 block flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-500" /> {student.parent_phone}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">Email Address</span>
                <span className="font-medium text-slate-900 dark:text-white mt-1 block flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {student.email || "No email provided"}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">Residential Address</span>
                <span className="font-medium text-slate-900 dark:text-white mt-1 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {student.address}
                </span>
              </div>
            </div>
          </div>

          {/* Account Security Notice */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                Security &amp; Privacy Notice:
              </span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Your profile information is accessible only to you and your authorized tuition administrator. If you need to update your phone number or residential address, please notify your teacher.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
