import { NextRequest } from "next/server";
import { PaymentController } from "@/controllers/payment.controller";

export async function POST(req: NextRequest) {
  return PaymentController.handleUploadSlip(req);
}
