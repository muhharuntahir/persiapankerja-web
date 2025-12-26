// app/api/payments/cancel/route.ts
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { cancelTransaction } from "@/lib/midtrans/core";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    await cancelTransaction(orderId);

    await db
      .update(userSubscription)
      .set({
        paymentStatus: "cancel",
        isActive: false,
      })
      .where(eq(userSubscription.orderId, orderId));

    return NextResponse.json({ message: "Transaction cancelled" });
  } catch (err: any) {
    console.error("❌ Cancel error:", err);
    return NextResponse.json(
      { error: err.message || "Cancel failed" },
      { status: 500 }
    );
  }
}
