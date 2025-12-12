"use server";

import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { createMidtransClient } from "@/lib/midtrans";
import { nanoid } from "nanoid";
import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { eq } from "drizzle-orm";

export const createMidtransPayment = async () => {
  const supabase = createServerSupabaseClient();

  // 1. GET AUTH USER
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 2. Generate unique order ID
  const orderId = "order-" + nanoid();
  const PRICE = 99000;

  // 3. Build payload Midtrans
  const midtrans = createMidtransClient();

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: PRICE,
    },
    customer_details: {
      first_name: user.user_metadata?.full_name ?? "User",
      email: user.email ?? "",
    },
  };

  // 4. Create transaction
  const transaction = await midtrans.createTransaction(parameter);

  // 5. UPSERT (jika ada → update, jika belum → insert)
  await db.insert(userSubscription).values({
    userId: user.id,
    orderId,
    paymentStatus: "pending",
    grossAmount: PRICE,
  });
  // await db
  //   .insert(userSubscription)
  //   .values({
  //     userId: user.id,
  //     orderId,
  //     paymentStatus: "pending",
  //     grossAmount: PRICE,
  //     isActive: false,
  //     expiresAt: null,
  //   })
  //   .onConflictDoUpdate({
  //     target: userSubscription.userId,
  //     set: {
  //       orderId,
  //       paymentStatus: "pending",
  //       grossAmount: PRICE,
  //       isActive: false,
  //       expiresAt: null,
  //     },
  //   });

  // 6. Return Snap Token
  return {
    snapToken: transaction.token,
    redirectUrl: transaction.redirect_url,
  };
};
