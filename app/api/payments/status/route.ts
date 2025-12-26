// app/api/payments/status/route.ts
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { getTransactionStatus } from "@/lib/midtrans/core";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const status = await getTransactionStatus(orderId);

    // Update DB jika sudah paid
    if (status.transaction_status === "settlement") {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      await db
        .update(userSubscription)
        .set({
          paymentStatus: "paid",
          isActive: true,
          expiresAt,
        })
        .where(eq(userSubscription.orderId, orderId));
    }

    return NextResponse.json(status);
  } catch (err: any) {
    console.error("❌ Status check error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to check status" },
      { status: 500 }
    );
  }
}
