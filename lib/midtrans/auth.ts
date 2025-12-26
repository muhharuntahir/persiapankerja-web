// lib/midtrans/auth.ts

/**
 * Generate Basic Auth header for Midtrans Core API
 * Format: Base64Encode(ServerKey + ":")
 */
export function getMidtransAuthHeader() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY is not set");
  }

  const encodedKey = Buffer.from(`${serverKey}:`).toString("base64");

  return {
    Authorization: `Basic ${encodedKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}
