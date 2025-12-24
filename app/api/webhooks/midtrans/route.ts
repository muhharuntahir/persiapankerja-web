// app/api/webhooks/midtrans/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";

/* =========================
   GET → TEST ENDPOINT
========================= */
export async function GET() {
  return NextResponse.json({
    status: "OK",
    message: "Midtrans webhook is reachable",
  });
}

/* =========================
   SIGNATURE VERIFICATION
========================= */
function verifySignature(body: any) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const payload =
    body.order_id + body.status_code + body.gross_amount + serverKey;

  const hash = crypto.createHash("sha512").update(payload).digest("hex");

  return hash === body.signature_key;
}

/* =========================
   POST → WEBHOOK HANDLER
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 MIDTRANS WEBHOOK:", body);

    if (!verifySignature(body)) {
      console.error("❌ Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_time,
      transaction_id,
    } = body;

    const subscription = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.orderId, order_id),
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    if (isSuccess) {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      await db
        .update(userSubscription)
        .set({
          paymentStatus: "paid",
          isActive: true,
          expiresAt,
          paymentType: payment_type,
          transactionTime: new Date(transaction_time),
          transactionId: transaction_id,
        })
        .where(eq(userSubscription.orderId, order_id));

      console.log("✅ Subscription activated:", order_id);
      return NextResponse.json({ message: "OK" });
    }

    await db
      .update(userSubscription)
      .set({
        paymentStatus: transaction_status,
        isActive: false,
      })
      .where(eq(userSubscription.orderId, order_id));

    return NextResponse.json({ message: "Status updated" });
  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
