// lib/midtrans/core.ts
import { getMidtransAuthHeader } from "./auth";

const MIDTRANS_BASE_URL =
  process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";

/**
 * Generic POST request to Midtrans Core API
 */
async function midtransPost<T>(
  endpoint: string,
  body: Record<string, any>
): Promise<T> {
  const res = await fetch(`${MIDTRANS_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: getMidtransAuthHeader(),
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Midtrans API Error:", data);
    throw new Error(data.status_message || "Midtrans API error");
  }

  return data;
}

/**
 * Create Bank Transfer (VA)
 */
export async function chargeBankTransfer({
  orderId,
  amount,
  bank,
}: {
  orderId: string;
  amount: number;
  bank: "bca" | "bni" | "bri" | "permata" | "cimb";
}) {
  return midtransPost("/v2/charge", {
    payment_type: bank === "permata" ? "permata" : "bank_transfer",
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    ...(bank !== "permata" && {
      bank_transfer: {
        bank,
      },
    }),
  });
}

/**
 * Mandiri Bill Payment
 */
export async function chargeMandiri({
  orderId,
  amount,
}: {
  orderId: string;
  amount: number;
}) {
  return midtransPost("/v2/charge", {
    payment_type: "echannel",
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    echannel: {
      bill_info1: "Payment:",
      bill_info2: "PersiapanKerja",
    },
  });
}

/**
 * QRIS / E-Wallet (Gopay, Shopeepay, dll)
 */
export async function chargeEwallet({
  orderId,
  amount,
  type,
}: {
  orderId: string;
  amount: number;
  type: "gopay" | "shopeepay";
}) {
  return midtransPost("/v2/charge", {
    payment_type: type,
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
  });
}

/**
 * QRIS
 */
export async function chargeQris({
  orderId,
  amount,
}: {
  orderId: string;
  amount: number;
}) {
  return midtransPost("/v2/charge", {
    payment_type: "qris",
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
  });
}

/**
 * Retail Store (Alfamart / Indomaret)
 */
export async function chargeRetail({
  orderId,
  amount,
  store,
}: {
  orderId: string;
  amount: number;
  store: "alfamart" | "indomaret";
}) {
  return midtransPost("/v2/charge", {
    payment_type: "cstore",
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    cstore: {
      store,
      message: "Pembayaran PersiapanKerja",
    },
  });
}

/**
 * Cardless Credit (Akulaku / Kredivo)
 */
export async function chargeCardless({
  orderId,
  amount,
  provider,
}: {
  orderId: string;
  amount: number;
  provider: "akulaku" | "kredivo";
}) {
  return midtransPost("/v2/charge", {
    payment_type: provider,
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
  });
}

/**
 * Check transaction status
 */
export async function getTransactionStatus(orderId: string) {
  const res = await fetch(`${MIDTRANS_BASE_URL}/v2/${orderId}/status`, {
    headers: getMidtransAuthHeader(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.status_message || "Failed to get transaction status");
  }

  return data;
}

/**
 * Cancel transaction
 */
export async function cancelTransaction(orderId: string) {
  return midtransPost(`/v2/${orderId}/cancel`, {});
}
