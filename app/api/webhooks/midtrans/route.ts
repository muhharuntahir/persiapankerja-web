import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Midtrans akan mengirim JSON POST ke endpoint ini:
 * {
 *   "order_id": "order-xxxx",
 *   "transaction_status": "settlement",
 *   "gross_amount": "20000",
 *   "fraud_status": "accept"
 * }
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { order_id, transaction_status, gross_amount } = body;

    // ======== CASE 1: Pembayaran sukses ========
    if (transaction_status === "settlement") {
      await db
        .update(userSubscription)
        .set({
          paymentStatus: "success",
        })
        .where(eq(userSubscription.orderId, order_id));
    }

    // ======== CASE 2: Pembayaran gagal ========
    if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      await db
        .update(userSubscription)
        .set({
          paymentStatus: "failed",
        })
        .where(eq(userSubscription.orderId, order_id));
    }

    return NextResponse.json(
      { message: "Webhook received", order_id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}
