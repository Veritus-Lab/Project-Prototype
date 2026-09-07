import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import "./globals.css";

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
      <body><ServiceWorkerRegistration />{children}</body>
    </html>
  );
}
