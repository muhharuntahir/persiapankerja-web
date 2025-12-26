// lib/midtrans.ts
import midtransClient from "midtrans-client";

export function createMidtransClient() {
  return new midtransClient.Snap({
    isProduction: false, // TRUE saat produksi
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.MIDTRANS_CLIENT_KEY!,
  });
}
