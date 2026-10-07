"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Key,
  Eye,
  CheckCircle2,
  XCircle,
  Phone,
  MessageSquare,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "@/views/components/Badge";
import { Button } from "@/views/components/Button";
import { Input } from "@/views/components/Input";
import { Modal } from "@/views/components/Modal";
import { Alert } from "@/views/components/Alert";
import { formatDate } from "@/lib/utils";
import { Student } from "@/models/types";

export const StudentListView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected student modals
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [newPassword, setNewPassword] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (statusFilter !== "all") query.set("status", statusFilter);

      const res = await fetch(`/api/students?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleToggleStatus = async (student: Student) => {
    const nextStatus = !student.is_active;
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_status", isActive: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        fetchStudents();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedStudent || !newPassword.trim()) return;

    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password", newPassword: newPassword.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Password reset successfully for ${selectedStudent.full_name}`);
        setIsPasswordModalOpen(false);
        setNewPassword("");
        fetchStudents();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage("Student details updated successfully.");
        setIsEditModalOpen(false);
        fetchStudents();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const openDetail = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const openEdit = (student: Student) => {
    setSelectedStudent(student);
    setEditForm({
      full_name: student.full_name,
      first_name: student.first_name,
      last_name: student.last_name,
      student_phone: student.student_phone,
      whatsapp_phone: student.whatsapp_phone,
      parent_phone: student.parent_phone,
      address: student.address,
      email: student.email || "",
      course_class: student.course_class,
    });
    setIsEditModalOpen(true);
  };

  const openPasswordModal = (student: Student) => {
    setSelectedStudent(student);
    setNewPassword("");
    setIsPasswordModalOpen(true);
  };

  const copyCreds = (student: Student) => {
    const text = `Username: ${student.username || student.first_name}\nDefault Password: ${student.initial_password_plain || "N/A"}`;
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Student Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View, search, edit student details, manage account status, and view login credentials.
          </p>
        </div>

        <Link href="/admin/students/register">
          <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
            Register New Student
          </Button>
        </Link>
      </div>

      {actionMessage && (
        <Alert
          type="success"
          message={actionMessage}
          onDismiss={() => setActionMessage(null)}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <Input
            placeholder="Search by Name, Student ID, NIC, or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-full"
          />
          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <Button
            variant="outline"
            size="md"
            onClick={fetchStudents}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        {students.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              No students found
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search query or filter options.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-850 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">NIC</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Username & Initial Pass</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {student.student_id}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {student.full_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        Joined: {formatDate(student.registration_date)}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {student.nic}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{student.student_phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{student.whatsapp_phone}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-slate-800 dark:text-slate-200">
                      {student.course_class}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {student.username || student.first_name}
                          </span>
                          <span className="block text-[11px] text-slate-400 font-mono">
                            {student.initial_password_plain || "••••••"}
                          </span>
                        </div>
                        <button
                          onClick={() => copyCreds(student)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="Copy login info"
                        >
                          {copiedId === student.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={student.is_active ? "ACTIVE" : "INACTIVE"} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetail(student)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEdit(student)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Information"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openPasswordModal(student)}
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(student)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            student.is_active
                              ? "text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          }`}
                          title={student.is_active ? "Deactivate Account" : "Activate Account"}
                        >
                          {student.is_active ? (
                            <XCircle className="w-4 h-4 text-rose-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Student Profile Overview"
        description="Comprehensive personal and contact records"
        maxWidth="lg"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedStudent.full_name}
                </h4>
                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                  {selectedStudent.student_id} • {selectedStudent.course_class}
                </p>
              </div>
              <Badge status={selectedStudent.is_active ? "ACTIVE" : "INACTIVE"} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-semibold">NIC Number</span>
                <p className="font-mono text-slate-800 dark:text-slate-200 font-bold">{selectedStudent.nic}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-semibold">Registered Date</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{formatDate(selectedStudent.registration_date)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-semibold">Student Phone</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedStudent.student_phone}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-semibold">WhatsApp Phone</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedStudent.whatsapp_phone}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-semibold">Parent / Guardian Phone</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedStudent.parent_phone}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-semibold">Email</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedStudent.email || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-400 uppercase font-semibold">Residential Address</span>
              <p className="text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                {selectedStudent.address}
              </p>
            </div>

            {selectedStudent.additional_details && (
              <div className="space-y-1 text-xs">
                <span className="text-slate-400 uppercase font-semibold">Additional Details</span>
                <p className="text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  {selectedStudent.additional_details}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Information"
        description="Update personal or contact details"
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          <Input
            label="Full Name"
            value={editForm.full_name || ""}
            onChange={(e) => setEditForm((prev) => ({ ...prev, full_name: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Student Phone"
              value={editForm.student_phone || ""}
              onChange={(e) => setEditForm((prev) => ({ ...prev, student_phone: e.target.value }))}
              required
            />
            <Input
              label="WhatsApp Phone"
              value={editForm.whatsapp_phone || ""}
              onChange={(e) => setEditForm((prev) => ({ ...prev, whatsapp_phone: e.target.value }))}
              required
            />
          </div>

          <Input
            label="Parent / Guardian Phone"
            value={editForm.parent_phone || ""}
            onChange={(e) => setEditForm((prev) => ({ ...prev, parent_phone: e.target.value }))}
            required
          />

          <Input
            label="Address"
            value={editForm.address || ""}
            onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
            required
          />

          <Input
            label="Course / Class"
            value={editForm.course_class || ""}
            onChange={(e) => setEditForm((prev) => ({ ...prev, course_class: e.target.value }))}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Reset Student Password"
        description={`Set a new login password for ${selectedStudent?.full_name}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="New Password"
            placeholder="Enter new password (e.g. NewPass@2027)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <p className="text-xs text-slate-500">
            Once reset, the student will be required to use this new password to sign into the LMS.
          </p>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleResetPassword} disabled={!newPassword.trim()}>
              Reset Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
