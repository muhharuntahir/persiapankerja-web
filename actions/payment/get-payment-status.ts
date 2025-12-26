// actions/payment/get-payment-status.ts
"use server";

export async function getPaymentStatus(orderId: string) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/payments/status`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
      cache: "no-store",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch payment status");
  }

  /**
   * return Midtrans status:
   * pending | settlement | expire | cancel | deny
   */
  return data;
}
