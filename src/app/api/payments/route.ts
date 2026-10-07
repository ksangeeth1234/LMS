import { NextRequest } from "next/server";
import { PaymentController } from "@/controllers/payment.controller";

export async function GET(req: NextRequest) {
  return PaymentController.handleGetPayments(req);
}
