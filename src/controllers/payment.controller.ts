import { NextRequest, NextResponse } from "next/server";
import { AuthController } from "./auth.controller";
import { PaymentModel } from "@/models/payment.model";
import { MONTH_CODE_REGEX } from "@/lib/validators";
import { StudentModel } from "@/models/student.model";

export class PaymentController {
  /**
   * GET: Retrieve payment history
   */
  static async handleGetPayments(req: NextRequest): Promise<NextResponse> {
    const session = AuthController.verifyAuth(req);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || undefined;
    const status: any = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    if (session.role === "STUDENT") {
      const student = await StudentModel.findByUserId(session.id);
      if (!student) {
        return NextResponse.json({ success: false, message: "Student record not found" }, { status: 404 });
      }

      const payments = await PaymentModel.getAll({
        studentId: student.id,
        month,
        status,
      });

      return NextResponse.json({ success: true, payments });
    }

    // Admin view
    const payments = await PaymentModel.getAll({
      month,
      status,
      search,
    });

    return NextResponse.json({ success: true, payments, count: payments.length });
  }

  /**
   * POST: Student uploads monthly payment slip
   */
  static async handleUploadSlip(req: NextRequest): Promise<NextResponse> {
    const session = AuthController.verifyAuth(req, "STUDENT");
    if (!session) {
      return NextResponse.json({ success: false, message: "Student authentication required" }, { status: 401 });
    }

    try {
      const body = await req.json();
      const { paymentMonth, fileUrl, fileName, fileSize, mimeType, amount } = body;

      // Validate month format
      if (!paymentMonth || !MONTH_CODE_REGEX.test(paymentMonth)) {
        return NextResponse.json(
          { success: false, message: "Invalid payment month format. Expected 'YYYY-MM' (e.g. 2027-01)" },
          { status: 400 }
        );
      }

      // Validate slip file
      if (!fileUrl || !fileName) {
        return NextResponse.json(
          { success: false, message: "Payment slip file is required" },
          { status: 400 }
        );
      }

      const allowedMimes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (mimeType && !allowedMimes.includes(mimeType.toLowerCase())) {
        return NextResponse.json(
          { success: false, message: "Unsupported file format. Please upload JPG, PNG or PDF." },
          { status: 400 }
        );
      }

      const student = await StudentModel.findByUserId(session.id);
      if (!student) {
        return NextResponse.json({ success: false, message: "Student profile not found" }, { status: 404 });
      }

      const payment = await PaymentModel.submitPaymentSlip(
        student.id,
        paymentMonth,
        {
          fileUrl,
          fileName,
          fileSize: fileSize || 204800,
          mimeType: mimeType || "image/jpeg",
        },
        amount || 4500.0
      );

      return NextResponse.json({
        success: true,
        message: "Payment slip uploaded successfully. Awaiting teacher verification.",
        payment,
      });
    } catch (error: any) {
      console.error("Payment slip upload error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to upload payment slip: " + error.message },
        { status: 500 }
      );
    }
  }

  /**
   * POST: Admin verifies or rejects payment slip
   */
  static async handleVerifyPayment(req: NextRequest): Promise<NextResponse> {
    const session = AuthController.verifyAuth(req, "ADMIN");
    if (!session) {
      return NextResponse.json({ success: false, message: "Admin authorization required." }, { status: 403 });
    }

    try {
      const body = await req.json();
      const { paymentId, action, rejectionReason, remarks } = body;

      if (!paymentId) {
        return NextResponse.json({ success: false, message: "Payment ID is required" }, { status: 400 });
      }

      if (action === "VERIFY") {
        const payment = await PaymentModel.verify(paymentId, session.id, remarks);
        if (!payment) {
          return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          message: "Payment verified successfully. Student monthly materials unlocked!",
          payment,
        });
      }

      if (action === "REJECT") {
        if (!rejectionReason || !rejectionReason.trim()) {
          return NextResponse.json(
            { success: false, message: "A reason must be provided when rejecting a payment slip." },
            { status: 400 }
          );
        }

        const payment = await PaymentModel.reject(paymentId, rejectionReason.trim(), session.id);
        if (!payment) {
          return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          message: "Payment slip rejected. Status updated.",
          payment,
        });
      }

      return NextResponse.json({ success: false, message: "Invalid action. Must be VERIFY or REJECT" }, { status: 400 });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }
}
