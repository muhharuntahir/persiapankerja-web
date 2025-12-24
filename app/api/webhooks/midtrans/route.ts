import { NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";

/**
 * Verifikasi signature dari Midtrans
 */
function verifySignature(body: any) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY not set");
  }

  const payload =
    body.order_id + body.status_code + body.gross_amount + serverKey;

  const expectedSignature = crypto
    .createHash("sha512")
    .update(payload)
    .digest("hex");

  return expectedSignature === body.signature_key;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📩 MIDTRANS WEBHOOK:", body);

    // 🔐 1. Verify signature
    if (!verifySignature(body)) {
      console.error("❌ Invalid Midtrans signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_time,
      transaction_id,
      gross_amount,
    } = body;

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // 🔍 Ambil subscription
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

    /**
     * ===========================
     * STATUS BERHASIL BAYAR
     * ===========================
     */
    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    if (isSuccess) {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 tahun

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

    /**
     * ===========================
     * STATUS GAGAL / BATAL
     * ===========================
     */
    if (["deny", "cancel", "expire", "refund"].includes(transaction_status)) {
      await db
        .update(userSubscription)
        .set({
          paymentStatus: transaction_status,
          isActive: false,
        })
        .where(eq(userSubscription.orderId, order_id));

      console.log("⚠️ Subscription FAILED:", transaction_status, order_id);

      return NextResponse.json({ message: "Subscription failed" });
    }

    /**
     * ===========================
     * STATUS PENDING
     * ===========================
     */
    if (transaction_status === "pending") {
      await db
        .update(userSubscription)
        .set({
          paymentStatus: "pending",
        })
        .where(eq(userSubscription.orderId, order_id));

      return NextResponse.json({ message: "Payment pending" });
    }

    return NextResponse.json({ message: "Unhandled status" });
  } catch (err: any) {
    console.error("❌ Midtrans webhook error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
