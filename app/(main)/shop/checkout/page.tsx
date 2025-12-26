"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaymentMethod =
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

export default function CheckoutPage() {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);

  const onPay = async () => {
    if (!method) return;

    setLoading(true);

    const res = await fetch("/api/payments/create", {
      method: "POST",
      body: JSON.stringify({ method }),
    });

    const data = await res.json();

    if (data.orderId) {
      router.push(`/shop/payment/${data.orderId}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Pilih Metode Pembayaran
      </h1>

      {/* BANK TRANSFER */}
      <Section title="Bank Transfer (Virtual Account)">
        <Option
          id="bca_va"
          label="BCA Virtual Account"
          method={method}
          setMethod={setMethod}
        />
        <Option
          id="bni_va"
          label="BNI Virtual Account"
          method={method}
          setMethod={setMethod}
        />
        <Option
          id="bri_va"
          label="BRI Virtual Account"
          method={method}
          setMethod={setMethod}
        />
        <Option
          id="mandiri_va"
          label="Mandiri Bill Payment"
          method={method}
          setMethod={setMethod}
        />
        <Option
          id="permata_va"
          label="Permata Virtual Account"
          method={method}
          setMethod={setMethod}
        />
        <Option
          id="cimb_va"
          label="CIMB Virtual Account"
          method={method}
          setMethod={setMethod}
        />
      </Section>

      {/* E-MONEY */}
      <Section title="E-Money">
        <Option
          id="gopay"
          label="GoPay"
          method={method}
          setMethod={setMethod}
        />
        <Option
          id="shopeepay"
          label="ShopeePay"
          method={method}
          setMethod={setMethod}
        />
      </Section>

      {/* QR */}
      <Section title="QRIS">
        <Option
          id="qris"
          label="QRIS (Semua E-Wallet)"
          method={method}
          setMethod={setMethod}
        />
      </Section>

      {/* RETAIL */}
      <Section title="Gerai Retail">
        <Option
          id="alfamart"
          label="Alfamart"
          method={method}
          setMethod={setMethod}
        />
        <Option
          id="indomaret"
          label="Indomaret"
          method={method}
          setMethod={setMethod}
        />
      </Section>

      {/* CARDLESS CREDIT */}
      <Section title="Cicilan Tanpa Kartu">
        <Option
          id="akulaku"
          label="Akulaku"
          method={method}
          setMethod={setMethod}
        />
        <Option
          id="kredivo"
          label="Kredivo"
          method={method}
          setMethod={setMethod}
        />
      </Section>

      {/* CREDIT CARD */}
      <Section title="Kartu Kredit">
        <Option
          id="credit_card"
          label="Kartu Kredit / Debit"
          method={method}
          setMethod={setMethod}
        />
      </Section>

      <Button
        className="w-full mt-8"
        size="lg"
        disabled={!method || loading}
        onClick={onPay}
      >
        {loading ? "Memproses..." : "Bayar Sekarang"}
      </Button>
    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h2 className="font-semibold mb-3 text-neutral-700">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Option({
  id,
  label,
  method,
  setMethod,
}: {
  id: PaymentMethod;
  label: string;
  method: PaymentMethod | null;
  setMethod: (m: PaymentMethod) => void;
}) {
  return (
    <button
      onClick={() => setMethod(id)}
      className={cn(
        "w-full flex items-center justify-between p-4 border-2 rounded-xl text-left",
        method === id
          ? "border-sky-500 bg-sky-50"
          : "border-neutral-200 hover:bg-neutral-50"
      )}
    >
      <span className="font-medium">{label}</span>
      {method === id && <span className="text-sky-600 font-bold">✓</span>}
    </button>
  );
}
