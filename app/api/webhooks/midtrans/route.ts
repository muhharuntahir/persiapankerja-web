// import { NextResponse } from "next/server";
// import db from "@/db/drizzle";
// import { userSubscription } from "@/db/schema";
// import { eq } from "drizzle-orm";

// /**
//  * Midtrans akan mengirim JSON POST ke endpoint ini:
//  * {
//  *   "order_id": "order-xxxx",
//  *   "transaction_status": "settlement",
//  *   "gross_amount": "20000",
//  *   "fraud_status": "accept"
//  * }
//  */

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     const { order_id, transaction_status, gross_amount } = body;

//     // ======== CASE 1: Pembayaran sukses ========
//     if (transaction_status === "settlement") {
//       await db
//         .update(userSubscription)
//         .set({
//           paymentStatus: "success",
//         })
//         .where(eq(userSubscription.orderId, order_id));
//     }

//     // ======== CASE 2: Pembayaran gagal ========
//     if (
//       transaction_status === "cancel" ||
//       transaction_status === "deny" ||
//       transaction_status === "expire"
//     ) {
//       await db
//         .update(userSubscription)
//         .set({
//           paymentStatus: "failed",
//         })
//         .where(eq(userSubscription.orderId, order_id));
//     }

//     return NextResponse.json(
//       { message: "Webhook received", order_id },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Midtrans webhook error:", error);
//     return new NextResponse("Webhook error", { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.json();

  const orderId = body.order_id;
  const transactionStatus = body.transaction_status;

  // VALIDASI WAJIB (Midtrans security)
  if (!orderId) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  // CARI USER BERDASARKAN orderId
  const existing = await db.query.userSubscription.findFirst({
    where: eq(userSubscription.orderId, orderId),
  });

  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // UPDATE STATUS
  let paymentStatus = "pending";
  let isActive = false;

  if (transactionStatus === "settlement") {
    paymentStatus = "success";
    isActive = true;
  }

  if (transactionStatus === "cancel" || transactionStatus === "expire") {
    paymentStatus = "failed";
  }

  await db
    .update(userSubscription)
    .set({
      paymentStatus,
      isActive,
    })
    .where(eq(userSubscription.orderId, orderId));

  return NextResponse.json({ received: true });
}
