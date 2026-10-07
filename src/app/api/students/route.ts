import { NextRequest } from "next/server";
import { StudentController } from "@/controllers/student.controller";

export async function GET(req: NextRequest) {
  return StudentController.handleGetStudents(req);
}

export async function POST(req: NextRequest) {
  return StudentController.handleRegisterStudent(req);
}
