import { NextRequest } from "next/server";
import { ReportController } from "@/controllers/report.controller";

export async function GET(req: NextRequest) {
  return ReportController.handleGetAuditLogs(req);
}
