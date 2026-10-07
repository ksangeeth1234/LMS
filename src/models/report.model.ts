import { StudentModel } from "./student.model";
import { PaymentModel } from "./payment.model";
import { MaterialModel } from "./material.model";

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  pendingSlips: number;
  verifiedPayments: number;
  pendingPayments: number;
  rejectedPayments: number;
  totalRevenue: number;
  totalMaterials: number;
  notesCount: number;
  linksCount: number;
  filesCount: number;
}

export interface MonthlyReportRow {
  month: string;
  totalExpected: number;
  totalCollected: number;
  verifiedCount: number;
  pendingSlipCount: number;
  unpaidCount: number;
  rejectedCount: number;
}

export class ReportModel {
  /**
   * Compute comprehensive system dashboard metrics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const [students, payments, materials] = await Promise.all([
      StudentModel.getAll(),
      PaymentModel.getAll(),
      MaterialModel.getAllForAdmin(),
    ]);

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.is_active).length;

    const pendingSlips = payments.filter((p) => p.payment_status === "SLIP UPLOADED").length;
    const verifiedPayments = payments.filter((p) => p.payment_status === "VERIFIED").length;
    const pendingPayments = payments.filter((p) => p.payment_status === "NOT PAID").length;
    const rejectedPayments = payments.filter((p) => p.payment_status === "REJECTED").length;

    const totalRevenue = payments
      .filter((p) => p.payment_status === "VERIFIED")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const totalMaterials = materials.length;
    const notesCount = materials.filter((m) => m.material_type === "NOTE").length;
    const linksCount = materials.filter((m) => m.material_type === "LINK").length;
    const filesCount = materials.filter((m) => m.material_type === "FILE").length;

    return {
      totalStudents,
      activeStudents,
      pendingSlips,
      verifiedPayments,
      pendingPayments,
      rejectedPayments,
      totalRevenue,
      totalMaterials,
      notesCount,
      linksCount,
      filesCount,
    };
  }

  /**
   * Generate monthly aggregate payment breakdown
   */
  static async getMonthlySummary(monthFilter?: string): Promise<MonthlyReportRow[]> {
    const [students, payments] = await Promise.all([
      StudentModel.getAll(),
      PaymentModel.getAll(monthFilter && monthFilter !== "ALL" ? { month: monthFilter } : undefined),
    ]);

    const activeStudentCount = students.filter((s) => s.is_active).length;
    const feePerStudent = 4500.0;

    const months = Array.from(new Set(payments.map((p) => p.payment_month))).sort();
    if (months.length === 0) months.push("2027-01", "2027-02", "2027-03");

    return months.map((m) => {
      const monthPayments = payments.filter((p) => p.payment_month === m);
      const verified = monthPayments.filter((p) => p.payment_status === "VERIFIED");
      const slips = monthPayments.filter((p) => p.payment_status === "SLIP UPLOADED");
      const unpaid = monthPayments.filter((p) => p.payment_status === "NOT PAID");
      const rejected = monthPayments.filter((p) => p.payment_status === "REJECTED");

      const collected = verified.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const expected = activeStudentCount * feePerStudent;

      return {
        month: m,
        totalExpected: expected,
        totalCollected: collected,
        verifiedCount: verified.length,
        pendingSlipCount: slips.length,
        unpaidCount: unpaid.length,
        rejectedCount: rejected.length,
      };
    });
  }
}
