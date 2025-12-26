"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  /* =========================
     FETCH PAYMENT STATUS
  ========================= */
  const fetchStatus = async () => {
    setChecking(true);
    const res = await fetch("/api/payments/status", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    });

    const result = await res.json();
    setData(result);
    setLoading(false);
    setChecking(false);

    if (["expire", "cancel", "deny"].includes(result.transaction_status)) {
      setTimeout(() => router.push("/shop"), 3000);
    }

    if (result.transaction_status === "settlement") {
      setTimeout(() => router.push("/shop"), 2000);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 7000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader className="animate-spin text-neutral-500" />
      </div>
    );
  }

  /* =========================
     RENDER HELPERS
  ========================= */
  const renderPaymentInfo = () => {
    // BANK TRANSFER
    if (data.va_numbers?.length) {
      const va = data.va_numbers[0];
      return (
        <InfoBox>
          <p className="text-sm text-neutral-500">Bank</p>
          <p className="font-bold text-lg uppercase">{va.bank}</p>

          <p className="text-sm text-neutral-500 mt-4">Nomor Virtual Account</p>
          <p className="font-mono text-2xl">{va.va_number}</p>
        </InfoBox>
      );
    }

    // MANDIRI BILL
    if (data.bill_key) {
      return (
        <InfoBox>
          <p className="text-sm">Bill Key</p>
          <p className="font-mono text-xl">{data.bill_key}</p>

          <p className="text-sm mt-2">Biller Code</p>
          <p className="font-mono">{data.biller_code}</p>
        </InfoBox>
      );
    }

    // E-WALLET / QR
    // if (data.actions?.length) {
    //   const action = data.actions.find(
    //     (a: any) => a.name === "generate-qr-code"
    //   );
    //   if (action) {
    //     return (
    //       <InfoBox>
    //         <img src={action.url} alt="QR Payment" className="mx-auto w-64" />
    //         <p className="text-sm text-center mt-4">
    //           Scan QR untuk menyelesaikan pembayaran
    //         </p>
    //       </InfoBox>
    //     );
    //   }
    // }

    // RETAIL
    if (data.payment_code && data.store) {
      return (
        <InfoBox>
          <p className="text-sm">Gerai</p>
          <p className="font-bold uppercase">{data.store}</p>
          <p className="text-sm mt-4">Kode Pembayaran</p>
          <p className="font-mono text-2xl">{data.payment_code}</p>
        </InfoBox>
      );
    }

    // QRIS / GOPAY QR
    const qr = data.actions?.find((a: any) => a.name === "generate-qr-code");
    if (qr) {
      return (
        <InfoBox>
          <img src={qr.url} className="mx-auto w-64" />
          <p className="text-sm mt-4">Scan QR untuk membayar</p>
        </InfoBox>
      );
    }

    // GOPAY DEEPLINK (MOBILE)
    const deeplink = data.actions?.find(
      (a: any) => a.name === "deeplink-redirect"
    );
    if (deeplink) {
      return (
        <InfoBox>
          <Button onClick={() => (window.location.href = deeplink.url)}>
            Buka GoPay
          </Button>
        </InfoBox>
      );
    }

    return <p className="text-neutral-500">Menunggu instruksi pembayaran…</p>;
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Selesaikan Pembayaran
      </h1>

      <p className="text-center text-neutral-500 mb-6">
        Order ID: <span className="font-mono">{orderId}</span>
      </p>

      {renderPaymentInfo()}

      <StatusBadge status={data.transaction_status} />

      <Button
        onClick={fetchStatus}
        disabled={checking}
        className="w-full mt-6"
        variant="secondary"
      >
        {checking ? "Memeriksa..." : "Cek Status Pembayaran"}
      </Button>
    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-2 rounded-xl p-6 mb-6 text-center bg-neutral-50">
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "settlement"
      ? "bg-green-100 text-green-700"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <div
      className={`mt-4 px-4 py-2 rounded-full text-center text-sm font-semibold ${color}`}
    >
      Status: {status.toUpperCase()}
    </div>
  );
}
