// app/api/webhooks/midtrans/route.ts
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📩 MIDTRANS WEBHOOK BODY:", body);

    const orderId = body.order_id;
    const transactionStatus = body.transaction_status;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // 🎉 Payment success
    if (transactionStatus === "settlement") {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // aktif 1 tahun

      await db
        .update(userSubscription)
        .set({
          paymentStatus: "paid",
          isActive: true,
          expiresAt,
        })
        .where(eq(userSubscription.orderId, orderId));

      console.log("🎉 User subscription updated:", orderId);

      return NextResponse.json({ message: "Subscription activated" });
    }

    // Status lain: pending, deny, cancel, expire, refund
    return NextResponse.json({ message: "No action taken" });
  } catch (err: any) {
    console.error("❌ Midtrans webhook error:", err);
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
