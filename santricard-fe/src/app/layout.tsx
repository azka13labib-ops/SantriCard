import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SantriCard — Sistem Card Jual Beli Student",
  description: "Kelola saldo, transaction, dan topUp santri dengan mudah dan aman.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
