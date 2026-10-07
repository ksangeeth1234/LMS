import { NextRequest } from "next/server";
import { MaterialController } from "@/controllers/material.controller";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return MaterialController.handleDeleteMaterial(req, params.id);
}
