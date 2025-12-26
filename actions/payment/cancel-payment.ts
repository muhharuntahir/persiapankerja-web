// actions/payment/cancel-payment.ts
"use server";

export async function cancelPayment(orderId: string) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/payments/cancel`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
      cache: "no-store",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to cancel payment");
  }

  return data;
}
