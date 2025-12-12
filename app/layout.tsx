// app/layout.tsx
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Script from "next/script"; // ⬅️ Tambahkan ini

import "./globals.css";

// UI components
import { Toaster } from "@/components/ui/sonner";
import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";

const font = Nunito({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PersiapanKerja | Belajar Interaktif",
  description: "Platform belajar interaktif mirip Duolingo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        {/* Inject Midtrans Snap.js CLIENT-SIDE */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive" // ⬅️ memastikan script hanya jalan di client
        />

        <Toaster />

        <ExitModal />
        <HeartsModal />
        <PracticeModal />

        {children}
      </body>
    </html>
  );
}
