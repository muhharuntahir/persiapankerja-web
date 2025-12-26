// actions/payment/create-order.ts
"use server";

type CreateOrderPayload = {
  method:
    | "bca_va"
    | "bni_va"
    | "bri_va"
    | "mandiri_va"
    | "permata_va"
    | "cimb_va"
    | "gopay"
    | "shopeepay"
    | "qris"
    | "alfamart"
    | "indomaret"
    | "akulaku"
    | "kredivo"
    | "credit_card";
};

export async function createOrder(payload: CreateOrderPayload) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/payments/create`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to create order");
  }

  /**
   * return:
   * {
   *   orderId,
   *   payment (response Midtrans)
   * }
   */
  return data;
}
