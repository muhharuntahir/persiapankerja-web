"use server";

import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { createMidtransClient } from "@/lib/midtrans";
import { nanoid } from "nanoid";
import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";

export const createMidtransPayment = async () => {
  const supabase = createServerSupabaseClient();

  // 1. GET AUTH USER
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // 2. Generate unique order ID
  const orderId = "order-" + nanoid();
  const PRICE = 99000; // Rp 20.000

  // 3. Build payload Midtrans
  const midtrans = createMidtransClient();

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: PRICE,
    },
    customer_details: {
      first_name: user.user_metadata.full_name ?? "User",
      email: user.email ?? "",
    },
  };

  // 4. Create transaction to Midtrans
  const transaction = await midtrans.createTransaction(parameter);

  // 5. Save pending subscription
  await db
    .insert(userSubscription)
    .values({
      userId: user.id,
      orderId,
      paymentStatus: "pending",
      grossAmount: PRICE,
    })
    .onConflictDoUpdate({
      target: userSubscription.userId,
      set: {
        orderId,
        paymentStatus: "pending",
        grossAmount: PRICE,
        // boleh tambah field lain jika mau
      },
    });

  // 6. Return Snap Token to FE
  return {
    snapToken: transaction.token,
    redirectUrl: transaction.redirect_url,
  };
};
