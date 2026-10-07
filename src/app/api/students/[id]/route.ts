import { NextRequest } from "next/server";
import { StudentController } from "@/controllers/student.controller";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return StudentController.handleUpdateStudent(req, params.id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return StudentController.handlePatchStudent(req, params.id);
}
