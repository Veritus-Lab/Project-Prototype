import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import "./globals.css";

export const metadata: Metadata = {
  title: "FLERNK | Assessoria de corrida",
  description: "A chama que te move. Conheça a assessoria de corrida FLERNK.",
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
