import { requireRole } from "@/lib/auth/session";
import ManagementDashboard from "@/app/(dashboard)/treinador/page";
export const metadata = { title: "Visão geral — FLERNK" };
export default async function SocioDashboardPage() { await requireRole("socio"); return ManagementDashboard(); }
