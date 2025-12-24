import { NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";

/* =========================
   GET → Health Check
========================= */
export async function GET() {
  return NextResponse.json({
    status: "OK",
    message: "Midtrans webhook is reachable",
  });
}

/* =========================
   Signature Verification
========================= */
function verifySignature(body: any) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    if (!body.signature_key) return false;

    const payload =
      body.order_id + body.status_code + body.gross_amount + serverKey;

    const hash = crypto.createHash("sha512").update(payload).digest("hex");

    return hash === body.signature_key;
  } catch {
    return false;
  }
}

/* =========================
   POST → Webhook Handler
========================= */
export async function POST(req: Request) {
  let body: any;

  try {
    // ⛑️ SAFE PARSE (JSON / FORM)
    const text = await req.text();
    body = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error("❌ Failed to parse webhook body");
    return NextResponse.json({ message: "OK" }); // ⚠️ tetap 200
  }

  console.log("📩 MIDTRANS WEBHOOK:", body);

  const orderId = body.order_id;
  if (!orderId) {
    return NextResponse.json({ message: "OK" }); // ⚠️ jangan bikin Midtrans gagal
  }

  // 🔐 VERIFY SIGNATURE (skip if missing → test notification)
  const isSignatureValid = verifySignature(body);
  if (!isSignatureValid && body.signature_key) {
    console.error("❌ Invalid Midtrans signature");
    return NextResponse.json({ message: "OK" });
  }

  const {
    transaction_status,
    fraud_status,
    payment_type,
    transaction_time,
    transaction_id,
  } = body;

  const subscription = await db.query.userSubscription.findFirst({
    where: eq(userSubscription.orderId, orderId),
  });

  if (!subscription) {
    console.error("❌ Subscription not found:", orderId);
    return NextResponse.json({ message: "OK" });
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
        transactionTime: transaction_time ? new Date(transaction_time) : null,
        transactionId: transaction_id,
      })
      .where(eq(userSubscription.orderId, orderId));

    console.log("✅ Subscription ACTIVATED:", orderId);
    return NextResponse.json({ message: "OK" });
  }

  // ❌ FAILED / PENDING
  await db
    .update(userSubscription)
    .set({
      paymentStatus: transaction_status ?? "pending",
      isActive: false,
    })
    .where(eq(userSubscription.orderId, orderId));

  console.log("⚠️ Subscription updated:", transaction_status, orderId);
  return NextResponse.json({ message: "OK" });
}
