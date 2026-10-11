import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { getMockStore } from "@/lib/mock-store";
import { Payment, PaymentSlip, PaymentStatus } from "./types";
import { AuditModel } from "./audit.model";
import { StudentModel, extractMonthlyFee } from "./student.model";

export class PaymentModel {
  /**
   * Retrieve payments with optional filters
   */
  static async getAll(filters?: {
    month?: string;
    status?: PaymentStatus | "ALL";
    search?: string;
    studentId?: string;
  }): Promise<Payment[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabaseAdmin
          .from("payments")
          .select("*, students(*), payment_slips(*), admins(*)")
          .order("payment_month", { ascending: false });

        if (filters?.month && filters.month !== "ALL") {
          query = query.eq("payment_month", filters.month);
        }
        if (filters?.status && filters.status !== "ALL") {
          query = query.eq("payment_status", filters.status);
        }
        if (filters?.studentId) {
          query = query.eq("student_id", filters.studentId);
        }

        const { data, error } = await query;
        if (!error && data) {
          let results: Payment[] = data.map((item: any) => ({
            ...item,
            amount: Number(item.amount) || Number(item.students?.monthly_fee) || 4500.0,
            student: item.students ? {
              ...item.students,
              monthly_fee: Number(item.students.monthly_fee) || 4500.0,
            } : undefined,
            slip: item.payment_slips?.[0] || null,
            admin_verifier: item.admins,
          }));

          if (filters?.search) {
            const q = filters.search.toLowerCase();
            results = results.filter(
              (p) =>
                p.student?.full_name?.toLowerCase().includes(q) ||
                p.student?.student_id?.toLowerCase().includes(q) ||
                p.payment_month.includes(q)
            );
          }

          return results;
        }
      } catch (err) {
        console.error("Supabase getAll payments error:", err);
      }
    }

    // Fallback Mock Store
    const store = getMockStore();
    let list = store.payments.map((p) => {
      const student = store.students.find((s) => s.id === p.student_id);
      const slip = store.slips.find((s) => s.payment_id === p.id) || null;
      const admin = store.admins.find((a) => a.id === p.verified_by) || null;
      return {
        ...p,
        amount: Number(p.amount) || Number(student?.monthly_fee) || 4500.0,
        student,
        slip,
        admin_verifier: admin,
      };
    });

    if (filters?.studentId) {
      list = list.filter((p) => p.student_id === filters.studentId);
    }

    if (filters?.month && filters.month !== "ALL") {
      list = list.filter((p) => p.payment_month === filters.month);
    }

    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((p) => p.payment_status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.student?.full_name?.toLowerCase().includes(q) ||
          p.student?.student_id?.toLowerCase().includes(q) ||
          p.payment_month.includes(q)
      );
    }

    return list.sort((a, b) => b.payment_month.localeCompare(a.payment_month));
  }

  /**
   * Find payment by ID
   */
  static async findById(id: string): Promise<Payment | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from("payments")
          .select("*, students(*), payment_slips(*), admins(*)")
          .eq("id", id)
          .single();

        if (!error && data) {
          return {
            ...data,
            amount: Number(data.amount) || Number(data.students?.monthly_fee) || 4500.0,
            student: data.students ? {
              ...data.students,
              monthly_fee: Number(data.students.monthly_fee) || 4500.0,
            } : undefined,
            slip: data.payment_slips?.[0] || null,
            admin_verifier: data.admins,
          };
        }
      } catch (err) {
        console.error("Supabase findById payment error:", err);
      }
    }

    const store = getMockStore();
    const p = store.payments.find((item) => item.id === id);
    if (!p) return null;

    const student = store.students.find((s) => s.id === p.student_id);
    const slip = store.slips.find((s) => s.payment_id === p.id) || null;
    const admin = store.admins.find((a) => a.id === p.verified_by) || null;

    return {
      ...p,
      amount: Number(p.amount) || Number(student?.monthly_fee) || 4500.0,
      student,
      slip,
      admin_verifier: admin,
    };
  }

  /**
   * Check if a specific student has verified access for a given month
   */
  static async isMonthVerified(studentId: string, paymentMonth: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from("payments")
          .select("payment_status")
          .eq("student_id", studentId)
          .eq("payment_month", paymentMonth)
          .eq("payment_status", "VERIFIED")
          .maybeSingle();

        if (!error && data) return true;
      } catch (err) {
        console.error("Supabase isMonthVerified error:", err);
      }
    }

    const store = getMockStore();
    const payment = store.payments.find(
      (p) => p.student_id === studentId && p.payment_month === paymentMonth
    );
    return payment?.payment_status === "VERIFIED";
  }

  /**
   * Student uploads a payment slip for a specific month with tutor-configured fee
   */
  static async submitPaymentSlip(
    studentId: string,
    month: string,
    slipData: {
      fileUrl: string;
      fileName: string;
      fileSize?: number;
      mimeType?: string;
    },
    customAmount?: number
  ): Promise<Payment> {
    const timestamp = new Date().toISOString();
    
    // Resolve custom fee decided by tutor for this student
    let feeAmount = customAmount;
    if (!feeAmount || feeAmount <= 0) {
      const student = await StudentModel.findById(studentId);
      feeAmount = student?.monthly_fee || 4500.0;
    }

    if (isSupabaseConfigured()) {
      try {
        // Resolve target student's UUID in Supabase
        let targetStudentId = studentId;
        const { data: dbStudent } = await supabaseAdmin
          .from("students")
          .select("id, additional_details")
          .or(`id.eq.${studentId},student_id.eq.${studentId}`)
          .maybeSingle();

        if (dbStudent) {
          targetStudentId = dbStudent.id;
          if (!customAmount) {
            feeAmount = extractMonthlyFee(dbStudent.additional_details);
          }
        }

        // Upsert payment record
        const { data: payment, error: pError } = await supabaseAdmin
          .from("payments")
          .upsert(
            {
              student_id: targetStudentId,
              payment_month: month,
              amount: feeAmount,
              payment_date: timestamp,
              payment_status: "SLIP UPLOADED",
              rejection_reason: null,
              remarks: "Slip submitted by student, awaiting teacher verification.",
            },
            { onConflict: "student_id, payment_month" }
          )
          .select()
          .single();

        if (pError) throw pError;

        // Delete any existing slip for this payment to avoid duplicates
        await supabaseAdmin
          .from("payment_slips")
          .delete()
          .eq("payment_id", payment.id);

        // Insert fresh slip
        const { data: slip, error: sError } = await supabaseAdmin
          .from("payment_slips")
          .insert({
            payment_id: payment.id,
            file_url: slipData.fileUrl,
            file_name: slipData.fileName,
            file_size: slipData.fileSize || 0,
            mime_type: slipData.mimeType || "image/jpeg",
          })
          .select()
          .single();

        if (sError) throw sError;

        await AuditModel.log({
          action: "PAYMENT_SLIP_UPLOADED",
          entity_type: "PAYMENT",
          entity_id: payment.id,
          details: {
            student_id: targetStudentId,
            month: month,
            amount: feeAmount,
            file_name: slipData.fileName,
          },
        });

        return {
          ...payment,
          amount: Number(payment.amount) || feeAmount,
          slip,
        };
      } catch (err: any) {
        console.error("Supabase submitPaymentSlip error:", err);
        throw new Error(err.message || "Failed to submit payment slip to database");
      }
    }

    // Mock store
    const store = getMockStore();
    let payment = store.payments.find(
      (p) => p.student_id === studentId && p.payment_month === month
    );

    if (!payment) {
      payment = {
        id: `p-${Date.now()}`,
        student_id: studentId,
        payment_month: month,
        amount: feeAmount,
        payment_date: timestamp,
        payment_status: "SLIP UPLOADED",
        verified_at: null,
        verified_by: null,
        rejection_reason: null,
        remarks: "Slip submitted by student, awaiting teacher verification.",
        created_at: timestamp,
        updated_at: timestamp,
      };
      store.payments.push(payment);
    } else {
      payment.payment_status = "SLIP UPLOADED";
      payment.amount = feeAmount;
      payment.payment_date = timestamp;
      payment.rejection_reason = null;
      payment.remarks = "Slip re-submitted by student, awaiting teacher verification.";
      payment.updated_at = timestamp;
    }

    // Remove old slip if existing
    const existingSlipIndex = store.slips.findIndex((s) => s.payment_id === payment!.id);
    const newSlip: PaymentSlip = {
      id: `slip-${Date.now()}`,
      payment_id: payment.id,
      file_url: slipData.fileUrl,
      file_name: slipData.fileName,
      file_size: slipData.fileSize || 250000,
      mime_type: slipData.mimeType || "image/jpeg",
      uploaded_at: timestamp,
    };

    if (existingSlipIndex >= 0) {
      store.slips[existingSlipIndex] = newSlip;
    } else {
      store.slips.push(newSlip);
    }

    payment.slip = newSlip;

    await AuditModel.log({
      action: "PAYMENT_SLIP_UPLOADED",
      entity_type: "PAYMENT",
      entity_id: payment.id,
      details: {
        student_id: studentId,
        month: month,
        amount: feeAmount,
        file_name: slipData.fileName,
      },
    });

    return payment;
  }

  /**
   * Admin verifies a payment slip
   */
  static async verify(paymentId: string, adminUserId?: string, remarks?: string): Promise<Payment | null> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const { data: payment, error } = await supabaseAdmin
          .from("payments")
          .update({
            payment_status: "VERIFIED",
            verified_at: timestamp,
            rejection_reason: null,
            remarks: remarks || "Payment verified by tuition master. Learning materials unlocked.",
          })
          .eq("id", paymentId)
          .select("*, students(*)")
          .single();

        if (!error && payment) {
          await AuditModel.log({
            user_id: adminUserId,
            action: "PAYMENT_VERIFIED",
            entity_type: "PAYMENT",
            entity_id: payment.id,
            details: {
              month: payment.payment_month,
              student: payment.students?.full_name,
              amount: payment.amount,
            },
          });
          return payment;
        }
      } catch (err) {
        console.error("Supabase verify payment error:", err);
      }
    }

    const store = getMockStore();
    const payment = store.payments.find((p) => p.id === paymentId);
    if (!payment) return null;

    payment.payment_status = "VERIFIED";
    payment.verified_at = timestamp;
    payment.verified_by = store.admins[0]?.id || "a-01";
    payment.rejection_reason = null;
    payment.remarks = remarks || "Payment verified by tuition master. Learning materials unlocked.";
    payment.updated_at = timestamp;

    const student = store.students.find((s) => s.id === payment.student_id);

    await AuditModel.log({
      user_id: adminUserId,
      action: "PAYMENT_VERIFIED",
      entity_type: "PAYMENT",
      entity_id: payment.id,
      details: {
        month: payment.payment_month,
        student: student?.full_name,
        amount: payment.amount,
      },
    });

    return payment;
  }

  /**
   * Admin rejects a payment slip with reason
   */
  static async reject(
    paymentId: string,
    reason: string,
    adminUserId?: string
  ): Promise<Payment | null> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const { data: payment, error } = await supabaseAdmin
          .from("payments")
          .update({
            payment_status: "REJECTED",
            verified_at: timestamp,
            rejection_reason: reason,
            remarks: `Payment rejected. Reason: ${reason}`,
          })
          .eq("id", paymentId)
          .select("*, students(*)")
          .single();

        if (!error && payment) {
          await AuditModel.log({
            user_id: adminUserId,
            action: "PAYMENT_REJECTED",
            entity_type: "PAYMENT",
            entity_id: payment.id,
            details: {
              month: payment.payment_month,
              student: payment.students?.full_name,
              reason,
            },
          });
          return payment;
        }
      } catch (err) {
        console.error("Supabase reject payment error:", err);
      }
    }

    const store = getMockStore();
    const payment = store.payments.find((p) => p.id === paymentId);
    if (!payment) return null;

    payment.payment_status = "REJECTED";
    payment.verified_at = timestamp;
    payment.verified_by = store.admins[0]?.id || "a-01";
    payment.rejection_reason = reason;
    payment.remarks = `Payment rejected. Reason: ${reason}`;
    payment.updated_at = timestamp;

    const student = store.students.find((s) => s.id === payment.student_id);

    await AuditModel.log({
      user_id: adminUserId,
      action: "PAYMENT_REJECTED",
      entity_type: "PAYMENT",
      entity_id: payment.id,
      details: {
        month: payment.payment_month,
        student: student?.full_name,
        reason,
      },
    });

    return payment;
  }
}
