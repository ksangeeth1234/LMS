import { NextRequest, NextResponse } from "next/server";
import { AuthController } from "./auth.controller";
import { MaterialModel } from "@/models/material.model";
import { StudentModel } from "@/models/student.model";
import { MONTH_CODE_REGEX } from "@/lib/validators";

export class MaterialController {
  /**
   * GET: Retrieve learning materials with role and payment access checks
   */
  static async handleGetMaterials(req: NextRequest): Promise<NextResponse> {
    const session = AuthController.verifyAuth(req);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || "2027-01";
    const courseClass = searchParams.get("courseClass") || undefined;

    // Student Access Flow (STRICT ACCESS CONTROL)
    if (session.role === "STUDENT") {
      const student = await StudentModel.findByUserId(session.id);
      if (!student) {
        return NextResponse.json({ success: false, message: "Student record not found" }, { status: 404 });
      }

      const { materials, isMonthVerified } = await MaterialModel.getMaterialsForStudent(
        student.id,
        month
      );

      return NextResponse.json({
        success: true,
        month,
        isMonthVerified,
        materials,
        count: materials.length,
      });
    }

    // Admin Access Flow
    const materials = await MaterialModel.getAllForAdmin(month, courseClass);
    return NextResponse.json({
      success: true,
      month,
      materials,
      count: materials.length,
    });
  }

  /**
   * POST: Create a new learning material (Admin only)
   */
  static async handleCreateMaterial(req: NextRequest): Promise<NextResponse> {
    const session = AuthController.verifyAuth(req, "ADMIN");
    if (!session) {
      return NextResponse.json({ success: false, message: "Admin authorization required." }, { status: 403 });
    }

    try {
      const body = await req.json();
      const { paymentMonth, title, description, materialType, courseClass, url, platform, content, fileUrl, fileName, fileSize, mimeType, isPublished } = body;

      if (!paymentMonth || !MONTH_CODE_REGEX.test(paymentMonth)) {
        return NextResponse.json(
          { success: false, message: "Valid payment month (YYYY-MM) is required" },
          { status: 400 }
        );
      }

      if (!title || !title.trim()) {
        return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
      }

      if (!["LINK", "NOTE", "FILE"].includes(materialType)) {
        return NextResponse.json({ success: false, message: "Invalid material type" }, { status: 400 });
      }

      if (materialType === "LINK" && (!url || !url.trim())) {
        return NextResponse.json({ success: false, message: "Valid resource URL is required for Links" }, { status: 400 });
      }

      if (materialType === "NOTE" && (!content || !content.trim())) {
        return NextResponse.json({ success: false, message: "Note content is required" }, { status: 400 });
      }

      if (materialType === "FILE" && (!fileUrl || !fileUrl.trim())) {
        return NextResponse.json({ success: false, message: "File attachment URL or upload is required" }, { status: 400 });
      }

      const material = await MaterialModel.create(
        {
          paymentMonth,
          title: title.trim(),
          description: description?.trim(),
          materialType,
          courseClass: courseClass || "Combined Maths 2027 A/L",
          isPublished: isPublished !== undefined ? isPublished : true,
          url,
          platform,
          content,
          fileUrl,
          fileName,
          fileSize,
          mimeType,
        },
        session.id
      );

      return NextResponse.json({
        success: true,
        message: "Learning material created successfully.",
        material,
      }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  /**
   * DELETE: Remove learning material (Admin only)
   */
  static async handleDeleteMaterial(req: NextRequest, id: string): Promise<NextResponse> {
    const session = AuthController.verifyAuth(req, "ADMIN");
    if (!session) {
      return NextResponse.json({ success: false, message: "Admin authorization required." }, { status: 403 });
    }

    const success = await MaterialModel.delete(id, session.id);
    if (!success) {
      return NextResponse.json({ success: false, message: "Material not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Learning material deleted successfully." });
  }
}
