// app/api/payments/create/route.ts
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import {
  chargeBankTransfer,
  chargeMandiri,
  chargeEwallet,
  chargeQris,
  chargeCardless,
  chargeRetail,
} from "@/lib/midtrans/core";

export async function POST(req: Request) {
  try {
    const { method } = await req.json();

    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const PRICE = 99000;
    const orderId = `order-${nanoid()}`;

    let chargeResult: any;

    /* ============================
       MAP PAYMENT METHOD
    ============================ */
    switch (method) {
      case "bca_va":
        chargeResult = await chargeBankTransfer({
          orderId,
          amount: PRICE,
          bank: "bca",
        });
        break;

      case "bni_va":
        chargeResult = await chargeBankTransfer({
          orderId,
          amount: PRICE,
          bank: "bni",
        });
        break;

      case "bri_va":
        chargeResult = await chargeBankTransfer({
          orderId,
          amount: PRICE,
          bank: "bri",
        });
        break;

      case "permata_va":
        chargeResult = await chargeBankTransfer({
          orderId,
          amount: PRICE,
          bank: "permata",
        });
        break;

      case "cimb_va":
        chargeResult = await chargeBankTransfer({
          orderId,
          amount: PRICE,
          bank: "cimb",
        });
        break;

      case "mandiri_va":
        chargeResult = await chargeMandiri({
          orderId,
          amount: PRICE,
        });
        break;

      case "gopay":
      case "shopeepay":
        chargeResult = await chargeEwallet({
          orderId,
          amount: PRICE,
          type: method,
        });
        break;

      case "qris":
        chargeResult = await chargeQris({
          orderId,
          amount: PRICE,
        });
        break;

      case "alfamart":
        chargeResult = await chargeRetail({
          orderId,
          amount: PRICE,
          store: "alfamart",
        });
        break;

      case "indomaret":
        chargeResult = await chargeRetail({
          orderId,
          amount: PRICE,
          store: "indomaret",
        });
        break;

      case "akulaku":
      case "kredivo":
        chargeResult = await chargeCardless({
          orderId,
          amount: PRICE,
          provider: method,
        });
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported payment method" },
          { status: 400 }
        );
    }

    /* ============================
       SAVE ORDER TO DB
    ============================ */
    await db.insert(userSubscription).values({
      userId: user.id,
      orderId,
      paymentStatus: "pending",
      grossAmount: PRICE,
      isActive: false,
    });

    return NextResponse.json({
      orderId,
      payment: chargeResult,
    });
  } catch (err: any) {
    console.error("❌ Create payment error:", err);
    return NextResponse.json(
      { error: err.message || "Payment failed" },
      { status: 500 }
    );
  }
}
