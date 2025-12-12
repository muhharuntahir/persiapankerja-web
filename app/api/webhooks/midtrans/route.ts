import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("MIDTRANS WEBHOOK BODY:", body);

    const transactionStatus = body.transaction_status;
    const orderId = body.order_id;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Jika pembayaran sukses
    if (transactionStatus === "settlement") {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // aktif 1 tahun

      await db
        .update(userSubscription)
        .set({
          paymentStatus: "paid",
          isActive: true,
          expiresAt: expiresAt,
        })
        .where(eq(userSubscription.orderId, orderId));

      return NextResponse.json({ message: "Subscription activated" });
    }

    // Jika pembayaran masih pending atau lainnya
    return NextResponse.json({ message: "No action taken" });
  } catch (error: any) {
    console.error("Midtrans webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
