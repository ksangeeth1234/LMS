import { NextRequest, NextResponse } from "next/server";
import { AuthController } from "./auth.controller";
import { ReportModel } from "@/models/report.model";
import { AuditModel } from "@/models/audit.model";
import { StudentModel } from "@/models/student.model";
import { PaymentModel } from "@/models/payment.model";

export class ReportController {
  /**
   * GET: Dashboard KPIs and metrics
   */
  static async handleGetDashboardStats(req: NextRequest): Promise<NextResponse> {
    const session = AuthController.verifyAuth(req, "ADMIN");
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const stats = await ReportModel.getDashboardStats();
    return NextResponse.json({ success: true, stats });
  }

  /**
   * GET: Monthly breakdown summary & optional CSV export
   */
  static async handleGetReports(req: NextRequest): Promise<NextResponse> {
    const session = AuthController.verifyAuth(req, "ADMIN");
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || undefined;
    const format = searchParams.get("format");

    const summary = await ReportModel.getMonthlySummary(month);

    // If CSV export requested
    if (format === "csv") {
      const [students, payments] = await Promise.all([
        StudentModel.getAll(),
        PaymentModel.getAll(month ? { month } : undefined),
      ]);

      const headers = [
        "Student ID",
        "Student Name",
        "NIC",
        "Phone",
        "Payment Month",
        "Amount (LKR)",
        "Payment Status",
        "Verification Date",
      ].join(",");

      const rows = payments.map((p) => {
        return [
          `"${p.student?.student_id || ""}"`,
          `"${p.student?.full_name || ""}"`,
          `"${p.student?.nic || ""}"`,
          `"${p.student?.student_phone || ""}"`,
          `"${p.payment_month}"`,
          p.amount,
          `"${p.payment_status}"`,
          `"${p.verified_at || "N/A"}"`,
        ].join(",");
      });

      const csvContent = [headers, ...rows].join("\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="tuition_lms_report_${month || "all"}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, summary });
  }

  /**
   * GET: Audit Logs
   */
  static async handleGetAuditLogs(req: NextRequest): Promise<NextResponse> {
    const session = AuthController.verifyAuth(req, "ADMIN");
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const logs = await AuditModel.getAll(100);
    return NextResponse.json({ success: true, logs });
  }
}
