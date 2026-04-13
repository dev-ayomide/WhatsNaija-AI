import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsNaija AI — Your 24/7 WhatsApp Sales Assistant",
  description: "Turn your WhatsApp into a 24/7 AI-powered sales and support team. Built for Nigerian small businesses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
