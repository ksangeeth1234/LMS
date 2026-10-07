import { NextRequest, NextResponse } from "next/server";
import { AuthController } from "./auth.controller";
import { StudentModel } from "@/models/student.model";
import { validateStudentRegistration } from "@/lib/validators";
import { generateStudentCredentials, hashPassword } from "@/lib/auth";
import { StudentRegistrationInput } from "@/models/types";

export class StudentController {
  /**
   * GET: Retrieve student list or student profile
   */
  static async handleGetStudents(req: NextRequest): Promise<NextResponse> {
    const session = AuthController.verifyAuth(req);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const studentIdParam = searchParams.get("id");

    // Student can only access their own profile
    if (session.role === "STUDENT") {
      const student = await StudentModel.findByUserId(session.id);
      if (!student) {
        return NextResponse.json({ success: false, message: "Student record not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, student });
    }

    // Admin can get single student by ID or list all
    if (studentIdParam) {
      const student = await StudentModel.findById(studentIdParam);
      if (!student) {
        return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, student });
    }

    const students = await StudentModel.getAll(search, status);
    return NextResponse.json({ success: true, students, count: students.length });
  }

  /**
   * POST: Register a new student (Admin only)
   */
  static async handleRegisterStudent(req: NextRequest): Promise<NextResponse> {
    const session = AuthController.verifyAuth(req, "ADMIN");
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin authorization required." },
        { status: 403 }
      );
    }

    try {
      const body: StudentRegistrationInput = await req.json();

      // 1. Backend validation using regex rules
      const validation = validateStudentRegistration(body);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed. Please correct the highlighted errors.",
            errors: validation.errors,
          },
          { status: 422 }
        );
      }

      // 2. Generate Credentials automatically according to rule
      const credentials = generateStudentCredentials(
        body.firstName,
        body.lastName,
        body.nic,
        body.studentId,
        body.fullName
      );

      // 3. Duplicate check
      const duplicateError = await StudentModel.checkDuplicate(
        body.studentId,
        body.nic,
        credentials.username
      );
      if (duplicateError) {
        return NextResponse.json(
          { success: false, message: duplicateError },
          { status: 409 }
        );
      }

      // 4. Hash password
      const passwordHash = await hashPassword(credentials.passwordPlain);

      // 5. Save to Model
      const result = await StudentModel.create(
        body,
        credentials,
        passwordHash,
        session.id
      );

      return NextResponse.json(
        {
          success: true,
          message: "Student registered successfully.",
          student: result.student,
          credentials: result.credentials,
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Student registration error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to register student. " + (error.message || "") },
        { status: 500 }
      );
    }
  }

  /**
   * PUT: Update student information (Admin only)
   */
  static async handleUpdateStudent(req: NextRequest, id: string): Promise<NextResponse> {
    const session = AuthController.verifyAuth(req, "ADMIN");
    if (!session) {
      return NextResponse.json({ success: false, message: "Admin authorization required." }, { status: 403 });
    }

    try {
      const body = await req.json();
      const updated = await StudentModel.update(id, body, session.id);

      if (!updated) {
        return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "Student details updated successfully.",
        student: updated,
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  /**
   * PATCH: Toggle active status or Reset Password
   */
  static async handlePatchStudent(req: NextRequest, id: string): Promise<NextResponse> {
    const session = AuthController.verifyAuth(req, "ADMIN");
    if (!session) {
      return NextResponse.json({ success: false, message: "Admin authorization required." }, { status: 403 });
    }

    try {
      const body = await req.json();

      if (body.action === "toggle_status") {
        const success = await StudentModel.toggleStatus(id, Boolean(body.isActive), session.id);
        return NextResponse.json({
          success,
          message: `Student account ${body.isActive ? "activated" : "deactivated"} successfully.`,
        });
      }

      if (body.action === "reset_password") {
        const newPasswordPlain = body.newPassword || "Pass@2027";
        const newHash = await hashPassword(newPasswordPlain);
        const success = await StudentModel.resetPassword(id, newHash, newPasswordPlain, session.id);
        return NextResponse.json({
          success,
          message: "Password reset successfully.",
          newPassword: newPasswordPlain,
        });
      }

      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }
}
