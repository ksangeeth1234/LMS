import { NextRequest } from "next/server";
import { MaterialController } from "@/controllers/material.controller";

export async function GET(req: NextRequest) {
  return MaterialController.handleGetMaterials(req);
}

export async function POST(req: NextRequest) {
  return MaterialController.handleCreateMaterial(req);
}
