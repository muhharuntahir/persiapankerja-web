import { NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";

/* =========================
   GET → HEALTH CHECK
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
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return false;

  const payload =
    body.order_id + body.status_code + body.gross_amount + serverKey;

  const expected = crypto.createHash("sha512").update(payload).digest("hex");

  return expected === body.signature_key;
}

/* =========================
   POST → WEBHOOK HANDLER
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 MIDTRANS WEBHOOK:", body);

    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_time,
      transaction_id,
    } = body;

    // ✅ 1. IGNORE TEST NOTIFICATION
    if (order_id?.startsWith("payment_notif_test_")) {
      console.log("ℹ️ Test notification received, ignored.");
      return NextResponse.json({ message: "Test notification ignored" });
    }

    // 🔐 2. VERIFY SIGNATURE
    if (!verifySignature(body)) {
      console.error("❌ Invalid Midtrans signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // 🔍 3. FIND SUBSCRIPTION
    const subscription = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.orderId, order_id),
    });

    if (!subscription) {
      console.error("❌ Subscription not found:", order_id);
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // ✅ 4. SUCCESS PAYMENT
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
          transactionTime: transaction_time ? new Date(transaction_time) : null,
          transactionId: transaction_id,
        })
        .where(eq(userSubscription.orderId, order_id));

      console.log("✅ Subscription ACTIVATED:", order_id);
      return NextResponse.json({ message: "Subscription activated" });
    }

    // ❌ 5. FAILED / CANCELLED
    await db
      .update(userSubscription)
      .set({
        paymentStatus: transaction_status,
        isActive: false,
      })
      .where(eq(userSubscription.orderId, order_id));

    console.log("⚠️ Subscription updated:", transaction_status, order_id);
    return NextResponse.json({ message: "Subscription updated" });
  } catch (err: any) {
    console.error("❌ Midtrans webhook error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
