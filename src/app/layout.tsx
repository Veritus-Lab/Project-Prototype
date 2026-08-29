import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FLERNK",
  description: "Plataforma para assessorias esportivas de corrida.",
  appleWebApp: { capable: true, title: "FLERNK" },
};
export const viewport: Viewport = { themeColor: "#101315" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={inter.variable}><ServiceWorkerRegistration />{children}</body>
    </html>
  );
}
